import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const [
      totalPosts,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      totalMedia,
      connectedAccounts,
      aiUsageCount,
      totalTokens,
      totalCost,
    ] = await Promise.all([
      db.post.count({ where: { userId: user.userId } }),
      db.post.count({ where: { userId: user.userId, status: 'published' } }),
      db.post.count({ where: { userId: user.userId, status: 'scheduled' } }),
      db.post.count({ where: { userId: user.userId, status: 'draft' } }),
      db.media.count({ where: { userId: user.userId } }),
      db.socialAccount.count({ where: { userId: user.userId, isActive: true } }),
      db.aiUsageLog.count({ where: { userId: user.userId } }),
      db.aiUsageLog.aggregate({ where: { userId: user.userId }, _sum: { totalTokens: true } }),
      db.aiUsageLog.aggregate({ where: { userId: user.userId }, _sum: { costUsd: true } }),
    ]);

    const recentPosts = await db.post.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, platform: true, createdAt: true, publishedAt: true },
    });

    const recentActivity = await db.activityLog.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const postsByStatus = await db.post.groupBy({
      by: ['status'],
      where: { userId: user.userId },
      _count: { status: true },
    });

    return createApiResponse(true, {
      stats: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        totalMedia,
        connectedAccounts,
        aiUsageCount,
        totalTokens: totalTokens._sum.totalTokens || 0,
        totalCost: totalCost._sum.costUsd || 0,
      },
      recentPosts,
      recentActivity,
      postsByStatus: postsByStatus.map(p => ({ status: p.status, count: p._count.status })),
    });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}