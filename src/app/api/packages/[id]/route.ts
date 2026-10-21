import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// PATCH /api/packages/[id] — تعديل باقة (لوحة التحكم)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 })

    const data: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const v = String(body.name).trim()
      if (!v) return NextResponse.json({ error: 'اسم الباقة مطلوب' }, { status: 400 })
      data.name = v
    }
    if (body.description !== undefined) data.description = String(body.description).trim()
    if (body.price !== undefined) {
      const v = Number(body.price)
      if (!Number.isFinite(v) || v <= 0) {
        return NextResponse.json({ error: 'السعر غير صحيح' }, { status: 400 })
      }
      data.price = v
    }
    if (body.oldPrice !== undefined) {
      const v = body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
      if (v !== null && (!Number.isFinite(v) || v <= 0)) {
        return NextResponse.json({ error: 'السعر قبل الخصم غير صحيح' }, { status: 400 })
      }
      data.oldPrice = v
    }
    if (body.image !== undefined) data.image = String(body.image).trim() || '/placeholder-electrical.png'
    if (body.features !== undefined) {
      let features: string[] = []
      if (Array.isArray(body.features)) {
        features = body.features.map((f: unknown) => String(f).trim()).filter(Boolean)
      } else if (typeof body.features === 'string') {
        features = body.features.split('\n').map((s: string) => s.trim()).filter(Boolean)
      }
      if (features.length === 0) {
        return NextResponse.json({ error: 'محتويات الباقة فارغة' }, { status: 400 })
      }
      data.features = JSON.stringify(features)
    }
    if (body.badge !== undefined) data.badge = String(body.badge).trim() || null
    if (body.isPopular !== undefined) data.isPopular = Boolean(body.isPopular)
    if (body.sortOrder !== undefined) {
      const v = Number(body.sortOrder)
      data.sortOrder = Number.isFinite(v) ? Math.floor(v) : 0
    }

    const pkg = await db.package.update({ where: { id }, data })
    return NextResponse.json({ package: { ...pkg, features: JSON.parse(pkg.features) } })
  } catch (error) {
    console.error('PATCH /api/packages/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الباقة' }, { status: 500 })
  }
}

// DELETE /api/packages/[id] — حذف باقة (لوحة التحكم)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const existing = await db.package.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 })

    // إزالة عناصر السلة المرتبطة (الطلبات القديمة تحتفظ بنسخة البيانات)
    await db.cartItem.deleteMany({ where: { packageId: id } })
    await db.package.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/packages/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الباقة' }, { status: 500 })
  }
}
