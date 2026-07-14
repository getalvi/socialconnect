"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check } from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, type: "success", title: "Post published successfully", body: "Your Instagram reel 'Summer Collection' is now live.", time: "5 min ago", read: false },
  { id: 2, type: "success", title: "Campaign milestone reached", body: "Eid ul Adha Special reached 90% completion.", time: "1 hour ago", read: false },
  { id: 3, type: "warning", title: "Token expiring soon", body: "Your Twitter/X token expires in 28 days. Reconnect to continue publishing.", time: "3 hours ago", read: false },
  { id: 4, type: "info", title: "AI generation complete", body: "Your 5 caption variations for 'Jute Tote' are ready to review.", time: "6 hours ago", read: true },
  { id: 5, type: "error", title: "Publishing failed", body: "Pinterest post failed: rate limit exceeded. Will retry in 1 hour.", time: "1 day ago", read: true },
  { id: 6, type: "info", title: "New trend detected", body: "#PlasticFreeJuly is trending in your category. Generate content now.", time: "1 day ago", read: true },
  { id: 7, type: "success", title: "Analytics sync complete", body: "Last 30 days of analytics synced from all platforms.", time: "2 days ago", read: true },
];

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">Stay updated on your AI employee's activity</p>
          </div>
          <Button variant="outline" size="sm">
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-emerald-500/5" : ""}`}>
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  n.type === "success" ? "bg-emerald-500/10 text-emerald-500" :
                  n.type === "warning" ? "bg-amber-500/10 text-amber-500" :
                  n.type === "error" ? "bg-rose-500/10 text-rose-500" :
                  "bg-sky-500/10 text-sky-500"
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
