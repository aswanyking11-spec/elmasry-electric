import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

/**
 * إنشاء عميل Prisma حسب نوع قاعدة البيانات:
 * - libsql://... (Turso — النشر الدائم على Vercel) → عبر Driver Adapter
 * - file:... (SQLite محلي — التطوير) → عميل عادي
 * هذا يجعل نفس الكود يعمل محلياً وعلى السحابة بتبديل متغيرات البيئة فقط.
 */
export function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? ''

  if (url.startsWith('libsql://')) {
    return new PrismaClient({
      adapter: new PrismaLibSQL({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }),
      log: ['error', 'warn'],
    })
  }

  return new PrismaClient({ log: ['query'] })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
