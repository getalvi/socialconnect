'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockWorkflowTemplates } from '@/lib/mock-data';
import { GitBranch, Play, Pause, RotateCcw, CheckCircle2, XCircle, Clock, ArrowRight, Plus, Zap, Loader2 } from 'lucide-react';

const mockWorkflows = [
  { id: 'w1', name: 'Daily Instagram Post', template: 'full_marketing', status: 'ACTIVE', lastRun: '2 hours ago', runCount: 45, successRate: 92 },
  { id: 'w2', name: 'Weekly Trend Report', template: 'trend_based', status: 'ACTIVE', lastRun: '1 day ago', runCount: 12, successRate: 100 },
  { id: 'w3', name: 'Product Launch Pipeline', template: 'full_marketing', status: 'PAUSED', lastRun: '3 days ago', runCount: 8, successRate: 87 },
  { id: 'w4', name: 'Content Refresh', template: 'content_only', status: 'DRAFT', lastRun: 'Never', runCount: 0, successRate: 0 },
];

const mockExecutions = [
  { id: 'e1', workflow: 'Daily Instagram Post', status: 'COMPLETED', startedAt: '2025-07-08 14:00', completedAt: '2025-07-08 14:03', steps: 7, completedSteps: 7 },
  { id: 'e2', workflow: 'Daily Instagram Post', status: 'COMPLETED', startedAt: '2025-07-07 14:00', completedAt: '2025-07-07 14:02', steps: 7, completedSteps: 7 },
  { id: 'e3', workflow: 'Weekly Trend Report', status: 'COMPLETED', startedAt: '2025-07-07 10:00', completedAt: '2025-07-07 10:05', steps: 5, completedSteps: 5 },
  { id: 'e4', workflow: 'Product Launch Pipeline', status: 'FAILED', startedAt: '2025-07-05 09:00', completedAt: '2025-07-05 09:01', steps: 7, completedSteps: 3, error: 'AI model timeout' },
];

export default function WorkflowsView() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'history'>('workflows');

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Workflows</h2>
          <p className="text-sm text-muted-foreground">Automate your marketing with AI-powered workflows</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Choose a template to get started:</p>
              <div className="space-y-3">
                {mockWorkflowTemplates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    className="w-full p-4 rounded-lg border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tmpl.icon}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{tmpl.name}</h4>
                        <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'workflows', label: 'My Workflows', icon: GitBranch },
          { id: 'templates', label: 'Templates', icon: Zap },
          { id: 'history', label: 'Execution History', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={activeTab === tab.id ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-border/50'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Workflows */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockWorkflows.map(workflow => (
            <Card key={workflow.id} className="border-border/50 hover:border-emerald-500/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{workflow.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{workflow.template.replace('_', ' ')} template</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] px-1.5 py-0 ${workflow.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : workflow.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {workflow.status}
                    </Badge>
                    <Switch checked={workflow.status === 'ACTIVE'} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Runs</p>
                    <p className="text-sm font-semibold text-foreground">{workflow.runCount}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Success</p>
                    <p className="text-sm font-semibold text-emerald-400">{workflow.successRate}%</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Last Run</p>
                    <p className="text-xs font-semibold text-foreground">{workflow.lastRun}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 h-7 text-xs">
                    <Play className="w-3 h-3 mr-1" /> Run Now
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                    <RotateCcw className="w-3 h-3 mr-1" /> History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockWorkflowTemplates.map(template => (
            <Card key={template.id} className="border-border/50 hover:border-emerald-500/30 transition-all group cursor-pointer">
              <CardContent className="p-5">
                <div className="text-3xl mb-3">{template.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{template.steps} steps</span>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Execution History */}
      {activeTab === 'history' && (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <table className="w-full">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Workflow</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Steps</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Started</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {mockExecutions.map(exec => (
                    <tr key={exec.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm text-foreground">{exec.workflow}</td>
                      <td className="p-3">
                        <Badge className={`text-[10px] px-1.5 py-0 ${exec.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {exec.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3 mr-1 inline" /> : <XCircle className="w-3 h-3 mr-1 inline" />}
                          {exec.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{exec.completedSteps}/{exec.steps}</td>
                      <td className="p-3 text-xs text-muted-foreground">{exec.startedAt}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {exec.status === 'COMPLETED'
                          ? Math.round((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000) + 's'
                          : exec.error || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
