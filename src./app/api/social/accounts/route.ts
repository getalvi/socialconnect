import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { socialAccountAddSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const accounts = await db.socialAccount.findMany({
      where: { userId: user.userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return createApiResponse(true, accounts);
  } catch (error) {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = socialAccountAddSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const account = await db.socialAccount.create({
      data: {
        ...parsed.data,
        userId: user.userId,
        scopes: parsed.data.scopes ? JSON.stringify(parsed.data.scopes) : undefined,
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : undefined,
        tokenExpiresAt: parsed.data.tokenExpiresAt ? new Date(parsed.data.tokenExpiresAt) : undefined,
      },
    });

    await db.activityLog.create({
      data: {
        userId: user.userId, action: 'connect_social',
        resource: 'social_account', resourceId: account.id,
        metadata: JSON.stringify({ platform: parsed.data.platform, displayName: parsed.data.displayName }),
      },
    });

    logger.info(`Social account connected: ${parsed.data.platform} for ${user.email}`);

    return createApiResponse(true, account, undefined, 201);
  } catch (error) {
    logger.error('Add social account error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}