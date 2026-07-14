"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardStats, Post, TrendTopic } from "@/types";
import {
  BarChart3, Eye, Heart, MessageCircle, Share2, TrendingUp,
  Zap, PlusCircle, Calendar, ArrowUpRight,
} from "lucide-react";
import { POST_STATUSES, PLATFORMS } from "@/lib/constants";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [topTrends, setTopTrends] = useState<TrendTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>("/analytics/dashboard?days=30").catch(() => null),
      api.get<{ items: Post[] }>("/posts?page=1&page_size=5").catch(() => ({ items: [] })),
      api.get<{ items: TrendTopic[] }>("/trends?page=1&page_size=5&sort_by=score").catch(() => ({ items: [] })),
    ]).then(([dashData, postsData, trendsData]) => {
      setStats(dashData);
      setRecentPosts(postsData.items);
      setTopTrends(trendsData.items);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card h-28 skeleton" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Posts", value: stats?.total_posts ?? 0, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Impressions", value: formatNumber(stats?.total_impressions ?? 0), icon: Eye, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Engagement", value: formatNumber(stats?.total_engagement ?? 0), icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Avg. Rate", value: `${(stats?.avg_engagement_rate ?? 0).toFixed(2)}%`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">Overview of your social media performance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/schedule" className="btn-secondary">
            <Calendar size={18} /> Schedule
          </Link>
          <Link href="/dashboard/create" className="btn-primary">
            <PlusCircle size={18} /> Create Post
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Engagement Chart Placeholder + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-4">Engagement Over Time</h3>
          <div className="h-64 flex items-end gap-1">
            {stats?.engagement_over_time?.slice(-14).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-600/80 rounded-t hover:bg-brand-500 transition-colors min-h-[4px]"
                  style={{ height: `${Math.max(4, (d.value / (Math.max(...stats!.engagement_over_time.map(x => x.value), 1))) * 200)}px` }}
                />
                <span className="text-[10px] text-surface-500">{d.date.slice(5)}</span>
              </div>
            )) || <p className="text-surface-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Posts by Status */}
        <div className="card">
          <h3 className="font-semibold mb-4">Posts by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats?.posts_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${POST_STATUSES[status as keyof typeof POST_STATUSES]?.color || "badge-info"}`}>
                    {status.replace("_", " ")}
                  </span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts + Top Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Posts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Posts</h3>
            <Link href="/dashboard/schedule" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <Zap size={32} className="mx-auto text-surface-600 mb-3" />
              <p className="text-surface-400">No posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{post.caption || "Untitled post"}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-surface-500 flex items-center gap-1"><Heart size={12} />{post.likes_count}</span>
                      <span className="text-xs text-surface-500 flex items-center gap-1"><MessageCircle size={12} />{post.comments_count}</span>
                      <span className="text-xs text-surface-500 flex items-center gap-1"><Share2 size={12} />{post.shares_count}</span>
                    </div>
                  </div>
                  <span className={`badge ${POST_STATUSES[post.status as keyof typeof POST_STATUSES]?.color || "badge-info"}`}>
                    {post.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Trending Topics</h3>
            <Link href="/dashboard/trends" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Explore <ArrowUpRight size={14} />
            </Link>
          </div>
          {topTrends.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={32} className="mx-auto text-surface-600 mb-3" />
              <p className="text-surface-400">Discover trending topics for your content</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTrends.map((trend) => (
                <div key={trend.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200">{trend.keyword}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-surface-500">Volume: {formatNumber(trend.volume)}</span>
                      <span className={`text-xs flex items-center gap-0.5 ${trend.growth_rate > 0 ? "text-green-400" : "text-red-400"}`}>
                        <ArrowUpRight size={12} />{trend.growth_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-brand-400">{trend.score.toFixed(0)}</span>
                    <span className="text-[10px] text-surface-500">{trend.platform || "All"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}