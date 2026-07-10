'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { mockPosts, platformIcons, statusColors, approvalColors, mockGeneratedContent } from '@/lib/mock-data';
import { PenTool, Wand2, Copy, Edit3, CheckCircle2, XCircle, Clock, Eye, Loader2, Sparkles, Hash, Search } from 'lucide-react';

export default function ContentView() {
  const [activeTab, setActiveTab] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['INSTAGRAM']);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  const filteredPosts = mockPosts.filter(post => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return post.status === 'DRAFT';
    if (activeTab === 'pending') return post.approvalStatus === 'PENDING';
    if (activeTab === 'published') return post.status === 'PUBLISHED';
    if (activeTab === 'scheduled') return post.status === 'SCHEDULED';
    return true;
  });

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const simulateGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Content Studio</h2>
          <p className="text-sm text-muted-foreground">Manage and create AI-powered marketing content</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Content Generator
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Select Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['INSTAGRAM', 'FACEBOOK_PAGE', 'TWITTER', 'LINKEDIN', 'PINTEREST', 'THREADS', 'TIKTOK'].map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all
                        ${selectedPlatforms.includes(p) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border/50 text-muted-foreground hover:border-emerald-500/30'}
                      `}
                    >
                      <span>{platformIcons[p]}</span>
                      <span className="text-xs">{p.replace('_', ' ').replace('PAGE', 'Page')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Content Tone</Label>
                <div className="flex gap-2 mt-2">
                  {['professional', 'friendly', 'luxury', 'emoji'].map(tone => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-4 py-2 rounded-lg border text-sm capitalize transition-all
                        ${selectedTone === tone ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-border/50 text-muted-foreground hover:border-emerald-500/30'}
                      `}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Custom Prompt (optional)</Label>
                <Textarea placeholder="Describe what kind of content you want to generate..." className="mt-2 bg-muted/50 border-border/50" rows={3} />
              </div>

              <Button onClick={simulateGenerate} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is generating content...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({mockPosts.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({mockPosts.filter(p => p.status === 'DRAFT').length})</TabsTrigger>
          <TabsTrigger value="pending">Awaiting Approval ({mockPosts.filter(p => p.approvalStatus === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({mockPosts.filter(p => p.status === 'SCHEDULED').length})</TabsTrigger>
          <TabsTrigger value="published">Published ({mockPosts.filter(p => p.status === 'PUBLISHED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="border-border/50 hover:border-emerald-500/30 transition-all group cursor-pointer" onClick={() => setEditingPost(post.id)}>
                <CardContent className="p-4">
                  {/* Platform & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1.5">
                      {post.platforms.map(p => (
                        <span key={p} className="text-sm" title={p}>{platformIcons[p]}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[post.status]}`}>
                        {post.status}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 ${approvalColors[post.approvalStatus]}`}>
                        {post.approvalStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.captionDefault}</p>

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.hashtags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] text-emerald-400">{tag}</span>
                      ))}
                      {post.hashtags.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{post.hashtags.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    {post.engagementRate > 0 ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-400 font-medium">{post.engagementRate}% engagement</span>
                        <span className="text-xs text-muted-foreground">{(post.totalReach / 1000).toFixed(1)}K reach</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No data yet</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); }}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Content Editor Modal */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input defaultValue={mockPosts.find(p => p.id === editingPost)?.title || ''} className="mt-1 bg-muted/50 border-border/50" />
            </div>

            {/* Platform-specific content */}
            <Tabs defaultValue="instagram">
              <TabsList>
                <TabsTrigger value="instagram">📷 Instagram</TabsTrigger>
                <TabsTrigger value="facebook">📘 Facebook</TabsTrigger>
                <TabsTrigger value="linkedin">💼 LinkedIn</TabsTrigger>
                <TabsTrigger value="twitter">🐦 Twitter</TabsTrigger>
              </TabsList>
              {['instagram', 'facebook', 'linkedin', 'twitter'].map(platform => (
                <TabsContent key={platform} value={platform}>
                  <Textarea
                    defaultValue={mockGeneratedContent[platform as keyof typeof mockGeneratedContent] || ''}
                    className="min-h-[120px] bg-muted/50 border-border/50"
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Hashtags */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" /> Hashtags
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mockGeneratedContent.hashtags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                    {tag}
                    <XCircle className="w-3 h-3 cursor-pointer hover:text-red-400" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Add hashtag..." className="bg-muted/50 border-border/50" />
                <Button variant="outline" size="icon"><Search className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* SEO */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">SEO Title</Label>
                <Input defaultValue={mockGeneratedContent.seoTitle} className="mt-1 bg-muted/50 border-border/50" />
              </div>
              <div>
                <Label className="text-sm font-medium">CTA</Label>
                <Input defaultValue={mockGeneratedContent.cta} className="mt-1 bg-muted/50 border-border/50" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Meta Description</Label>
              <Textarea defaultValue={mockGeneratedContent.metaDescription} className="mt-1 bg-muted/50 border-border/50" rows={2} />
            </div>
            <div>
              <Label className="text-sm font-medium">Product Description</Label>
              <Textarea defaultValue={mockGeneratedContent.productDescription} className="mt-1 bg-muted/50 border-border/50" rows={3} />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                  <Edit3 className="w-4 h-4 mr-2" /> Request Revision
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400">
                  <Wand2 className="w-4 h-4 mr-2" /> Regenerate
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
