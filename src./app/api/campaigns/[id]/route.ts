import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { campaignSchema } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);
    const { id } = await params;

    const campaign = await db.campaign.findFirst({
      where: { id, userId: user.userId },
      include: {
        posts: { include: { media: { include: { media: true } } } },
        _count: { select: { posts: true } },
      },
    });

    if (!campaign) return createApiResponse(false, undefined, 'Campaign not found', 404);
    return createApiResponse(true, campaign);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);
    const { id } = await params;

    const existing = await db.campaign.findFirst({ where: { id, userId: user.userId } });
    if (!existing) return createApiResponse(false, undefined, 'Campaign not found', 404);

    const body = await request.json();
    const parsed = campaignSchema.partial().safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const updated = await db.campaign.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
    });

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

    const existing = await db.campaign.findFirst({ where: { id, userId: user.userId } });
    if (!existing) return createApiResponse(false, undefined, 'Campaign not found', 404);

    await db.campaign.update({ where: { id }, data: { status: 'archived' } });
    return createApiResponse(true, { message: 'Campaign archived' });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}