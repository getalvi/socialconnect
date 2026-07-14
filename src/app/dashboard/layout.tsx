"use client";

import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { NAV_ITEMS, PLATFORMS, APP_NAME } from "@/lib/constants";
import {
  LayoutDashboard, Image, PlusCircle, Calendar, BarChart3,
  TrendingUp, Link, Settings, LogOut, Bell, Menu, X,
  Search, Zap, ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Notification } from "@/types";
import { api } from "@/lib/api";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Image, PlusCircle, Calendar, BarChart3,
  TrendingUp, Link, Settings,
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Zap className="w-10 h-10 text-brand-400" />
          <p className="text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-surface-800 bg-surface-900 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-800">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg text-surface-100 truncate">{APP_NAME}</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={isActive ? "sidebar-link-active" : "sidebar-link"}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-800 p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 text-brand-400 font-semibold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200 truncate">{user.name}</p>
                <p className="text-xs text-surface-500 truncate">{user.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={logout} className="text-surface-500 hover:text-red-400" title="Sign out">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-surface-800 bg-surface-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-surface-400 hover:text-surface-200">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                placeholder="Search posts, media, trends..."
                className="w-80 pl-10 pr-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm text-surface-200 placeholder-surface-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800"
              >
                <Bell size={20} />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-surface-700 bg-surface-800 shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-surface-700">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-surface-500">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 hover:bg-surface-700/50 cursor-pointer border-b border-surface-700/50">
                          <p className="text-sm font-medium text-surface-200">{n.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-600/20 text-brand-400 border border-brand-600/30">
              {user.plan}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}