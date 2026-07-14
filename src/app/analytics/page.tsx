"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2, MousePointerClick, Users } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

const TREND = [
  { day: "Wk1", impressions: 124000, engagement: 8200, clicks: 4100 },
  { day: "Wk2", impressions: 158000, engagement: 11000, clicks: 5400 },
  { day: "Wk3", impressions: 142000, engagement: 9400, clicks: 4800 },
  { day: "Wk4", impressions: 195000, engagement: 13800, clicks: 7200 },
];

const PLATFORM_SHARE = [
  { name: "Instagram", value: 35, color: "#ec4899" },
  { name: "Facebook", value: 22, color: "#3b82f6" },
  { name: "TikTok", value: 18, color: "#0f172a" },
  { name: "LinkedIn", value: 12, color: "#0284c7" },
  { name: "Twitter/X", value: 8, color: "#1d4ed8" },
  { name: "Pinterest", value: 5, color: "#dc2626" },
];

const TOP_POSTS = [
  { title: "Summer Collection Reveal", platform: "Instagram", impressions: 48200, engagement: 8400, rate: "17.4%" },
  { title: "Behind the Scenes", platform: "TikTok", impressions: 42100, engagement: 7200, rate: "17.1%" },
  { title: "Customer Spotlight", platform: "Facebook", impressions: 31800, engagement: 4100, rate: "12.9%" },
  { title: "Industry Insight", platform: "LinkedIn", impressions: 28400, engagement: 3900, rate: "13.7%" },
  { title: "Weekend Sale", platform: "Instagram", impressions: 25600, engagement: 3200, rate: "12.5%" },
];

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cross-platform performance insights</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Impressions", value: "619K", icon: Eye, color: "text-emerald-500" },
            { label: "Reach", value: "412K", icon: Users, color: "text-teal-500" },
            { label: "Likes", value: "42.4K", icon: Heart, color: "text-rose-500" },
            { label: "Comments", value: "8.1K", icon: MessageCircle, color: "text-amber-500" },
            { label: "Shares", value: "3.9K", icon: Share2, color: "text-sky-500" },
            { label: "Clicks", value: "21.5K", icon: MousePointerClick, color: "text-violet-500" },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.label}>
                <CardContent className="p-4">
                  <Icon className={`mb-2 h-4 w-4 ${k.color}`} />
                  <p className="text-2xl font-bold">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">4-Week Performance</CardTitle>
              <CardDescription>Weekly aggregated metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND}>
                    <defs>
                      <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} fill="url(#a1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Share</CardTitle>
              <CardDescription>Engagement distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PLATFORM_SHARE} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {PLATFORM_SHARE.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Posts</CardTitle>
            <CardDescription>Sorted by impressions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TOP_POSTS.map((p, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.platform}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{p.impressions.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">impressions</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{p.engagement.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">engagement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.rate}</p>
                    <p className="text-[10px] text-muted-foreground">eng. rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
