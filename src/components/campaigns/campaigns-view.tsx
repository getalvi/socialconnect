'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockCampaigns, statusColors } from '@/lib/mock-data';
import { Megaphone, Plus, Calendar, TrendingUp, Users, Eye, ArrowUpRight, Pause, Play, Archive } from 'lucide-react';

const objectiveIcons: Record<string, string> = {
  AWARENESS: '👁️',
  ENGAGEMENT: '💬',
  TRAFFIC: '🔗',
  CONVERSIONS: '💰',
  LEAD_GENERATION: '📋',
  SALES: '🛒',
  BRAND_LOYALTY: '❤️',
};

export default function CampaignsView() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Campaigns</h2>
          <p className="text-sm text-muted-foreground">Manage your marketing campaigns and track performance</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Campaign Name</Label>
                <Input placeholder="e.g., Summer Collection Launch" className="mt-1 bg-muted/50 border-border/50" />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea placeholder="Describe your campaign goals..." className="mt-1 bg-muted/50 border-border/50" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Objective</Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AWARENESS">👁️ Awareness</SelectItem>
                      <SelectItem value="ENGAGEMENT">💬 Engagement</SelectItem>
                      <SelectItem value="TRAFFIC">🔗 Traffic</SelectItem>
                      <SelectItem value="CONVERSIONS">💰 Conversions</SelectItem>
                      <SelectItem value="SALES">🛒 Sales</SelectItem>
                      <SelectItem value="BRAND_LOYALTY">❤️ Brand Loyalty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Budget</Label>
                  <Input type="number" placeholder="0.00" className="mt-1 bg-muted/50 border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Input type="date" className="mt-1 bg-muted/50 border-border/50" />
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <Input type="date" className="mt-1 bg-muted/50 border-border/50" />
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowCreateDialog(false)}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
            <p className="text-2xl font-bold text-emerald-400">{mockCampaigns.filter(c => c.status === 'ACTIVE').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Posts</p>
            <p className="text-2xl font-bold text-foreground">{mockCampaigns.reduce((a, c) => a + c.postCount, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Reach</p>
            <p className="text-2xl font-bold text-foreground">{(mockCampaigns.reduce((a, c) => a + c.totalReach, 0) / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Avg. Engagement</p>
            <p className="text-2xl font-bold text-foreground">{(mockCampaigns.reduce((a, c) => a + c.engagementRate, 0) / mockCampaigns.length).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCampaigns.map(campaign => {
          const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
          const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
          const totalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const elapsed = startDate ? Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

          return (
            <Card key={campaign.id} className="border-border/50 hover:border-emerald-500/30 transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{objectiveIcons[campaign.objective || ''] || '📢'}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground">{campaign.description}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[campaign.status]}`}>
                    {campaign.status}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{startDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Posts</p>
                    <p className="text-sm font-semibold text-foreground">{campaign.postCount}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Reach</p>
                    <p className="text-sm font-semibold text-foreground">{(campaign.totalReach / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground">Eng.</p>
                    <p className="text-sm font-semibold text-emerald-400">{campaign.engagementRate}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {campaign.status === 'ACTIVE' && (
                    <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-7 text-xs">
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </Button>
                  )}
                  {campaign.status === 'PAUSED' && (
                    <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs">
                      <Play className="w-3 h-3 mr-1" /> Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-border/50 h-7 text-xs">
                    <Eye className="w-3 h-3 mr-1" /> View Details
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground ml-auto">
                    <Archive className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
