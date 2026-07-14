'use client';

import { useAppStore, type ViewName } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardView } from '@/components/views/dashboard-view';
import { ContentView } from '@/components/views/content-view';
import { MediaView } from '@/components/views/media-view';
import { AiStudioView } from '@/components/views/ai-studio-view';
import { ScheduleView } from '@/components/views/schedule-view';
import { SocialAccountsView } from '@/components/views/social-accounts-view';
import { AnalyticsView } from '@/components/views/analytics-view';
import { CampaignsView } from '@/components/views/campaigns-view';
import { SettingsView } from '@/components/views/settings-view';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const viewComponents: Record<ViewName, React.ComponentType> = {
  dashboard: DashboardView,
  content: ContentView,
  media: MediaView,
  'ai-studio': AiStudioView,
  schedule: ScheduleView,
  social: SocialAccountsView,
  analytics: AnalyticsView,
  campaigns: CampaignsView,
  settings: SettingsView,
};

export function DashboardLayout() {
  const { currentView, sidebarOpen, toggleSidebar } = useAppStore();
  const { user } = useAuthStore();
  const ViewComponent = viewComponents[currentView] || DashboardView;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 bg-background z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold capitalize hidden sm:block">
              {currentView.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <ViewComponent />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}