"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your brand voice, preferences, and API keys</p>
        </div>

        <Tabs defaultValue="brand">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brand Voice</CardTitle>
                <CardDescription>Define how your AI marketing employee writes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input id="brand-name" defaultValue="SocialConnect" />
                  </div>
                  <div>
                    <Label htmlFor="brand-tone">Tone</Label>
                    <select id="brand-tone" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Friendly</option>
                      <option>Authoritative</option>
                      <option>Playful</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="brand-voice">Brand Voice Guidelines</Label>
                  <Textarea
                    id="brand-voice"
                    placeholder="Describe your brand personality, words to use/avoid, key messages..."
                    defaultValue="Concise, confident, sustainability-focused. Avoid buzzwords. Use 'we' not 'I'. Always mention artisan origin."
                    className="min-h-24"
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input id="primary-color" defaultValue="#10b981" />
                      <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: "#10b981" }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input id="logo" placeholder="https://..." />
                  </div>
                  <div>
                    <Label htmlFor="watermark">Watermark URL</Label>
                    <Input id="watermark" placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Enable watermark on all images</p>
                    <p className="text-xs text-muted-foreground">Automatically apply your logo to published media</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">Save Brand Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defaults" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default Preferences</CardTitle>
                <CardDescription>Pre-filled values for new content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <div>
                    <Label htmlFor="default-lang">Default Language</Label>
                    <select id="default-lang" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="en">English</option>
                      <option value="bn">Bangla</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="hashtag-count">Default Hashtag Count</Label>
                    <Input id="hashtag-count" type="number" defaultValue={15} min={1} max={30} />
                  </div>
                  <div>
                    <Label htmlFor="default-platforms">Default Platforms</Label>
                    <Input id="default-platforms" defaultValue="instagram, facebook, tiktok" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Auto-publish after approval</p>
                    <p className="text-xs text-muted-foreground">Skip the scheduling step — publish immediately when a post is approved</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">Save Defaults</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Configuration</CardTitle>
                <CardDescription>OpenRouter model and token budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-sm font-medium">Provider: OpenRouter</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    API key is stored securely in Hugging Face Spaces secrets as <code className="rounded bg-muted px-1 py-0.5">OP_API_KEY</code>.
                    Never exposed to the frontend. Never logged.
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ai-model">Default Model</Label>
                    <select id="ai-model" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option>anthropic/claude-3.5-sonnet</option>
                      <option>openai/gpt-4o</option>
                      <option>openai/gpt-4o-mini</option>
                      <option>google/gemini-flash-1.5</option>
                      <option>meta-llama/llama-3.1-70b-instruct</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="ai-vision-model">Vision Model</Label>
                    <select id="ai-vision-model" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option>openai/gpt-4o</option>
                      <option>anthropic/claude-3.5-sonnet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="ai-budget">Daily Token Budget</Label>
                  <Input id="ai-budget" type="number" defaultValue={500000} />
                  <p className="mt-1 text-xs text-muted-foreground">Current usage: 450,200 / 500,000 tokens (90%)</p>
                </div>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">Save AI Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Publishing success/failure", desc: "When a post is published or fails", on: true },
                  { label: "AI generation complete", desc: "When AI finishes generating content", on: true },
                  { label: "Token expiring", desc: "When OAuth tokens need refresh", on: true },
                  { label: "New trend detected", desc: "When AI spots a trending topic in your category", on: true },
                  { label: "Weekly digest", desc: "Summary email every Monday", on: false },
                  { label: "Comment replies", desc: "When someone comments on your post", on: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.on} />
                  </div>
                ))}
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Access</CardTitle>
                <CardDescription>For n8n workflows and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-base">Backend API URL</Label>
                  <Input id="api-base" readOnly defaultValue="https://getalvi-socialconnect.hf.space/api/v1" />
                </div>
                <div>
                  <Label htmlFor="api-key">Service Account Token</Label>
                  <div className="flex gap-2">
                    <Input id="api-key" readOnly defaultValue="sk_live_••••••••••••••••" />
                    <Button variant="outline">Reveal</Button>
                    <Button variant="outline">Rotate</Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Use this token in n8n HTTP request nodes to authenticate to the backend API.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Rate Limits</p>
                  <div className="mt-2 flex gap-4">
                    <Badge variant="outline">Anonymous: 60 req/min</Badge>
                    <Badge variant="outline">Authenticated: 600 req/min</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
