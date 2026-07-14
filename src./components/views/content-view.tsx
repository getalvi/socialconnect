'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Calendar, Send, Sparkles, Search } from 'lucide-react';
import { format } from 'date-fns';

export function ContentView() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', caption: '', platform: '', status: 'draft' });

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page, statusFilter, search],
    queryFn: () => api.get(`/api/posts?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}${search ? `&search=${search}` : ''}`),
  });

  const posts = (data?.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;
  const pagination = (data?.data as Record<string, unknown>)?.pagination as Record<string, unknown> | undefined;

  const createMutation = useMutation({
    mutationFn: (body: unknown) => api.post('/api/posts', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); setDialogOpen(false); resetForm(); toast.success('Post created'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/posts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['posts'] }); toast.success('Post deleted'); },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  function resetForm() {
    setForm({ title: '', content: '', caption: '', platform: '', status: 'draft' });
    setEditingId(null);
  }

  function handleSubmit() {
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-muted-foreground text-sm">Manage your social media posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Post' : 'Create New Post'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea rows={4} placeholder="Full post content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea rows={2} placeholder="Social media caption..." value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multi">Multi-Platform</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="pinterest">Pinterest</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="threads">Threads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search posts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full border-b border-border" />)}</div>
          ) : posts && posts.length > 0 ? (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <div key={String(post.id)} className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{String(post.title || 'Untitled Post')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{format(new Date(String(post.createdAt)), 'MMM d, h:mm a')}</span>
                      {post.platform && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{String(post.platform)}</Badge>}
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusColors[String(post.status)] || ''}>
                    {String(post.status).replace(/_/g, ' ')}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(String(post.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found</p>
              <Button variant="link" onClick={() => setDialogOpen(true)}>Create your first post</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && Number(pagination.totalPages) > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {String(pagination.totalPages)}</span>
          <Button variant="outline" size="sm" disabled={page >= Number(pagination.totalPages)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}