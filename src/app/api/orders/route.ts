import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

// GET /api/orders?sessionId= — طلبات هذا الجهاز
export async function GET(req: NextRequest) {
  try {
    const sessionId = new URL(req.url).searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId مطلوب' }, { status: 400 })
    }
    const orders = await db.order.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الطلبات' }, { status: 500 })
  }
}

// POST /api/orders — إنشاء طلب من السلة
// { sessionId, customerName, phone, city, address, notes? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, customerName, phone, city, address, notes } = body as {
      sessionId?: string
      customerName?: string
      phone?: string
      city?: string
      address?: string
      notes?: string
    }

    if (!sessionId || !customerName?.trim() || !phone?.trim() || !city?.trim() || !address?.trim()) {
      return NextResponse.json({ error: 'الرجاء تعبئة جميع الحقول المطلوبة' }, { status: 400 })
    }
    if (!/^01[0125][0-9]{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      return NextResponse.json({ error: 'رقم الموبايل غير صحيح (مثال: 01012345678)' }, { status: 400 })
    }

    const cartItems = await db.cartItem.findMany({ where: { sessionId } })
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'السلة فارغة' }, { status: 400 })
    }

    const total = cartItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`

    const order = await db.order.create({
      data: {
        orderNumber,
        sessionId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        notes: notes?.trim() || null,
        total,
        status: 'pending',
        items: {
          create: cartItems.map((it) => ({
            productId: it.productId,
            packageId: it.packageId,
            name: it.name,
            image: it.image,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
          })),
        },
      },
      include: { items: true },
    })

    // تفريغ السلة بعد الطلب
    await db.cartItem.deleteMany({ where: { sessionId } })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الطلب' }, { status: 500 })
  }
}
