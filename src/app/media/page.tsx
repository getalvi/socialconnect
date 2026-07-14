"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, Filter, ImageIcon } from "lucide-react";

const MEDIA = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  name: `product-shot-${i + 1}.jpg`,
  type: i % 7 === 0 ? "video" : "image",
  size: `${(1.2 + (i % 4) * 0.5).toFixed(1)} MB`,
  uploaded: `${i + 1}h ago`,
  gradient: [
    "from-rose-400 to-orange-400",
    "from-emerald-400 to-teal-500",
    "from-sky-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-pink-500",
    "from-cyan-400 to-blue-500",
  ][i % 6],
}));

export default function MediaPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Media Library</h1>
            <p className="mt-1 text-sm text-muted-foreground">All your product images and videos in one place</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by filename or tag..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {MEDIA.map((m) => (
            <Card key={m.id} className="group overflow-hidden">
              <div className={`relative aspect-square bg-gradient-to-br ${m.gradient}`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-[10px] font-medium text-white">{m.name}</p>
                  <p className="text-[9px] text-white/80">{m.size}</p>
                </div>
                {m.type === "video" && (
                  <div className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                    VIDEO
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <p className="truncate text-xs font-medium">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.uploaded}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
