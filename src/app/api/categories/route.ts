import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
export const dynamic = 'force-dynamic'

// GET /api/categories — قائمة التصنيفات
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب التصنيفات' }, { status: 500 })
  }
}

// POST /api/categories — إضافة تصنيف جديد (لوحة التحكم)
// { name, icon?, sortOrder? }
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })

    const icon = String(body.icon ?? 'Zap').trim() || 'Zap'
    const last = await db.category.findFirst({ orderBy: { sortOrder: 'desc' } })
    const sortOrder = Number.isFinite(Number(body.sortOrder))
      ? Math.floor(Number(body.sortOrder))
      : (last?.sortOrder ?? 0) + 1

    const category = await db.category.create({ data: { name, icon, sortOrder } })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('POST /api/categories error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة التصنيف' }, { status: 500 })
  }
}
