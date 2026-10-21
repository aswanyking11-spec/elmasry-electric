// سكربت تعبئة قاعدة البيانات — محل ELMASRY ELECTRIC للأدوات الكهربائية
// يعمل مع SQLite المحلي أو قاعدة Turso السحابية حسب DATABASE_URL في .env
// ⚠️ هذا السكربت يمسح البيانات القديمة ويعيد التعبئة (للتطوير) — للتطبيق المنشور استخدم زر الإعداد في لوحة الإدارة
import { db } from '../src/lib/db'
import { CATEGORIES, PACKAGES, PRODUCTS } from '../src/lib/seed-data'

async function main() {
  console.log('🗑️  مسح البيانات القديمة...')
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.package.deleteMany()

  console.log('📁 إنشاء التصنيفات...')
  const keyToId = new Map<string, string>()
  for (const c of CATEGORIES) {
    const created = await db.category.create({
      data: { name: c.name, icon: c.icon, sortOrder: c.sortOrder },
    })
    keyToId.set(c.key, created.id)
  }

  console.log('📦 إنشاء المنتجات...')
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

  console.log('🎁 إنشاء الباقات...')
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

  console.log('⚙️ إنشاء إعدادات المحل...')
  await db.storeSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  })

  console.log(`✅ تم! ${await db.category.count()} تصنيفات، ${await db.product.count()} منتجات، ${await db.package.count()} باقات`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
