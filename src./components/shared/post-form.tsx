'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
}

interface PostFormProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    caption?: string;
    hashtags?: string[];
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    platform?: string;
    mediaIds?: string[];
  };
  onSubmit: (data: PostFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  caption: string;
  hashtags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  platform: string;
  mediaIds: string[];
}

export function PostForm({ initialData, onSubmit, onCancel, submitLabel = 'Save Post', loading: externalLoading }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(initialData?.seoKeywords || []);
  const [seoKeywordInput, setSeoKeywordInput] = useState('');
  const [platform, setPlatform] = useState(initialData?.platform || 'multi');
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(initialData?.mediaIds || []);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        caption: caption.trim(),
        hashtags,
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        seoKeywords,
        platform,
        mediaIds: selectedMediaIds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const addSeoKeyword = () => {
    const kw = seoKeywordInput.trim();
    if (kw && !seoKeywords.includes(kw)) {
      setSeoKeywords([...seoKeywords, kw]);
      setSeoKeywordInput('');
    }
  };

  const removeSeoKeyword = (kw: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== kw));
  };

  const searchMedia = useCallback(async (query: string) => {
    setMediaSearch(query);
    if (!query.trim()) { setMediaResults([]); return; }
    setLoadingMedia(true);
    try {
      const results = await apiClient.get<MediaItem[]>('/media', { params: { search: query } });
      setMediaResults(results || []);
    } catch {
      setMediaResults([]);
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  const toggleMedia = (mediaId: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const generateAI = async (type: 'caption' | 'hashtags' | 'seo') => {
    setAiLoading(type);
    try {
      const payload: Record<string, unknown> = { content: content || caption };
      if (type === 'seo') payload.keywords = seoKeywords;
      const result = await apiClient.post<Record<string, unknown>>(`/ai/generate-${type}`, payload);
      if (type === 'caption' && result.caption) {
        setCaption(result.caption as string);
        toast.success('Caption generated');
      } else if (type === 'hashtags' && result.hashtags) {
        setHashtags(result.hashtags as string[]);
        toast.success('Hashtags generated');
      } else if (type === 'seo' && result.seoTitle) {
        setSeoTitle(result.seoTitle as string);
        if (result.seoDescription) setSeoDescription(result.seoDescription as string);
        if (result.seoKeywords) setSeoKeywords(result.seoKeywords as string[]);
        toast.success('SEO content generated');
      }
    } catch {
      // Error already handled by api-client
    } finally {
      setAiLoading(null);
    }
  };

  const isLoading = externalLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-content">Content</Label>
        <Textarea
          id="post-content"
          placeholder="Write your post content..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-caption">Caption</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateAI('caption')}
            disabled={isLoading || aiLoading === 'caption'}
          >
            {aiLoading === 'caption' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            AI Generate
          </Button>
        </div>
        <Textarea
          id="post-caption"
          placeholder="Social media caption..."
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Hashtags</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateAI('hashtags')}
            disabled={isLoading || aiLoading === 'hashtags'}
          >
            {aiLoading === 'hashtags' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            AI Generate
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add hashtag..."
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
            disabled={isLoading}
          />
          <Button type="button" variant="outline" onClick={addHashtag} disabled={isLoading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                #{tag}
                <button type="button" onClick={() => removeHashtag(tag)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Platform</Label>
        <Select value={platform} onValueChange={setPlatform} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multi">All Platforms</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter / X</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="pinterest">Pinterest</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="threads">Threads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Media</Label>
        <Input
          placeholder="Search media library..."
          value={mediaSearch}
          onChange={(e) => searchMedia(e.target.value)}
          disabled={isLoading}
        />
        {mediaSearch && (
          <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
            {loadingMedia ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : mediaResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No media found</p>
            ) : (
              mediaResults.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  className={`flex items-center gap-2 w-full p-2 rounded hover:bg-muted text-left ${
                    selectedMediaIds.includes(media.id) ? 'bg-primary/10 border border-primary' : ''
                  }`}
                  onClick={() => toggleMedia(media.id)}
                >
                  <div className="h-10 w-10 rounded bg-muted shrink-0 overflow-hidden">
                    {media.thumbnailUrl ? (
                      <img src={media.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        {media.mimeType.split('/')[0]?.[0]?.toUpperCase() || 'F'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm truncate flex-1">{media.filename}</span>
                  {selectedMediaIds.includes(media.id) && (
                    <span className="text-xs text-primary font-medium">Selected</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">SEO Settings</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateAI('seo')}
            disabled={isLoading || aiLoading === 'seo'}
          >
            {aiLoading === 'seo' ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            AI Generate
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-title">SEO Title</Label>
          <Input
            id="seo-title"
            placeholder="SEO-optimized title"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-desc">SEO Description</Label>
          <Textarea
            id="seo-desc"
            placeholder="Meta description for search engines"
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label>SEO Keywords</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={seoKeywordInput}
              onChange={(e) => setSeoKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSeoKeyword())}
              disabled={isLoading}
            />
            <Button type="button" variant="outline" onClick={addSeoKeyword} disabled={isLoading}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {seoKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {seoKeywords.map((kw) => (
                <Badge key={kw} variant="outline" className="gap-1">
                  {kw}
                  <button type="button" onClick={() => removeSeoKeyword(kw)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}