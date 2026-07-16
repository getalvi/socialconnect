"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Megaphone, Calendar as CalendarIcon, Users } from "lucide-react";

const CAMPAIGNS = [
  { name: "Summer Collection Launch", status: "active", platforms: ["Instagram", "Facebook", "TikTok"], posts: 24, progress: 78, budget: 5000, spent: 3200, start: "Jul 1, 2026", end: "Jul 31, 2026" },
  { name: "Eid ul Adha Special", status: "active", platforms: ["Instagram", "WhatsApp", "Facebook"], posts: 18, progress: 92, budget: 3000, spent: 2850, start: "Jun 15, 2026", end: "Jun 25, 2026" },
  { name: "Back to School 2026", status: "planning", platforms: ["Pinterest", "Facebook"], posts: 6, progress: 25, budget: 2000, spent: 200, start: "Aug 1, 2026", end: "Aug 31, 2026" },
  { name: "Brand Awareness Q3", status: "paused", platforms: ["LinkedIn", "Twitter/X"], posts: 12, progress: 45, budget: 4000, spent: 1800, start: "Jul 1, 2026", end: "Sep 30, 2026" },
  { name: "Winter Sale Teaser", status: "completed", platforms: ["Instagram", "TikTok"], posts: 30, progress: 100, budget: 2500, spent: 2500, start: "Jun 1, 2026", end: "Jun 30, 2026" },
];

export default function CampaignsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Campaigns</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track all your marketing campaigns</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-500/10 p-2"><Megaphone className="h-4 w-4 text-emerald-500" /></div><div><p className="text-2xl font-bold">5</p><p className="text-xs text-muted-foreground">Total Campaigns</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-sky-500/10 p-2"><CalendarIcon className="h-4 w-4 text-sky-500" /></div><div><p className="text-2xl font-bold">2</p><p className="text-xs text-muted-foreground">Active Now</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-amber-500/10 p-2"><Users className="h-4 w-4 text-amber-500" /></div><div><p className="text-2xl font-bold">90</p><p className="text-xs text-muted-foreground">Posts Published</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-violet-500/10 p-2"><CalendarIcon className="h-4 w-4 text-violet-500" /></div><div><p className="text-2xl font-bold">$10.6K</p><p className="text-xs text-muted-foreground">Total Budget</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Campaigns</CardTitle>
            <CardDescription>Click a campaign to view details, posts, and analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {CAMPAIGNS.map((c) => (
              <div key={c.name} className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{c.name}</h3>
                      <Badge variant={c.status === "active" ? "default" : c.status === "completed" ? "secondary" : c.status === "paused" ? "secondary" : "outline"} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{c.start} → {c.end}</span>
                      <span>•</span>
                      <span>{c.posts} posts</span>
                      <span>•</span>
                      <span>${c.spent} / ${c.budget} budget</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.platforms.map((p) => (
                        <span key={p} className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-32 shrink-0">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
