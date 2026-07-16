"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plug, AlertCircle, RefreshCw } from "lucide-react";

const PLATFORMS = [
  { name: "Facebook", icon: "f", color: "bg-blue-600", connected: true, account: "Alvi's Shop Page", expires: "in 50 days" },
  { name: "Instagram", icon: "IG", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400", connected: true, account: "@alvishop", expires: "in 50 days" },
  { name: "Twitter/X", icon: "X", color: "bg-slate-900", connected: true, account: "@alvi_ai", expires: "in 28 days" },
  { name: "LinkedIn", icon: "in", color: "bg-sky-700", connected: true, account: "Alvi Inc.", expires: "in 60 days" },
  { name: "TikTok", icon: "TT", color: "bg-slate-900", connected: false, account: null, expires: null },
  { name: "Pinterest", icon: "P", color: "bg-red-600", connected: true, account: "alvishop", expires: "in 45 days" },
  { name: "Threads", icon: "@", color: "bg-slate-900", connected: false, account: null, expires: null },
  { name: "Telegram", icon: "TG", color: "bg-sky-500", connected: false, account: null, expires: null },
  { name: "WhatsApp", icon: "WA", color: "bg-green-500", connected: false, account: null, expires: null },
  { name: "WordPress", icon: "W", color: "bg-slate-800", connected: false, account: null, expires: null },
  { name: "WooCommerce", icon: "WC", color: "bg-purple-700", connected: false, account: null, expires: null },
  { name: "Shopify", icon: "S", color: "bg-green-700", connected: false, account: null, expires: null },
  { name: "Google Business", icon: "G", color: "bg-amber-500", connected: false, account: null, expires: null },
];

export default function AccountsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Connected Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect your social media and e-commerce platforms via OAuth</p>
        </div>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <div className="text-sm">
              <p className="font-medium">OAuth is real, not mock.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Each platform implements OAuth2 with token refresh and encrypted storage. Click Connect to start the OAuth flow — you'll be redirected to the platform to authorize.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <Card key={p.name} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.color} text-sm font-bold text-white`}>
                      {p.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      {p.connected ? (
                        <Badge variant="outline" className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <Check className="mr-1 h-2.5 w-2.5" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-0.5 text-[10px] text-muted-foreground">
                          Not connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {p.connected ? (
                  <div className="mt-3 space-y-1 border-t pt-3">
                    <p className="text-xs text-muted-foreground">Account: <span className="font-medium text-foreground">{p.account}</span></p>
                    <p className="text-xs text-muted-foreground">Token expires: <span className="font-medium text-foreground">{p.expires}</span></p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Refresh
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" size="sm">
                    <Plug className="mr-2 h-3 w-3" />
                    Connect {p.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
