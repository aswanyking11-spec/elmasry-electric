import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSettings, requireAdmin } from '@/lib/admin'
export const dynamic = 'force-dynamic'

// GET /api/settings — إعدادات عامة (بدون رمز الإدارة)
export async function GET() {
  try {
    const s = await getSettings()
    return NextResponse.json({
      settings: {
        storeName: s.storeName,
        storeTagline: s.storeTagline,
        storePhone: s.storePhone,
        shippingFee: s.shippingFee,
        freeShippingThreshold: s.freeShippingThreshold,
      },
    })
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإعدادات' }, { status: 500 })
  }
}

// PATCH /api/settings — تحديث الإعدادات (لوحة التحكم فقط)
// { storeName?, storeTagline?, storePhone?, shippingFee?, freeShippingThreshold?, newPin? }
export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.storeName !== undefined) {
      const v = String(body.storeName).trim()
      if (!v) return NextResponse.json({ error: 'اسم المحل مطلوب' }, { status: 400 })
      data.storeName = v
    }
    if (body.storeTagline !== undefined) {
      data.storeTagline = String(body.storeTagline).trim()
    }
    if (body.storePhone !== undefined) {
      const v = String(body.storePhone).replace(/[\s-]/g, '').trim()
      if (v && !/^0?\d{9,11}$/.test(v)) {
        return NextResponse.json({ error: 'رقم هاتف المحل غير صحيح' }, { status: 400 })
      }
      data.storePhone = v || '01000000000'
    }
    if (body.shippingFee !== undefined) {
      const v = Number(body.shippingFee)
      if (!Number.isFinite(v) || v < 0) {
        return NextResponse.json({ error: 'رسوم التوصيل غير صحيحة' }, { status: 400 })
      }
      data.shippingFee = v
    }
    if (body.freeShippingThreshold !== undefined) {
      const v = Number(body.freeShippingThreshold)
      if (!Number.isFinite(v) || v < 0) {
        return NextResponse.json({ error: 'حد الشحن المجاني غير صحيح' }, { status: 400 })
      }
      data.freeShippingThreshold = v
    }
    if (body.newPin !== undefined) {
      const v = String(body.newPin).trim()
      if (!/^\d{4,8}$/.test(v)) {
        return NextResponse.json({ error: 'رمز الإدارة يجب أن يكون من 4 إلى 8 أرقام' }, { status: 400 })
      }
      data.adminPin = v
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 })
    }

    const updated = await db.storeSettings.update({ where: { id: 'main' }, data })
    return NextResponse.json({
      settings: {
        storeName: updated.storeName,
        storeTagline: updated.storeTagline,
        storePhone: updated.storePhone,
        shippingFee: updated.shippingFee,
        freeShippingThreshold: updated.freeShippingThreshold,
      },
    })
  } catch (error) {
    console.error('PATCH /api/settings error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الإعدادات' }, { status: 500 })
  }
}
