import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
export const dynamic = 'force-dynamic'

// GET /api/products?categoryId=&featured=&q= — قائمة المنتجات
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const q = searchParams.get('q')

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (featured === 'true') where.isFeatured = true
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim() } },
        { description: { contains: q.trim() } },
        { brand: { contains: q.trim() } },
      ]
    }

    const products = await db.product.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المنتجات' }, { status: 500 })
  }
}

// POST /api/products — إضافة منتج جديد (لوحة التحكم)
// { name, price, categoryId, description?, oldPrice?, image?, brand?, stock?, badge?, isFeatured? }
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const price = Number(body.price)
    const categoryId = String(body.categoryId ?? '').trim()

    if (!name) return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'السعر يجب أن يكون رقماً أكبر من صفر' }, { status: 400 })
    }
    const category = await db.category.findUnique({ where: { id: categoryId } })
    if (!category) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 400 })

    const oldPrice = body.oldPrice === undefined || body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
      return NextResponse.json({ error: 'السعر قبل الخصم غير صحيح' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name,
        price,
        categoryId,
        oldPrice,
        description: String(body.description ?? '').trim() || 'منتج من محل ELMASRY ELECTRIC للأدوات الكهربائية.',
        image: String(body.image ?? '').trim() || '/placeholder-electrical.png',
        brand: String(body.brand ?? '').trim() || null,
        stock: Number.isFinite(Number(body.stock)) && Number(body.stock) >= 0 ? Math.floor(Number(body.stock)) : 10,
        badge: String(body.badge ?? '').trim() || null,
        isFeatured: Boolean(body.isFeatured),
        rating: 4.5,
        reviews: 0,
      },
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة المنتج' }, { status: 500 })
  }
}
