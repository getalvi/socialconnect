'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AuthPage } from '@/components/layout/auth-page';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { isAuthenticated, token, loading, setUser, logout, setLoading } = useAuthStore();

  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me'),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (meData?.success && meData.data) {
      const d = meData.data as { id: string; email: string; name: string | null; role: string; avatar: string | null };
      setUser(d);
    } else if (meData && !meData.success && meData.status === 401) {
      logout();
    }
    if (meData || meLoading === false) {
      setLoading(false);
    }
  }, [meData, meLoading, setUser, logout, setLoading]);

  if (loading || (token && meLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-80">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="space-y-2 mt-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <DashboardLayout />;
}