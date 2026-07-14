import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { scheduleSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const schedules = await db.schedule.findMany({
      where: { userId: user.userId },
      include: { post: { select: { id: true, title: true, caption: true, status: true, platform: true } } },
      orderBy: { scheduledAt: 'desc' },
    });

    return createApiResponse(true, schedules);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const scheduledAt = new Date(parsed.data.scheduledAt);
    if (scheduledAt <= new Date()) {
      return createApiResponse(false, undefined, 'Scheduled time must be in the future', 400);
    }

    const post = await db.post.findFirst({ where: { id: parsed.data.postId, userId: user.userId } });
    if (!post) return createApiResponse(false, undefined, 'Post not found', 404);

    await db.post.update({
      where: { id: parsed.data.postId },
      data: { status: 'scheduled', publishAt: scheduledAt },
    });

    const schedule = await db.schedule.create({
      data: {
        postId: parsed.data.postId,
        userId: user.userId,
        scheduledAt,
        status: 'pending',
      },
    });

    await db.activityLog.create({
      data: { userId: user.userId, action: 'schedule_post', resource: 'schedule', resourceId: schedule.id, metadata: JSON.stringify({ postId: parsed.data.postId, scheduledAt }) },
    });

    logger.info(`Post scheduled: ${parsed.data.postId} at ${scheduledAt.toISOString()}`);

    return createApiResponse(true, schedule, undefined, 201);
  } catch (error) {
    logger.error('Schedule creation error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}