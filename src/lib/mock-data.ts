import { PostData, CampaignData, SocialAccount, MediaItem, GeneratedContent } from './store';

// ============================================================
// Mock Posts
// ============================================================

export const mockPosts: PostData[] = [
  {
    id: 'p1', title: 'Summer Collection Launch', captionDefault: 'Embrace the summer vibes with our latest collection! 🌞 Fresh colors, bold patterns, and sustainable fabrics await.',
    status: 'PUBLISHED', approvalStatus: 'APPROVED', publishedAt: '2025-07-08T14:00:00Z',
    engagementRate: 4.8, totalReach: 12500, totalLikes: 890, totalComments: 67, totalShares: 124,
    platforms: ['INSTAGRAM', 'FACEBOOK_PAGE'], mediaUrl: '/uploads/summer.jpg',
    hashtags: ['#SummerCollection', '#FashionForward', '#SustainableFashion', '#SummerVibes'],
    createdAt: '2025-07-07T10:00:00Z',
  },
  {
    id: 'p2', title: 'Product Highlight - Leather Bag', captionDefault: 'Handcrafted with premium leather. Every stitch tells a story of artisan craftsmanship.',
    status: 'SCHEDULED', approvalStatus: 'APPROVED', scheduledAt: '2025-07-10T18:00:00Z',
    engagementRate: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
    platforms: ['INSTAGRAM', 'PINTEREST', 'THREADS'], mediaUrl: '/uploads/bag.jpg',
    hashtags: ['#LeatherCraft', '#ArtisanMade', '#PremiumQuality', '#Handcrafted'],
    createdAt: '2025-07-08T09:00:00Z',
  },
  {
    id: 'p3', title: 'Weekend Flash Sale', captionDefault: 'FLASH SALE! 50% off on selected items this weekend only. Don\'t miss out! 🔥',
    status: 'DRAFT', approvalStatus: 'PENDING',
    engagementRate: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
    platforms: ['FACEBOOK_PAGE', 'TWITTER'], mediaUrl: '/uploads/sale.jpg',
    hashtags: ['#FlashSale', '#WeekendDeal', '#LimitedTime', '#ShopNow'],
    createdAt: '2025-07-08T11:00:00Z',
  },
  {
    id: 'p4', title: 'Behind the Scenes', captionDefault: 'Take a peek behind the scenes of our design process. From sketch to runway ✨',
    status: 'PUBLISHED', approvalStatus: 'APPROVED', publishedAt: '2025-07-06T12:00:00Z',
    engagementRate: 6.2, totalReach: 18700, totalLikes: 1245, totalComments: 89, totalShares: 201,
    platforms: ['INSTAGRAM', 'LINKEDIN'], mediaUrl: '/uploads/bts.jpg',
    hashtags: ['#BehindTheScenes', '#DesignProcess', '#CreativeJourney'],
    createdAt: '2025-07-05T08:00:00Z',
  },
  {
    id: 'p5', title: 'Customer Spotlight', captionDefault: 'Meet Sarah, one of our amazing customers! Her style game is always on point 💫',
    status: 'PUBLISHED', approvalStatus: 'APPROVED', publishedAt: '2025-07-04T16:00:00Z',
    engagementRate: 5.1, totalReach: 9800, totalLikes: 567, totalComments: 45, totalShares: 78,
    platforms: ['INSTAGRAM', 'FACEBOOK_PAGE'], mediaUrl: '/uploads/customer.jpg',
    hashtags: ['#CustomerSpotlight', '#StyleInspo', '#RealCustomers'],
    createdAt: '2025-07-04T09:00:00Z',
  },
  {
    id: 'p6', title: 'New Arrival Alert', captionDefault: 'Just landed! Our newest arrivals are here and they\'re absolutely stunning 🌟',
    status: 'SCHEDULED', approvalStatus: 'APPROVED', scheduledAt: '2025-07-12T19:00:00Z',
    engagementRate: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
    platforms: ['INSTAGRAM', 'TWITTER', 'PINTEREST'], mediaUrl: '/uploads/new-arrival.jpg',
    hashtags: ['#NewArrival', '#JustLanded', '#ShopNew', '#Fashion'],
    createdAt: '2025-07-08T14:00:00Z',
  },
  {
    id: 'p7', title: 'Sustainability Commitment', captionDefault: 'Our commitment to sustainability goes beyond fashion. Every choice matters. 🌱',
    status: 'DRAFT', approvalStatus: 'NEEDS_REVISION',
    engagementRate: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
    platforms: ['LINKEDIN', 'FACEBOOK_PAGE'], mediaUrl: '/uploads/sustainable.jpg',
    hashtags: ['#Sustainability', '#EcoFashion', '#GreenLiving'],
    createdAt: '2025-07-08T15:00:00Z',
  },
  {
    id: 'p8', title: 'Style Guide - Office Wear', captionDefault: 'Master the office look with our curated style guide. Professional meets personality.',
    status: 'DRAFT', approvalStatus: 'PENDING',
    engagementRate: 0, totalReach: 0, totalLikes: 0, totalComments: 0, totalShares: 0,
    platforms: ['LINKEDIN', 'PINTEREST'], mediaUrl: '/uploads/office.jpg',
    hashtags: ['#OfficeStyle', '#WorkWear', '#ProfessionalFashion'],
    createdAt: '2025-07-08T16:00:00Z',
  },
];

// ============================================================
// Mock Campaigns
// ============================================================

export const mockCampaigns: CampaignData[] = [
  { id: 'c1', name: 'Summer 2025 Launch', description: 'Full campaign for summer collection across all platforms', objective: 'AWARENESS', status: 'ACTIVE', startDate: '2025-06-01', endDate: '2025-08-31', postCount: 24, totalReach: 45000, engagementRate: 4.5 },
  { id: 'c2', name: 'Flash Sale Weekend', description: 'Weekend promotional campaign', objective: 'SALES', status: 'ACTIVE', startDate: '2025-07-10', endDate: '2025-07-13', postCount: 8, totalReach: 12000, engagementRate: 5.8 },
  { id: 'c3', name: 'Brand Awareness Q3', description: 'Brand awareness campaign for Q3', objective: 'AWARENESS', status: 'DRAFT', startDate: '2025-07-15', endDate: '2025-09-30', postCount: 0, totalReach: 0, engagementRate: 0 },
  { id: 'c4', name: 'Loyalty Program', description: 'Customer loyalty and retention campaign', objective: 'BRAND_LOYALTY', status: 'PAUSED', startDate: '2025-05-01', endDate: '2025-07-31', postCount: 15, totalReach: 28000, engagementRate: 3.9 },
];

// ============================================================
// Mock Social Accounts
// ============================================================

export const mockAccounts: SocialAccount[] = [
  { id: 'a1', platform: 'INSTAGRAM', username: '@socialconnect', displayName: 'SocialConnect', followers: 15420, isActive: true, connected: true, lastSyncedAt: '2025-07-08T12:00:00Z' },
  { id: 'a2', platform: 'FACEBOOK_PAGE', username: 'SocialConnect Official', displayName: 'SocialConnect Official Page', followers: 8900, isActive: true, connected: true, lastSyncedAt: '2025-07-08T12:00:00Z' },
  { id: 'a3', platform: 'TWITTER', username: '@socialconnect', displayName: 'SocialConnect', followers: 6700, isActive: true, connected: true, lastSyncedAt: '2025-07-08T11:00:00Z' },
  { id: 'a4', platform: 'LINKEDIN', username: 'SocialConnect Inc.', displayName: 'SocialConnect Business', followers: 4200, isActive: true, connected: true, lastSyncedAt: '2025-07-08T10:00:00Z' },
  { id: 'a5', platform: 'PINTEREST', username: 'SocialConnect', displayName: 'SocialConnect Pins', followers: 3100, isActive: true, connected: true, lastSyncedAt: '2025-07-07T18:00:00Z' },
  { id: 'a6', platform: 'THREADS', username: '@socialconnect', displayName: 'SocialConnect', followers: 2200, isActive: true, connected: true, lastSyncedAt: '2025-07-08T09:00:00Z' },
  { id: 'a7', platform: 'TIKTOK', username: '@socialconnect', displayName: 'SocialConnect', followers: 0, isActive: false, connected: false },
  { id: 'a8', platform: 'YOUTUBE', username: '', displayName: '', followers: 0, isActive: false, connected: false },
  { id: 'a9', platform: 'TELEGRAM', username: '', displayName: '', followers: 0, isActive: false, connected: false },
  { id: 'a10', platform: 'WHATSAPP', username: '', displayName: '', followers: 0, isActive: false, connected: false },
  { id: 'a11', platform: 'SHOPIFY', username: '', displayName: '', followers: 0, isActive: false, connected: false },
  { id: 'a12', platform: 'WORDPRESS', username: '', displayName: '', followers: 0, isActive: false, connected: false },
];

// ============================================================
// Mock Generated Content
// ============================================================

export const mockGeneratedContent: GeneratedContent = {
  caption: 'Elevate your everyday style with our premium leather collection. Crafted for those who appreciate the finer details. ✨',
  professional: 'Introducing our latest premium leather collection, designed for the modern professional who values quality craftsmanship and timeless elegance.',
  friendly: 'Hey friends! Check out our gorgeous new leather goodies! They\'re super soft, totally gorgeous, and you NEED them in your life! 🥰',
  luxury: 'Exquisite craftsmanship meets contemporary design. Each piece in our premium leather collection is a testament to artisanal excellence and refined taste.',
  emoji: 'New leather collection just dropped! 🔥👜✨ Premium quality that you can feel! Perfect for every occasion 💼 Shop now! 🛍️ #LuxuryLifestyle',
  facebook: 'We\'re thrilled to introduce our new premium leather collection! Each piece is handcrafted with care and attention to detail. Visit our store to explore the full range. #NewCollection #PremiumLeather',
  instagram: 'New leather collection just dropped! 🔥 Handcrafted with premium materials ✨ Every piece tells a story of artisan craftsmanship 🤎 Drop a 🔥 if you love it! #NewArrival #LeatherCollection #PremiumQuality #Handcrafted',
  linkedin: 'Excited to announce the launch of our premium leather collection. Combining traditional craftsmanship with modern design, each piece represents our commitment to quality and sustainability. Explore the collection: [link]',
  twitter: 'NEW: Premium leather collection just dropped! 🔥 Handcrafted quality meets modern design. Shop now: [link] #NewArrival #PremiumLeather',
  pinterest: 'Premium Leather Collection - Handcrafted bags and accessories for the modern professional. Shop the collection for timeless elegance.',
  threads: 'Our new leather collection is HERE and it\'s absolutely stunning! 🔥✨ Every piece handcrafted with love. Which one is your fave? 🤎',
  seoTitle: 'Premium Leather Collection | Handcrafted Bags & Accessories',
  metaDescription: 'Discover our premium leather collection featuring handcrafted bags and accessories. Sustainable materials, artisan craftsmanship, and timeless design.',
  productDescription: 'Our premium leather collection features handcrafted bags and accessories made from sustainably sourced materials. Each piece is designed with both functionality and style in mind, featuring premium hardware, reinforced stitching, and a timeless aesthetic that only gets better with age.',
  cta: 'Shop the Collection Now →',
  hashtags: ['#PremiumLeather', '#Handcrafted', '#LeatherBags', '#ArtisanMade', '#LuxuryFashion', '#NewArrival', '#SustainableFashion', '#TimelessStyle', '#QualityCraftsmanship', '#FashionForward', '#LeatherCraft', '#BangladeshFashion', '#DhakaStyle', '#BDStyle', '#TrendingNow'],
};

// ============================================================
// Mock Analytics Data
// ============================================================

export const mockEngagementTrend = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  engagement: +(2 + Math.random() * 4).toFixed(1),
  reach: Math.floor(800 + Math.random() * 2500),
  impressions: Math.floor(1200 + Math.random() * 3500),
  clicks: Math.floor(50 + Math.random() * 300),
  likes: Math.floor(30 + Math.random() * 200),
}));

export const mockPlatformPerformance = [
  { platform: 'Instagram', posts: 24, engagement: 4.2, reach: 12500, clicks: 890, color: '#E1306C' },
  { platform: 'Facebook', posts: 18, engagement: 2.8, reach: 8900, clicks: 567, color: '#1877F2' },
  { platform: 'Twitter', posts: 15, engagement: 3.1, reach: 6700, clicks: 445, color: '#1DA1F2' },
  { platform: 'LinkedIn', posts: 8, engagement: 5.4, reach: 4200, clicks: 312, color: '#0077B5' },
  { platform: 'Pinterest', posts: 6, engagement: 2.5, reach: 3100, clicks: 234, color: '#E60023' },
];

export const mockTopHashtags = [
  { tag: '#FashionForward', count: 45, reach: 89000 },
  { tag: '#SustainableFashion', count: 38, reach: 72000 },
  { tag: '#NewArrival', count: 34, reach: 65000 },
  { tag: '#Handcrafted', count: 28, reach: 54000 },
  { tag: '#SummerCollection', count: 25, reach: 48000 },
  { tag: '#PremiumQuality', count: 22, reach: 42000 },
  { tag: '#LeatherCraft', count: 19, reach: 36000 },
  { tag: '#BangladeshFashion', count: 16, reach: 28000 },
  { tag: '#DhakaStyle', count: 14, reach: 22000 },
  { tag: '#TrendingNow', count: 12, reach: 18000 },
];

export const mockBestPostingTimes = [
  { hour: '6 AM', score: 3.2 }, { hour: '7 AM', score: 4.5 }, { hour: '8 AM', score: 5.8 },
  { hour: '9 AM', score: 4.9 }, { hour: '10 AM', score: 3.8 }, { hour: '11 AM', score: 3.2 },
  { hour: '12 PM', score: 4.1 }, { hour: '1 PM', score: 3.5 }, { hour: '2 PM', score: 2.8 },
  { hour: '3 PM', score: 3.1 }, { hour: '4 PM', score: 4.2 }, { hour: '5 PM', score: 5.1 },
  { hour: '6 PM', score: 6.8 }, { hour: '7 PM', score: 7.2 }, { hour: '8 PM', score: 6.5 },
  { hour: '9 PM', score: 5.4 }, { hour: '10 PM', score: 4.1 }, { hour: '11 PM', score: 2.8 },
];

export const mockWorkflowTemplates = [
  { id: 'full_marketing', name: 'Full Marketing Pipeline', description: 'Upload → Analyze → Enhance → Trend → Caption → Hashtag → Schedule', steps: 7, icon: '🚀' },
  { id: 'content_only', name: 'Content Generation', description: 'Marketing Strategy → Copywriting → Hashtags → SEO', steps: 4, icon: '✍️' },
  { id: 'trend_based', name: 'Trend-Based Campaign', description: 'Trends → Strategy → Content → Hashtags → Schedule', steps: 5, icon: '📈' },
  { id: 'image_focus', name: 'Image-First Workflow', description: 'Analysis → Enhancement → Brand Check → Content', steps: 4, icon: '🖼️' },
  { id: 'analytics_review', name: 'Analytics & Optimize', description: 'Analytics → Growth → Revised Strategy → New Content', steps: 4, icon: '📊' },
];

export const mockAIModels = [
  { id: 'glm-5-turbo', name: 'GLM-5 Turbo', status: 'active', qualityScore: 8.5, speedMs: 1200, cost: 0.001, overallScore: 8.7 },
  { id: 'deepseek-v3', name: 'DeepSeek V3', status: 'active', qualityScore: 8.2, speedMs: 1800, cost: 0.0015, overallScore: 8.1 },
  { id: 'qwen', name: 'Qwen 2.5 72B', status: 'active', qualityScore: 7.9, speedMs: 2200, cost: 0.002, overallScore: 7.6 },
  { id: 'kimi', name: 'Kimi Moonshot', status: 'active', qualityScore: 7.5, speedMs: 2500, cost: 0.002, overallScore: 7.2 },
  { id: 'gemini-flash', name: 'Gemini Flash', status: 'active', qualityScore: 7.8, speedMs: 900, cost: 0.001, overallScore: 8.0 },
  { id: 'claude', name: 'Claude Sonnet', status: 'fallback', qualityScore: 9.1, speedMs: 3000, cost: 0.003, overallScore: 8.5 },
  { id: 'gpt4o', name: 'GPT-4o', status: 'fallback', qualityScore: 9.0, speedMs: 3500, cost: 0.005, overallScore: 8.2 },
];

export const platformIcons: Record<string, string> = {
  INSTAGRAM: '📷',
  FACEBOOK_PAGE: '📘',
  FACEBOOK_GROUP: '👥',
  TWITTER: '🐦',
  LINKEDIN: '💼',
  PINTEREST: '📌',
  THREADS: '🧵',
  TIKTOK: '🎵',
  YOUTUBE: '▶️',
  TELEGRAM: '✈️',
  WHATSAPP: '💬',
  SHOPIFY: '🛒',
  WORDPRESS: '📝',
  WOOCOMMERCE: '🏪',
};

export const platformColors: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  FACEBOOK_PAGE: '#1877F2',
  FACEBOOK_GROUP: '#1877F2',
  TWITTER: '#1DA1F2',
  LINKEDIN: '#0077B5',
  PINTEREST: '#E60023',
  THREADS: '#000000',
  TIKTOK: '#000000',
  YOUTUBE: '#FF0000',
  TELEGRAM: '#0088CC',
  WHATSAPP: '#25D366',
  SHOPIFY: '#95BF47',
  WORDPRESS: '#21759B',
};

export const statusColors: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
  SCHEDULED: 'bg-amber-500/20 text-amber-400',
  DRAFT: 'bg-slate-500/20 text-slate-400',
  FAILED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-slate-600/20 text-slate-500',
  ACTIVE: 'bg-emerald-500/20 text-emerald-400',
  PAUSED: 'bg-amber-500/20 text-amber-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
};

export const approvalColors: Record<string, string> = {
  APPROVED: 'bg-emerald-500/20 text-emerald-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  NEEDS_REVISION: 'bg-orange-500/20 text-orange-400',
};
