'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar as CalIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function ScheduleView() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ postId: '', scheduledAt: '' });

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => api.get('/api/schedules'),
  });
  const { data: postsData } = useQuery({
    queryKey: ['posts-draft'],
    queryFn: () => api.get('/api/posts?limit=100&status=draft'),
  });
  const schedules = (schedulesData?.data as Array<Record<string, unknown>>) || [];
  const posts = (postsData?.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;

  const createMutation = useMutation({
    mutationFn: () => api.post('/api/schedules', { postId: form.postId, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); setDialogOpen(false); setForm({ postId: '', scheduledAt: '' }); toast.success('Post scheduled'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/schedules/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule cancelled'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground text-sm">Schedule posts for automatic publishing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Schedule Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule a Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Post</Label>
                <Select value={form.postId} onValueChange={(v) => setForm({ ...form, postId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a draft post" /></SelectTrigger>
                  <SelectContent>
                    {posts?.map(p => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>{String(p.title || 'Untitled')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.postId || !form.scheduledAt}>
                {createMutation.isPending ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : schedules.length > 0 ? (
        <div className="space-y-2">
          {schedules.map((s) => (
            <Card key={String(s.id)}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CalIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{String((s.post as Record<string, unknown>)?.title || 'Untitled')}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {format(new Date(String(s.scheduledAt)), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <Badge variant="secondary" className={statusColors[String(s.status)] || ''}>
                  {String(s.status)}
                </Badge>
                {(String(s.status) === 'pending' || String(s.status) === 'failed') && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(String(s.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <CalIcon className="h-10 w-10 mx-auto mb-2" />
            <p>No scheduled posts</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}