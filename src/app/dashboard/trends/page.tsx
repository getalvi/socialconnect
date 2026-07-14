"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { TrendTopic } from "@/types";
import { PLATFORMS } from "@/lib/constants";
import {
  TrendingUp, Search, Sparkles, ArrowUpRight, RefreshCw,
  Loader2, Filter, Hash, BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", page_size: "50", sort_by: sortBy });
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (search) params.set("search", search);
      const data = await api.get<{ items: TrendTopic[] }>(`/trends?${params}`);
      setTrends(data.items);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTrends(); }, [platformFilter, sortBy]);

  async function researchTrends() {
    setSearching(true);
    try {
      await api.post("/trends/research", {});
      await fetchTrends();
      toast.success("Trend research completed!");
    } catch { toast.error("Research failed"); }
    setSearching(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trend Research</h1>
          <p className="text-surface-400 text-sm mt-1">Discover what&apos;s trending and optimize your content strategy</p>
        </div>
        <button onClick={researchTrends} disabled={searching} className="btn-primary">
          {searching ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> AI Research</>}
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTrends()}
            className="input-field pl-9"
            placeholder="Search trends..."
          />
        </div>
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="input-field w-auto">
          <option value="all">All Platforms</option>
          {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto">
          <option value="score">By Relevance</option>
          <option value="volume">By Volume</option>
          <option value="growth_rate">By Growth</option>
        </select>
      </div>

      {/* Trends Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-40 skeleton" />)}
        </div>
      ) : trends.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-surface-300">No trends found</h3>
          <p className="text-surface-500 mt-1">Run AI research to discover trending topics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((trend) => (
            <div key={trend.id} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{trend.keyword}</h3>
                <span className="text-xs font-bold text-brand-400">{trend.score.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                {trend.platform && (
                  <span className="badge badge-info">
                    {PLATFORMS.find(p => p.id === trend.platform)?.name || trend.platform}
                  </span>
                )}
                {trend.category && <span className="badge badge-warning">{trend.category}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-surface-500 text-xs">Volume</p>
                  <p className="font-semibold">{formatNum(trend.volume)}</p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs">Growth</p>
                  <p className={`font-semibold flex items-center gap-1 ${trend.growth_rate > 0 ? "text-green-400" : "text-red-400"}`}>
                    <ArrowUpRight size={14} />{Math.abs(trend.growth_rate).toFixed(1)}%
                  </p>
                </div>
              </div>
              {trend.related_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trend.related_tags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-xs text-surface-400 bg-surface-800 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}