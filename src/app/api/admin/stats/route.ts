import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
export const dynamic = 'force-dynamic'

// GET /api/admin/stats — إحصائيات لوحة التحكم (محمي برمز الإدارة)
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin(req)
    if (authError) return NextResponse.json({ error: authError }, { status: 401 })

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [revenue, ordersCount, todayOrders, pendingOrders, productsCount, packagesCount, lowStock, recentOrders] =
      await Promise.all([
        db.order.aggregate({ _sum: { total: true } }),
        db.order.count(),
        db.order.count({ where: { createdAt: { gte: startOfDay } } }),
        db.order.count({ where: { status: 'pending' } }),
        db.product.count(),
        db.package.count(),
        db.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: 'asc' }, take: 8 }),
        db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }),
      ])

    return NextResponse.json({
      stats: {
        totalRevenue: revenue._sum.total ?? 0,
        ordersCount,
        todayOrders,
        pendingOrders,
        productsCount,
        packagesCount,
        lowStock,
        recentOrders,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإحصائيات' }, { status: 500 })
  }
}
