"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/api";
import type { MediaAsset } from "@/types";
import {
  Upload, Image as ImageIcon, X, Search, Eye, Sparkles, Wand2,
  Loader2, Grid, List, Filter, Trash2,
} from "lucide-react";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const data = await api.get<{ items: MediaAsset[] }>("/media?page=1&page_size=50");
      setMedia(data.items);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      try {
        await api.upload<MediaAsset>("/media/upload", file);
      } catch {}
    }
    await fetchMedia();
    setUploading(false);
  }, [fetchMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"], "video/*": [".mp4", ".webm"] },
    multiple: true,
  });

  async function handleAnalyze(id: string) {
    setAnalyzingId(id);
    try {
      await api.post(`/media/${id}/analyze`);
      await fetchMedia();
    } catch {}
    setAnalyzingId(null);
  }

  async function handleEnhance(id: string) {
    setEnhancingId(id);
    try {
      await api.post(`/media/${id}/enhance`);
      await fetchMedia();
    } catch {}
    setEnhancingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media file?")) return;
    try {
      await api.delete(`/media/${id}`);
      await fetchMedia();
      if (selectedMedia?.id === id) setSelectedMedia(null);
    } catch {}
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-surface-400 text-sm mt-1">Upload, analyze, and enhance your media assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-surface-700 text-surface-200" : "text-surface-400"}`}><Grid size={18} /></button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-surface-700 text-surface-200" : "text-surface-400"}`}><List size={18} /></button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive ? "border-brand-500 bg-brand-500/5" : "border-surface-700 hover:border-surface-600 bg-surface-900/50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-brand-400 animate-spin" />
            <p className="text-surface-300">Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={32} className="text-surface-400" />
            <p className="text-surface-300">Drop files here or click to upload</p>
            <p className="text-xs text-surface-500">Supports JPEG, PNG, GIF, WebP, MP4, WebM (max 50MB)</p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-medium text-surface-300">No media uploaded yet</h3>
          <p className="text-surface-500 mt-1">Upload images or videos to get started</p>
        </div>
      ) : (
        <div className={viewMode === "grid"
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "space-y-3"
        }>
          {media.map((item) => (
            <div
              key={item.id}
              className={`card-hover cursor-pointer group ${viewMode === "grid" ? "" : "flex items-center gap-4"}`}
              onClick={() => setSelectedMedia(item)}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface-800 relative">
                    {item.thumbnail_url || item.mime_type.startsWith("image/") ? (
                      <img
                        src={item.enhanced_url || item.thumbnail_url || item.url}
                        alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-surface-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAnalyze(item.id); }}
                        className="p-1.5 rounded-md bg-surface-900/80 text-surface-300 hover:text-brand-400"
                        disabled={analyzingId === item.id}
                        title="AI Analyze"
                      >
                        {analyzingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEnhance(item.id); }}
                        className="p-1.5 rounded-md bg-surface-900/80 text-surface-300 hover:text-green-400"
                        disabled={enhancingId === item.id}
                        title="Enhance"
                      >
                        {enhancingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1.5 rounded-md bg-surface-900/80 text-surface-300 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{item.file_name}</p>
                    <p className="text-xs text-surface-500">{formatFileSize(item.file_size)}</p>
                    <span className={`badge mt-1 ${item.status === "ENHANCED" ? "badge-success" : item.status === "ANALYZED" ? "badge-info" : "badge-warning"}`}>
                      {item.status}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-800 flex-shrink-0">
                    <img src={item.thumbnail_url || item.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file_name}</p>
                    <p className="text-xs text-surface-500">{formatFileSize(item.file_size)} · {item.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleAnalyze(item.id); }} className="btn-secondary text-xs py-1.5 px-3" disabled={analyzingId === item.id}>
                      {analyzingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={14} /> Analyze</>}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEnhance(item.id); }} className="btn-secondary text-xs py-1.5 px-3" disabled={enhancingId === item.id}>
                      {enhancingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <><Wand2 size={14} /> Enhance</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMedia(null)}>
          <div className="bg-surface-900 rounded-2xl border border-surface-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-surface-800">
              <h3 className="font-semibold">{selectedMedia.file_name}</h3>
              <button onClick={() => setSelectedMedia(null)} className="text-surface-400 hover:text-surface-200"><X size={20} /></button>
            </div>
            <div className="p-4">
              <img src={selectedMedia.enhanced_url || selectedMedia.url} alt="" className="w-full rounded-lg" />
              {selectedMedia.analysis_result && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-sm">AI Analysis</h4>
                  <p className="text-sm text-surface-300">{(selectedMedia.analysis_result as Record<string, string>)?.description}</p>
                  {(selectedMedia.analysis_result as Record<string, string[]>)?.objects?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(selectedMedia.analysis_result as Record<string, string[]>)?.objects.map((obj, i) => (
                        <span key={i} className="badge badge-info">{obj}</span>
                      ))}
                    </div>
                  )}
                  {(selectedMedia.analysis_result as Record<string, string[]>)?.related_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(selectedMedia.analysis_result as Record<string, string[]>)?.related_tags.map((tag, i) => (
                        <span key={i} className="badge badge-success">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-surface-500">Size:</span> {formatFileSize(selectedMedia.file_size)}</div>
                <div><span className="text-surface-500">Type:</span> {selectedMedia.mime_type}</div>
                {selectedMedia.width && <div><span className="text-surface-500">Dimensions:</span> {selectedMedia.width}x{selectedMedia.height}</div>}
                <div><span className="text-surface-500">Status:</span> {selectedMedia.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}