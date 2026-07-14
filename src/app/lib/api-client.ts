import { useAuthStore } from '@/stores/auth-store';

const BASE = '';

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('sc_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { data: { token: string; refreshToken: string } };
    localStorage.setItem('sc_token', data.data.token);
    localStorage.setItem('sc_refresh_token', data.data.refreshToken);
    useAuthStore.getState().login(data.data.token, data.data.refreshToken, useAuthStore.getState().user!);
    return data.data.token;
  } catch {
    return null;
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
  let token = localStorage.getItem('sc_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (res.status === 401 && token) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retry = await fetch(`${BASE}${path}`, { ...options, headers });
        const data = await retry.json();
        return { ...data, status: retry.status };
      }
      useAuthStore.getState().logout();
      return { success: false, error: 'Session expired', status: 401 };
    }

    const data = await res.json();
    return { ...data, status: res.status };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error', status: 0 };
  }
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = unknown>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: async (path: string, file: File) => {
    const token = localStorage.getItem('sc_token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  },
};