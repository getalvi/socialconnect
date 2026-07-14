// Typed API client for the SocialConnect backend.
// Auto-injects JWT, handles 401 refresh, returns typed responses.

import type {
  AIGenerateRequest,
  AIGenerateResponse,
  AnalyticsSummary,
  Campaign,
  ConnectedAccount,
  MediaItem,
  Notification,
  Post,
  Schedule,
  User,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860/api/v1";

const TOKEN_KEY = "sc_access_token";
const REFRESH_KEY = "sc_refresh_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const auth = {
  setTokens,
  clearTokens,
  getToken,
  isAuthenticated: () => !!getToken(),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  try {
    const resp = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (e) {
    // Network error — backend unreachable (e.g., in sandbox preview without backend)
    throw new ApiError(0, "Network error — backend unreachable", String(e));
  }

  if (resp.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    clearTokens();
    throw new ApiError(401, "Session expired");
  }

  if (!resp.ok) {
    let detail: unknown;
    try {
      detail = await resp.json();
    } catch {
      detail = await resp.text();
    }
    throw new ApiError(resp.status, `API ${resp.status}`, detail);
  }

  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

// ---------------- Auth API ----------------
export const api = {
  async register(email: string, password: string, name: string) {
    const data = await request<{ access_token: string; refresh_token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      },
    );
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await request<{ access_token: string; refresh_token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async logout() {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh) {
      try {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refresh_token: refresh }),
        });
      } catch {
        // ignore
      }
    }
    clearTokens();
  },

  async me(): Promise<User> {
    return request<User>("/users/me");
  },

  // ---------------- Campaigns ----------------
  campaigns: {
    async list(): Promise<Campaign[]> {
      return request<Campaign[]>("/campaigns");
    },
    async create(payload: Partial<Campaign>): Promise<Campaign> {
      return request<Campaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<Campaign>): Promise<Campaign> {
      return request<Campaign>(`/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/campaigns/${id}`, { method: "DELETE" });
    },
  },

  // ---------------- Posts ----------------
  posts: {
    async list(): Promise<Post[]> {
      return request<Post[]>("/posts");
    },
    async create(payload: Partial<Post>): Promise<Post> {
      return request<Post>("/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async approve(id: string): Promise<Post> {
      return request<Post>(`/posts/${id}/approve`, { method: "POST" });
    },
  },

  // ---------------- Schedules ----------------
  schedules: {
    async list(): Promise<Schedule[]> {
      return request<Schedule[]>("/schedules");
    },
    async create(payload: {
      post_id: string;
      platform: string;
      scheduled_for: string;
      timezone?: string;
    }): Promise<Schedule> {
      return request<Schedule>("/schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string): Promise<void> {
      await request<void>(`/schedules/${id}`, { method: "DELETE" });
    },
  },

  // ---------------- Media ----------------
  media: {
    async list(): Promise<{ items: MediaItem[]; total: number }> {
      return request("/media");
    },
  },

  // ---------------- AI ----------------
  ai: {
    async generate(payload: AIGenerateRequest): Promise<AIGenerateResponse> {
      return request<AIGenerateResponse>("/ai/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async analyzeImage(image_url: string, question?: string): Promise<AIGenerateResponse> {
      return request<AIGenerateResponse>("/ai/analyze-image", {
        method: "POST",
        body: JSON.stringify({ image_url, question }),
      });
    },
  },

  // ---------------- OAuth ----------------
  oauth: {
    async authorize(platform: string): Promise<{ authorize_url: string; state: string }> {
      return request(`/oauth/authorize/${platform}`);
    },
    async listAccounts(): Promise<ConnectedAccount[]> {
      return request<ConnectedAccount[]>("/oauth/accounts");
    },
    async disconnect(platform: string): Promise<void> {
      await request<void>(`/oauth/disconnect/${platform}`, { method: "DELETE" });
    },
  },

  // ---------------- Analytics ----------------
  analytics: {
    async summary(days = 30): Promise<AnalyticsSummary> {
      return request<AnalyticsSummary>(`/analytics/summary?days=${days}`);
    },
  },

  // ---------------- Notifications ----------------
  notifications: {
    async list(): Promise<Notification[]> {
      return request<Notification[]>("/notifications");
    },
    async markRead(id: string): Promise<void> {
      await request<void>(`/notifications/${id}/read`, { method: "POST" });
    },
  },
};
