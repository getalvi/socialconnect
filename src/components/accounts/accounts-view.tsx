'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockAccounts, platformIcons, platformColors } from '@/lib/mock-data';
import { Link, Plus, RefreshCw, ExternalLink, Unlink, CheckCircle2, AlertCircle, Users } from 'lucide-react';

const allPlatforms = [
  { id: 'FACEBOOK_PAGE', name: 'Facebook Page', icon: '📘', color: '#1877F2', description: 'Post to your business page' },
  { id: 'FACEBOOK_GROUP', name: 'Facebook Group', icon: '👥', color: '#1877F2', description: 'Post to groups you manage' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: '📷', color: '#E1306C', description: 'Business & Creator accounts' },
  { id: 'THREADS', name: 'Threads', icon: '🧵', color: '#000000', description: 'Meta\'s text platform' },
  { id: 'TWITTER', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2', description: 'Tweet & engage' },
  { id: 'PINTEREST', name: 'Pinterest', icon: '📌', color: '#E60023', description: 'Pin products & content' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: '💼', color: '#0077B5', description: 'Professional network' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: '#000000', description: 'Short-form video' },
  { id: 'YOUTUBE', name: 'YouTube Community', icon: '▶️', color: '#FF0000', description: 'Community posts' },
  { id: 'TELEGRAM', name: 'Telegram Channel', icon: '✈️', color: '#0088CC', description: 'Channel broadcasts' },
  { id: 'WHATSAPP', name: 'WhatsApp Channel', icon: '💬', color: '#25D366', description: 'Business broadcasts' },
  { id: 'SHOPIFY', name: 'Shopify', icon: '🛒', color: '#95BF47', description: 'Product collection' },
  { id: 'WORDPRESS', name: 'WordPress', icon: '📝', color: '#21759B', description: 'Blog publishing' },
  { id: 'WOOCOMMERCE', name: 'WooCommerce', icon: '🏪', color: '#96588A', description: 'Product sync' },
  { id: 'CUSTOM_API', name: 'Custom REST API', icon: '🔗', color: '#6366F1', description: 'Custom webhook/API' },
];

export default function AccountsView() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const connectedAccounts = allPlatforms.map(p => {
    const existing = mockAccounts.find(a => a.platform === p.id);
    return {
      ...p,
      connected: existing?.connected || false,
      username: existing?.username || null,
      followers: existing?.followers || 0,
      isActive: existing?.isActive || false,
      lastSyncedAt: existing?.lastSyncedAt || null,
    };
  });

  const connected = connectedAccounts.filter(a => a.connected);
  const disconnected = connectedAccounts.filter(a => !a.connected);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage your social media and platform connections</p>
        </div>
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {disconnected.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => setShowConnectDialog(false)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">{platform.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 h-7 text-xs">
                    Connect
                  </Button>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Connected</p>
            <p className="text-2xl font-bold text-emerald-400">{connected.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-foreground">{disconnected.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Followers</p>
            <p className="text-2xl font-bold text-foreground">{(connected.reduce((a, c) => a + c.followers, 0) / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Auto-Publish</p>
            <p className="text-2xl font-bold text-foreground">{connected.filter(a => a.isActive).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Connected ({connected.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connected.map(account => (
            <Card key={account.id} className="border-border/50 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${account.color}20` }}>
                      {account.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.username || 'Connected'}</p>
                    </div>
                  </div>
                  <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-400">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground font-medium">{(account.followers / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Never'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Auto-publish</span>
                    <Switch checked={account.isActive} />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                      <Unlink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Platforms */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Available Platforms ({disconnected.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {disconnected.map(platform => (
            <button
              key={platform.id}
              className="p-4 rounded-lg border border-dashed border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{platform.name}</p>
                  <p className="text-[10px] text-muted-foreground">{platform.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link className="w-3 h-3" />
                Connect
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
