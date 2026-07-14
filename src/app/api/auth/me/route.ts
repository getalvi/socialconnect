import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const fullUser = await db.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            media: true,
            accounts: true,
            schedules: true,
          },
        },
      },
    });

    if (!fullUser) return createApiResponse(false, undefined, 'User not found', 404);

    return createApiResponse(true, fullUser);
  } catch (error) {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}