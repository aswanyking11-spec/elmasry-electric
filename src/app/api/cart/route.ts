import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cart?sessionId= — عناصر السلة + الإجمالي
export async function GET(req: NextRequest) {
  try {
    const sessionId = new URL(req.url).searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId مطلوب' }, { status: 400 })
    }
    const items = await db.cartItem.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    })
    const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
    const count = items.reduce((sum, it) => sum + it.quantity, 0)
    return NextResponse.json({ items, total, count })
  } catch (error) {
    console.error('GET /api/cart error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب السلة' }, { status: 500 })
  }
}

// POST /api/cart — إضافة عنصر للسلة { sessionId, productId?, packageId?, quantity? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId: string | undefined = body.sessionId
    const productId: string | undefined = body.productId
    const packageId: string | undefined = body.packageId
    const quantity: number = Math.max(1, Number(body.quantity) || 1)

    if (!sessionId || (!productId && !packageId)) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    let name: string, unitPrice: number, image: string | null

    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
      name = product.name
      unitPrice = product.price
      image = product.image
    } else {
      const pkg = await db.package.findUnique({ where: { id: packageId as string } })
      if (!pkg) return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 })
      name = pkg.name
      unitPrice = pkg.price
      image = pkg.image
    }

    // إذا كان العنصر موجوداً في السلة نرفع الكمية
    const existing = await db.cartItem.findFirst({
      where: { sessionId, productId: productId ?? null, packageId: packageId ?? null },
    })

    let item
    if (existing) {
      item = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    } else {
      item = await db.cartItem.create({
        data: { sessionId, productId: productId ?? null, packageId: packageId ?? null, name, image, unitPrice, quantity },
      })
    }

    const items = await db.cartItem.findMany({ where: { sessionId }, orderBy: { createdAt: 'desc' } })
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
    const count = items.reduce((s, it) => s + it.quantity, 0)
    return NextResponse.json({ item, items, total, count }, { status: 201 })
  } catch (error) {
    console.error('POST /api/cart error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء الإضافة للسلة' }, { status: 500 })
  }
}

// PATCH /api/cart — تحديث كمية { sessionId, itemId, quantity }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, itemId, quantity } = body as { sessionId?: string; itemId?: string; quantity?: number }
    if (!sessionId || !itemId || quantity === undefined) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }

    const existing = await db.cartItem.findFirst({ where: { id: itemId, sessionId } })
    if (!existing) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } })
    } else {
      await db.cartItem.update({ where: { id: itemId }, data: { quantity: Math.min(99, quantity) } })
    }

    const items = await db.cartItem.findMany({ where: { sessionId }, orderBy: { createdAt: 'desc' } })
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
    const count = items.reduce((s, it) => s + it.quantity, 0)
    return NextResponse.json({ items, total, count })
  } catch (error) {
    console.error('PATCH /api/cart error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث السلة' }, { status: 500 })
  }
}

// DELETE /api/cart?sessionId=&itemId= — حذف عنصر من السلة
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const itemId = searchParams.get('itemId')
    if (!sessionId || !itemId) {
      return NextResponse.json({ error: 'sessionId و itemId مطلوبان' }, { status: 400 })
    }
    const existing = await db.cartItem.findFirst({ where: { id: itemId, sessionId } })
    if (!existing) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })

    await db.cartItem.delete({ where: { id: itemId } })
    const items = await db.cartItem.findMany({ where: { sessionId }, orderBy: { createdAt: 'desc' } })
    const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
    const count = items.reduce((s, it) => s + it.quantity, 0)
    return NextResponse.json({ items, total, count })
  } catch (error) {
    console.error('DELETE /api/cart error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء الحذف من السلة' }, { status: 500 })
  }
}
