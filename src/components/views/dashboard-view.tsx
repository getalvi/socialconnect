'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ImagePlus, Sparkles, Calendar, Send, TrendingUp, Users, Zap, Activity } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export function DashboardView() {
  const { setCurrentView } = useAppStore();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get('/api/analytics/overview'),
  });

  const stats = (overview?.data as Record<string, unknown>)?.stats as Record<string, unknown> | undefined;
  const recentPosts = (overview?.data as Record<string, unknown>)?.recentPosts as Array<Record<string, unknown>> | undefined;
  const recentActivity = (overview?.data as Record<string, unknown>)?.recentActivity as Array<Record<string, unknown>> | undefined;

  const statCards = [
    { label: 'Total Posts', value: stats?.totalPosts ?? 0, icon: FileText, color: 'text-emerald-500' },
    { label: 'Published', value: stats?.publishedPosts ?? 0, icon: Send, color: 'text-blue-500' },
    { label: 'Scheduled', value: stats?.scheduledPosts ?? 0, icon: Calendar, color: 'text-amber-500' },
    { label: 'Media Files', value: stats?.totalMedia ?? 0, icon: ImagePlus, color: 'text-purple-500' },
    { label: 'Connected', value: stats?.connectedAccounts ?? 0, icon: Users, color: 'text-rose-500' },
    { label: 'AI Requests', value: stats?.aiUsageCount ?? 0, icon: Zap, color: 'text-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to SocialConnect AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('media')}>
            <ImagePlus className="h-4 w-4 mr-1.5" /> Upload
          </Button>
          <Button variant="outline" onClick={() => setCurrentView('content')}>
            <FileText className="h-4 w-4 mr-1.5" /> New Post
          </Button>
          <Button onClick={() => setCurrentView('ai-studio')}>
            <Sparkles className="h-4 w-4 mr-1.5" /> AI Studio
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-12" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{String(s.value)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <div key={String(post.id)} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{String(post.title || 'Untitled')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(String(post.createdAt)), 'MMM d, h:mm a')}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      String(post.status) === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      String(post.status) === 'scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      String(post.status) === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {String(post.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No posts yet. Create your first post to get started.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentActivity.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm">{String(log.action).replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(String(log.createdAt)), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}