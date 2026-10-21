import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered']

// PATCH /api/orders/[id] — تحديث حالة الطلب (لوحة التحكم)
// { status: 'pending' | 'confirmed' | 'shipped' | 'delivered' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const status = String(body.status ?? '')

    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'حالة الطلب غير صحيحة' }, { status: 400 })
    }

    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })
    return NextResponse.json({ order })
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الطلب' }, { status: 500 })
  }
}
