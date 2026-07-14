import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const posts = await db.post.findMany({
      where: { userId: user.userId, createdAt: { gte: startDate } },
      select: { id: true, title: true, status: true, platform: true, publishedAt: true, engagementData: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyData: Record<string, { date: string; posts: number; published: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailyData[key] = { date: key, posts: 0, published: 0 };
    }

    for (const post of posts) {
      const key = post.createdAt.toISOString().split('T')[0];
      if (dailyData[key]) {
        dailyData[key].posts++;
        if (post.status === 'published') dailyData[key].published++;
      }
    }

    const performance = posts
      .filter(p => p.engagementData)
      .map(p => {
        let data: Record<string, unknown> = {};
        try { data = JSON.parse(p.engagementData || '{}'); } catch { /* empty */ }
        return { id: p.id, title: p.title, platform: p.platform, status: p.status, publishedAt: p.publishedAt, ...data };
      });

    return createApiResponse(true, {
      dailyStats: Object.values(dailyData),
      posts,
      topPerforming: performance.sort((a, b) => {
        const aScore = (a.engagement_rate as number) || 0;
        const bScore = (b.engagement_rate as number) || 0;
        return bScore - aScore;
      }).slice(0, 10),
    });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}