// Shared TypeScript types for the frontend.

export type Platform =
  | "facebook"
  | "instagram"
  | "threads"
  | "twitter"
  | "pinterest"
  | "linkedin"
  | "tiktok"
  | "telegram"
  | "whatsapp"
  | "wordpress"
  | "woocommerce"
  | "shopify"
  | "google_business";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "archived";

export type CampaignStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  platforms: Platform[];
  created_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  storage_url: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  media_type: "image" | "video" | "carousel";
  alt_text?: string;
  tags: string[];
  created_at: string;
}

export interface Post {
  id: string;
  campaign_id?: string;
  media_id?: string;
  title?: string;
  caption: string;
  hashtags: string[];
  seo_title?: string;
  meta_description?: string;
  product_description?: string;
  cta?: string;
  status: PostStatus;
  language: string;
  variations: unknown[];
  created_at: string;
  published_at?: string;
}

export interface Schedule {
  id: string;
  post_id: string;
  platform: Platform;
  scheduled_for: string;
  timezone: string;
  published_at?: string;
  external_url?: string;
  error_message?: string;
}

export interface ConnectedAccount {
  platform: Platform;
  account_id?: string;
  account_label?: string;
  is_connected: boolean;
  expires_at?: string;
}

export interface AIGenerateRequest {
  request_type:
    | "caption"
    | "hashtags"
    | "seo_title"
    | "meta_description"
    | "product_description"
    | "cta"
    | "strategy"
    | "multilingual"
    | "trend_research"
    | "keyword_research"
    | "audience_analysis"
    | "competitor_analysis"
    | "content_variations";
  prompt: string;
  context?: Record<string, unknown>;
  language?: string;
  variations?: number;
  model?: string;
}

export interface AIGenerateResponse {
  request_type: string;
  content: string;
  variations: string[];
  metadata: Record<string, unknown>;
  tokens_used: number;
}

export interface AnalyticsSummary {
  days: number;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body?: string;
  link?: string;
  read_at?: string;
  created_at: string;
}
