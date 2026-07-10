'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { mockEngagementTrend, mockPlatformPerformance, mockTopHashtags, mockBestPostingTimes } from '@/lib/mock-data';
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Heart, MessageCircle, Share2, Download, Sparkles, ArrowUpRight, ArrowDownRight, Hash, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';

const overviewStats = [
  { title: 'Total Reach', value: '89.2K', change: '+15.3%', changeType: 'up', icon: Eye, color: 'from-emerald-500 to-teal-600' },
  { title: 'Impressions', value: '234.5K', change: '+8.7%', changeType: 'up', icon: BarChart3, color: 'from-sky-500 to-blue-600' },
  { title: 'Clicks', value: '4,567', change: '+22.1%', changeType: 'up', icon: MousePointer, color: 'from-violet-500 to-purple-600' },
  { title: 'CTR', value: '1.95%', change: '+0.12%', changeType: 'up', icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
  { title: 'Likes', value: '2,702', change: '+18.4%', changeType: 'up', icon: Heart, color: 'from-rose-500 to-pink-600' },
  { title: 'Comments', value: '201', change: '-5.2%', changeType: 'down', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
  { title: 'Shares', value: '403', change: '+12.6%', changeType: 'up', icon: Share2, color: 'from-cyan-500 to-teal-600' },
  { title: 'Followers', value: '40,720', change: '+2,340', changeType: 'up', icon: Users, color: 'from-indigo-500 to-violet-600' },
];

const aiRecommendations = [
  { type: 'schedule', title: 'Optimal Posting Time', message: 'Your Instagram audience is most active between 6-9 PM. Consider scheduling your next 5 posts during this window.', confidence: 92, impact: 'high' },
  { type: 'content', title: 'Content Strategy', message: 'Carousel posts generate 3.2x more engagement than single images. Increase carousel content to 40% of your feed.', confidence: 87, impact: 'high' },
  { type: 'hashtag', title: 'Hashtag Optimization', message: '#BangladeshiFashion has low competition but growing search volume. Add it to your next 10 posts for local reach.', confidence: 85, impact: 'medium' },
  { type: 'platform', title: 'Platform Focus', message: 'Pinterest drives 28% of your website traffic despite only 5% of posts. Double your Pinterest posting frequency.', confidence: 90, impact: 'high' },
  { type: 'engagement', title: 'Engagement Window', message: 'Responding to comments within 30 minutes increases re-engagement by 3x. Set up auto-replies for common questions.', confidence: 78, impact: 'medium' },
];

export default function AnalyticsView() {
  const { analyticsRange, setAnalyticsRange } = useAppStore();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Track performance and get AI-powered recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {(['7d', '30d', '90d'] as const).map(range => (
              <Button
                key={range}
                variant={analyticsRange === range ? 'default' : 'ghost'}
                size="sm"
                className={analyticsRange === range ? 'bg-emerald-600 hover:bg-emerald-700 text-xs' : 'text-xs text-muted-foreground'}
                onClick={() => setAnalyticsRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="border-emerald-500/30 text-emerald-400">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {overviewStats.map(stat => {
          const Icon = stat.icon;
          const isUp = stat.changeType === 'up';
          return (
            <Card key={stat.title} className="border-border/50 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.title}</p>
                <p className={`text-[10px] font-medium mt-1 ${isUp ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-0.5`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Engagement Over Time */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockEngagementTrend}>
                <defs>
                  <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} interval="preserveStartEnd" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="engagement" stroke="#10B981" fill="url(#engagementGrad)" strokeWidth={2} name="Engagement %" />
                <Area type="monotone" dataKey="reach" stroke="#06B6D4" fill="url(#reachGrad)" strokeWidth={2} name="Reach" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Platform Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockPlatformPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="reach" radius={[4, 4, 0, 0]} name="Reach">
                  {mockPlatformPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hashtags & Best Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Hashtags */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" />
              Top Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockTopHashtags.slice(8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="tag" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} width={120} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} name="Usage Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Posting Times */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Best Posting Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockBestPostingTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} angle={-45} textAnchor="end" height={50} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} domain={[0, 8]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="score" name="Engagement Score" radius={[4, 4, 0, 0]}>
                  {mockBestPostingTimes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 6 ? '#10B981' : entry.score >= 4 ? '#F59E0B' : '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiRecommendations.map((rec, i) => (
              <div key={i} className={`p-4 rounded-lg border transition-all hover:border-emerald-500/30
                ${rec.impact === 'high' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30 border-border/50'}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-[10px] px-1.5 py-0 ${rec.impact === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {rec.impact} impact
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{rec.confidence}% confidence</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{rec.title}</h4>
                <p className="text-xs text-muted-foreground">{rec.message}</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs text-emerald-400 hover:text-emerald-300 p-0">
                  Apply Suggestion →
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
