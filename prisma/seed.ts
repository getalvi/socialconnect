import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  // Create system configs
  const configs = [
    { key: 'AUTO_APPROVE_POSTS', value: 'false', type: 'boolean', description: 'Automatically approve AI-generated content' },
    { key: 'DEFAULT_AI_MODEL', value: 'google/gemini-2.0-flash-exp:free', type: 'string', description: 'Default AI model for content generation' },
    { key: 'SCHEDULE_TIMEZONE', value: 'UTC', type: 'string', description: 'Timezone for scheduling' },
    { key: 'MAX_DAILY_POSTS', value: '50', type: 'number', description: 'Maximum posts per day per user' },
    { key: 'ENABLE_AUTO_PUBLISH', value: 'false', type: 'boolean', description: 'Enable automatic publishing after approval' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('System configs seeded');

  // Create demo user
  const crypto = await import('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('demo1234', salt, 100000, 64, 'sha512').toString('hex');

  const user = await prisma.user.upsert({
    where: { email: 'demo@socialconnect.ai' },
    update: {},
    create: {
      email: 'demo@socialconnect.ai',
      passwordHash: `${salt}:${hash}`,
      name: 'Demo User',
      role: 'admin',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log(`Demo user created: ${user.email} (password: demo1234)`);

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      name: 'Q4 Marketing Push',
      description: 'End of year marketing campaign across all platforms',
      status: 'active',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      budget: 5000,
    },
  });

  console.log(`Sample campaign created: ${campaign.name}`);

  // Create sample posts
  const posts = [
    { title: 'Product Launch Announcement', content: 'We are excited to announce our latest product!', caption: 'New arrival! Check out our latest offering that will transform your daily routine.', status: 'draft', platform: 'multi', campaignId: campaign.id },
    { title: 'Behind the Scenes', content: 'Take a look at how we create our products.', caption: 'Ever wondered what goes on behind the scenes? Here is a sneak peek into our creative process.', status: 'draft', platform: 'instagram', campaignId: campaign.id },
    { title: 'Customer Testimonial', content: 'What our customers are saying about us.', caption: 'Our customers love us! Here is what they have to say about their experience.', status: 'published', platform: 'facebook', campaignId: campaign.id, publishedAt: new Date() },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: {
        ...post,
        userId: user.id,
        engagementData: JSON.stringify({ likes: Math.floor(Math.random() * 100), comments: Math.floor(Math.random() * 20), shares: Math.floor(Math.random() * 10) }),
      },
    });
  }

  console.log(`${posts.length} sample posts created`);

  console.log('Seed completed successfully!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());