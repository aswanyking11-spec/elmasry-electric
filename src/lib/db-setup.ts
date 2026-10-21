import { PrismaClient } from '@prisma/client'
import { CATEGORIES, PACKAGES, PRODUCTS } from './seed-data'

/**
 * إعداد قاعدة البيانات الذاتي — يُستخدم بعد النشر على Vercel مع قاعدة Turso فارغة:
 * 1) ensureSchema: إنشاء الجداول إذا لم تكن موجودة (آمن ومتكرر — لا يمسح بيانات)
 * 2) seedCatalogIfEmpty: تعبئة التصنيفات والمنتجات والباقات إذا كانت القاعدة فارغة
 */

// عبارات إنشاء الجداول مطابقة تماماً لما ينشئه prisma db push لـ SQLite
const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "oldPrice" REAL,
    "image" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brand" TEXT,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 10,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "oldPrice" REAL,
    "image" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "badge" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT,
    "packageId" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "unitPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "packageId" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "unitPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeName" TEXT NOT NULL DEFAULT 'ELMASRY ELECTRIC',
    "storeTagline" TEXT NOT NULL DEFAULT 'للأدوات الكهربائية والإنارة',
    "storePhone" TEXT NOT NULL DEFAULT '01000000000',
    "adminPin" TEXT NOT NULL DEFAULT '1234',
    "shippingFee" REAL NOT NULL DEFAULT 50,
    "freeShippingThreshold" REAL NOT NULL DEFAULT 1500,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,
  `CREATE INDEX IF NOT EXISTS "CartItem_sessionId_idx" ON "CartItem"("sessionId")`,
  `CREATE INDEX IF NOT EXISTS "Order_sessionId_idx" ON "Order"("sessionId")`,
]

// إنشاء الجداول إذا لم تكن موجودة — آمن للتكرار ولا يعدل الجداول الموجودة
export async function ensureSchema(db: PrismaClient) {
  for (const sql of CREATE_STATEMENTS) {
    await db.$executeRawUnsafe(sql)
  }
}

// تعبئة الكتالوج الافتراضي فقط إذا كانت القاعدة فارغة (لا يلمس بيانات موجودة)
export async function seedCatalogIfEmpty(db: PrismaClient) {
  const existingProducts = await db.product.count()
  const existingCategories = await db.category.count()
  const existingPackages = await db.package.count()

  if (existingProducts > 0 || existingCategories > 0 || existingPackages > 0) {
    return {
      seeded: false as const,
      message: 'القاعدة تحتوي على بيانات بالفعل — لم يتم تغيير أي شيء',
      categories: existingCategories,
      products: existingProducts,
      packages: existingPackages,
    }
  }

  // التصنيفات مع خريطة المفاتيح لربط المنتجات
  const keyToId = new Map<string, string>()
  for (const c of CATEGORIES) {
    const created = await db.category.create({
      data: { name: c.name, icon: c.icon, sortOrder: c.sortOrder },
    })
    keyToId.set(c.key, created.id)
  }

  for (const p of PRODUCTS) {
    await db.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.image,
        categoryId: keyToId.get(p.categoryKey) ?? '',
        brand: p.brand,
        rating: p.rating,
        reviews: p.reviews,
        stock: p.stock,
        isFeatured: p.isFeatured,
        badge: p.badge,
      },
    })
  }

  for (const pkg of PACKAGES) {
    await db.package.create({
      data: {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        oldPrice: pkg.oldPrice,
        image: pkg.image,
        features: JSON.stringify(pkg.features),
        badge: pkg.badge,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
      },
    })
  }

  return {
    seeded: true as const,
    message: `تم تجهيز القاعدة بنجاح: ${CATEGORIES.length} تصنيفات، ${PRODUCTS.length} منتجاً، ${PACKAGES.length} باقات`,
    categories: CATEGORIES.length,
    products: PRODUCTS.length,
    packages: PACKAGES.length,
  }
}

// إعداد كامل: جداول + إعدادات المحل + بيانات إن كانت فارغة
export async function setupDatabase(db: PrismaClient) {
  await ensureSchema(db)
  // صف إعدادات المحل الافتراضي (رمز الإدارة الافتراضي 1234)
  await db.storeSettings.upsert({ where: { id: 'main' }, update: {}, create: { id: 'main' } })
  return seedCatalogIfEmpty(db)
}
