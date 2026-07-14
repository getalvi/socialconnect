import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken, createApiResponse } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = rateLimit(ip, 5, 60000);
    if (!allowed) return createApiResponse(false, undefined, 'Too many registration attempts. Please try again later.', 429);

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { email, password, name } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return createApiResponse(false, undefined, 'Email already registered', 409);

    const passwordHash = hashPassword(password);
    const user = await db.user.create({
      data: { email, passwordHash, name: name || null, role: 'admin' },
    });

    const token = generateAccessToken(user.id, user.role, user.email);
    const refreshToken = generateRefreshToken();

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'register',
        metadata: JSON.stringify({ email: user.email }),
        ipAddress: ip,
      },
    });

    logger.info(`User registered: ${user.email}`);

    return createApiResponse(true, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
      refreshToken,
    }, undefined, 201);
  } catch (error) {
    logger.error('Registration error', error);
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}