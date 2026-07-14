import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, createApiResponse } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = rateLimit(ip, 10, 60000);
    if (!allowed) return createApiResponse(false, undefined, 'Too many login attempts. Please try again later.', 429);

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return createApiResponse(false, undefined, 'Invalid email or password', 401);
    if (!user.isActive) return createApiResponse(false, undefined, 'Account is deactivated', 403);

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) return createApiResponse(false, undefined, 'Invalid email or password', 401);

    const token = generateAccessToken(user.id, user.role, user.email);
    const refreshToken = generateRefreshToken();

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'login',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    logger.info(`User logged in: ${user.email}`);

    return createApiResponse(true, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}