'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { mockAIModels } from '@/lib/mock-data';
import { Settings as SettingsIcon, User, Cpu, Key, Shield, Bell, CreditCard, Plus, Trash2, Eye, EyeOff, Trophy, Zap, TrendingUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const mockTeam = [
  { id: '1', name: 'Admin User', email: 'admin@socialconnect.ai', role: 'ADMIN', lastLogin: '2 hours ago', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@socialconnect.ai', role: 'MANAGER', lastLogin: '1 day ago', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@socialconnect.ai', role: 'EDITOR', lastLogin: '3 hours ago', status: 'active' },
  { id: '4', name: 'Lisa Wang', email: 'lisa@socialconnect.ai', role: 'VIEWER', lastLogin: '5 days ago', status: 'inactive' },
];

const mockApiKeys = [
  { id: 'k1', name: 'OpenRouter Production', provider: 'openrouter', key: 'sk-or-...xxxx', lastUsed: '2 hours ago', created: '2025-01-15' },
  { id: 'k2', name: 'Google AI Backup', provider: 'google', key: 'AIza...xxxx', lastUsed: 'Never', created: '2025-03-01' },
];

const mockAuditLog = [
  { id: '1', action: 'Post Published', user: 'Admin User', resource: 'Post', time: '2 hours ago' },
  { id: '2', action: 'User Login', user: 'Sarah Chen', resource: 'Auth', time: '5 hours ago' },
  { id: '3', action: 'Campaign Created', user: 'Admin User', resource: 'Campaign', time: '1 day ago' },
  { id: '4', action: 'Account Connected', user: 'Admin User', resource: 'SocialAccount', time: '2 days ago' },
  { id: '5', action: 'API Key Added', user: 'Admin User', resource: 'ApiKey', time: '3 days ago' },
  { id: '6', action: 'Workflow Executed', user: 'System', resource: 'Workflow', time: '3 days ago' },
];

const notificationSettings = [
  { key: 'post_published', label: 'Post Published', description: 'Get notified when a post is successfully published', enabled: true },
  { key: 'post_failed', label: 'Post Failed', description: 'Alert when a post fails to publish', enabled: true },
  { key: 'approval_needed', label: 'Approval Needed', description: 'Notify when content awaits approval', enabled: true },
  { key: 'trend_alert', label: 'Trend Alerts', description: 'Get alerts about trending topics in your niche', enabled: true },
  { key: 'ai_recommendation', label: 'AI Recommendations', description: 'Receive AI-powered suggestions', enabled: false },
  { key: 'weekly_report', label: 'Weekly Report', description: 'Get weekly performance summary', enabled: true },
  { key: 'campaign_milestone', label: 'Campaign Milestones', description: 'Notify when campaign hits milestones', enabled: false },
  { key: 'account_issue', label: 'Account Issues', description: 'Alert about disconnected accounts or token expiry', enabled: true },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account, AI models, security, and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="text-xs"><User className="w-4 h-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="ai" className="text-xs"><Cpu className="w-4 h-4 mr-1" /> AI Models</TabsTrigger>
          <TabsTrigger value="api" className="text-xs"><Key className="w-4 h-4 mr-1" /> API Keys</TabsTrigger>
          <TabsTrigger value="team" className="text-xs"><ShieldCheck className="w-4 h-4 mr-1" /> Team</TabsTrigger>
          <TabsTrigger value="security" className="text-xs"><Shield className="w-4 h-4 mr-1" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs"><Bell className="w-4 h-4 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs"><CreditCard className="w-4 h-4 mr-1" /> Billing</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <div className="max-w-2xl space-y-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Full Name</Label>
                    <Input defaultValue="Admin User" className="mt-1 bg-muted/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input defaultValue="admin@socialconnect.ai" className="mt-1 bg-muted/50 border-border/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Timezone</Label>
                    <Select defaultValue="Asia/Dhaka">
                      <SelectTrigger className="mt-1 bg-muted/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1 bg-muted/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Models */}
        <TabsContent value="ai" className="mt-4">
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Model Priority & Benchmark</CardTitle>
                  <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400">
                    <Zap className="w-4 h-4 mr-1" /> Run Benchmark
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Priority</TableHead>
                      <TableHead className="text-xs">Model</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Quality</TableHead>
                      <TableHead className="text-xs">Speed</TableHead>
                      <TableHead className="text-xs">Cost/1K</TableHead>
                      <TableHead className="text-xs">Overall</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAIModels.map((model, i) => (
                      <TableRow key={model.id}>
                        <TableCell className="text-xs font-medium text-foreground">{i + 1}</TableCell>
                        <TableCell className="text-xs font-medium text-foreground">{model.name}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] px-1.5 py-0 ${model.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {model.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground">{model.qualityScore}/10</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{model.speedMs}ms</TableCell>
                        <TableCell className="text-xs text-muted-foreground">${model.cost}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-medium text-foreground">{model.overallScore}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">AI Recommendation</h4>
                    <p className="text-xs text-muted-foreground">Based on your usage patterns, <span className="text-emerald-400 font-medium">GLM-5 Turbo</span> offers the best balance of quality, speed, and cost for marketing content generation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">API Keys</CardTitle>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-1" /> Add Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockApiKeys.map(apiKey => (
                <div key={apiKey.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{apiKey.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[10px] px-1.5 py-0 bg-slate-500/20 text-slate-400">{apiKey.provider}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {showApiKey[apiKey.id] ? 'sk-or-v1-abc123fullkey' : apiKey.key}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Last used: {apiKey.lastUsed}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowApiKey(p => ({ ...p, [apiKey.id]: !p[apiKey.id] }))}>
                      {showApiKey[apiKey.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Team Members</CardTitle>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-1" /> Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Last Login</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeam.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="text-xs font-medium text-foreground">{member.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-1.5 py-0 ${member.role === 'ADMIN' ? 'bg-emerald-500/20 text-emerald-400' : member.role === 'MANAGER' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{member.lastLogin}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-1.5 py-0 ${member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4">
          <div className="max-w-2xl space-y-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-sm">Current Password</Label><Input type="password" className="mt-1 bg-muted/50 border-border/50" /></div>
                <div><Label className="text-sm">New Password</Label><Input type="password" className="mt-1 bg-muted/50 border-border/50" /></div>
                <div><Label className="text-sm">Confirm New Password</Label><Input type="password" className="mt-1 bg-muted/50 border-border/50" /></div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Update Password</Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Two-Factor Authentication</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Audit Log</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockAuditLog.map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div>
                        <p className="text-xs font-medium text-foreground">{log.action}</p>
                        <p className="text-[10px] text-muted-foreground">by {log.user} • {log.resource}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-4">
          <div className="max-w-2xl space-y-4">
            <Card className="border-emerald-500/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="text-2xl font-bold text-foreground">Pro Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">5,000 AI credits/month • Unlimited posts</p>
                  </div>
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-400">Upgrade</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Usage This Month</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">AI Credits Used</span>
                    <span className="text-foreground font-medium">2,550 / 5,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '51%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Posts Published</span>
                    <span className="text-foreground font-medium">128 / Unlimited</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Connected Accounts</span>
                    <span className="text-foreground font-medium">6 / 15</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground font-medium">Estimated Cost This Month</span>
                  <span className="text-sm text-emerald-400 font-bold">$24.50</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
