import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { publishPostSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { getPublisher } from '@/lib/social/publishers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = publishPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { platformAccountIds } = parsed.data;

    const post = await db.post.findFirst({
      where: { id, userId: authUser.userId },
      include: {
        media: { include: { media: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    const accounts = await db.socialAccount.findMany({
      where: { id: { in: platformAccountIds }, userId: authUser.userId, isActive: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid accounts found' }, { status: 400 });
    }

    const mediaUrls = post.media.map(m => m.media.url);
    const content = post.caption || post.content || post.title || '';

    const results: Array<{ platform: string; accountId: string; success: boolean; postId?: string; postUrl?: string; error?: string }> = [];

    for (const account of accounts) {
      const publisher = getPublisher(account.platform);
      if (!publisher) {
        results.push({ platform: account.platform, accountId: account.id, success: false, error: `Unsupported platform: ${account.platform}` });
        continue;
      }

      try {
        const result = await publisher(account.accessToken, content, mediaUrls, account.metadata ? JSON.parse(account.metadata) : undefined);
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: result.success,
          postId: result.platformPostId,
          postUrl: result.platformPostUrl,
          error: result.error,
        });
      } catch (error) {
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    const anySuccess = results.some(r => r.success);

    // Update post status
    const newStatus = allSuccess ? 'published' : anySuccess ? 'published' : 'failed';
    await db.post.update({
      where: { id },
      data: {
        status: newStatus,
        publishedAt: anySuccess ? new Date() : undefined,
        failedReason: allSuccess ? null : results.filter(r => !r.success).map(r => r.error).join('; '),
        engagementData: JSON.stringify({ publishResults: results }),
      },
    });

    // Connect accounts to post
    for (const account of accounts) {
      await db.post.update({
        where: { id },
        data: {
          accounts: { connect: { id: account.id } },
        },
      }).catch(() => {
        // Already connected
      });
    }

    await db.activityLog.create({
      data: {
        userId: authUser.userId,
        action: 'publish_post',
        resource: 'post',
        resourceId: id,
        metadata: JSON.stringify({ results }),
      },
    });

    logger.info('Post published', { postId: id, results });

    return NextResponse.json({
      success: true,
      data: {
        postId: id,
        status: newStatus,
        results,
      },
    });
  } catch (error) {
    logger.error('Publish post failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}