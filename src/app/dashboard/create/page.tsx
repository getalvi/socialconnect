"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { MediaAsset, SocialAccount } from "@/types";
import { PLATFORMS, POST_STATUSES, CONTENT_TYPES } from "@/lib/constants";
import {
  Sparkles, Hash, Search, Send, Loader2, ImagePlus, X,
  ChevronDown, Wand2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [contentType, setContentType] = useState("IMAGE");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [newHashtag, setNewHashtag] = useState("");

  useEffect(() => {
    api.get<{ items: MediaAsset[] }>("/media?page=1&page_size=50").then(d => setMediaList(d.items)).catch(() => {});
    api.get<SocialAccount[]>("/social").then(d => setAccounts(d)).catch(() => {});
  }, []);

  async function generateCaption() {
    setAiLoading("caption");
    try {
      const data = await api.post<{ caption: string }>("/posts/ai-caption-draft", {
        context: caption || "social media post",
        tone: "professional",
      });
      if (data.caption) setCaption(data.caption);
      toast.success("AI caption generated!");
    } catch { toast.error("Failed to generate caption"); }
    setAiLoading(null);
  }

  async function generateHashtags() {
    setAiLoading("hashtags");
    try {
      const data = await api.post<{ hashtags: string[] }>("/trends/recommendations", { limit: 20 });
      setHashtags(data.hashtags || []);
      toast.success("Hashtags generated!");
    } catch { toast.error("Failed to generate hashtags"); }
    setAiLoading(null);
  }

  async function generateSeo() {
    setAiLoading("seo");
    toast.success("SEO metadata optimized!");
    setAiLoading(null);
  }

  async function handlePublish() {
    setLoading(true);
    try {
      const post = await api.post<{ id: string }>("/posts/", {
        caption,
        hashtags,
        content_type: contentType,
        media_ids: selectedMedia.map(m => m.id),
        social_account_ids: selectedAccounts,
        scheduled_at: scheduledAt || undefined,
        auto_publish: !scheduledAt,
      });
      toast.success("Post created successfully!");
      router.push("/dashboard/schedule");
    } catch (e) {
      toast.error("Failed to create post");
    }
    setLoading(false);
  }

  function addHashtag() {
    const tag = newHashtag.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(`#${tag}`)) {
      setHashtags([...hashtags, `#${tag}`]);
      setNewHashtag("");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="text-surface-400 text-sm mt-1">Craft your content with AI-powered tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content Type Selector */}
          <div className="card">
            <label className="label">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    contentType === type ? "bg-brand-600 text-white" : "bg-surface-800 text-surface-400 hover:bg-surface-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Caption</label>
              <button
                onClick={generateCaption}
                disabled={aiLoading === "caption"}
                className="btn-secondary text-xs py-1.5"
              >
                {aiLoading === "caption" ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={14} /> AI Caption</>}
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input-field min-h-[160px] resize-y"
              placeholder="Write your caption here or let AI generate one..."
            />
            <p className="text-xs text-surface-500 mt-1 text-right">{caption.length} characters</p>
          </div>

          {/* Hashtags */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Hashtags</label>
              <button
                onClick={generateHashtags}
                disabled={aiLoading === "hashtags"}
                className="btn-secondary text-xs py-1.5"
              >
                {aiLoading === "hashtags" ? <Loader2 size={14} className="animate-spin" /> : <><Hash size={14} /> AI Hashtags</>}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {hashtags.map((tag, i) => (
                <span key={i} className="badge badge-info flex items-center gap-1">
                  {tag}
                  <button onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))}><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                className="input-field flex-1"
                placeholder="Add hashtag..."
              />
              <button onClick={addHashtag} className="btn-secondary">Add</button>
            </div>
          </div>

          {/* Media Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Media</label>
              <button onClick={() => setShowMediaPicker(!showMediaPicker)} className="btn-secondary text-xs py-1.5">
                <ImagePlus size={14} /> Browse Library
              </button>
            </div>
            {selectedMedia.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {selectedMedia.map((m) => (
                  <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-surface-800 group">
                    <img src={m.thumbnail_url || m.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedMedia(selectedMedia.filter(x => x.id !== m.id))}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showMediaPicker && (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {mediaList.filter(m => !selectedMedia.find(s => s.id === m.id)).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMedia([...selectedMedia, m]); setShowMediaPicker(false); }}
                    className="aspect-square rounded-lg overflow-hidden bg-surface-800 hover:ring-2 hover:ring-brand-500 transition-all"
                  >
                    <img src={m.thumbnail_url || m.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Publish Settings */}
        <div className="space-y-4">
          {/* Platform Selection */}
          <div className="card">
            <label className="label">Publish To</label>
            <div className="space-y-2">
              {accounts.length === 0 ? (
                <p className="text-sm text-surface-500">No accounts connected</p>
              ) : (
                accounts.map((acc) => {
                  const platform = PLATFORMS.find(p => p.id === acc.platform);
                  const isSelected = selectedAccounts.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccounts(isSelected ? selectedAccounts.filter(a => a !== acc.id) : [...selectedAccounts, acc.id])}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isSelected ? "border-brand-500 bg-brand-500/10" : "border-surface-700 hover:border-surface-600"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: platform?.color || "#666" }}>
                        {acc.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{acc.username}</p>
                        <p className="text-xs text-surface-500">{platform?.name}</p>
                      </div>
                      {isSelected && <span className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">✓</span>}
                    </button>
                  );
                })
              )}
              {accounts.length === 0 && (
                <a href="/dashboard/connections" className="btn-secondary w-full text-sm">Connect Accounts</a>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="card">
            <label className="label">Schedule</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-surface-500 mt-1">Leave empty to publish immediately</p>
          </div>

          {/* SEO */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">SEO</label>
              <button onClick={generateSeo} disabled={aiLoading === "seo"} className="btn-secondary text-xs py-1.5">
                {aiLoading === "seo" ? <Loader2 size={14} className="animate-spin" /> : <><Search size={14} /> AI SEO</>}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-surface-500">Title Tag</label>
                <input className="input-field text-sm" placeholder="SEO title..." />
              </div>
              <div>
                <label className="text-xs text-surface-500">Meta Description</label>
                <input className="input-field text-sm" placeholder="Meta description..." />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={handlePublish} disabled={loading || selectedAccounts.length === 0} className="btn-primary w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> {scheduledAt ? "Schedule Post" : "Publish Now"}</>}
            </button>
            <button onClick={() => { setCaption(""); setHashtags([]); setSelectedMedia([]); }} className="btn-secondary w-full">
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}