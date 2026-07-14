'use client';

import { useAppStore, type ViewName } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Link2,
  BarChart3,
  Target,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const navItems: { id: ViewName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'social', label: 'Social Accounts', icon: Link2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } = useAppStore();
  const { logout, user } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-border bg-card flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-6 w-6 text-primary shrink-0" />
          {sidebarOpen && (
            <span className="font-bold text-lg truncate">SocialConnect AI</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-2">
        {sidebarOpen && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}