import {
  PrismaClient,
  ProductStatus,
  Channel,
  PostVariant,
  CouponType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // 1. Clear existing data (correct order for FK constraints)
  // ============================================
  console.log('🗑️  Clearing existing data...');
  await prisma.conversion.deleteMany();
  await prisma.click.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.systemSetting.deleteMany();

  // ============================================
  // 2. Create Categories
  // ============================================
  console.log('📂 Creating categories...');

  const categoriesData = [
    { nameHe: 'אלקטרוניקה', nameEn: 'Electronics', slug: 'electronics', icon: '📱', demandScore: 90 },
    { nameHe: 'אופנה', nameEn: 'Fashion', slug: 'fashion', icon: '👗', demandScore: 85 },
    { nameHe: 'בית וגן', nameEn: 'Home & Garden', slug: 'home-garden', icon: '🏠', demandScore: 75 },
    { nameHe: 'בריאות ויופי', nameEn: 'Health & Beauty', slug: 'health-beauty', icon: '💊', demandScore: 80 },
    { nameHe: 'ספורט', nameEn: 'Sports', slug: 'sports', icon: '⚽', demandScore: 70 },
    { nameHe: 'צעצועים וילדים', nameEn: 'Toys & Kids', slug: 'toys-kids', icon: '🧸', demandScore: 65 },
    { nameHe: 'מחשבים וגיימינג', nameEn: 'Computers & Gaming', slug: 'computers-gaming', icon: '🖥️', demandScore: 88 },
    { nameHe: 'מטבח', nameEn: 'Kitchen', slug: 'kitchen', icon: '🍳', demandScore: 72 },
  ] as const;

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // ============================================
  // 3. Create Stores
  // ============================================
  console.log('🏪 Creating stores...');

  const aliexpress = await prisma.store.create({
    data: {
      name: 'AliExpress',
      platform: 'ALIEXPRESS',
      logoUrl: 'https://ae01.alicdn.com/kf/H3c4da55d12db4df4b2b7b4f4b4b4b4b4.png',
      baseUrl: 'https://www.aliexpress.com',
      affiliateConfig: JSON.stringify({ appKey: 'demo_key', appSecret: 'demo_secret', trackingId: 'clickly_ali' }),
      trustScore: 75,
      commissionRate: 8,
    },
  });

  const temu = await prisma.store.create({
    data: {
      name: 'Temu',
      platform: 'TEMU',
      logoUrl: 'https://img.temu.com/favicon.ico',
      baseUrl: 'https://www.temu.com',
      affiliateConfig: JSON.stringify({ apiKey: 'demo_key', affiliateId: 'clickly_temu' }),
      trustScore: 70,
      commissionRate: 15,
    },
  });

  const iherb = await prisma.store.create({
    data: {
      name: 'iHerb',
      platform: 'IHERB',
      logoUrl: 'https://www.iherb.com/favicon.ico',
      baseUrl: 'https://www.iherb.com',
      affiliateConfig: JSON.stringify({ affiliateCode: 'demo_code', apiKey: 'demo_key' }),
      trustScore: 90,
      commissionRate: 10,
    },
  });

  // ============================================
  // 4. Create Products (15 total, 5 per store)
  // ============================================
  console.log('📦 Creating products...');

  const productsData = [
    // ─── AliExpress Products (5) ─────────────────────────
    {
      externalId: 'ali_001',
      storeId: aliexpress.id,
      categoryId: categories['electronics'].id,
      titleEn: 'Wireless Bluetooth Earbuds Pro ANC',
      titleHe: 'אוזניות בלוטוס אלחוטיות פרו עם סינון רעשים',
      descriptionHe: 'אוזניות TWS עם סינון רעשים אקטיבי, בס עמוק וחיי סוללה של 30 שעות. כוללות מארז טעינה אלחוטי.',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop',
      productUrl: 'https://www.aliexpress.com/item/1005006001.html',
      affiliateUrl: 'https://s.click.aliexpress.com/e/_clickly_001',
      priceOriginal: 49.99,
      priceCurrent: 24.99,
      shippingFree: true,
      couponCode: 'CLICKLY5',
      couponValue: 5,
      couponType: CouponType.FIXED,
      rating: 4.6,
      reviewCount: 12450,
      score: 92,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-15'),
      tags: JSON.stringify(['earbuds', 'bluetooth', 'wireless', 'anc']),
      targetAudience: JSON.stringify(['tech', 'music']),
    },
    {
      externalId: 'ali_002',
      storeId: aliexpress.id,
      categoryId: categories['electronics'].id,
      titleEn: 'Premium Silicone Phone Case iPhone 16',
      titleHe: 'כיסוי סיליקון פרימיום לאייפון 16',
      descriptionHe: 'כיסוי סיליקון רך ועמיד בפני זעזועים, עיצוב מינימליסטי עם הגנה מלאה על המצלמה.',
      imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
      productUrl: 'https://www.aliexpress.com/item/1005006002.html',
      affiliateUrl: 'https://s.click.aliexpress.com/e/_clickly_002',
      priceOriginal: 12.99,
      priceCurrent: 5.49,
      shippingFree: true,
      rating: 4.8,
      reviewCount: 34200,
      score: 85,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-16'),
      tags: JSON.stringify(['phone case', 'iphone', 'silicone']),
      targetAudience: JSON.stringify(['tech']),
    },
    {
      externalId: 'ali_003',
      storeId: aliexpress.id,
      categoryId: categories['home-garden'].id,
      titleEn: 'RGB LED Strip Light 10M Smart WiFi',
      titleHe: 'רצועת LED חכמה 10 מטר עם WiFi',
      descriptionHe: 'רצועת לד צבעונית 10 מטר עם שליטה מהאפליקציה, סנכרון למוזיקה ו-16 מיליון צבעים. תואמת Alexa ו-Google Home.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
      productUrl: 'https://www.aliexpress.com/item/1005006003.html',
      affiliateUrl: 'https://s.click.aliexpress.com/e/_clickly_003',
      priceOriginal: 29.99,
      priceCurrent: 14.99,
      shippingCost: 2.50,
      shippingFree: false,
      rating: 4.3,
      reviewCount: 8900,
      score: 78,
      status: ProductStatus.APPROVED,
      isPublished: false,
      tags: JSON.stringify(['led', 'smart home', 'rgb']),
      targetAudience: JSON.stringify(['home', 'tech']),
    },
    {
      externalId: 'ali_004',
      storeId: aliexpress.id,
      categoryId: categories['electronics'].id,
      titleEn: 'Smart Watch Ultra Fitness Tracker',
      titleHe: 'שעון חכם אולטרה עם מעקב כושר',
      descriptionHe: 'שעון חכם עם מסך AMOLED 1.9 אינץ\', מד דופק, SpO2, GPS מובנה ועמידות במים IP68. סוללה ל-14 ימים.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      productUrl: 'https://www.aliexpress.com/item/1005006004.html',
      affiliateUrl: 'https://s.click.aliexpress.com/e/_clickly_004',
      priceOriginal: 89.99,
      priceCurrent: 39.99,
      shippingFree: true,
      couponCode: 'WATCH10',
      couponValue: 10,
      couponType: CouponType.PERCENT,
      rating: 4.5,
      reviewCount: 5600,
      score: 88,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-17'),
      tags: JSON.stringify(['smartwatch', 'fitness', 'health']),
      targetAudience: JSON.stringify(['tech', 'sports']),
    },
    {
      externalId: 'ali_005',
      storeId: aliexpress.id,
      categoryId: categories['computers-gaming'].id,
      titleEn: 'USB-C Hub 7-in-1 Multiport Adapter',
      titleHe: 'מתאם USB-C 7 ב-1 מולטיפורט',
      descriptionHe: 'תחנת עגינה קומפקטית עם HDMI 4K, 3 יציאות USB 3.0, קורא כרטיסים SD/TF וטעינת PD 100W.',
      imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop',
      productUrl: 'https://www.aliexpress.com/item/1005006005.html',
      affiliateUrl: 'https://s.click.aliexpress.com/e/_clickly_005',
      priceOriginal: 35.99,
      priceCurrent: 18.99,
      shippingFree: true,
      rating: 4.4,
      reviewCount: 7200,
      score: 81,
      status: ProductStatus.PENDING,
      isPublished: false,
      tags: JSON.stringify(['usb hub', 'usb-c', 'adapter']),
      targetAudience: JSON.stringify(['tech', 'work']),
    },

    // ─── Temu Products (5) ───────────────────────────────
    {
      externalId: 'temu_001',
      storeId: temu.id,
      categoryId: categories['fashion'].id,
      titleEn: 'Elegant Summer Maxi Dress Floral',
      titleHe: 'שמלת מקסי אלגנטית פרחונית לקיץ',
      descriptionHe: 'שמלת מקסי פרחונית מבד קליל ונושם, מתאימה לים ולערב. גזרה מחמיאה עם שסע צדדי.',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
      productUrl: 'https://www.temu.com/item/1001.html',
      affiliateUrl: 'https://share.temu.com/clickly_001',
      priceOriginal: 39.99,
      priceCurrent: 15.99,
      shippingFree: true,
      couponCode: 'TEMU20',
      couponValue: 20,
      couponType: CouponType.PERCENT,
      rating: 4.2,
      reviewCount: 18900,
      score: 76,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-14'),
      tags: JSON.stringify(['dress', 'summer', 'women']),
      targetAudience: JSON.stringify(['women', 'fashion']),
    },
    {
      externalId: 'temu_002',
      storeId: temu.id,
      categoryId: categories['sports'].id,
      titleEn: 'Breathable Running Sneakers Unisex',
      titleHe: 'נעלי ריצה נושמות יוניסקס',
      descriptionHe: 'נעלי ספורט קלות עם סולייה מונעת החלקה, בד מאוורר ותמיכה בקשת כף הרגל. מושלמות לריצה ולאימון.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      productUrl: 'https://www.temu.com/item/1002.html',
      affiliateUrl: 'https://share.temu.com/clickly_002',
      priceOriginal: 59.99,
      priceCurrent: 22.99,
      shippingFree: true,
      rating: 4.0,
      reviewCount: 9500,
      score: 71,
      status: ProductStatus.APPROVED,
      isPublished: false,
      tags: JSON.stringify(['sneakers', 'running', 'sports']),
      targetAudience: JSON.stringify(['sports', 'unisex']),
    },
    {
      externalId: 'temu_003',
      storeId: temu.id,
      categoryId: categories['fashion'].id,
      titleEn: 'Waterproof Travel Backpack 40L',
      titleHe: 'תיק גב עמיד למים 40 ליטר לטיולים',
      descriptionHe: 'תיק גב מרווח עם תא ייעודי ללפטופ 15.6 אינץ\', כיסים נסתרים ורצועות מרופדות. עמיד למים ונוח לגב.',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      productUrl: 'https://www.temu.com/item/1003.html',
      affiliateUrl: 'https://share.temu.com/clickly_003',
      priceOriginal: 45.99,
      priceCurrent: 19.99,
      shippingCost: 3.99,
      shippingFree: false,
      rating: 4.4,
      reviewCount: 6700,
      score: 83,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-16'),
      tags: JSON.stringify(['backpack', 'travel', 'waterproof']),
      targetAudience: JSON.stringify(['travel', 'unisex']),
    },
    {
      externalId: 'temu_004',
      storeId: temu.id,
      categoryId: categories['kitchen'].id,
      titleEn: 'Kitchen Utensils Set 12-Piece Silicone',
      titleHe: 'סט כלי מטבח 12 חלקים סיליקון',
      descriptionHe: 'סט כלי בישול מסיליקון עמיד בחום עם ידיות עץ טבעי. כולל מצקת, מרית, כף הגשה ועוד. בטוח לסירים נון-סטיק.',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      productUrl: 'https://www.temu.com/item/1004.html',
      affiliateUrl: 'https://share.temu.com/clickly_004',
      priceOriginal: 29.99,
      priceCurrent: 12.99,
      shippingFree: true,
      rating: 4.6,
      reviewCount: 15300,
      score: 87,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-17'),
      tags: JSON.stringify(['kitchen', 'utensils', 'silicone']),
      targetAudience: JSON.stringify(['home', 'kitchen']),
    },
    {
      externalId: 'temu_005',
      storeId: temu.id,
      categoryId: categories['electronics'].id,
      titleEn: 'Adjustable Phone Stand Desktop Holder',
      titleHe: 'מעמד טלפון שולחני מתכוונן',
      descriptionHe: 'מעמד אלומיניום יציב עם זווית מתכווננת, תואם לכל הטלפונים והטאבלטים עד 12.9 אינץ\'. בסיס נגד החלקה.',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
      productUrl: 'https://www.temu.com/item/1005.html',
      affiliateUrl: 'https://share.temu.com/clickly_005',
      priceOriginal: 15.99,
      priceCurrent: 6.99,
      shippingFree: true,
      rating: 4.7,
      reviewCount: 22100,
      score: 79,
      status: ProductStatus.PENDING,
      isPublished: false,
      tags: JSON.stringify(['phone stand', 'desk', 'aluminum']),
      targetAudience: JSON.stringify(['tech', 'work']),
    },

    // ─── iHerb Products (5) ─────────────────────────────
    {
      externalId: 'iherb_001',
      storeId: iherb.id,
      categoryId: categories['health-beauty'].id,
      titleEn: 'Vitamin D3 5000 IU - 360 Softgels',
      titleHe: 'ויטמין D3 5000 יחידות - 360 כמוסות',
      descriptionHe: 'ויטמין D3 במינון גבוה לחיזוק מערכת החיסון ובריאות העצמות. מספיק לשנה שלמה! תוצרת Now Foods.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      productUrl: 'https://www.iherb.com/pr/now-foods-vitamin-d3/1001',
      affiliateUrl: 'https://iherb.co/clickly_001',
      priceOriginal: 18.99,
      priceCurrent: 12.99,
      shippingCost: 4.00,
      shippingFree: false,
      couponCode: 'CLICKLY10',
      couponValue: 10,
      couponType: CouponType.PERCENT,
      rating: 4.8,
      reviewCount: 45200,
      score: 95,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-13'),
      tags: JSON.stringify(['vitamin d', 'supplements', 'health']),
      targetAudience: JSON.stringify(['health']),
    },
    {
      externalId: 'iherb_002',
      storeId: iherb.id,
      categoryId: categories['sports'].id,
      titleEn: 'Whey Protein Isolate Chocolate 2.27kg',
      titleHe: 'אבקת חלבון מי גבינה שוקולד 2.27 ק"ג',
      descriptionHe: 'אבקת חלבון איזולט באיכות פרימיום עם 25 גרם חלבון למנה. טעם שוקולד עשיר, ללא סוכר מוסף. תוצרת Optimum Nutrition.',
      imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2c828?w=400&h=400&fit=crop',
      productUrl: 'https://www.iherb.com/pr/optimum-nutrition-whey/1002',
      affiliateUrl: 'https://iherb.co/clickly_002',
      priceOriginal: 74.99,
      priceCurrent: 59.99,
      shippingFree: true,
      rating: 4.7,
      reviewCount: 28900,
      score: 91,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-15'),
      tags: JSON.stringify(['protein', 'whey', 'fitness']),
      targetAudience: JSON.stringify(['sports', 'health']),
    },
    {
      externalId: 'iherb_003',
      storeId: iherb.id,
      categoryId: categories['health-beauty'].id,
      titleEn: 'Omega-3 Fish Oil 1000mg - 200 Softgels',
      titleHe: 'אומגה 3 שמן דגים 1000 מ"ג - 200 כמוסות',
      descriptionHe: 'שמן דגים טהור עם EPA ו-DHA לבריאות הלב והמוח. ללא טעם דגי, כמוסות קלות לבליעה. תוצרת Nature Made.',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
      productUrl: 'https://www.iherb.com/pr/nature-made-omega3/1003',
      affiliateUrl: 'https://iherb.co/clickly_003',
      priceOriginal: 24.99,
      priceCurrent: 17.49,
      shippingCost: 4.00,
      shippingFree: false,
      rating: 4.6,
      reviewCount: 19800,
      score: 86,
      status: ProductStatus.APPROVED,
      isPublished: false,
      tags: JSON.stringify(['omega 3', 'fish oil', 'supplements']),
      targetAudience: JSON.stringify(['health']),
    },
    {
      externalId: 'iherb_004',
      storeId: iherb.id,
      categoryId: categories['health-beauty'].id,
      titleEn: 'CeraVe Moisturizing Cream 453g',
      titleHe: 'קרם לחות סראווה 453 גרם',
      descriptionHe: 'קרם לחות אינטנסיבי עם סרמידים וחומצה היאלורונית לעור יבש ורגיש. ללא ניחוח, מומלץ על ידי רופאי עור.',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
      productUrl: 'https://www.iherb.com/pr/cerave-moisturizing/1004',
      affiliateUrl: 'https://iherb.co/clickly_004',
      priceOriginal: 19.99,
      priceCurrent: 15.99,
      shippingCost: 4.00,
      shippingFree: false,
      rating: 4.9,
      reviewCount: 52100,
      score: 93,
      status: ProductStatus.PUBLISHED,
      isPublished: true,
      publishedAt: new Date('2026-03-18'),
      tags: JSON.stringify(['skincare', 'moisturizer', 'cerave']),
      targetAudience: JSON.stringify(['beauty', 'women']),
    },
    {
      externalId: 'iherb_005',
      storeId: iherb.id,
      categoryId: categories['health-beauty'].id,
      titleEn: 'Organic Matcha Green Tea Powder 100g',
      titleHe: "אבקת תה ירוק מאצ'ה אורגני 100 גרם",
      descriptionHe: "מאצ'ה יפני אורגני באיכות טקסית, עשיר בנוגדי חמצון וL-תיאנין. מושלם לשתייה, שייקים ואפייה.",
      imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
      productUrl: 'https://www.iherb.com/pr/matcha-green-tea/1005',
      affiliateUrl: 'https://iherb.co/clickly_005',
      priceOriginal: 29.99,
      priceCurrent: 21.99,
      shippingCost: 4.00,
      shippingFree: false,
      rating: 4.5,
      reviewCount: 8400,
      score: 74,
      status: ProductStatus.PENDING,
      isPublished: false,
      tags: JSON.stringify(['matcha', 'green tea', 'organic']),
      targetAudience: JSON.stringify(['health', 'food']),
    },
  ];

  const createdProducts: Array<{ id: string; titleHe: string | null; status: ProductStatus }> = [];
  for (const product of productsData) {
    const created = await prisma.product.create({ data: product });
    createdProducts.push({ id: created.id, titleHe: created.titleHe, status: created.status });
  }

  // ============================================
  // 5. Create Posts (5 published posts)
  // ============================================
  console.log('📝 Creating posts...');

  const publishedProducts = createdProducts.filter((p) => p.status === ProductStatus.PUBLISHED);

  const postsData = [
    // Post 1: Earbuds - WEB SEO
    {
      productId: publishedProducts[0].id,
      channel: Channel.WEB,
      variant: PostVariant.SEO_LONG,
      titleHe: 'אוזניות בלוטוס ב-25$ בלבד! סינון רעשים אקטיבי במחיר מטורף',
      bodyHe: [
        'אם חיפשתם אוזניות TWS איכותיות בלי לשבור את הכיס, המציאה הזו בשבילכם.',
        '',
        'האוזניות האלה מגיעות עם סינון רעשים אקטיבי (ANC), בס עמוק ומארז טעינה שנותן עד 30 שעות האזנה.',
        '',
        'עם קופון CLICKLY5 תקבלו הנחה נוספת של 5$!',
      ].join('\n'),
      ctaHe: 'לקנייה עם הנחה',
      prosHe: JSON.stringify(['סינון רעשים מעולה במחיר', 'סוללה ל-30 שעות', 'משלוח חינם']),
      consHe: 'אין אפליקציית אקולייזר מותאמת',
      slug: 'wireless-earbuds-anc-deal',
      metaDescription: 'אוזניות בלוטוס TWS עם ANC ב-25$ בלבד - כולל קופון הנחה של 5$. משלוח חינם מ-AliExpress.',
      isPublished: true,
      publishedAt: new Date('2026-03-15'),
    },
    // Post 2: Phone Case - TELEGRAM short
    {
      productId: publishedProducts[1].id,
      channel: Channel.TELEGRAM,
      variant: PostVariant.SHORT_FIRE,
      titleHe: 'כיסוי אייפון 16 ב-5.49$ עם משלוח חינם!',
      bodyHe: [
        'כיסוי סיליקון פרימיום לאייפון 16 במחיר שבור!',
        '',
        'הגנה מלאה על המצלמה',
        'סיליקון רך ונעים',
        'משלוח חינם',
        '',
        'במחיר הזה שווה לקחת שניים',
      ].join('\n'),
      ctaHe: 'לרכישה מהירה',
      isPublished: true,
      publishedAt: new Date('2026-03-16'),
      telegramMessageId: 'tg_msg_001',
    },
    // Post 3: Smart Watch - WEB social proof
    {
      productId: publishedProducts[3].id,
      channel: Channel.WEB,
      variant: PostVariant.SOCIAL_PROOF,
      titleHe: 'שעון חכם עם GPS ומד דופק - מעל 5,600 ביקורות חיוביות',
      bodyHe: [
        'השעון החכם הזה הפתיע אותנו בגדול.',
        '',
        'עם מסך AMOLED חד, GPS מובנה, מד דופק ו-SpO2 - הוא מתחרה ישירות בשעונים שעולים פי 5.',
        '',
        '5,600+ קונים כבר נתנו לו דירוג של 4.5 כוכבים.',
        '',
        'עם הקופון WATCH10 תקבלו 10% הנחה נוספת!',
      ].join('\n'),
      ctaHe: 'לצפייה בשעון',
      prosHe: JSON.stringify(['מסך AMOLED 1.9"', 'GPS מובנה', 'סוללה ל-14 ימים', 'עמיד למים IP68']),
      consHe: 'האפליקציה בסינית חלקית',
      slug: 'smart-watch-ultra-gps-review',
      metaDescription: 'סקירת שעון חכם Ultra עם GPS ב-40$ בלבד. מד דופק, SpO2, מסך AMOLED וסוללה ל-14 ימים.',
      isPublished: true,
      publishedAt: new Date('2026-03-17'),
    },
    // Post 4: Dress - TELEGRAM short
    {
      productId: publishedProducts[4].id,
      channel: Channel.TELEGRAM,
      variant: PostVariant.SHORT_FIRE,
      titleHe: 'שמלת מקסי מהממת לקיץ ב-16$ בלבד!',
      bodyHe: [
        'דיל אש לקיץ!',
        '',
        'שמלת מקסי פרחונית בגזרה מחמיאה',
        '',
        'מחיר מקורי: 40$',
        'עכשיו רק: 16$',
        'קופון TEMU20 = 20% הנחה נוספת!',
        'משלוח חינם',
        '',
        'רוצו לפני שנגמר!',
      ].join('\n'),
      ctaHe: 'לרכישה עם קופון',
      isPublished: true,
      publishedAt: new Date('2026-03-14'),
      telegramMessageId: 'tg_msg_002',
    },
    // Post 5: Vitamin D - WEB SEO
    {
      productId: publishedProducts[7].id,
      channel: Channel.WEB,
      variant: PostVariant.SEO_LONG,
      titleHe: 'ויטמין D3 - מספיק לשנה שלמה ב-13$ בלבד',
      bodyHe: [
        'ויטמין D3 הוא אחד התוספים הכי חשובים, במיוחד בישראל שם רבים סובלים מחוסר.',
        '',
        '360 כמוסות של Now Foods במינון 5000 IU - מספיק לשנה שלמה!',
        '',
        'דירוג של 4.8 כוכבים עם יותר מ-45,000 ביקורות.',
        '',
        'עם קופון CLICKLY10 תקבלו 10% הנחה.',
      ].join('\n'),
      ctaHe: 'לרכישה באייהרב',
      prosHe: JSON.stringify(['מספיק לשנה שלמה', 'מותג Now Foods אמין', '45,000+ ביקורות', 'מחיר מעולה ליחידה']),
      consHe: 'משלוח לא חינמי (4$)',
      slug: 'vitamin-d3-now-foods-iherb-deal',
      metaDescription: 'ויטמין D3 5000 IU של Now Foods - 360 כמוסות ב-13$ באייהרב. כולל קופון הנחה 10%.',
      isPublished: true,
      publishedAt: new Date('2026-03-13'),
    },
  ];

  for (const post of postsData) {
    await prisma.post.create({ data: post });
  }

  // ============================================
  // 6. Create System Settings
  // ============================================
  console.log('⚙️  Creating system settings...');

  await Promise.all([
    prisma.systemSetting.create({
      data: {
        key: 'scoring_weights',
        value: JSON.stringify({
          discount: 25,
          reviews: 20,
          reviewCount: 10,
          freeShipping: 15,
          coupon: 10,
          categoryDemand: 10,
          storeTrust: 10,
        }),
      },
    }),
    prisma.systemSetting.create({
      data: {
        key: 'publish_config',
        value: JSON.stringify({
          minScore: 60,
          maxTelegramPostsPerDay: 15,
          autoPublish: false,
        }),
      },
    }),
    prisma.systemSetting.create({
      data: {
        key: 'site_config',
        value: JSON.stringify({
          siteName: 'קליקלי',
          siteUrl: 'http://localhost:3000',
          language: 'he',
          currency: 'ILS',
        }),
      },
    }),
  ]);

  // ============================================
  // Summary
  // ============================================
  const categoryCount = await prisma.category.count();
  const storeCount = await prisma.store.count();
  const productCount = await prisma.product.count();
  const postCount = await prisma.post.count();

  console.log('');
  console.log('Seed completed successfully!');
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Stores:     ${storeCount}`);
  console.log(`   Products:   ${productCount}`);
  console.log(`   Posts:      ${postCount}`);
  console.log('');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
