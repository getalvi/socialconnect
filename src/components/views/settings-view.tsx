'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, Key, User, Shield, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SettingsView() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/api/settings'),
  });
  const settings = (settingsData?.data as Record<string, string>) || {};

  const { data: activityData } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => api.get('/api/activity?limit=50'),
  });
  const logs = (activityData?.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;

  const saveSetting = useMutation({
    mutationFn: (params: { key: string; value: string }) => api.put('/api/settings', params),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Setting saved'); },
    onError: () => toast.error('Failed to save setting'),
  });

  const changePassword = useMutation({
    mutationFn: () => api.put('/api/auth/password', { currentPassword: passwordForm.current, newPassword: passwordForm.newPass }),
    onSuccess: () => { setPasswordForm({ current: '', newPass: '', confirm: '' }); toast.success('Password changed'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSaveKey = () => {
    saveSetting.mutate({ key: 'OPENROUTER_API_KEY', value: openRouterKey });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and platform configuration</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1"><Key className="h-3.5 w-3.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Email</Label><Input value={user?.email || ''} disabled /></div>
                <div><Label>Role</Label><Input value={user?.role || ''} disabled /></div>
                <div><Label>Joined</Label><Input value={user ? new Date().toLocaleDateString() : ''} disabled /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> OpenRouter API Key</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" placeholder="sk-or-v1-..." value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} />
                <p className="text-xs text-muted-foreground">Get your key from openrouter.ai/keys. This is stored securely in the database.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveKey} disabled={saveSetting.isPending}>
                  <Save className="h-4 w-4 mr-1.5" /> Save Key
                </Button>
                {settings.OPENROUTER_API_KEY && <span className="text-xs text-emerald-600 dark:text-emerald-400">Key is configured</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Platform OAuth Credentials</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure OAuth credentials for each social media platform. Set these as environment variables in your deployment.
              </p>
              <div className="space-y-2 text-sm">
                {['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'].map(key => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{key}</code>
                    <span className={`text-xs ${settings[key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {settings[key] ? 'Set' : 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
              </div>
              <Button onClick={() => {
                if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
                if (passwordForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                changePassword.mutate();
              }} disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Activity Log</CardTitle></CardHeader>
            <CardContent>
              {logs && logs.length > 0 ? (
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm capitalize">{String(log.action).replace(/_/g, ' ')}</p>
                        {log.metadata && <p className="text-xs text-muted-foreground truncate">{String(log.metadata).substring(0, 100)}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(String(log.createdAt)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}