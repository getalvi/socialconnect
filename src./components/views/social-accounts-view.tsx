'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Trash2, Link2, ExternalLink, Facebook, Instagram } from 'lucide-react';

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '🎬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'wordpress', name: 'WordPress', icon: '📝' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
];

export function SocialAccountsView() {
  const qc = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [connectDialog, setConnectDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => api.get('/api/social/accounts'),
  });
  const accounts = (data?.data as Array<Record<string, unknown>>) || [];

  const connectMutation = useMutation({
    mutationFn: () => api.get(`/api/social/oauth/${selectedPlatform}`),
    onSuccess: (d) => {
      const authUrl = (d.data as Record<string, unknown>)?.authorizationUrl;
      if (authUrl) {
        window.open(String(authUrl), '_blank', 'width=600,height=700');
        toast.info('Complete the OAuth flow in the new window');
      } else {
        toast.error('Could not generate authorization URL. Check platform credentials in settings.');
      }
      setConnectDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/social/accounts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts'] }); toast.success('Account disconnected'); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Social Accounts</h1>
          <p className="text-muted-foreground text-sm">Connect and manage your social media accounts</p>
        </div>
        <Dialog open={connectDialog} onOpenChange={setConnectDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1.5" /> Connect Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Connect Social Account</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger><SelectValue placeholder="Choose a platform" /></SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.icon} {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                You will be redirected to the platform&apos;s authorization page. Make sure the OAuth credentials are configured in Settings.
              </p>
              <Button className="w-full" onClick={() => connectMutation.mutate()} disabled={!selectedPlatform || connectMutation.isPending}>
                {connectMutation.isPending ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const platform = platforms.find(p => p.id === String(account.platform));
            return (
              <Card key={String(account.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform?.icon || '🔗'}</span>
                      <div>
                        <CardTitle className="text-sm">{String(account.displayName)}</CardTitle>
                        <p className="text-xs text-muted-foreground">{platform?.name || String(account.platform)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {account.username ? `@${String(account.username)}` : `ID: ${String(account.platformUserId).substring(0, 12)}...`}
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 text-xs" onClick={() => disconnectMutation.mutate(String(account.id))}>
                      <Trash2 className="h-3 w-3 mr-1" /> Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Link2 className="h-10 w-10 mx-auto mb-2" />
            <p>No social accounts connected</p>
            <Button variant="link" onClick={() => setConnectDialog(true)}>Connect your first account</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Available Platforms</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {platforms.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-xs font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}