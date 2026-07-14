import { PrismaClient, Role, Plan } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@socialconnect.ai" },
    update: {},
    create: {
      email: "admin@socialconnect.ai",
      passwordHash: adminPassword,
      name: "Admin User",
      role: Role.SUPER_ADMIN,
      plan: Plan.ENTERPRISE,
      emailVerified: true,
      isActive: true,
    },
  });

  // Create demo user
  const demoPassword = await hash("Demo@123456", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@socialconnect.ai" },
    update: {},
    create: {
      email: "demo@socialconnect.ai",
      passwordHash: demoPassword,
      name: "Demo User",
      role: Role.USER,
      plan: Plan.PRO,
      emailVerified: true,
      isActive: true,
    },
  });

  // Create sample trend topics
  const trendTopics = [
    { keyword: "AI Marketing", platform: "TWITTER", category: "Technology", score: 95.5, volume: 45000, growthRate: 23.5, relatedTags: ["#AIMarketing", "#MarketingAI", "#DigitalMarketing"] },
    { keyword: "Reels Strategy", platform: "INSTAGRAM", category: "Social Media", score: 88.2, volume: 32000, growthRate: 18.2, relatedTags: ["#InstagramReels", "#ReelsStrategy", "#ContentCreator"] },
    { keyword: "Sustainable Business", platform: "LINKEDIN", category: "Business", score: 82.7, volume: 28000, growthRate: 15.8, relatedTags: ["#Sustainability", "#ESG", "#GreenBusiness"] },
    { keyword: "Short Form Video", platform: "TIKTOK", category: "Content", score: 91.3, volume: 52000, growthRate: 28.1, relatedTags: ["#ShortFormVideo", "#TikTokTrends", "#ViralContent"] },
    { keyword: "E-commerce Tips", platform: "SHOPIFY", category: "E-commerce", score: 76.8, volume: 18000, growthRate: 12.4, relatedTags: ["#ShopifyTips", "#Ecommerce", "#OnlineStore"] },
  ];

  for (const trend of trendTopics) {
    await prisma.trendTopic.upsert({
      where: { id: trend.keyword.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: trend.keyword.toLowerCase().replace(/\s+/g, "-"),
        ...trend,
        relatedTags: trend.relatedTags,
      },
    });
  }

  // Create sample notifications for admin
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, type: "SYSTEM", title: "Welcome to SocialConnect AI", message: "Your platform is set up and ready. Connect your social media accounts to get started." },
      { userId: admin.id, type: "UPDATE", title: "New Feature: AI Trend Research", message: "AI-powered trend research is now available. Discover trending topics across all platforms." },
      { userId: admin.id, type: "ALERT", title: "API Usage Update", message: "Your OpenRouter API key has been configured successfully. AI features are now active." },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data created:");
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Demo:  ${demo.email}`);
  console.log(`  Trends: ${trendTopics.length} topics`);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });