import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, verifyPassword, hashPassword, createApiResponse } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const fullUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!fullUser) return createApiResponse(false, undefined, 'User not found', 404);

    const valid = verifyPassword(parsed.data.currentPassword, fullUser.passwordHash);
    if (!valid) return createApiResponse(false, undefined, 'Current password is incorrect', 400);

    await db.user.update({
      where: { id: user.userId },
      data: { passwordHash: hashPassword(parsed.data.newPassword) },
    });

    await db.activityLog.create({
      data: { userId: user.userId, action: 'change_password' },
    });

    logger.info(`Password changed for: ${user.email}`);

    return createApiResponse(true, { message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Password change error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}