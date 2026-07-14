import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { campaignSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const campaigns = await db.campaign.findMany({
      where: { userId: user.userId },
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return createApiResponse(true, campaigns);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const campaign = await db.campaign.create({
      data: {
        ...parsed.data,
        userId: user.userId,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      },
    });

    logger.info(`Campaign created: ${campaign.id} by ${user.email}`);
    return createApiResponse(true, campaign, undefined, 201);
  } catch (error) {
    logger.error('Campaign create error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}