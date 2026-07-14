import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);
    const { id } = await params;
    const account = await db.socialAccount.findFirst({ where: { id, userId: user.userId } });
    if (!account) return createApiResponse(false, undefined, 'Account not found', 404);
    return createApiResponse(true, account);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);
    const { id } = await params;

    const account = await db.socialAccount.findFirst({ where: { id, userId: user.userId } });
    if (!account) return createApiResponse(false, undefined, 'Account not found', 404);

    await db.socialAccount.update({ where: { id }, data: { isActive: false, accessToken: 'revoked' } });

    await db.activityLog.create({
      data: { userId: user.userId, action: 'disconnect_social', resource: 'social_account', resourceId: id },
    });

    logger.info(`Social account disconnected: ${account.platform} for ${user.email}`);
    return createApiResponse(true, { message: 'Account disconnected' });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}