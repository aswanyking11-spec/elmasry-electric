import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// PATCH /api/products/[id] — تعديل منتج (لوحة التحكم)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

    const data: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 })
      data.name = name
    }
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: 'السعر يجب أن يكون رقماً أكبر من صفر' }, { status: 400 })
      }
      data.price = price
    }
    if (body.oldPrice !== undefined) {
      const oldPrice = body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
      if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
        return NextResponse.json({ error: 'السعر قبل الخصم غير صحيح' }, { status: 400 })
      }
      data.oldPrice = oldPrice
    }
    if (body.description !== undefined) data.description = String(body.description).trim()
    if (body.image !== undefined) data.image = String(body.image).trim() || '/placeholder-electrical.png'
    if (body.brand !== undefined) data.brand = String(body.brand).trim() || null
    if (body.badge !== undefined) data.badge = String(body.badge).trim() || null
    if (body.stock !== undefined) {
      const stock = Number(body.stock)
      data.stock = Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0
    }
    if (body.categoryId !== undefined) {
      const category = await db.category.findUnique({ where: { id: String(body.categoryId) } })
      if (!category) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 400 })
      data.categoryId = String(body.categoryId)
    }
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)

    const product = await db.product.update({ where: { id }, data })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل المنتج' }, { status: 500 })
  }
}

// DELETE /api/products/[id] — حذف منتج (لوحة التحكم)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })

    // إزالة عناصر السلة المرتبطة (الطلبات القديمة تحتفظ بنسخة البيانات)
    await db.cartItem.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المنتج' }, { status: 500 })
  }
}
