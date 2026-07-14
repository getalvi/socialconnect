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

    const [totalLogs, aggregated] = await Promise.all([
      db.aiUsageLog.count({ where: { userId: user.userId, createdAt: { gte: startDate } } }),
      db.aiUsageLog.groupBy({
        by: ['requestType'],
        where: { userId: user.userId, createdAt: { gte: startDate } },
        _sum: { promptTokens: true, completionTokens: true, totalTokens: true, costUsd: true, latencyMs: true },
        _count: { id: true },
      }),
    ]);

    const byModel = await db.aiUsageLog.groupBy({
      by: ['model'],
      where: { userId: user.userId, createdAt: { gte: startDate } },
      _sum: { totalTokens: true, costUsd: true },
      _count: { id: true },
    });

    const recentLogs = await db.aiUsageLog.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const totalTokens = aggregated.reduce((sum, a) => sum + (a._sum.totalTokens || 0), 0);
    const totalCost = aggregated.reduce((sum, a) => sum + (a._sum.costUsd || 0), 0);
    const avgLatency = aggregated.reduce((sum, a) => sum + ((a._sum.latencyMs || 0) / (a._count.id || 1)), 0) / (aggregated.length || 1);

    return createApiResponse(true, {
      summary: {
        totalRequests: totalLogs,
        totalTokens,
        totalCost,
        avgLatencyMs: Math.round(avgLatency),
      },
      byType: aggregated.map(a => ({
        type: a.requestType,
        count: a._count.id,
        tokens: a._sum.totalTokens || 0,
        cost: a._sum.costUsd || 0,
      })),
      byModel: byModel.map(m => ({
        model: m.model,
        requests: m._count.id,
        tokens: m._sum.totalTokens || 0,
        cost: m._sum.costUsd || 0,
      })),
      recentLogs,
    });
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}