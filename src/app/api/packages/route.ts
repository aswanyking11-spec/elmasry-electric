import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
export const dynamic = 'force-dynamic'

// GET /api/packages — قائمة الباقات
export async function GET() {
  try {
    const packages = await db.package.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    // تحويل features من JSON string إلى مصفوفة
    const parsed = packages.map((p) => ({
      ...p,
      features: JSON.parse(p.features || '[]') as string[],
    }))
    return NextResponse.json({ packages: parsed })
  } catch (error) {
    console.error('GET /api/packages error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الباقات' }, { status: 500 })
  }
}

// POST /api/packages — إضافة باقة جديدة (لوحة التحكم)
// { name, price, features: string[] | string(أسطر), description?, oldPrice?, image?, badge?, isPopular?, sortOrder? }
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const price = Number(body.price)

    if (!name) return NextResponse.json({ error: 'اسم الباقة مطلوب' }, { status: 400 })
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'السعر يجب أن يكون رقماً أكبر من صفر' }, { status: 400 })
    }
    const oldPrice = body.oldPrice === undefined || body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
      return NextResponse.json({ error: 'السعر قبل الخصم غير صحيح' }, { status: 400 })
    }

    let features: string[] = []
    if (Array.isArray(body.features)) {
      features = body.features.map((f: unknown) => String(f).trim()).filter(Boolean)
    } else if (typeof body.features === 'string') {
      features = body.features.split('\n').map((s: string) => s.trim()).filter(Boolean)
    }
    if (features.length === 0) {
      return NextResponse.json({ error: 'أضف محتويات الباقة (سطر لكل ميزة)' }, { status: 400 })
    }

    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Math.floor(Number(body.sortOrder)) : 0

    const pkg = await db.package.create({
      data: {
        name,
        description: String(body.description ?? '').trim() || 'باقة موفرة من ELMASRY ELECTRIC',
        price,
        oldPrice,
        image: String(body.image ?? '').trim() || '/placeholder-electrical.png',
        features: JSON.stringify(features),
        badge: String(body.badge ?? '').trim() || null,
        isPopular: Boolean(body.isPopular),
        sortOrder,
      },
    })
    return NextResponse.json({ package: { ...pkg, features: JSON.parse(pkg.features) } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/packages error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الباقة' }, { status: 500 })
  }
}
