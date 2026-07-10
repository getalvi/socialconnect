'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { mockPosts, platformIcons, statusColors, approvalColors } from '@/lib/mock-data';
import { Calendar, Clock, CheckCircle2, XCircle, Edit3, Wand2, ChevronLeft, ChevronRight, Sparkles, AlertCircle, Zap, ListFilter } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ScheduleView() {
  const { setActiveSection } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [view, setView] = useState<'calendar' | 'list' | 'approval'>('calendar');
  const [timezone, setTimezone] = useState('Asia/Dhaka');

  const pendingPosts = mockPosts.filter(p => p.approvalStatus === 'PENDING' || p.approvalStatus === 'NEEDS_REVISION');
  const scheduledPosts = mockPosts.filter(p => p.status === 'SCHEDULED');

  // Generate calendar days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const toggleSelectPost = (id: string) => {
    setSelectedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const smartTimeSuggestions = [
    { platform: 'Instagram', time: '6:00 PM - 9:00 PM', confidence: 92, reason: 'Your audience is most active in the evening' },
    { platform: 'Facebook', time: '1:00 PM - 4:00 PM', confidence: 85, reason: 'Lunch and afternoon break browsing peak' },
    { platform: 'LinkedIn', time: '8:00 AM - 10:00 AM', confidence: 88, reason: 'Professional network peak activity' },
    { platform: 'Twitter', time: '12:00 PM - 3:00 PM', confidence: 79, reason: 'Midday engagement spike' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Schedule & Approval</h2>
          <p className="text-sm text-muted-foreground">Manage post schedules and approve content</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-border/50 text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern (GMT-5)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific (GMT-8)</SelectItem>
              <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setActiveSection('upload')}>
            <Sparkles className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'list', label: 'List View', icon: ListFilter },
          { id: 'approval', label: `Approval Queue (${pendingPosts.length})`, icon: AlertCircle },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={view === tab.id ? 'default' : 'outline'}
              className={view === tab.id ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-border/50'}
              onClick={() => setView(tab.id as typeof view)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {months[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                  const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth();
                  // Simulate scheduled posts on certain days
                  const postsOnDay = day && (day % 3 === 0 || day % 5 === 0) ? Math.floor(Math.random() * 3) + 1 : 0;
                  return (
                    <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all
                      ${day ? 'hover:bg-muted/50 cursor-pointer' : ''}
                      ${isToday ? 'bg-emerald-500/20 border border-emerald-500/30' : ''}
                    `}>
                      {day && (
                        <>
                          <span className={isToday ? 'text-emerald-400 font-bold' : 'text-foreground'}>{day}</span>
                          {postsOnDay > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              {Array.from({ length: Math.min(postsOnDay, 3) }).map((_, j) => (
                                <div key={j} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Smart Time Suggestions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Smart Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smartTimeSuggestions.map(s => (
                  <div key={s.platform} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <span>{platformIcons[s.platform.toUpperCase()] || '📱'}</span>
                        {s.platform}
                      </span>
                      <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-400">{s.confidence}%</Badge>
                    </div>
                    <p className="text-xs font-medium text-amber-400">{s.time}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              <table className="w-full">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Post</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Platforms</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Scheduled</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledPosts.map((post) => (
                    <tr key={post.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="text-sm font-medium text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{post.captionDefault}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">{post.platforms.map(p => <span key={p} className="text-sm">{platformIcons[p]}</span>)}</div>
                      </td>
                      <td className="p-3">
                        <p className="text-xs text-amber-400">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not set'}</p>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[post.status]}`}>{post.status}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400"><XCircle className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Approval Queue */}
      {view === 'approval' && (
        <div className="space-y-4">
          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-emerald-400 font-medium">{selectedPosts.length} selected</span>
              <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Bulk Approve
              </Button>
              <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-400">
                <Clock className="w-3.5 h-3.5 mr-1" /> Reschedule
              </Button>
              <Button variant="outline" size="sm" className="border-red-500/30 text-red-400">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Bulk Reject
              </Button>
            </div>
          )}

          {/* Pending Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPosts.map((post) => (
              <Card key={post.id} className={`border-border/50 ${selectedPosts.includes(post.id) ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => toggleSelectPost(post.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground">{post.title}</h3>
                        <Badge className={`text-[10px] px-1.5 py-0 ${approvalColors[post.approvalStatus]}`}>
                          {post.approvalStatus === 'NEEDS_REVISION' ? 'REVISION' : post.approvalStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.captionDefault}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {post.platforms.map(p => <span key={p} className="text-xs">{platformIcons[p]}</span>)}
                        {post.hashtags?.slice(0, 3).map(tag => <span key={tag} className="text-[10px] text-emerald-400">{tag}</span>)}
                      </div>
                      {post.approvalStatus === 'NEEDS_REVISION' && (
                        <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 mb-3">
                          <p className="text-[10px] text-orange-400">Revision requested: Caption too long for Twitter</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                        <Button variant="outline" size="sm" className="border-border/50 h-7 text-xs">
                          <Wand2 className="w-3 h-3 mr-1" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
