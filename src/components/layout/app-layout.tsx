'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import DashboardView from '@/components/dashboard/dashboard-view';
import UploadView from '@/components/upload/upload-view';
import ContentView from '@/components/content/content-view';
import ScheduleView from '@/components/schedule/schedule-view';
import AnalyticsView from '@/components/analytics/analytics-view';
import CampaignsView from '@/components/campaigns/campaigns-view';
import WorkflowsView from '@/components/workflows/workflows-view';
import AccountsView from '@/components/accounts/accounts-view';
import SettingsView from '@/components/settings/settings-view';
import {
  LayoutDashboard, Upload, PenTool, Calendar, BarChart3, Megaphone,
  GitBranch, Link, Settings, ChevronLeft, ChevronRight, Bell,
  Search, Moon, Sun, Sparkles, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload & Create', icon: Upload },
  { id: 'content', label: 'Content Studio', icon: PenTool },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'accounts', label: 'Accounts', icon: Link },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const { activeSection, setActiveSection } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-foreground truncate">SocialConnect</h1>
            <p className="text-[10px] text-muted-foreground truncate">AI Marketing Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); onNavigate(); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">A</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@socialconnect.ai</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { activeSection, sidebarCollapsed, toggleSidebar, notifications, markNotificationRead, markAllRead } = useAppStore();
  const { theme, setTheme } = useTheme();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardView />;
      case 'upload': return <UploadView />;
      case 'content': return <ContentView />;
      case 'schedule': return <ScheduleView />;
      case 'analytics': return <AnalyticsView />;
      case 'campaigns': return <CampaignsView />;
      case 'workflows': return <WorkflowsView />;
      case 'accounts': return <AccountsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300
        ${sidebarCollapsed ? 'w-[70px]' : 'w-[260px]'}
      `}>
        <SidebarContent collapsed={sidebarCollapsed} onNavigate={() => {}} />
        <div className="p-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <SidebarContent collapsed={false} onNavigate={() => {}} />
              </SheetContent>
            </Sheet>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, campaigns, media..."
                className="pl-10 w-[300px] bg-muted/50 border-border/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground">
                    Mark all read
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-border/30 cursor-pointer hover:bg-muted/50 transition-colors
                        ${!n.isRead ? 'bg-emerald-500/5' : ''}
                      `}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* User Avatar */}
            <Avatar className="w-9 h-9 cursor-pointer">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm">A</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
