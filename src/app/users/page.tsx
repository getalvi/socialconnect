"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Shield, Crown, Pencil, Eye } from "lucide-react";

const USERS = [
  { name: "Alvi", email: "alvi@socialconnect.ai", role: "owner", initials: "AI", color: "from-emerald-500 to-teal-600", joined: "Jan 2026", lastActive: "now" },
  { name: "Sarah Chen", email: "sarah@socialconnect.ai", role: "admin", initials: "SC", color: "from-sky-500 to-indigo-600", joined: "Feb 2026", lastActive: "2 hours ago" },
  { name: "Karim Ahmed", email: "karim@socialconnect.ai", role: "editor", initials: "KA", color: "from-amber-500 to-orange-600", joined: "Mar 2026", lastActive: "1 day ago" },
  { name: "Riya Patel", email: "riya@socialconnect.ai", role: "editor", initials: "RP", color: "from-rose-500 to-pink-600", joined: "Apr 2026", lastActive: "3 days ago" },
  { name: "External Client", email: "viewer@socialconnect.ai", role: "viewer", initials: "EC", color: "from-slate-500 to-slate-700", joined: "Jun 2026", lastActive: "1 week ago" },
];

const ROLE_INFO: Record<string, { icon: typeof Crown; color: string; desc: string }> = {
  owner: { icon: Crown, color: "text-amber-500", desc: "Full access, billing, deletion" },
  admin: { icon: Shield, color: "text-sky-500", desc: "Manage users, all content" },
  editor: { icon: Pencil, color: "text-emerald-500", desc: "Create/edit/publish content" },
  viewer: { icon: Eye, color: "text-muted-foreground", desc: "Read-only access" },
};

export default function UsersPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage team members and their permissions (RBAC)</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(ROLE_INFO).map(([role, info]) => {
            const Icon = info.icon;
            const count = USERS.filter((u) => u.role === role).length;
            return (
              <Card key={role}>
                <CardContent className="p-4">
                  <Icon className={`mb-2 h-4 w-4 ${info.color}`} />
                  <p className="text-2xl font-bold capitalize">{count}</p>
                  <p className="text-xs font-medium capitalize">{role}s</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{info.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Members</CardTitle>
            <CardDescription>{USERS.length} members in your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {USERS.map((u) => {
              const info = ROLE_INFO[u.role];
              const RoleIcon = info.icon;
              return (
                <div key={u.email} className="flex flex-wrap items-center gap-4 rounded-lg border p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`bg-gradient-to-br ${u.color} text-white`}>
                      {u.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-xs font-medium">{u.joined}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-muted-foreground">Last active</p>
                    <p className="text-xs font-medium">{u.lastActive}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${info.color}`}>
                    <RoleIcon className="mr-1 h-3 w-3" />
                    {u.role}
                  </Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
