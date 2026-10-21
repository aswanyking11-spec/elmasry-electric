import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// PATCH /api/categories/[id] — تعديل تصنيف (لوحة التحكم)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) {
      const v = String(body.name).trim()
      if (!v) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })
      data.name = v
    }
    if (body.icon !== undefined) data.icon = String(body.icon).trim() || 'Zap'
    if (body.sortOrder !== undefined) {
      const v = Number(body.sortOrder)
      data.sortOrder = Number.isFinite(v) ? Math.floor(v) : 0
    }

    const category = await db.category.update({ where: { id }, data })
    return NextResponse.json({ category })
  } catch (error) {
    console.error('PATCH /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل التصنيف' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] — حذف تصنيف (لوحة التحكم)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })

    // منع حذف تصنيف يحتوي منتجات
    const productsCount = await db.product.count({ where: { categoryId: id } })
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف التصنيف — يحتوي على ${productsCount} منتج. انقل المنتجات لتصنيف آخر أولاً` },
        { status: 400 }
      )
    }

    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف التصنيف' }, { status: 500 })
  }
}
