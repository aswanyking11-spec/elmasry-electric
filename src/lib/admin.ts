import { db } from '@/lib/db'

const SETTINGS_ID = 'main'

// يجلب إعدادات المحل وينشئ الصف الافتراضي إن لم يوجد
export async function getSettings() {
  return db.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  })
}

// يتحقق من رمز الإدارة المرسل في الترويسة x-admin-pin
// يعيد رسالة الخطأ أو null إذا كان الرمز صحيحاً
export async function requireAdmin(req: Request): Promise<string | null> {
  const pin = req.headers.get('x-admin-pin') ?? ''
  const settings = await getSettings()
  if (!pin || pin !== settings.adminPin) {
    return 'رمز الإدارة غير صحيح'
  }
  return null
}
