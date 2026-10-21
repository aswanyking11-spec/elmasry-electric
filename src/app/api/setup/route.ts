import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { setupDatabase } from '@/lib/db-setup'

export const dynamic = 'force-dynamic'

// POST /api/setup — إعداد قاعدة البيانات عند أول نشر على Vercel (قاعدة Turso فارغة):
// 1) ينشئ الجداول إن لم تكن موجودة (آمن — لا يمسح بيانات)
// 2) يتحقق من رمز الإدارة (الافتراضي 1234 حتى تغيّره من الإعدادات)
// 3) يعبّئ التصنيفات والمنتجات والباقات الافتراضية إذا كانت القاعدة فارغة
export async function POST(req: NextRequest) {
  try {
    const pin = req.headers.get('x-admin-pin')
    if (!pin) {
      return NextResponse.json({ error: 'أدخل رمز الإدارة أولاً' }, { status: 401 })
    }

    // ملاحظة: الجداول تُنشأ قبل التحقق من الرمز لأن جدول الإعدادات نفسه قد لا يكون موجوداً بعد
    const result = await setupDatabase(db)
    const authError = await requireAdmin(req)
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/setup error:', error)
    // تشخيص مؤقت: كشف رسالة الخطأ الحقيقية لمعرفة سبب فشل الاتصال على Vercel
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إعداد قاعدة البيانات', detail }, { status: 500 })
  }
}
