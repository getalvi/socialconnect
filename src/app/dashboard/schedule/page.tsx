"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Post, ScheduledJob } from "@/types";
import { POST_STATUSES, PLATFORMS } from "@/lib/constants";
import {
  Calendar, Clock, Play, Trash2, MoreVertical, PlusCircle,
  ChevronLeft, ChevronRight, Loader2, Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    Promise.all([
      api.get<{ items: Post[] }>("/posts?page=1&page_size=100"),
      api.get<{ items: ScheduledJob[] }>("/schedule?page=1&page_size=100"),
    ]).then(([postsData, jobsData]) => {
      setPosts(postsData.items);
      setJobs(jobsData.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPosts = filterStatus === "all"
    ? posts
    : posts.filter(p => p.status === filterStatus);

  const scheduledPosts = filteredPosts.filter(p => ["SCHEDULED", "PUBLISHED", "PUBLISHING"].includes(p.status));

  if (loading) return <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="card h-24 skeleton" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-surface-400 text-sm mt-1">Manage your scheduled and published posts</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-surface-700 overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm ${view === "list" ? "bg-surface-700 text-surface-200" : "text-surface-400"}`}
            >
              <Calendar size={18} />
            </button>
          </div>
          <Link href="/dashboard/create" className="btn-primary"><PlusCircle size={18} /> New Post</Link>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus("all")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filterStatus === "all" ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-400 hover:bg-surface-700"}`}>All</button>
        {Object.entries(POST_STATUSES).map(([key, val]) => (
          <button key={key} onClick={() => setFilterStatus(key)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filterStatus === key ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-400 hover:bg-surface-700"}`}>{val.label}</button>
        ))}
      </div>

      {/* Posts List */}
      {scheduledPosts.length === 0 ? (
        <div className="text-center py-16">
          <Calendar size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-surface-300">No scheduled posts</h3>
          <p className="text-surface-500 mt-1">Create and schedule your first post</p>
          <Link href="/dashboard/create" className="btn-primary mt-4 inline-flex"><PlusCircle size={18} /> Create Post</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-surface-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{post.caption || "Untitled"}</p>
                <div className="flex items-center gap-4 mt-1">
                  {post.scheduled_at && (
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(post.scheduled_at).toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-surface-500">{post.content_type}</span>
                  <span className="text-xs text-surface-500">{post.hashtags.length} hashtags</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  {post.impressions_count > 0 && <p className="text-surface-400">{formatNum(post.impressions_count)} impressions</p>}
                  {post.engagement_rate && <p className="text-green-400">{post.engagement_rate}% engagement</p>}
                </div>
                <span className={`badge ${POST_STATUSES[post.status as keyof typeof POST_STATUSES]?.color || "badge-info"}`}>
                  {post.status.replace("_", " ")}
                </span>
                {post.is_ai_generated && <Zap size={14} className="text-brand-400" title="AI Generated" />}
              </div>
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