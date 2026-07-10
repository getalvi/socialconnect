'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { mockPosts, mockEngagementTrend, mockPlatformPerformance, platformIcons, platformColors, statusColors } from '@/lib/mock-data';
import { BarChart3, Calendar, FileText, TrendingUp, Users, Zap, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const statsCards = [
  { title: 'Total Posts', value: '156', change: '+12%', icon: FileText, color: 'from-emerald-500 to-teal-600' },
  { title: 'Scheduled', value: '23', change: '+5', icon: Calendar, color: 'from-amber-500 to-orange-600' },
  { title: 'Published', value: '128', change: '+8%', icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
  { title: 'Engagement Rate', value: '4.2%', change: '+0.3%', icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
  { title: 'Total Reach', value: '89.2K', change: '+15%', icon: Users, color: 'from-sky-500 to-blue-600' },
  { title: 'AI Credits', value: '2,450', change: '78% left', icon: Zap, color: 'from-rose-500 to-pink-600' },
];

export default function DashboardView() {
  const { setActiveSection, notifications } = useAppStore();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Engagement Trend */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Engagement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockEngagementTrend.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} dot={false} name="Engagement %" />
                <Line type="monotone" dataKey="reach" stroke="#06B6D4" strokeWidth={2} dot={false} name="Reach" yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockPlatformPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="platform" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="engagement" fill="#10B981" radius={[0, 4, 4, 0]} name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts & Schedule + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Posts */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Recent Posts
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('content')} className="text-xs text-emerald-400">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {mockPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center shrink-0">
                      <span className="text-lg">{post.platforms[0] ? platformIcons[post.platforms[0]] : '📝'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[post.status] || 'bg-slate-500/20 text-slate-400'}`}>
                          {post.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {post.platforms.map(p => platformIcons[p]).join(' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {post.engagementRate > 0 && (
                        <p className="text-sm font-semibold text-emerald-400">{post.engagementRate}%</p>
                      )}
                      {post.totalReach > 0 && (
                        <p className="text-[10px] text-muted-foreground">{(post.totalReach / 1000).toFixed(1)}K reach</p>
                      )}
                      {post.scheduledAt && (
                        <p className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-400 mb-1">Best Posting Time</p>
                <p className="text-sm text-foreground">Post on Instagram between 6-9 PM for 40% higher engagement</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-medium text-amber-400 mb-1">Trending Alert</p>
                <p className="text-sm text-foreground">#SummerFashion is trending in Bangladesh - 2.5M posts</p>
              </div>
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <p className="text-xs font-medium text-sky-400 mb-1">Content Suggestion</p>
                <p className="text-sm text-foreground">Your audience prefers carousel posts - 3x more engagement than single images</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs font-medium text-violet-400 mb-1">Growth Opportunity</p>
                <p className="text-sm text-foreground">Pinterest shows 28% follower growth potential in your niche</p>
              </div>
              <Button
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => setActiveSection('upload')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Upcoming Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection('schedule')} className="text-xs text-emerald-400">
              View Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {mockPosts.filter(p => p.status === 'SCHEDULED').map((post) => (
              <div key={post.id} className="shrink-0 w-64 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{post.platforms[0] ? platformIcons[post.platforms[0]] : '📝'}</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[post.status]}`}>
                    {post.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground truncate mb-2">{post.title}</p>
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not scheduled'}
                </p>
                <div className="flex gap-1 mt-2">
                  {post.platforms.map(p => (
                    <span key={p} className="text-xs" title={p}>{platformIcons[p]}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
