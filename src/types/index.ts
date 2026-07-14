export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Post {
  id: string;
  user_id: string;
  status: string;
  content_type: string;
  caption: string;
  hashtags: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  ai_model?: string;
  is_ai_generated: boolean;
  auto_publish: boolean;
  scheduled_at?: string;
  published_at?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  impressions_count: number;
  engagement_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  analysis_result?: Record<string, unknown>;
  enhanced_url?: string;
  status: string;
  created_at: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_active: boolean;
  followers_count: number;
  following_count: number;
  last_synced_at?: string;
  created_at: string;
}

export interface TrendTopic {
  id: string;
  keyword: string;
  platform?: string;
  category?: string;
  score: number;
  volume: number;
  growth_rate: number;
  related_tags: string[];
  discovered_at: string;
  expires_at?: string;
}

export interface ScheduledJob {
  id: string;
  post_id?: string;
  type: string;
  status: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  error_count: number;
  created_at: string;
}

export interface DashboardStats {
  total_posts: number;
  total_impressions: number;
  total_engagement: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  avg_engagement_rate: number;
  posts_by_status: Record<string, number>;
  posts_by_platform: Record<string, number>;
  impressions_over_time: { date: string; value: number }[];
  engagement_over_time: { date: string; value: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}