"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { BarChart3, Eye, Heart, MessageCircle, Share2, TrendingUp, Download } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<DashboardStats>(`/analytics/dashboard?days=${period}`)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i=><div key={i} className="card h-32 skeleton" />)}</div>;

  const cards = [
    { label: "Total Impressions", value: formatNum(stats?.total_impressions ?? 0), icon: Eye, color: "text-purple-400", bg: "bg-purple-400/10", change: "+12.5%" },
    { label: "Total Engagement", value: formatNum(stats?.total_engagement ?? 0), icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10", change: "+8.3%" },
    { label: "Likes", value: formatNum(stats?.total_likes ?? 0), icon: Heart, color: "text-red-400", bg: "bg-red-400/10", change: "+5.1%" },
    { label: "Comments", value: formatNum(stats?.total_comments ?? 0), icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10", change: "+3.7%" },
    { label: "Shares", value: formatNum(stats?.total_shares ?? 0), icon: Share2, color: "text-green-400", bg: "bg-green-400/10", change: "+15.2%" },
    { label: "Avg Engagement Rate", value: `${(stats?.avg_engagement_rate ?? 0).toFixed(2)}%`, icon: TrendingUp, color: "text-brand-400", bg: "bg-brand-400/10", change: "+2.1%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-surface-400 text-sm mt-1">Track your social media performance</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)} className={`px-3 py-1.5 text-sm ${period === d ? "bg-brand-600 text-white" : "text-surface-400 hover:bg-surface-800"}`}>{d}d</button>
            ))}
          </div>
          <button onClick={() => { api.post("/analytics/reports/generate?period=MONTHLY").then(() => toast.success("Report generated")); }} className="btn-secondary"><Download size={18} /> Export</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-400">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bg}`}><c.icon size={18} className={c.color} /></div>
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-green-400 mt-1">{c.change} vs previous period</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-4">Impressions Over Time</h3>
          <div className="h-64 flex items-end gap-1">
            {stats?.impressions_over_time?.slice(-20).map((d, i) => {
              const maxVal = Math.max(...(stats?.impressions_over_time?.map(x => x.value) || [1]));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-purple-500/70 rounded-t hover:bg-purple-400 transition-colors min-h-[4px]"
                    style={{ height: `${Math.max(4, (d.value / maxVal) * 220)}px` }}
                  />
                  <span className="text-[10px] text-surface-500">{d.date.slice(5)}</span>
                </div>
              );
            }) || <p className="text-surface-500 text-sm">No data</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Posts by Platform</h3>
          <div className="space-y-4 mt-6">
            {Object.entries(stats?.posts_by_platform || {}).map(([platform, count]) => {
              const p = PLATFORMS.find(x => x.id === platform);
              const total = Object.values(stats?.posts_by_platform || {}).reduce((a, b) => a + b, 0) || 1;
              return (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{p?.name || platform}</span>
                    <span className="text-sm text-surface-400">{count} posts</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / total) * 100}%`, backgroundColor: p?.color || "#666" }} />
                  </div>
                </div>
              );
            }) || <p className="text-surface-500 text-sm">No platform data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}