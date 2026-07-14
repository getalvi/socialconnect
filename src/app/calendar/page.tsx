"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHEDULED: Record<string, { title: string; platform: string; color: string; time: string }[]> = {
  "Wed 9": [{ title: "Industry Insight", platform: "LinkedIn", color: "bg-sky-600", time: "9:00 AM" }],
  "Wed 15": [{ title: "Product Demo", platform: "TikTok", color: "bg-slate-900", time: "3:00 PM" }],
  "Thu 10": [{ title: "Customer Story", platform: "Instagram", color: "bg-pink-500", time: "10:00 AM" }],
  "Thu 18": [{ title: "Summer Reel", platform: "Instagram", color: "bg-pink-500", time: "6:00 PM" }],
  "Fri 12": [{ title: "Weekend Deal", platform: "Facebook", color: "bg-blue-600", time: "12:00 PM" }],
  "Sat 9": [{ title: "Behind the Scenes", platform: "TikTok", color: "bg-slate-900", time: "9:00 AM" }],
};

export default function CalendarPage() {
  // Build a 5-week grid for current month (Jul 2026)
  const dates: { day: number; key: string; isToday: boolean; inMonth: boolean }[] = [];
  for (let i = 0; i < 35; i++) {
    const dayNum = i - 1; // Jul 1 = Wed (index 2 in some calendars)
    const inMonth = dayNum >= 1 && dayNum <= 31;
    const key = inMonth ? `${DAYS[i % 7]} ${dayNum}` : "";
    dates.push({ day: inMonth ? dayNum : 0, key, isToday: dayNum === 14, inMonth });
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Content Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Schedule and visualize your publishing plan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Month</Button>
            <Button variant="outline" size="sm">Week</Button>
            <Button variant="outline" size="sm">Day</Button>
            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Plus className="mr-1 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">July 2026</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">Today</Button>
                <Button variant="ghost" size="icon" aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {dates.map((d, i) => (
                <div
                  key={i}
                  className={`min-h-24 rounded-lg border p-1.5 ${
                    d.isToday ? "border-emerald-500 bg-emerald-500/5" : "border-border"
                  } ${!d.inMonth ? "bg-muted/30 opacity-50" : ""}`}
                >
                  {d.inMonth && (
                    <>
                      <p className={`text-xs font-medium ${d.isToday ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                        {d.day}
                      </p>
                      <div className="mt-1 space-y-1">
                        {(SCHEDULED[d.key] || []).map((s, j) => (
                          <div
                            key={j}
                            className={`rounded px-1 py-0.5 text-[9px] font-medium text-white ${s.color}`}
                            title={`${s.time} — ${s.title}`}
                          >
                            <span className="block truncate">{s.time} {s.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(SCHEDULED).map(([key, items]) =>
              items.map((item, i) => (
                <div key={`${key}-${i}`} className="flex items-center gap-3 rounded-lg border p-2">
                  <div className={`h-8 w-1 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{key.replace(" ", ", ")} at {item.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{item.platform}</Badge>
                </div>
              )),
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
