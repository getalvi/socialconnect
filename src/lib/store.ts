import { create } from 'zustand';

// ============================================================
// Types
// ============================================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PostData {
  id: string;
  title: string;
  captionDefault?: string;
  status: string;
  approvalStatus: string;
  scheduledAt?: string;
  publishedAt?: string;
  engagementRate: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  platforms: string[];
  mediaUrl?: string;
  hashtags?: string[];
  createdAt: string;
}

export interface MediaItem {
  id: string;
  originalUrl: string;
  originalName: string;
  mimeType: string;
  status: string;
  aiCategory?: string;
  aiNiche?: string;
  aiQuality?: string;
  createdAt: string;
}

export interface GeneratedContent {
  caption?: string;
  professional?: string;
  friendly?: string;
  luxury?: string;
  emoji?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  pinterest?: string;
  threads?: string;
  seoTitle?: string;
  metaDescription?: string;
  productDescription?: string;
  cta?: string;
  hashtags?: string[];
}

export interface CampaignData {
  id: string;
  name: string;
  description?: string;
  objective?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  postCount: number;
  totalReach: number;
  engagementRate: number;
}

export interface SocialAccount {
  id: string;
  platform: string;
  username?: string;
  displayName?: string;
  followers: number;
  isActive: boolean;
  connected: boolean;
  lastSyncedAt?: string;
}

// ============================================================
// Store
// ============================================================

interface AppState {
  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Upload workflow
  uploadStep: 'upload' | 'analyze' | 'enhance' | 'generate' | 'review' | 'schedule';
  setUploadStep: (step: AppState['uploadStep']) => void;

  // Selected media for workflow
  selectedMedia: MediaItem[];
  addSelectedMedia: (media: MediaItem) => void;
  removeSelectedMedia: (id: string) => void;
  clearSelectedMedia: () => void;

  // Generated content
  generatedContent: GeneratedContent | null;
  setGeneratedContent: (content: GeneratedContent | null) => void;

  // Loading states
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;

  // Content editing
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;

  // Analytics date range
  analyticsRange: '7d' | '30d' | '90d';
  setAnalyticsRange: (range: '7d' | '30d' | '90d') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // Notifications
  notifications: [
    { id: '1', type: 'APPROVAL_NEEDED', title: 'Post awaiting approval', message: 'Instagram post "Summer Collection" needs your review', isRead: false, createdAt: new Date().toISOString() },
    { id: '2', type: 'POST_PUBLISHED', title: 'Post published', message: 'Facebook post successfully published', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', type: 'TREND_ALERT', title: 'Trending in your niche', message: '#SummerFashion is trending in Bangladesh', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', type: 'AI_RECOMMENDATION', title: 'AI Suggestion', message: 'Your audience is most active at 6-9 PM', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
  })),

  // Upload workflow
  uploadStep: 'upload',
  setUploadStep: (step) => set({ uploadStep: step }),

  // Selected media
  selectedMedia: [],
  addSelectedMedia: (media) => set((state) => ({ selectedMedia: [...state.selectedMedia, media] })),
  removeSelectedMedia: (id) => set((state) => ({ selectedMedia: state.selectedMedia.filter(m => m.id !== id) })),
  clearSelectedMedia: () => set({ selectedMedia: [] }),

  // Generated content
  generatedContent: null,
  setGeneratedContent: (content) => set({ generatedContent: content }),

  // Loading
  isGenerating: false,
  setIsGenerating: (loading) => set({ isGenerating: loading }),

  // Content editing
  editingPostId: null,
  setEditingPostId: (id) => set({ editingPostId: id }),

  // Analytics range
  analyticsRange: '30d',
  setAnalyticsRange: (range) => set({ analyticsRange: range }),
}));
