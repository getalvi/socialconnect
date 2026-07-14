import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken, createApiResponse } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken: token } = body;

    if (!token) return createApiResponse(false, undefined, 'Refresh token is required', 400);

    const stored = await db.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored) return createApiResponse(false, undefined, 'Invalid refresh token', 401);
    if (stored.expiresAt < new Date()) {
      await db.refreshToken.delete({ where: { id: stored.id } });
      return createApiResponse(false, undefined, 'Refresh token expired', 401);
    }

    await db.refreshToken.delete({ where: { id: stored.id } });

    const newToken = generateAccessToken(stored.user.id, stored.user.role, stored.user.email);
    const newRefreshToken = generateRefreshToken();

    await db.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`Token refreshed for: ${stored.user.email}`);

    return createApiResponse(true, {
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Token refresh error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}