'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sparkles, Hash, Search, Eye, Wand2, Loader2, Copy, Check } from 'lucide-react';

export function AiStudioView() {
  const [captionInput, setCaptionInput] = useState({ content: '', platform: 'instagram', tone: 'professional', variations: 3 });
  const [hashtagInput, setHashtagInput] = useState({ content: '', platform: 'instagram', count: 20 });
  const [seoInput, setSeoInput] = useState({ content: '', targetKeywords: '' });
  const [trendInput, setTrendInput] = useState({ query: '', platform: '' });
  const [analyzeId, setAnalyzeId] = useState('');
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [copied, setCopied] = useState('');

  const { data: mediaData } = useQuery({
    queryKey: ['media-list'],
    queryFn: () => api.get('/api/media?limit=50'),
  });
  const mediaItems = (mediaData?.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;

  const captionMutation = useMutation({
    mutationFn: () => api.post('/api/ai/caption', captionInput),
    onSuccess: (d) => { setResults(prev => ({ ...prev, caption: d.data })); toast.success('Captions generated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const hashtagMutation = useMutation({
    mutationFn: () => api.post('/api/ai/hashtags', hashtagInput),
    onSuccess: (d) => { setResults(prev => ({ ...prev, hashtags: d.data })); toast.success('Hashtags generated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const seoMutation = useMutation({
    mutationFn: () => api.post('/api/ai/seo', { content: seoInput.content, targetKeywords: seoInput.targetKeywords.split(',').map(k => k.trim()).filter(Boolean) }),
    onSuccess: (d) => { setResults(prev => ({ ...prev, seo: d.data })); toast.success('SEO content generated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const trendMutation = useMutation({
    mutationFn: () => api.post('/api/ai/trends', trendInput),
    onSuccess: (d) => { setResults(prev => ({ ...prev, trends: d.data })); toast.success('Trend research complete'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.post('/api/ai/analyze', { mediaId: analyzeId }),
    onSuccess: (d) => { setResults(prev => ({ ...prev, analyze: d.data })); toast.success('Image analyzed'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI Studio</h1>
        <p className="text-muted-foreground text-sm">Generate captions, hashtags, SEO content, and analyze images</p>
      </div>

      <Tabs defaultValue="caption">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="caption" className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Captions</TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Hashtags</TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1"><Search className="h-3.5 w-3.5" /> SEO</TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Trends</TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-1"><Wand2 className="h-3.5 w-3.5" /> Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="caption" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Generate Captions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content / Product Description</Label>
                <Textarea rows={3} placeholder="Describe your product or content..." value={captionInput.content} onChange={(e) => setCaptionInput({ ...captionInput, content: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={captionInput.platform} onValueChange={(v) => setCaptionInput({ ...captionInput, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="pinterest">Pinterest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={captionInput.tone} onValueChange={(v) => setCaptionInput({ ...captionInput, tone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="funny">Funny</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => captionMutation.mutate()} disabled={captionMutation.isPending}>
                {captionMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-1.5" /> Generate Captions</>}
              </Button>

              {results.caption && (() => {
                const d = results.caption as Record<string, unknown>;
                const captions = (d.captions as Array<Record<string, unknown>>) || [];
                return (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Generated Captions</p>
                      {d.latencyMs && <span className="text-xs text-muted-foreground">{String(d.latencyMs)}ms</span>}
                    </div>
                    {captions.map((c, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{String(c.text)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px]">Score: {String(c.engagement_score)}</Badge>
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => copyToClipboard(String(c.text), `caption-${i}`)}>
                            {copied === `caption-${i}` ? <Check className="h-3 w-3 mr-0.5" /> : <Copy className="h-3 w-3 mr-0.5" />}
                            {copied === `caption-${i}` ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Generate Hashtags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={2} placeholder="Your post content..." value={hashtagInput.content} onChange={(e) => setHashtagInput({ ...hashtagInput, content: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={hashtagInput.platform} onValueChange={(v) => setHashtagInput({ ...hashtagInput, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input type="number" min={5} max={50} value={hashtagInput.count} onChange={(e) => setHashtagInput({ ...hashtagInput, count: Number(e.target.value) })} />
                </div>
              </div>
              <Button onClick={() => hashtagMutation.mutate()} disabled={hashtagMutation.isPending}>
                {hashtagMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...</> : <><Hash className="h-4 w-4 mr-1.5" /> Generate Hashtags</>}
              </Button>

              {results.hashtags && (() => {
                const d = results.hashtags as Record<string, unknown>;
                return (
                  <div className="space-y-3 mt-4">
                    {(['trending', 'niche', 'general', 'branded'] as const).map(cat => {
                      const tags = d[cat] as string[] | undefined;
                      if (!tags || tags.length === 0) return null;
                      return (
                        <div key={cat}>
                          <p className="text-sm font-medium capitalize mb-1">{cat}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/10" onClick={() => copyToClipboard(tag, `${cat}-${i}`)}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Generate SEO Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={3} placeholder="Your content..." value={seoInput.content} onChange={(e) => setSeoInput({ ...seoInput, content: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Target Keywords (comma separated)</Label>
                <Input placeholder="keyword1, keyword2, keyword3" value={seoInput.targetKeywords} onChange={(e) => setSeoInput({ ...seoInput, targetKeywords: e.target.value })} />
              </div>
              <Button onClick={() => seoMutation.mutate()} disabled={seoMutation.isPending}>
                {seoMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...</> : <><Search className="h-4 w-4 mr-1.5" /> Generate SEO</>}
              </Button>

              {results.seo && (() => {
                const d = results.seo as Record<string, unknown>;
                return (
                  <div className="space-y-3 mt-4">
                    <div><Label className="text-xs text-muted-foreground">SEO Title</Label><p className="text-sm font-medium mt-0.5">{String(d.title || '')}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Meta Description</Label><p className="text-sm mt-0.5">{String(d.meta_description || '')}</p></div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Keywords</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {((d.keywords as string[]) || []).map((k, i) => <Badge key={i} variant="secondary">{k}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Readability: <strong>{String(d.readability_score)}/100</strong></span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Trend Research</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Query</Label>
                <Input placeholder="e.g. sustainable fashion 2025" value={trendInput.query} onChange={(e) => setTrendInput({ ...trendInput, query: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Platform (optional)</Label>
                <Select value={trendInput.platform || '_all'} onValueChange={(v) => setTrendInput({ ...trendInput, platform: v === '_all' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="All Platforms" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => trendMutation.mutate()} disabled={trendMutation.isPending || !trendInput.query}>
                {trendMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Researching...</> : <><Eye className="h-4 w-4 mr-1.5" /> Research Trends</>}
              </Button>

              {results.trends && (() => {
                const d = results.trends as Record<string, unknown>;
                const topics = (d.trending_topics as Array<Record<string, unknown>>) || [];
                const actions = (d.recommended_actions as string[]) || [];
                return (
                  <div className="space-y-4 mt-4">
                    {topics.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Trending Topics</p>
                        <div className="space-y-1.5">
                          {topics.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                              <span className="text-sm">{String(t.topic)}</span>
                              <Badge variant={String(t.growth) === 'rising' ? 'default' : 'secondary'} className="text-[10px]">{String(t.growth)}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {actions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recommended Actions</p>
                        <ul className="space-y-1">{actions.map((a, i) => <li key={i} className="text-sm text-muted-foreground">- {a}</li>)}</ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Image Analysis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Image</Label>
                <Select value={analyzeId} onValueChange={setAnalyzeId}>
                  <SelectTrigger><SelectValue placeholder="Choose an uploaded image" /></SelectTrigger>
                  <SelectContent>
                    {mediaItems?.map(m => (
                      <SelectItem key={String(m.id)} value={String(m.id)}>{String(m.originalName)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending || !analyzeId}>
                {analyzeMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Analyzing...</> : <><Wand2 className="h-4 w-4 mr-1.5" /> Analyze Image</>}
              </Button>

              {results.analyze && (() => {
                const d = results.analyze as Record<string, unknown>;
                const analysis = d.analysis as Record<string, unknown> | undefined;
                if (!analysis) return <p className="text-sm">No analysis results</p>;
                return (
                  <div className="space-y-3 mt-4">
                    {analysis.objects && <div><Label className="text-xs text-muted-foreground">Detected Objects</Label><div className="flex flex-wrap gap-1 mt-1">{((analysis.objects as string[]) || []).map((o, i) => <Badge key={i} variant="secondary">{o}</Badge>)}</div></div>}
                    {analysis.scene && <div><Label className="text-xs text-muted-foreground">Scene</Label><p className="text-sm mt-0.5">{String(analysis.scene)}</p></div>}
                    {analysis.mood && <div><Label className="text-xs text-muted-foreground">Mood</Label><p className="text-sm mt-0.5">{String(analysis.mood)}</p></div>}
                    {analysis.target_audience && <div><Label className="text-xs text-muted-foreground">Target Audience</Label><p className="text-sm mt-0.5">{String(analysis.target_audience)}</p></div>}
                    {analysis.content_suggestions && <div><Label className="text-xs text-muted-foreground">Content Suggestions</Label><ul className="space-y-1 mt-1">{((analysis.content_suggestions as string[]) || []).map((s, i) => <li key={i} className="text-sm text-muted-foreground">- {s}</li>)}</ul></div>}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}