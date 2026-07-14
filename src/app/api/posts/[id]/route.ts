import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { updatePostSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { id } = await params;
    const post = await db.post.findFirst({
      where: { id, userId: user.userId },
      include: {
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        schedules: { orderBy: { scheduledAt: 'desc' } },
        accounts: true,
        comments: true,
      },
    });

    if (!post) return createApiResponse(false, undefined, 'Post not found', 404);

    return createApiResponse(true, post);
  } catch (error) {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { id } = await params;
    const existing = await db.post.findFirst({ where: { id, userId: user.userId } });
    if (!existing) return createApiResponse(false, undefined, 'Post not found', 404);

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { mediaIds, ...updateData } = parsed.data;

    const post = await db.post.update({
      where: { id },
      data: {
        ...updateData,
        hashtags: updateData.hashtags ? JSON.stringify(updateData.hashtags) : undefined,
        seoKeywords: updateData.seoKeywords ? JSON.stringify(updateData.seoKeywords) : undefined,
      },
      include: { media: { include: { media: true } } },
    });

    if (mediaIds) {
      await db.postMedia.deleteMany({ where: { postId: id } });
      if (mediaIds.length > 0) {
        await db.postMedia.createMany({
          data: mediaIds.map((mediaId, index) => ({ postId: id, mediaId, order: index })),
        });
      }
    }

    await db.activityLog.create({
      data: { userId: user.userId, action: 'update_post', resource: 'post', resourceId: id },
    });

    logger.info(`Post updated: ${id} by ${user.email}`);

    return createApiResponse(true, post);
  } catch (error) {
    logger.error('Update post error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { id } = await params;
    const existing = await db.post.findFirst({ where: { id, userId: user.userId } });
    if (!existing) return createApiResponse(false, undefined, 'Post not found', 404);

    await db.schedule.deleteMany({ where: { postId: id } });
    await db.postMedia.deleteMany({ where: { postId: id } });
    await db.postComment.deleteMany({ where: { postId: id } });
    await db.post.delete({ where: { id } });

    await db.activityLog.create({
      data: { userId: user.userId, action: 'delete_post', resource: 'post', resourceId: id },
    });

    logger.info(`Post deleted: ${id} by ${user.email}`);

    return createApiResponse(true, { message: 'Post deleted' });
  } catch (error) {
    logger.error('Delete post error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}