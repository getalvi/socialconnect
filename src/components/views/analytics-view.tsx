'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Zap, Eye, TrendingUp, Hash } from 'lucide-react';

export function AnalyticsView() {
  const [days, setDays] = useState(30);

  const { data: overview } = useQuery({
    queryKey: ['overview-analytics'],
    queryFn: () => api.get('/api/analytics/overview'),
  });

  const { data: aiUsage } = useQuery({
    queryKey: ['ai-usage', days],
    queryFn: () => api.get(`/api/analytics/ai-usage?days=${days}`),
  });

  const stats = (overview?.data as Record<string, unknown>)?.stats as Record<string, unknown> | undefined;
  const aiSummary = (aiUsage?.data as Record<string, unknown>)?.summary as Record<string, unknown> | undefined;
  const byType = (aiUsage?.data as Record<string, unknown>)?.byType as Array<Record<string, unknown>> | undefined;

  const kpis = [
    { label: 'Total Posts', value: String(stats?.totalPosts ?? 0), icon: BarChart3, color: 'text-emerald-500' },
    { label: 'Published', value: String(stats?.publishedPosts ?? 0), icon: Eye, color: 'text-blue-500' },
    { label: 'AI Requests', value: String(aiSummary?.totalRequests ?? stats?.aiUsageCount ?? 0), icon: Zap, color: 'text-amber-500' },
    { label: 'Tokens Used', value: String(aiSummary?.totalTokens ?? stats?.totalTokens ?? 0), icon: Hash, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Track your performance and AI usage</p>
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-xs rounded-md transition-colors ${days === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
                  <Icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <p className="text-2xl font-bold">{k.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> AI Usage by Type</CardTitle></CardHeader>
          <CardContent>
            {byType && byType.length > 0 ? (
              <div className="space-y-3">
                {byType.map((item) => {
                  const maxTokens = Math.max(...byType.map(b => Number(b.tokens || 0)), 1);
                  return (
                    <div key={String(item.type)}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize">{String(item.type)}</span>
                        <span className="text-muted-foreground text-xs">{String(item.count)} requests</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(Number(item.tokens) / maxTokens) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No AI usage data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Post Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {stats?.postsByStatus ? (
              <div className="space-y-3">
                {(stats.postsByStatus as Array<Record<string, unknown>>).map((item) => {
                  const total = Number(stats.totalPosts) || 1;
                  const colors: Record<string, string> = { draft: 'bg-gray-400', published: 'bg-emerald-500', scheduled: 'bg-amber-500', failed: 'bg-red-500' };
                  return (
                    <div key={String(item.status)}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize">{String(item.status).replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground text-xs">{String(item.count)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${colors[String(item.status)] || 'bg-primary'}`} style={{ width: `${(Number(item.count) / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}