import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { createPostSchema, updatePostSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || '';
    const platform = searchParams.get('platform') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = { userId: user.userId };
    if (status) where.status = status;
    if (platform) where.platform = platform;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { caption: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          media: { include: { media: true }, orderBy: { order: 'asc' } },
          schedules: { where: { status: 'pending' }, take: 1, orderBy: { scheduledAt: 'asc' } },
          accounts: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return createApiResponse(true, {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('List posts error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { mediaIds, ...postData } = parsed.data;

    const post = await db.post.create({
      data: {
        ...postData,
        userId: user.userId,
        hashtags: postData.hashtags ? JSON.stringify(postData.hashtags) : undefined,
        seoKeywords: postData.seoKeywords ? JSON.stringify(postData.seoKeywords) : undefined,
        media: mediaIds
          ? {
              create: mediaIds.map((mediaId, index) => ({
                mediaId,
                order: index,
              })),
            }
          : undefined,
      },
      include: { media: { include: { media: true } } },
    });

    await db.activityLog.create({
      data: {
        userId: user.userId,
        action: 'create_post',
        resource: 'post',
        resourceId: post.id,
        metadata: JSON.stringify({ title: post.title, status: post.status }),
      },
    });

    logger.info(`Post created: ${post.id} by ${user.email}`);

    return createApiResponse(true, post, undefined, 201);
  } catch (error) {
    logger.error('Create post error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}