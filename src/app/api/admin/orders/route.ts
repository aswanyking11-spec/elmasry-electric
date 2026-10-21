import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/orders?status= — كل طلبات العملاء (لوحة التحكم، محمي برمز الإدارة)
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const status = new URL(req.url).searchParams.get('status')
    const orders = await db.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { items: true },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('GET /api/admin/orders error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الطلبات' }, { status: 500 })
  }
}
