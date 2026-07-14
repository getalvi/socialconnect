import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { publishToPlatform } from '@/lib/social/publishers';
import { publishRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = publishRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { postId, platformAccountIds } = parsed.data;

    const post = await db.post.findFirst({
      where: { id: postId, userId: user.userId },
      include: { media: { include: { media: true } } },
    });
    if (!post) return createApiResponse(false, undefined, 'Post not found', 404);

    const accounts = await db.socialAccount.findMany({
      where: { id: { in: platformAccountIds }, userId: user.userId, isActive: true },
    });

    if (accounts.length === 0) return createApiResponse(false, undefined, 'No valid accounts found', 400);

    const content = post.caption || post.content || post.title || '';
    const mediaUrls = post.media.map(pm => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return `${appUrl}${pm.media.url}`;
    });

    const results: Array<{ platform: string; accountId: string; success: boolean; error?: string; platformPostId?: string }> = [];

    for (const account of accounts) {
      try {
        const result = await publishToPlatform(account.platform, account.accessToken, content, mediaUrls);
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: result.success,
          error: result.error,
          platformPostId: result.platformPostId,
        });
      } catch (err) {
        results.push({
          platform: account.platform,
          accountId: account.id,
          success: false,
          error: (err as Error).message,
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    const newStatus = allSuccess ? 'published' : 'failed';

    await db.post.update({
      where: { id: postId },
      data: {
        status: newStatus,
        publishedAt: allSuccess ? new Date() : undefined,
        failedReason: allSuccess ? null : JSON.stringify(results.filter(r => !r.success)),
        engagementData: JSON.stringify({ publishResults: results }),
      },
    });

    await db.activityLog.create({
      data: {
        userId: user.userId, action: 'publish_post', resource: 'post', resourceId: postId,
        metadata: JSON.stringify({ platforms: accounts.map(a => a.platform), results }),
      },
    });

    logger.info(`Post ${postId} published to ${accounts.length} platforms, success: ${allSuccess}`);

    return createApiResponse(true, { postId, status: newStatus, results });
  } catch (error) {
    logger.error('Publish error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'Publishing failed', 500);
  }
}