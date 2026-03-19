import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ============================================
  // 1. Upsert Stores
  // ============================================
  console.log('Creating/updating stores...');

  const aliexpress = await prisma.store.upsert({
    where: { name: 'AliExpress' },
    update: {
      platform: 'ALIEXPRESS',
      baseUrl: 'https://www.aliexpress.com',
      affiliateConfig: {
        appKey: 'YOUR_ALIEXPRESS_APP_KEY',
        appSecret: 'YOUR_ALIEXPRESS_APP_SECRET',
        trackingId: 'YOUR_ALIEXPRESS_TRACKING_ID',
        apiEndpoint: 'https://api-sg.aliexpress.com/sync',
      },
      trustScore: 70,
      commissionRate: 5,
      logoUrl: 'https://ae01.alicdn.com/kf/H3c4da55d12db4df4b2b7b4f4b4b4b4b4.png',
    },
    create: {
      name: 'AliExpress',
      platform: 'ALIEXPRESS',
      baseUrl: 'https://www.aliexpress.com',
      affiliateConfig: {
        appKey: 'YOUR_ALIEXPRESS_APP_KEY',
        appSecret: 'YOUR_ALIEXPRESS_APP_SECRET',
        trackingId: 'YOUR_ALIEXPRESS_TRACKING_ID',
        apiEndpoint: 'https://api-sg.aliexpress.com/sync',
      },
      trustScore: 70,
      commissionRate: 5,
      logoUrl: 'https://ae01.alicdn.com/kf/H3c4da55d12db4df4b2b7b4f4b4b4b4b4.png',
    },
  });

  const temu = await prisma.store.upsert({
    where: { name: 'Temu' },
    update: {
      platform: 'TEMU',
      baseUrl: 'https://www.temu.com',
      affiliateConfig: {
        apiKey: 'YOUR_TEMU_API_KEY',
        affiliateId: 'YOUR_TEMU_AFFILIATE_ID',
        secretKey: 'YOUR_TEMU_SECRET_KEY',
        apiEndpoint: 'https://openapi.temupay.com',
      },
      trustScore: 65,
      commissionRate: 15,
      logoUrl: 'https://img.temu.com/favicon.ico',
    },
    create: {
      name: 'Temu',
      platform: 'TEMU',
      baseUrl: 'https://www.temu.com',
      affiliateConfig: {
        apiKey: 'YOUR_TEMU_API_KEY',
        affiliateId: 'YOUR_TEMU_AFFILIATE_ID',
        secretKey: 'YOUR_TEMU_SECRET_KEY',
        apiEndpoint: 'https://openapi.temupay.com',
      },
      trustScore: 65,
      commissionRate: 15,
      logoUrl: 'https://img.temu.com/favicon.ico',
    },
  });

  const iherb = await prisma.store.upsert({
    where: { name: 'iHerb' },
    update: {
      platform: 'IHERB',
      baseUrl: 'https://www.iherb.com',
      affiliateConfig: {
        affiliateCode: 'YOUR_IHERB_AFFILIATE_CODE',
        apiKey: 'YOUR_IHERB_API_KEY',
        apiSecret: 'YOUR_IHERB_API_SECRET',
        apiEndpoint: 'https://catalog.iherb.com/api',
      },
      trustScore: 85,
      commissionRate: 10,
      logoUrl: 'https://www.iherb.com/favicon.ico',
    },
    create: {
      name: 'iHerb',
      platform: 'IHERB',
      baseUrl: 'https://www.iherb.com',
      affiliateConfig: {
        affiliateCode: 'YOUR_IHERB_AFFILIATE_CODE',
        apiKey: 'YOUR_IHERB_API_KEY',
        apiSecret: 'YOUR_IHERB_API_SECRET',
        apiEndpoint: 'https://catalog.iherb.com/api',
      },
      trustScore: 85,
      commissionRate: 10,
      logoUrl: 'https://www.iherb.com/favicon.ico',
    },
  });

  console.log(`  Stores: ${aliexpress.name}, ${temu.name}, ${iherb.name}`);

  // ============================================
  // 2. Upsert Categories (10 categories)
  // ============================================
  console.log('Creating/updating categories...');

  const categoriesData = [
    { nameHe: 'אלקטרוניקה', nameEn: 'Electronics', slug: 'electronics', icon: '📱', demandScore: 90 },
    { nameHe: 'אופנה', nameEn: 'Fashion', slug: 'fashion', icon: '👗', demandScore: 85 },
    { nameHe: 'בית וגן', nameEn: 'Home & Garden', slug: 'home-garden', icon: '🏠', demandScore: 80 },
    { nameHe: 'בריאות ויופי', nameEn: 'Health & Beauty', slug: 'health-beauty', icon: '💊', demandScore: 88 },
    { nameHe: 'ספורט', nameEn: 'Sports', slug: 'sports', icon: '⚽', demandScore: 70 },
    { nameHe: 'צעצועים', nameEn: 'Toys', slug: 'toys', icon: '🧸', demandScore: 75 },
    { nameHe: 'מזון ותוספי תזונה', nameEn: 'Food & Supplements', slug: 'food-supplements', icon: '🥗', demandScore: 82 },
    { nameHe: 'טכנולוגיה', nameEn: 'Technology', slug: 'technology', icon: '💻', demandScore: 92 },
    { nameHe: 'תינוקות וילדים', nameEn: 'Baby & Kids', slug: 'baby-kids', icon: '👶', demandScore: 78 },
    { nameHe: 'רכב', nameEn: 'Automotive', slug: 'automotive', icon: '🚗', demandScore: 60 },
  ] as const;

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        nameHe: cat.nameHe,
        nameEn: cat.nameEn,
        icon: cat.icon,
        demandScore: cat.demandScore,
        isActive: true,
      },
      create: {
        nameHe: cat.nameHe,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        demandScore: cat.demandScore,
        isActive: true,
      },
    });
    categories[cat.slug] = upserted;
  }

  console.log(`  Categories: ${Object.keys(categories).length}`);

  // ============================================
  // 3. Upsert System Settings
  // ============================================
  console.log('Creating/updating system settings...');

  const settingsData = [
    {
      key: 'scoring_weights',
      value: {
        discount: 25,
        reviews: 20,
        reviewCount: 10,
        freeShipping: 15,
        coupon: 10,
        categoryDemand: 10,
        storeTrust: 10,
      },
    },
    {
      key: 'telegram_config',
      value: {
        botToken: 'YOUR_TELEGRAM_BOT_TOKEN',
        channelId: '@clickli26',
        maxPostsPerDay: 15,
        postInterval: 60,
        minScoreForTelegram: 70,
        enableAutoPost: false,
      },
    },
    {
      key: 'site_config',
      value: {
        siteName: 'קליקלי',
        siteUrl: 'https://clickly.co.il',
        language: 'he',
        currency: 'ILS',
        exchangeRate: 3.65,
        vatThreshold: 75,
        vatRate: 0.17,
        minPublishScore: 60,
        maxDealsPerPage: 12,
        enableCouponHighlight: true,
      },
    },
  ] as const;

  for (const setting of settingsData) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  console.log(`  System settings: ${settingsData.length}`);

  // ============================================
  // Summary
  // ============================================
  const [categoryCount, storeCount, settingCount] = await Promise.all([
    prisma.category.count(),
    prisma.store.count(),
    prisma.systemSetting.count(),
  ]);

  console.log('');
  console.log('Seed completed successfully!');
  console.log(`  Stores:          ${storeCount}`);
  console.log(`  Categories:      ${categoryCount}`);
  console.log(`  System Settings: ${settingCount}`);
  console.log('');
  console.log('NOTE: Products and posts are NOT seeded here.');
  console.log('They should be created via the ingestion pipeline or admin dashboard.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
