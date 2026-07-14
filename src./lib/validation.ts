import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createPostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.array(z.string()).optional(),
  platform: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed']).default('draft'),
  mediaIds: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.array(z.string()).optional(),
  platform: z.string().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed']).optional(),
  mediaIds: z.array(z.string()).optional(),
  campaignId: z.string().nullable().optional(),
});

export const scheduleSchema = z.object({
  postId: z.string().min(1),
  scheduledAt: z.string().datetime(),
});

export const captionRequestSchema = z.object({
  content: z.string().optional(),
  mediaId: z.string().optional(),
  platform: z.string().default('instagram'),
  tone: z.string().default('professional'),
  language: z.string().default('english'),
  model: z.string().optional(),
  variations: z.number().min(1).max(5).default(3),
});

export const hashtagRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.string().default('instagram'),
  count: z.number().min(5).max(50).default(20),
  model: z.string().optional(),
});

export const seoRequestSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  targetKeywords: z.array(z.string()).default([]),
  model: z.string().optional(),
});

export const trendRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  platform: z.string().optional(),
  model: z.string().optional(),
});

export const enhanceRequestSchema = z.object({
  mediaId: z.string().min(1),
  enhancementType: z.enum(['brightness', 'contrast', 'sharpness', 'saturation', 'denoise', 'auto']).default('auto'),
  brightness: z.number().min(0.1).max(3.0).optional(),
  contrast: z.number().min(0.1).max(3.0).optional(),
  sharpness: z.number().min(0.1).max(5.0).optional(),
  saturation: z.number().min(0.1).max(3.0).optional(),
});

export const analyzeRequestSchema = z.object({
  mediaId: z.string().min(1),
  model: z.string().optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().min(0).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  description: z.string().optional(),
});

export const publishRequestSchema = z.object({
  postId: z.string().min(1),
  platformAccountIds: z.array(z.string()).min(1),
});

export const socialAccountAddSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube', 'telegram', 'wordpress', 'shopify', 'threads']),
  platformUserId: z.string(),
  username: z.string().optional(),
  displayName: z.string().min(1),
  avatar: z.string().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  scopes: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type CaptionRequestInput = z.infer<typeof captionRequestSchema>;
export type HashtagRequestInput = z.infer<typeof hashtagRequestSchema>;
export type SeoRequestInput = z.infer<typeof seoRequestSchema>;
export type TrendRequestInput = z.infer<typeof trendRequestSchema>;
export type EnhanceRequestInput = z.infer<typeof enhanceRequestSchema>;
export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PublishRequestInput = z.infer<typeof publishRequestSchema>;