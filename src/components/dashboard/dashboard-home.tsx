"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, Eye, Heart, MessageCircle, Share2, MousePointerClick,
  Sparkles, Megaphone, Calendar, Plus, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

const KPI_DATA = [
  { label: "Impressions", value: "284.5K", delta: "+12.4%", up: true, icon: Eye, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Engagement", value: "18.2K", delta: "+8.1%", up: true, icon: Heart, color: "text-rose-600 dark:text-rose-400" },
  { label: "Comments", value: "3.4K", delta: "+4.7%", up: true, icon: MessageCircle, color: "text-amber-600 dark:text-amber-400" },
  { label: "Shares", value: "1.9K", delta: "-2.3%", up: false, icon: Share2, color: "text-sky-600 dark:text-sky-400" },
  { label: "Clicks", value: "9.8K", delta: "+15.6%", up: true, icon: MousePointerClick, color: "text-violet-600 dark:text-violet-400" },
  { label: "Reach", value: "192.3K", delta: "+9.2%", up: true, icon: TrendingUp, color: "text-teal-600 dark:text-teal-400" },
];

const TREND_DATA = [
  { day: "Mon", impressions: 12400, engagement: 820, clicks: 410 },
  { day: "Tue", impressions: 15800, engagement: 1100, clicks: 540 },
  { day: "Wed", impressions: 14200, engagement: 940, clicks: 480 },
  { day: "Thu", impressions: 19500, engagement: 1380, clicks: 720 },
  { day: "Fri", impressions: 22800, engagement: 1640, clicks: 910 },
  { day: "Sat", impressions: 26300, engagement: 2010, clicks: 1180 },
  { day: "Sun", impressions: 24100, engagement: 1820, clicks: 1040 },
];

const PLATFORM_DATA = [
  { platform: "Facebook", posts: 12, engagement: 4200 },
  { platform: "Instagram", posts: 18, engagement: 6800 },
  { platform: "Twitter/X", posts: 24, engagement: 2100 },
  { platform: "LinkedIn", posts: 8, engagement: 3400 },
  { platform: "TikTok", posts: 9, engagement: 5600 },
  { platform: "Pinterest", posts: 14, engagement: 2900 },
];

const RECENT_CAMPAIGNS = [
  { name: "Summer Collection Launch", status: "active", platforms: ["instagram", "facebook", "tiktok"], posts: 24, progress: 78 },
  { name: "Eid ul Adha Special", status: "active", platforms: ["instagram", "whatsapp", "facebook"], posts: 18, progress: 92 },
  { name: "Back to School 2026", status: "planning", platforms: ["pinterest", "facebook"], posts: 6, progress: 25 },
  { name: "Brand Awareness Q3", status: "paused", platforms: ["linkedin", "twitter"], posts: 12, progress: 45 },
];

const UPCOMING = [
  { title: "Summer Collection — Instagram Reel", time: "Today, 6:00 PM", platform: "Instagram", color: "bg-pink-500" },
  { title: "Eid Special — Facebook Post", time: "Tomorrow, 10:00 AM", platform: "Facebook", color: "bg-blue-600" },
  { title: "Product Demo — TikTok Video", time: "Tomorrow, 3:00 PM", platform: "TikTok", color: "bg-slate-900" },
  { title: "Industry Insight — LinkedIn", time: "Wed, 9:00 AM", platform: "LinkedIn", color: "bg-sky-700" },
];

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "IG",
  facebook: "FB",
  tiktok: "TT",
  whatsapp: "WA",
  pinterest: "PIN",
  linkedin: "IN",
  twitter: "X",
};

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, Alvi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI marketing employee published 24 posts this week across 6 platforms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 days
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      kpi.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.delta}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Performance Trend</CardTitle>
            <CardDescription>Impressions, engagement, and clicks over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
                  <Area type="monotone" dataKey="engagement" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                  <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Platform</CardTitle>
            <CardDescription>Posts published & engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PLATFORM_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="platform" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="engagement" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns + Upcoming */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Campaigns</CardTitle>
                <CardDescription>Performance across active campaigns</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Megaphone className="mr-2 h-4 w-4" />
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_CAMPAIGNS.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <Badge
                      variant={c.status === "active" ? "default" : c.status === "paused" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1">
                      {c.platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {PLATFORM_LABELS[p] || p}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{c.posts} posts</span>
                  </div>
                  <Progress value={c.progress} className="mt-2 h-1" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{c.progress}%</p>
                  <p className="text-[10px] text-muted-foreground">complete</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Posts</CardTitle>
            <CardDescription>Scheduled for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {UPCOMING.map((u) => (
              <div key={u.title} className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${u.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{u.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{u.time}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {u.platform}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Open Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Preview */}
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-600/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">AI Marketing Assistant</CardTitle>
              <CardDescription>Your AI employee is ready to work</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Generate Captions
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Research Trends
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Analyze Product Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
