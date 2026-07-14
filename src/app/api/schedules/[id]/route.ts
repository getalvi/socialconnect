import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();
    const { scheduledAt } = body;

    const schedule = await db.schedule.findFirst({ where: { id, userId: user.userId } });
    if (!schedule) return createApiResponse(false, undefined, 'Schedule not found', 404);
    if (schedule.status === 'completed') return createApiResponse(false, undefined, 'Cannot modify completed schedule', 400);

    const updated = await db.schedule.update({
      where: { id },
      data: { scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined },
    });

    if (scheduledAt) {
      await db.post.update({
        where: { id: schedule.postId },
        data: { publishAt: new Date(scheduledAt) },
      });
    }

    return createApiResponse(true, updated);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { id } = await params;
    const schedule = await db.schedule.findFirst({ where: { id, userId: user.userId } });
    if (!schedule) return createApiResponse(false, undefined, 'Schedule not found', 404);

    await db.schedule.delete({ where: { id } });
    await db.post.update({
      where: { id: schedule.postId },
      data: { status: 'draft', publishAt: null },
    });

    return createApiResponse(true, { message: 'Schedule cancelled' });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}