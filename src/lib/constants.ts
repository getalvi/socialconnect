export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const APP_NAME = "SocialConnect AI";

export const PLATFORMS = [
  { id: "FACEBOOK", name: "Facebook", icon: "Facebook", color: "#1877F2" },
  { id: "INSTAGRAM", name: "Instagram", icon: "Instagram", color: "#E4405F" },
  { id: "THREADS", name: "Threads", icon: "MessageCircle", color: "#000000" },
  { id: "TWITTER", name: "Twitter / X", icon: "Twitter", color: "#1DA1F2" },
  { id: "PINTEREST", name: "Pinterest", icon: "Pin", color: "#E60023" },
  { id: "LINKEDIN", name: "LinkedIn", icon: "Linkedin", color: "#0A66C2" },
  { id: "TIKTOK", name: "TikTok", icon: "Music2", color: "#000000" },
  { id: "YOUTUBE", name: "YouTube", icon: "Youtube", color: "#FF0000" },
  { id: "TELEGRAM", name: "Telegram", icon: "Send", color: "#0088CC" },
  { id: "WORDPRESS", name: "WordPress", icon: "FileText", color: "#21759B" },
  { id: "SHOPIFY", name: "Shopify", icon: "ShoppingBag", color: "#96BF48" },
] as const;

export const POST_STATUSES = {
  DRAFT: { label: "Draft", color: "badge-info" },
  AI_GENERATED: { label: "AI Generated", color: "badge-warning" },
  SCHEDULED: { label: "Scheduled", color: "badge-info" },
  APPROVED: { label: "Approved", color: "badge-success" },
  PUBLISHING: { label: "Publishing", color: "badge-warning" },
  PUBLISHED: { label: "Published", color: "badge-success" },
  FAILED: { label: "Failed", color: "badge-error" },
} as const;

export const CONTENT_TYPES = ["IMAGE", "VIDEO", "CAROUSEL", "TEXT", "STORY", "REEL"] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/media", label: "Media Library", icon: "Image" },
  { href: "/dashboard/create", label: "Create Post", icon: "PlusCircle" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "Calendar" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/dashboard/trends", label: "Trends", icon: "TrendingUp" },
  { href: "/dashboard/connections", label: "Connections", icon: "Link" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
] as const;