'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Zap, Search, ShoppingBag, Home as HomeIcon, Package, ShoppingCart, ClipboardList,
  Star, Plus, Minus, Trash2, X, MapPin, Phone, User, Truck, ShieldCheck,
  Loader2, CheckCircle2, PackageOpen, BadgePercent, Download, Check,
  Cable, Plug, Flame, Layers, Cog, Pencil, PackagePlus, Settings,
  ChevronLeft, Wallet, Lightbulb, LayoutDashboard, Gift, Tags, SlidersHorizontal,
  LockKeyhole, LogOut, TrendingUp, AlertTriangle, Eye, EyeOff,
  Wrench, CircuitBoard, PlugZap, BatteryCharging, Smartphone, CloudCog,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

// ============ الأنواع ============
interface Category { id: string; name: string; icon: string; sortOrder: number; _count?: { products: number } }
interface Product {
  id: string; name: string; description: string; price: number; oldPrice: number | null
  image: string; categoryId: string; brand: string | null; rating: number; reviews: number
  stock: number; isFeatured: boolean; badge: string | null
}
interface Pkg {
  id: string; name: string; description: string; price: number; oldPrice: number | null
  image: string; features: string[]; badge: string | null; isPopular: boolean; sortOrder: number
}
interface CartItem {
  id: string; productId: string | null; packageId: string | null
  name: string; image: string | null; unitPrice: number; quantity: number
}
interface CartData { items: CartItem[]; total: number; count: number }
interface OrderItem { id: string; name: string; image: string | null; unitPrice: number; quantity: number }
interface Order {
  id: string; orderNumber: string; customerName: string; phone: string; city: string
  address: string; notes: string | null; total: number; status: string
  createdAt: string; items: OrderItem[]
}
type Tab = 'home' | 'packages' | 'cart' | 'orders' | 'admin'
type AdminTab = 'overview' | 'orders' | 'products' | 'packages' | 'categories' | 'settings'

interface Settings {
  storeName: string
  storeTagline: string
  storePhone: string
  shippingFee: number
  freeShippingThreshold: number
}

interface AdminStats {
  totalRevenue: number
  ordersCount: number
  todayOrders: number
  pendingOrders: number
  productsCount: number
  packagesCount: number
  lowStock: Product[]
  recentOrders: Order[]
}

// ============ ثوابت ومساعدات ============
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cable, Lightbulb, Zap, Layers, Flame, Plug, Cog, ShieldCheck,
  Wrench, CircuitBoard, PlugZap, BatteryCharging,
}

// خيارات أيقونات التصنيفات (لوحة الإدارة)
const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'Zap', label: 'برق' }, { value: 'Cable', label: 'أسلاك' }, { value: 'Lightbulb', label: 'لمبة' },
  { value: 'Layers', label: 'خراطيم' }, { value: 'Flame', label: 'لحام' }, { value: 'Plug', label: 'مقبس' },
  { value: 'Cog', label: 'دواية' }, { value: 'ShieldCheck', label: 'حماية' }, { value: 'Wrench', label: 'عدة' },
  { value: 'CircuitBoard', label: 'لوحة كهرباء' }, { value: 'PlugZap', label: 'كهرباء' }, { value: 'BatteryCharging', label: 'بطارية' },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: 'قيد المراجعة', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  confirmed: { label: 'تم التأكيد', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  shipped: { label: 'قيد التوصيل', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  delivered: { label: 'تم التوصيل', className: 'bg-green-600 text-white border-green-700' },
}

const CITIES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'الزقازيق', 'بورسعيد', 'السويس', 'أسيوط', 'سوهاج', 'الأقصر', 'أسوان', 'أخرى']

// القيم الافتراضية — تُجلب فعلياً من /api/settings ويمكن تغييرها من لوحة الإدارة ← الإعدادات
const DEFAULT_SETTINGS: Settings = {
  storeName: 'ELMASRY ELECTRIC',
  storeTagline: 'للأدوات الكهربائية والإنارة',
  storePhone: '01000000000',
  shippingFee: 50,
  freeShippingThreshold: 1500,
}
const PLACEHOLDER_IMG = '/placeholder-electrical.png'

// صور جاهزة لاختيارها عند إضافة/تعديل منتج
const PRESET_IMAGES: string[] = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b6c9854f6f7b.jpeg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/32b479a2f787.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e2a64c4f93b9.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/98e6c846b033.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/57400a6f723f.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/93e7ade585db.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/326593f5a294.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/59bf6b73923d.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ab0cdb08ffac.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e003442bfbf1.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/598a1a194cb6.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c981f7292d29.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f4e530755be9.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/67a10ebbf729.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a6ded3cfb63d.png',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ac510486b540.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de1613827a9b.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de5c10a9d9a5.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7ddfbc3b7d2a.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f07778bd402c.png',
]

function formatPrice(n: number): string {
  return `${n.toLocaleString('en-US')} ج.م`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ar', { day: 'numeric', month: 'long' }) +
    ' • ' + d.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
}

function getSessionId(): string {
  let sid = localStorage.getItem('electro_session_id')
  if (!sid) {
    sid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('electro_session_id', sid)
  }
  return sid
}

// ترويسات طلبات لوحة الإدارة (رمز الإدارة يُحفظ في sessionStorage بعد فتح اللوحة)
function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-pin': typeof window !== 'undefined' ? sessionStorage.getItem('elmasry_admin_pin') ?? '' : '',
  }
}

// صورة منتج مع بديل عند الفشل أو الفراغ
function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-amber-50 ${className ?? ''}`}>
        <Zap className="h-8 w-8 text-amber-400" />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} loading="lazy" />
}

// ============ مكونات صغيرة ============

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`التقييم ${rating} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`}
        />
      ))}
    </div>
  )
}

function ProductCard({ product, onOpen, onAdd }: {
  product: Product
  onOpen: (p: Product) => void
  onAdd: (p: Product) => void
}) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const outOfStock = product.stock <= 0
  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition-all hover:shadow-md active:scale-[0.98] ${outOfStock ? 'opacity-70' : ''}`}
      onClick={() => onOpen(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(product)}
      aria-label={product.name}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {(product.badge || discount > 0) && !outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            {product.badge || `خصم ${discount}%`}
          </span>
        )}
        {outOfStock ? (
          <span className="absolute left-2 top-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-white shadow">نفذت الكمية</span>
        ) : product.stock <= 5 ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            باقي {product.stock} فقط
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-zinc-900">{product.name}</h3>
        <div className="flex items-center gap-1">
          <Stars rating={product.rating} />
          <span className="text-[10px] text-zinc-400">({product.reviews})</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-[11px] text-zinc-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          {!outOfStock && (
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full bg-amber-500 text-white shadow-md hover:bg-amber-600"
              onClick={(e) => { e.stopPropagation(); onAdd(product) }}
              aria-label={`أضف ${product.name} إلى السلة`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="aspect-square bg-zinc-200" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-zinc-200" />
        <div className="h-3 w-1/2 rounded bg-zinc-200" />
        <div className="h-4 w-1/3 rounded bg-zinc-200" />
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, subtitle, action }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <Icon className="h-10 w-10 text-amber-500" />
      </div>
      <h3 className="mb-1 text-lg font-extrabold text-zinc-900">{title}</h3>
      <p className="mb-5 max-w-60 text-sm text-zinc-500">{subtitle}</p>
      {action}
    </div>
  )
}

// بطاقة إحصائية في لوحة الإدارة
function StatCard({ icon: Icon, label, value, sub, tone = 'amber' }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  tone?: 'amber' | 'emerald' | 'orange' | 'red'
}) {
  const tones: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-zinc-100">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[10px] font-bold text-zinc-500">{label}</span>
      </div>
      <p className="mt-2 text-lg font-extrabold text-zinc-900">{value}</p>
      {sub && <p className="text-[10px] text-zinc-400">{sub}</p>}
    </div>
  )
}

// منتقي صور جاهزة (نماذج الإضافة والتعديل)
function PresetImagePicker({ value, onPick }: { value: string; onPick: (img: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold text-zinc-500">أو اختر صورة جاهزة:</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PRESET_IMAGES.map((img) => (
          <button
            key={img}
            onClick={() => onPick(img)}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
              value === img ? 'ring-amber-500' : 'ring-transparent hover:ring-amber-300'
            }`}
            aria-label="اختيار صورة"
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// شريحة تبويب داخلية في لوحة الإدارة
function AdminChip({ active, icon: Icon, label, onClick }: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${
        active ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-amber-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

// ============ الصفحة الرئيسية ============

export default function Home() {
  const { toast } = useToast()

  // بيانات
  const [sessionId, setSessionId] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [packages, setPackages] = useState<Pkg[]>([])
  const [cart, setCart] = useState<CartData>({ items: [], total: 0, count: 0 })
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  // واجهة
  const [tab, setTab] = useState<Tab>('home')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dialogQty, setDialogQty] = useState(1)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null)
  const [installHint, setInstallHint] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<{ prompt: () => void } | null>(null)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // لوحة الإدارة — المصادقة والإحصائيات
  const [adminTab, setAdminTab] = useState<AdminTab>('overview')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [pinBusy, setPinBusy] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusBusy, setStatusBusy] = useState<string | null>(null)
  // لوحة الإدارة — المنتجات
  const [productFormOpen, setProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'product' | 'package' | 'category'; id: string; name: string } | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [pForm, setPForm] = useState({ name: '', price: '', oldPrice: '', categoryId: '', stock: '', brand: '', description: '', image: '', badge: '', isFeatured: false })
  // لوحة الإدارة — الباقات
  const [pkgFormOpen, setPkgFormOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<Pkg | null>(null)
  const [pkgForm, setPkgForm] = useState({ name: '', description: '', price: '', oldPrice: '', image: '', featuresText: '', badge: '', isPopular: false, sortOrder: '0' })
  const [savingPkg, setSavingPkg] = useState(false)
  // لوحة الإدارة — التصنيفات
  const [catFormOpen, setCatFormOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState({ name: '', icon: 'Zap', sortOrder: '0' })
  const [savingCat, setSavingCat] = useState(false)
  // لوحة الإدارة — الإعدادات
  const [settingsForm, setSettingsForm] = useState({ storeName: '', storeTagline: '', storePhone: '', shippingFee: '', freeShippingThreshold: '', newPin: '' })
  const [savingSettings, setSavingSettings] = useState(false)
  const [cloudSetupBusy, setCloudSetupBusy] = useState(false)

  // نموذج الطلب
  const [form, setForm] = useState({ customerName: '', phone: '', city: 'القاهرة', address: '', notes: '' })

  // ---- تحميل البيانات ----
  const loadAll = useCallback(async (sid: string) => {
    try {
      const [catRes, prodRes, pkgRes, cartRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/categories'), fetch('/api/products'), fetch('/api/packages'),
        fetch(`/api/cart?sessionId=${sid}`), fetch(`/api/orders?sessionId=${sid}`),
        fetch('/api/settings'),
      ])
      if (catRes.ok) setCategories((await catRes.json()).categories ?? [])
      if (prodRes.ok) setProducts((await prodRes.json()).products ?? [])
      if (pkgRes.ok) setPackages((await pkgRes.json()).packages ?? [])
      if (cartRes.ok) setCart(await cartRes.json())
      if (ordersRes.ok) setOrders((await ordersRes.json()).orders ?? [])
      if (settingsRes.ok) {
        const s = (await settingsRes.json()).settings
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...s })
      }
    } catch {
      toast({ title: 'تعذر تحميل البيانات', description: 'تحقق من اتصالك بالإنترنت', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const sid = getSessionId()
    setSessionId(sid)
    loadAll(sid)
    if (sessionStorage.getItem('elmasry_admin_pin')) setAdminUnlocked(true)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as unknown as { prompt: () => void })
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    const hintShown = localStorage.getItem('electro_install_hint')
    if (!hintShown) {
      const t = setTimeout(() => setInstallHint(true), 2500)
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', onBeforeInstall) }
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [loadAll])

  const dismissInstallHint = () => {
    setInstallHint(false)
    localStorage.setItem('electro_install_hint', '1')
  }

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      setInstallPrompt(null)
    } else {
      setInstallHint(true)
    }
  }

  // تحديث المنتجات والتصنيفات بعد عمليات الإدارة
  const refreshCatalog = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')])
      if (prodRes.ok) setProducts((await prodRes.json()).products ?? [])
      if (catRes.ok) setCategories((await catRes.json()).categories ?? [])
    } catch {
      /* تجاهل */
    }
  }, [])

  // تحديث الباقات بعد عمليات الإدارة
  const refreshPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages')
      if (res.ok) setPackages((await res.json()).packages ?? [])
    } catch {
      /* تجاهل */
    }
  }, [])

  // ---- مصادقة وبيانات لوحة الإدارة ----
  const loadAdmin = useCallback(async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: adminHeaders() }),
        fetch('/api/admin/orders', { headers: adminHeaders() }),
      ])
      if (statsRes.ok) setStats((await statsRes.json()).stats ?? null)
      if (ordersRes.ok) setAllOrders((await ordersRes.json()).orders ?? [])
    } catch {
      /* تجاهل */
    }
  }, [])

  const unlockAdmin = async () => {
    const pin = pinInput.trim()
    if (!/^\d{4,8}$/.test(pin)) {
      toast({ title: 'رمز غير صحيح', description: 'أدخل من 4 إلى 8 أرقام', variant: 'destructive' })
      return
    }
    setPinBusy(true)
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'x-admin-pin': pin } })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'رمز الإدارة غير صحيح')
      }
      sessionStorage.setItem('elmasry_admin_pin', pin)
      setAdminUnlocked(true)
      setPinInput('')
      toast({ title: 'مرحباً بك في لوحة الإدارة 👋' })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setPinBusy(false)
    }
  }

  const lockAdmin = () => {
    sessionStorage.removeItem('elmasry_admin_pin')
    setAdminUnlocked(false)
    setAdminTab('overview')
    setPinInput('')
    setStats(null)
    setAllOrders([])
  }

  useEffect(() => {
    if (tab === 'admin' && adminUnlocked) loadAdmin()
  }, [tab, adminUnlocked, loadAdmin])

  // مزامنة نموذج الإعدادات عند فتح تبويب الإعدادات
  useEffect(() => {
    if (adminTab === 'settings') {
      setSettingsForm({
        storeName: settings.storeName,
        storeTagline: settings.storeTagline,
        storePhone: settings.storePhone,
        shippingFee: String(settings.shippingFee),
        freeShippingThreshold: String(settings.freeShippingThreshold),
        newPin: '',
      })
    }
  }, [adminTab, settings])

  const changeOrderStatus = async (orderId: string, status: string) => {
    setStatusBusy(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل التحديث')
      setAllOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      toast({ title: 'تم تحديث حالة الطلب ✅', description: data.order?.orderNumber })
      loadAdmin()
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setStatusBusy(null)
    }
  }

  // ---- عمليات السلة ----
  const refreshCartFromData = (data: { items: CartItem[]; total: number; count: number }) => {
    setCart({ items: data.items ?? [], total: data.total ?? 0, count: data.count ?? 0 })
  }

  const addToCart = async (opts: { productId?: string; packageId?: string; name?: string; quantity?: number }) => {
    if (!sessionId) return
    const key = opts.productId ?? opts.packageId ?? ''
    setAddingId(key)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...opts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الإضافة')
      refreshCartFromData(data)
      toast({ title: 'أُضيف إلى السلة 🛒', description: data.item?.name ?? opts.name })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setAddingId(null)
    }
  }

  const updateQty = async (itemId: string, quantity: number) => {
    if (!sessionId) return
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, itemId, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      refreshCartFromData(data)
    } catch {
      toast({ title: 'تعذر تحديث الكمية', variant: 'destructive' })
    }
  }

  const removeItem = async (itemId: string) => {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/cart?sessionId=${sessionId}&itemId=${itemId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      refreshCartFromData(data)
      toast({ title: 'أُزيل العنصر من السلة' })
    } catch {
      toast({ title: 'تعذر الحذف', variant: 'destructive' })
    }
  }

  // ---- إتمام الطلب ----
  const submitOrder = async () => {
    if (!sessionId) return
    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: 'بيانات ناقصة', description: 'الرجاء تعبئة الاسم والجوال والعنوان', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل إنشاء الطلب')
      setCheckoutOpen(false)
      setOrderSuccess(data.order)
      setCart({ items: [], total: 0, count: 0 })
      setOrders((prev) => [data.order, ...prev])
      setForm({ customerName: '', phone: '', city: 'القاهرة', address: '', notes: '' })
    } catch (err) {
      toast({ title: 'خطأ في الطلب', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // ---- إدارة المنتجات ----
  const openAddProduct = () => {
    setEditingProduct(null)
    setPForm({ name: '', price: '', oldPrice: '', categoryId: categories[0]?.id ?? '', stock: '10', brand: '', description: '', image: '', badge: '', isFeatured: false })
    setProductFormOpen(true)
  }

  const openEditProduct = (p: Product) => {
    setEditingProduct(p)
    setPForm({
      name: p.name, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      categoryId: p.categoryId, stock: String(p.stock), brand: p.brand ?? '',
      description: p.description, image: p.image === PLACEHOLDER_IMG ? '' : p.image,
      badge: p.badge ?? '', isFeatured: p.isFeatured,
    })
    setProductFormOpen(true)
  }

  const saveProduct = async () => {
    if (!pForm.name.trim()) { toast({ title: 'اسم المنتج مطلوب', variant: 'destructive' }); return }
    if (!pForm.price || Number(pForm.price) <= 0) { toast({ title: 'السعر غير صحيح', variant: 'destructive' }); return }
    if (!pForm.categoryId) { toast({ title: 'اختر التصنيف', variant: 'destructive' }); return }
    setSavingProduct(true)
    try {
      const payload = {
        name: pForm.name,
        price: Number(pForm.price),
        oldPrice: pForm.oldPrice ? Number(pForm.oldPrice) : null,
        categoryId: pForm.categoryId,
        stock: pForm.stock ? Number(pForm.stock) : 0,
        brand: pForm.brand,
        description: pForm.description,
        image: pForm.image.trim() || PLACEHOLDER_IMG,
        badge: pForm.badge,
        isFeatured: pForm.isFeatured,
      }
      const res = await fetch(editingProduct ? `/api/products/${editingProduct.id}` : '/api/products', {
        method: editingProduct ? 'PATCH' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      await refreshCatalog()
      setProductFormOpen(false)
      toast({
        title: editingProduct ? 'تم تعديل المنتج ✏️' : 'تمت إضافة المنتج ✅',
        description: data.product?.name,
      })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setSavingProduct(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeletingBusy(true)
    try {
      const url =
        deleteTarget.kind === 'product'
          ? `/api/products/${deleteTarget.id}`
          : deleteTarget.kind === 'package'
            ? `/api/packages/${deleteTarget.id}`
            : `/api/categories/${deleteTarget.id}`
      const res = await fetch(url, { method: 'DELETE', headers: adminHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحذف')
      if (deleteTarget.kind === 'package') await refreshPackages()
      else await refreshCatalog()
      // إعادة تحميل السلة (قد تكون فيها عناصر حُذفت)
      if (sessionId) {
        const cartRes = await fetch(`/api/cart?sessionId=${sessionId}`)
        if (cartRes.ok) refreshCartFromData(await cartRes.json())
      }
      toast({
        title: deleteTarget.kind === 'category' ? 'تم حذف التصنيف 🗑️' : deleteTarget.kind === 'package' ? 'تم حذف الباقة 🗑️' : 'تم حذف المنتج 🗑️',
        description: deleteTarget.name,
      })
      setDeleteTarget(null)
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setDeletingBusy(false)
    }
  }

  // ---- إدارة الباقات ----
  const openAddPkg = () => {
    setEditingPkg(null)
    setPkgForm({ name: '', description: '', price: '', oldPrice: '', image: '', featuresText: '', badge: '', isPopular: false, sortOrder: String(packages.length + 1) })
    setPkgFormOpen(true)
  }

  const openEditPkg = (pkg: Pkg) => {
    setEditingPkg(pkg)
    setPkgForm({
      name: pkg.name, description: pkg.description, price: String(pkg.price),
      oldPrice: pkg.oldPrice ? String(pkg.oldPrice) : '', image: pkg.image,
      featuresText: pkg.features.join('\n'), badge: pkg.badge ?? '', isPopular: pkg.isPopular,
      sortOrder: String(pkg.sortOrder),
    })
    setPkgFormOpen(true)
  }

  const savePkg = async () => {
    if (!pkgForm.name.trim()) { toast({ title: 'اسم الباقة مطلوب', variant: 'destructive' }); return }
    if (!pkgForm.price || Number(pkgForm.price) <= 0) { toast({ title: 'السعر غير صحيح', variant: 'destructive' }); return }
    const features = pkgForm.featuresText.split('\n').map((s) => s.trim()).filter(Boolean)
    if (features.length === 0) {
      toast({ title: 'أضف محتويات الباقة', description: 'سطر لكل ميزة', variant: 'destructive' })
      return
    }
    setSavingPkg(true)
    try {
      const payload = {
        name: pkgForm.name,
        description: pkgForm.description,
        price: Number(pkgForm.price),
        oldPrice: pkgForm.oldPrice ? Number(pkgForm.oldPrice) : null,
        image: pkgForm.image.trim() || PLACEHOLDER_IMG,
        features,
        badge: pkgForm.badge,
        isPopular: pkgForm.isPopular,
        sortOrder: pkgForm.sortOrder ? Number(pkgForm.sortOrder) : 0,
      }
      const res = await fetch(editingPkg ? `/api/packages/${editingPkg.id}` : '/api/packages', {
        method: editingPkg ? 'PATCH' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      await refreshPackages()
      setPkgFormOpen(false)
      toast({
        title: editingPkg ? 'تم تعديل الباقة ✏️' : 'تمت إضافة الباقة ✅',
        description: data.package?.name,
      })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setSavingPkg(false)
    }
  }

  // ---- إدارة التصنيفات ----
  const openAddCat = () => {
    setEditingCat(null)
    setCatForm({ name: '', icon: 'Zap', sortOrder: String(categories.length + 1) })
    setCatFormOpen(true)
  }

  const openEditCat = (cat: Category) => {
    setEditingCat(cat)
    setCatForm({ name: cat.name, icon: cat.icon, sortOrder: String(cat.sortOrder) })
    setCatFormOpen(true)
  }

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast({ title: 'اسم التصنيف مطلوب', variant: 'destructive' }); return }
    setSavingCat(true)
    try {
      const payload = { name: catForm.name, icon: catForm.icon, sortOrder: catForm.sortOrder ? Number(catForm.sortOrder) : 0 }
      const res = await fetch(editingCat ? `/api/categories/${editingCat.id}` : '/api/categories', {
        method: editingCat ? 'PATCH' : 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      await refreshCatalog()
      setCatFormOpen(false)
      toast({
        title: editingCat ? 'تم تعديل التصنيف ✏️' : 'تمت إضافة التصنيف ✅',
        description: data.category?.name,
      })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setSavingCat(false)
    }
  }

  // ---- إعدادات المحل ----
  const saveSettings = async () => {
    const fee = Number(settingsForm.shippingFee)
    const threshold = Number(settingsForm.freeShippingThreshold)
    if (!settingsForm.storeName.trim()) { toast({ title: 'اسم المحل مطلوب', variant: 'destructive' }); return }
    if (!Number.isFinite(fee) || fee < 0) { toast({ title: 'رسوم التوصيل غير صحيحة', variant: 'destructive' }); return }
    if (!Number.isFinite(threshold) || threshold < 0) { toast({ title: 'حد الشحن المجاني غير صحيح', variant: 'destructive' }); return }
    if (settingsForm.newPin && !/^\d{4,8}$/.test(settingsForm.newPin)) {
      toast({ title: 'الرمز الجديد يجب أن يكون من 4 إلى 8 أرقام', variant: 'destructive' })
      return
    }
    setSavingSettings(true)
    try {
      const payload: Record<string, unknown> = {
        storeName: settingsForm.storeName,
        storeTagline: settingsForm.storeTagline,
        storePhone: settingsForm.storePhone,
        shippingFee: fee,
        freeShippingThreshold: threshold,
      }
      if (settingsForm.newPin) payload.newPin = settingsForm.newPin
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ')
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      if (settingsForm.newPin) sessionStorage.setItem('elmasry_admin_pin', settingsForm.newPin)
      toast({ title: 'تم حفظ الإعدادات ✅', description: 'ستظهر التغييرات في المتجر فوراً' })
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setSavingSettings(false)
    }
  }

  // إعداد قاعدة البيانات السحابية (بعد النشر على Vercel) — إنشاء الجداول وتعبئة البيانات الافتراضية
  const runCloudSetup = async () => {
    setCloudSetupBusy(true)
    try {
      const res = await fetch('/api/setup', { method: 'POST', headers: adminHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الإعداد')
      if (data.seeded) {
        toast({ title: 'تم تجهيز قاعدة البيانات 🎉', description: data.message })
        await refreshCatalog()
        await refreshPackages()
      } else {
        toast({ title: 'القاعدة جاهزة مسبقاً ✅', description: data.message })
      }
    } catch (err) {
      toast({ title: 'خطأ في الإعداد', description: err instanceof Error ? err.message : 'حدث خطأ', variant: 'destructive' })
    } finally {
      setCloudSetupBusy(false)
    }
  }

  // ---- فلترة المنتجات ----
  const filteredProducts = useMemo(() => {
    let list = products
    if (activeCategory !== 'all') list = list.filter((p) => p.categoryId === activeCategory)
    const q = searchQuery.trim()
    if (q) {
      list = list.filter((p) =>
        p.name.includes(q) || p.description.includes(q) || (p.brand ?? '').includes(q)
      )
    }
    return list
  }, [products, activeCategory, searchQuery])

  const featured = useMemo(() => products.filter((p) => p.isFeatured).slice(0, 6), [products])
  const discounted = useMemo(() => products.filter((p) => p.oldPrice).slice(0, 8), [products])
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—'

  const shipping = cart.total >= settings.freeShippingThreshold || cart.total === 0 ? 0 : settings.shippingFee
  const grandTotal = cart.total + shipping

  const openProduct = (p: Product) => {
    setSelectedProduct(p)
    setDialogQty(1)
  }

  const goCategory = (id: string) => {
    setActiveCategory(id)
    setSearchQuery('')
    setTab('home')
    setTimeout(() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  // ============ الواجهة ============
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-zinc-100 shadow-2xl">
      {/* ===== الهيدر ===== */}
      <header className="sticky top-0 z-30 bg-zinc-900 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-amber-500 shadow-md">
              <Zap className="h-6 w-6 fill-white text-white" />
            </div>
            <div>
              <h1 className="whitespace-nowrap text-base font-extrabold leading-5 tracking-wide" dir="ltr">{settings.storeName}</h1>
              <p className="text-[10px] text-zinc-400">{settings.storeTagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {installPrompt && (
              <Button
                size="sm"
                className="h-9 gap-1 rounded-full bg-amber-500 text-xs font-bold text-white hover:bg-amber-600"
                onClick={handleInstall}
              >
                <Download className="h-3.5 w-3.5" />
                تثبيت
              </Button>
            )}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 transition hover:bg-zinc-700"
              onClick={() => setInstallGuideOpen(true)}
              aria-label="كيفية تثبيت التطبيق على الهاتف"
              title="كيفية تثبيت التطبيق"
            >
              <Smartphone className="h-5 w-5" />
            </button>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 transition hover:bg-zinc-700"
              onClick={() => setTab('cart')}
              aria-label="السلة"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.count > 0 && (
                <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* شريط تثبيت التطبيق */}
      <AnimatePresence>
        {installHint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-amber-400"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-zinc-900">
              <span className="text-lg">📱</span>
              <p className="flex-1 text-[11px] font-semibold leading-4">
                ثبّت «ELMASRY ELECTRIC» كتطبيق على هاتفك — بأيقونة على الشاشة الرئيسية
              </p>
              <button
                onClick={() => setInstallGuideOpen(true)}
                className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-[10px] font-extrabold text-amber-400 transition hover:bg-zinc-800"
              >
                الخطوات
              </button>
              <button onClick={dismissInstallHint} aria-label="إغلاق" className="rounded-full p-1 hover:bg-amber-500/40">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== المحتوى ===== */}
      <main className="flex-1 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* ================= الرئيسية ================= */}
            {tab === 'home' && (
              <div className="space-y-6 px-4 pt-4">
                {/* بانر العروض */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-zinc-900 via-zinc-800 to-amber-900 p-5 text-white shadow-lg">
                  <div className="relative z-10 max-w-[68%] space-y-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold">
                      <BadgePercent className="h-3 w-3" /> عروض المحل
                    </span>
                    <h2 className="text-xl font-extrabold leading-7">كل مستلزمات الكهرباء في محل واحد</h2>
                    <p className="text-xs text-zinc-300">أسلاك • قواطع • لمبات • خراطيم • دوايات • لحام</p>
                    <Button
                      size="sm"
                      className="mt-1 rounded-full bg-amber-500 font-bold text-zinc-900 hover:bg-amber-400"
                      onClick={() => goCategory(categories[2]?.id ?? 'all')}
                    >
                      تسوق العروض <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <img
                    src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b6c9854f6f7b.jpeg"
                    alt="أسلاك كهربائية"
                    className="absolute -left-6 bottom-0 h-[130%] w-2/5 rotate-6 rounded-2xl object-cover opacity-60 shadow-2xl"
                  />
                </div>

                {/* التصنيفات */}
                <section>
                  <h2 className="mb-3 text-base font-extrabold text-zinc-900">التصنيفات</h2>
                  <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-24 w-20 shrink-0 animate-pulse rounded-2xl bg-white" />
                        ))
                      : categories.map((cat) => {
                          const Icon = CATEGORY_ICONS[cat.icon] ?? Zap
                          const isActive = activeCategory === cat.id
                          return (
                            <button
                              key={cat.id}
                              onClick={() => goCategory(cat.id)}
                              className={`flex w-20 shrink-0 flex-col items-center gap-2 rounded-2xl px-2 py-3 shadow-sm ring-1 transition-all active:scale-95 ${
                                isActive ? 'bg-amber-500 ring-amber-500' : 'bg-white ring-zinc-100 hover:ring-amber-300'
                              }`}
                              aria-label={cat.name}
                            >
                              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isActive ? 'bg-white/20' : 'bg-amber-50'}`}>
                                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                              </span>
                              <span className={`text-center text-[10px] font-bold leading-3 ${isActive ? 'text-white' : 'text-zinc-700'}`}>
                                {cat.name}
                              </span>
                            </button>
                          )
                        })}
                  </div>
                </section>

                {/* الأكثر مبيعاً */}
                {!loading && featured.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-zinc-900">⭐ الأكثر مبيعاً</h2>
                    </div>
                    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                      {featured.map((p) => (
                        <div key={p.id} className="w-40 shrink-0">
                          <ProductCard product={p} onOpen={openProduct} onAdd={(pp) => addToCart({ productId: pp.id, name: pp.name })} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* الباقات الترويجية */}
                {!loading && packages.length > 0 && (
                  <section
                    className="cursor-pointer rounded-3xl bg-gradient-to-l from-amber-500 to-amber-400 p-4 shadow-lg transition active:scale-[0.99]"
                    onClick={() => setTab('packages')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setTab('packages')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25">
                        <Package className="h-6 w-6 text-white" />
                      </span>
                      <div className="flex-1">
                        <h3 className="text-sm font-extrabold text-white">باقات موفرة 🎁</h3>
                        <p className="text-[11px] text-amber-50">باقات تمديد وإنارة جاهزة توفر لك مئات الجنيهات</p>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </div>
                  </section>
                )}

                {/* بحث + شبكة المنتجات */}
                <section id="products-grid" className="scroll-mt-24 space-y-3">
                  <h2 className="text-base font-extrabold text-zinc-900">منتجات المحل</h2>
                  <div className="relative">
                    <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن منتج... (سلك، قاطع، لمبة)"
                      className="h-11 rounded-2xl border-zinc-200 bg-white pr-10 text-sm shadow-sm focus-visible:ring-amber-400"
                      aria-label="بحث"
                    />
                  </div>
                  {/* شرائح الفلترة */}
                  <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                        activeCategory === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                      }`}
                    >
                      الكل
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                          activeCategory === cat.id ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="لا توجد نتائج"
                      subtitle="لم نجد منتجات مطابقة، جرّب كلمة بحث أخرى أو تصنيفاً مختلفاً"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onOpen={openProduct}
                          onAdd={(pp) => addToCart({ productId: pp.id, name: pp.name })}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* عروض وخصومات */}
                {!loading && discounted.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-base font-extrabold text-zinc-900">🔥 عروض وخصومات</h2>
                    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                      {discounted.map((p) => (
                        <div key={p.id} className="w-40 shrink-0">
                          <ProductCard product={p} onOpen={openProduct} onAdd={(pp) => addToCart({ productId: pp.id, name: pp.name })} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* مزايا المحل */}
                <section className="grid grid-cols-3 gap-2 pb-2">
                  {[
                    { icon: Truck, label: 'توصيل سريع' },
                    { icon: ShieldCheck, label: 'ضمان وأصلي' },
                    { icon: Wallet, label: 'دفع عند الاستلام' },
                  ].map((f) => (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3.5 shadow-sm">
                      <f.icon className="h-5 w-5 text-amber-600" />
                      <span className="text-[10px] font-bold text-zinc-700">{f.label}</span>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {/* ================= الباقات ================= */}
            {tab === 'packages' && (
              <div className="space-y-4 px-4 pt-4">
                <div className="rounded-3xl bg-gradient-to-l from-zinc-900 to-zinc-800 p-5 text-white shadow-lg">
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-zinc-900">
                    🎁 وفّر أكثر
                  </span>
                  <h2 className="text-xl font-extrabold">الباقات والعروض</h2>
                  <p className="mt-1 text-xs text-zinc-300">مجموعات جاهزة لتمديد شقتك أو إنارة منزلك بأسعار أقل من شراء القطع منفردة</p>
                </div>

                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-72 animate-pulse rounded-3xl bg-white" />
                  ))
                ) : packages.length === 0 ? (
                  <EmptyState icon={Package} title="لا توجد باقات حالياً" subtitle="تابعنا قريباً لعروض جديدة" />
                ) : (
                  packages.map((pkg) => {
                    const save = pkg.oldPrice ? Math.round(pkg.oldPrice - pkg.price) : 0
                    return (
                      <div
                        key={pkg.id}
                        className={`overflow-hidden rounded-3xl bg-white shadow-md ${pkg.isPopular ? 'ring-2 ring-amber-400' : 'ring-1 ring-zinc-100'}`}
                      >
                        <div className="relative h-44 overflow-hidden">
                          <ProductImage src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {pkg.badge && (
                            <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold text-white shadow">
                              {pkg.badge}
                            </span>
                          )}
                          <div className="absolute bottom-3 right-4 left-4">
                            <h3 className="text-lg font-extrabold text-white drop-shadow">{pkg.name}</h3>
                            <p className="text-[11px] text-zinc-200 drop-shadow">{pkg.description}</p>
                          </div>
                        </div>
                        <div className="space-y-3 p-4">
                          <ul className="space-y-1.5">
                            {pkg.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-zinc-700">
                                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                  <Check className="h-3 w-3 text-amber-600" />
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-3">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-amber-600">{formatPrice(pkg.price)}</span>
                                {pkg.oldPrice && <span className="text-xs text-zinc-400 line-through">{formatPrice(pkg.oldPrice)}</span>}
                              </div>
                              {save > 0 && <span className="text-[11px] font-bold text-emerald-600">وفر {formatPrice(save)} 💰</span>}
                            </div>
                            <Button
                              className="h-10 gap-1.5 rounded-2xl bg-amber-500 px-5 font-bold text-white shadow-md hover:bg-amber-600"
                              disabled={addingId === pkg.id}
                              onClick={() => addToCart({ packageId: pkg.id, name: pkg.name })}
                            >
                              {addingId === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                              أضف للسلة
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ================= السلة ================= */}
            {tab === 'cart' && (
              <div className="space-y-4 px-4 pt-4">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-zinc-900">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                  سلة المشتريات
                  {cart.count > 0 && <Badge className="rounded-full bg-amber-500 text-white">{cart.count} عنصر</Badge>}
                </h2>

                {cart.items.length === 0 ? (
                  <EmptyState
                    icon={ShoppingBag}
                    title="سلتك فارغة"
                    subtitle="اكتشف منتجات المحل وباقاتنا الموفرة وابدأ التسوق الآن"
                    action={
                      <Button className="rounded-full bg-amber-500 font-bold text-white hover:bg-amber-600" onClick={() => setTab('home')}>
                        ابدأ التسوق
                      </Button>
                    }
                  />
                ) : (
                  <>
                    {/* عناصر السلة */}
                    <div className="electro-scroll max-h-96 space-y-3 overflow-y-auto pl-1">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-50">
                            <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="line-clamp-2 text-xs font-bold leading-4 text-zinc-900">
                                {item.packageId && <span className="ml-1 text-amber-600">🎁</span>}
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="shrink-0 rounded-full p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                                aria-label={`حذف ${item.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 rounded-full bg-zinc-100 p-1">
                                <button
                                  onClick={() => updateQty(item.id, item.quantity + 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-amber-50"
                                  aria-label="زيادة الكمية"
                                >
                                  <Plus className="h-3.5 w-3.5 text-zinc-700" />
                                </button>
                                <span className="min-w-6 text-center text-xs font-extrabold text-zinc-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQty(item.id, item.quantity - 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-amber-50"
                                  aria-label="تقليل الكمية"
                                >
                                  <Minus className="h-3.5 w-3.5 text-zinc-700" />
                                </button>
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-extrabold text-amber-600">{formatPrice(item.unitPrice * item.quantity)}</div>
                                {item.quantity > 1 && (
                                  <div className="text-[10px] text-zinc-400">{formatPrice(item.unitPrice)} × {item.quantity}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* الملخص */}
                    <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                      <div className="flex justify-between text-xs text-zinc-600">
                        <span>المجموع الفرعي</span>
                        <span className="font-bold text-zinc-900">{formatPrice(cart.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-600">
                        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> التوصيل</span>
                        {shipping === 0 ? (
                          <span className="font-bold text-emerald-600">مجاني 🎉</span>
                        ) : (
                          <span className="font-bold text-zinc-900">{formatPrice(shipping)}</span>
                        )}
                      </div>
                      {shipping > 0 && (
                        <p className="rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800">
                          أضف بقيمة {formatPrice(settings.freeShippingThreshold - cart.total)} للحصول على توصيل مجاني!
                        </p>
                      )}
                      <div className="flex justify-between border-t border-dashed border-zinc-200 pt-2.5 text-sm">
                        <span className="font-extrabold text-zinc-900">الإجمالي</span>
                        <span className="text-lg font-extrabold text-amber-600">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    <Button
                      className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
                      onClick={() => setCheckoutOpen(true)}
                    >
                      إتمام الطلب • {formatPrice(grandTotal)}
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* ================= طلباتي ================= */}
            {tab === 'orders' && (
              <div className="space-y-4 px-4 pt-4">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-zinc-900">
                  <ClipboardList className="h-5 w-5 text-amber-600" />
                  طلباتي
                </h2>
                {orders.length === 0 ? (
                  <EmptyState
                    icon={PackageOpen}
                    title="لا توجد طلبات بعد"
                    subtitle="عند إتمام أول طلب ستظهر هنا مع حالة التوصيل"
                    action={
                      <Button className="rounded-full bg-amber-500 font-bold text-white hover:bg-amber-600" onClick={() => setTab('home')}>
                        تسوق الآن
                      </Button>
                    }
                  />
                ) : (
                  orders.map((order) => {
                    const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending
                    return (
                      <div key={order.id} className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-xs font-bold text-zinc-900" dir="ltr">{order.orderNumber}</p>
                            <p className="text-[10px] text-zinc-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.items.slice(0, 4).map((it, i) => (
                            <div key={i} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-100">
                              <ProductImage src={it.image} alt={it.name} className="h-full w-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-[10px] font-bold text-zinc-500">+{order.items.length - 4}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-zinc-200 pt-2.5">
                          <span className="text-[11px] text-zinc-500">
                            {order.items.reduce((s, it) => s + it.quantity, 0)} عنصر • {order.city}
                          </span>
                          <span className="text-sm font-extrabold text-amber-600">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ================= لوحة الإدارة — بوابة الرمز ================= */}
            {tab === 'admin' && !adminUnlocked && (
              <div className="flex flex-col items-center px-6 pt-14">
                <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-zinc-100">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                    <LockKeyhole className="h-8 w-8 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-900">لوحة الإدارة</h2>
                  <p className="mb-5 mt-1 text-xs text-zinc-500">أدخل رمز الإدارة للتحكم الكامل في المحل</p>
                  <div className="relative">
                    <Input
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && unlockAdmin()}
                      placeholder="رمز الإدارة"
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={8}
                      className="h-12 rounded-2xl bg-zinc-50 pl-10 text-center text-lg tracking-[0.5em]"
                      aria-label="رمز الإدارة"
                    />
                    <button
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
                      aria-label={showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    className="mt-4 h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
                    disabled={pinBusy}
                    onClick={unlockAdmin}
                  >
                    {pinBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
                    فتح لوحة الإدارة
                  </Button>
                  <p className="mt-3 text-[10px] text-zinc-400">الرمز الافتراضي: 1234 — يمكن تغييره من الإعدادات</p>
                </div>
              </div>
            )}

            {/* ================= لوحة الإدارة ================= */}
            {tab === 'admin' && adminUnlocked && (
              <div className="space-y-4 px-4 pt-4">
                {/* رأس اللوحة */}
                <div className="rounded-3xl bg-gradient-to-l from-zinc-900 to-zinc-800 p-5 text-white shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-zinc-900">
                        <Settings className="h-3 w-3" /> تحكم كامل
                      </span>
                      <h2 className="text-xl font-extrabold">لوحة الإدارة</h2>
                      <p className="mt-1 text-xs text-zinc-300">المنتجات • الباقات • التصنيفات • الطلبات • الإعدادات</p>
                    </div>
                    <button
                      onClick={lockAdmin}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition hover:bg-red-500 hover:text-white"
                      aria-label="خروج من لوحة الإدارة"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      خروج
                    </button>
                  </div>
                </div>

                {/* تبويبات اللوحة */}
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                  <AdminChip active={adminTab === 'overview'} icon={LayoutDashboard} label="نظرة عامة" onClick={() => setAdminTab('overview')} />
                  <AdminChip active={adminTab === 'orders'} icon={ClipboardList} label={`الطلبات${stats && stats.pendingOrders > 0 ? ` (${stats.pendingOrders})` : ''}`} onClick={() => setAdminTab('orders')} />
                  <AdminChip active={adminTab === 'products'} icon={Package} label="المنتجات" onClick={() => setAdminTab('products')} />
                  <AdminChip active={adminTab === 'packages'} icon={Gift} label="الباقات" onClick={() => setAdminTab('packages')} />
                  <AdminChip active={adminTab === 'categories'} icon={Tags} label="التصنيفات" onClick={() => setAdminTab('categories')} />
                  <AdminChip active={adminTab === 'settings'} icon={SlidersHorizontal} label="الإعدادات" onClick={() => setAdminTab('settings')} />
                </div>

                {/* ---- نظرة عامة ---- */}
                {adminTab === 'overview' && (
                  stats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2.5">
                        <StatCard icon={Wallet} label="إجمالي المبيعات" value={formatPrice(stats.totalRevenue)} tone="emerald" />
                        <StatCard icon={ClipboardList} label="إجمالي الطلبات" value={String(stats.ordersCount)} sub={`${stats.pendingOrders} قيد المراجعة`} tone="amber" />
                        <StatCard icon={Package} label="المنتجات" value={String(stats.productsCount)} sub={`${stats.packagesCount} باقة`} tone="orange" />
                        <StatCard icon={TrendingUp} label="طلبات اليوم" value={String(stats.todayOrders)} tone="amber" />
                      </div>

                      {/* تنبيه المخزون المنخفض */}
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                        <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-extrabold text-zinc-900">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          مخزون منخفض ({stats.lowStock.length})
                        </h3>
                        {stats.lowStock.length === 0 ? (
                          <p className="text-xs text-zinc-400">كل المنتجات متوفرة بكميات جيدة ✅</p>
                        ) : (
                          <div className="electro-scroll max-h-44 space-y-1.5 overflow-y-auto pl-1">
                            {stats.lowStock.map((p) => (
                              <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="line-clamp-1 flex-1 text-zinc-700">{p.name}</span>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {p.stock === 0 ? 'نفذت' : `باقي ${p.stock}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* أحدث الطلبات */}
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                        <h3 className="mb-2.5 text-sm font-extrabold text-zinc-900">أحدث الطلبات</h3>
                        {stats.recentOrders.length === 0 ? (
                          <p className="text-xs text-zinc-400">لا توجد طلبات بعد</p>
                        ) : (
                          <div className="space-y-2">
                            {stats.recentOrders.map((o) => {
                              const st = STATUS_MAP[o.status] ?? STATUS_MAP.pending
                              return (
                                <button
                                  key={o.id}
                                  onClick={() => setAdminTab('orders')}
                                  className="flex w-full items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-right transition hover:bg-amber-50"
                                >
                                  <div className="min-w-0">
                                    <p className="font-mono text-[10px] font-bold text-zinc-900" dir="ltr">{o.orderNumber}</p>
                                    <p className="line-clamp-1 text-[10px] text-zinc-500">{o.customerName} • {o.city}</p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <span className="text-xs font-extrabold text-amber-600">{formatPrice(o.total)}</span>
                                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${st.className}`}>{st.label}</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}
                    </div>
                  )
                )}

                {/* ---- إدارة الطلبات ---- */}
                {adminTab === 'orders' && (
                  allOrders.length === 0 ? (
                    <EmptyState icon={ClipboardList} title="لا توجد طلبات" subtitle="ستظهر هنا كل طلبات العملاء مع إمكانية تحديث حالتها" />
                  ) : (
                    <div className="electro-scroll max-h-[65dvh] space-y-3 overflow-y-auto pl-1">
                      {allOrders.map((order) => {
                        const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending
                        const isExpanded = expandedOrder === order.id
                        return (
                          <div key={order.id} className="space-y-2.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                            <button
                              className="w-full text-right"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              aria-expanded={isExpanded}
                              aria-label={`تفاصيل الطلب ${order.orderNumber}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-mono text-xs font-bold text-zinc-900" dir="ltr">{order.orderNumber}</p>
                                  <p className="text-[10px] text-zinc-400">{formatDate(order.createdAt)}</p>
                                </div>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${st.className}`}>{st.label}</span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <p className="line-clamp-1 text-xs font-bold text-zinc-700">{order.customerName} • {order.phone}</p>
                                <span className="shrink-0 text-sm font-extrabold text-amber-600">{formatPrice(order.total)}</span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="space-y-2 rounded-xl bg-zinc-50 p-3">
                                <p className="text-[11px] leading-5 text-zinc-600">
                                  <MapPin className="ml-1 inline h-3 w-3" />
                                  {order.city} — {order.address}
                                </p>
                                {order.notes && <p className="text-[11px] text-zinc-500">📝 {order.notes}</p>}
                                <div className="space-y-1 border-t border-dashed border-zinc-200 pt-2">
                                  {order.items.map((it) => (
                                    <div key={it.id} className="flex items-center justify-between gap-2 text-[11px] text-zinc-600">
                                      <span className="line-clamp-1">{it.name} × {it.quantity}</span>
                                      <span className="shrink-0 font-bold">{formatPrice(it.unitPrice * it.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 border-t border-dashed border-zinc-200 pt-2.5">
                              <span className="shrink-0 text-[10px] font-bold text-zinc-400">الحالة:</span>
                              <select
                                value={order.status}
                                onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                                disabled={statusBusy === order.id}
                                className="h-9 flex-1 appearance-none rounded-xl bg-zinc-50 px-3 text-xs font-bold text-zinc-800 outline-none ring-amber-400 focus:ring-2"
                                aria-label="حالة الطلب"
                              >
                                <option value="pending">قيد المراجعة</option>
                                <option value="confirmed">تم التأكيد</option>
                                <option value="shipped">قيد التوصيل</option>
                                <option value="delivered">تم التوصيل</option>
                              </select>
                              {statusBusy === order.id && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                )}

                {/* ---- إدارة المنتجات ---- */}
                {adminTab === 'products' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-zinc-900">المنتجات ({products.length})</h3>
                      <Button
                        size="sm"
                        className="h-9 gap-1 rounded-full bg-amber-500 text-xs font-bold text-white hover:bg-amber-600"
                        onClick={openAddProduct}
                        disabled={categories.length === 0}
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        إضافة منتج
                      </Button>
                    </div>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
                      ))
                    ) : (
                      <div className="electro-scroll max-h-[60dvh] space-y-2.5 overflow-y-auto pl-1">
                        {products.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50">
                              <ProductImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="line-clamp-1 text-xs font-bold text-zinc-900">
                                {p.name}
                                {p.isFeatured && <Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" aria-label="مميز" />}
                              </h4>
                              <p className="text-[10px] text-zinc-400">{categoryName(p.categoryId)} • متوفر: {p.stock}</p>
                              <p className="text-sm font-extrabold text-amber-600">{formatPrice(p.price)}</p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1.5">
                              <button
                                onClick={() => openEditProduct(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-amber-100 hover:text-amber-700"
                                aria-label={`تعديل ${p.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ kind: 'product', id: p.id, name: p.name })}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-red-100 hover:text-red-600"
                                aria-label={`حذف ${p.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ---- إدارة الباقات ---- */}
                {adminTab === 'packages' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-zinc-900">الباقات ({packages.length})</h3>
                      <Button
                        size="sm"
                        className="h-9 gap-1 rounded-full bg-amber-500 text-xs font-bold text-white hover:bg-amber-600"
                        onClick={openAddPkg}
                      >
                        <Gift className="h-3.5 w-3.5" />
                        إضافة باقة
                      </Button>
                    </div>
                    {packages.length === 0 ? (
                      <EmptyState icon={Gift} title="لا توجد باقات" subtitle="أنشئ باقة موفرة وستظهر مباشرة في تبويب الباقات" />
                    ) : (
                      <div className="electro-scroll max-h-[60dvh] space-y-2.5 overflow-y-auto pl-1">
                        {packages.map((pkg) => (
                          <div key={pkg.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50">
                              <ProductImage src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="line-clamp-1 text-xs font-bold text-zinc-900">
                                {pkg.name}
                                {pkg.isPopular && <span className="mr-1 text-[9px] font-extrabold text-amber-600">• شائعة</span>}
                              </h4>
                              <p className="text-[10px] text-zinc-400">{pkg.features.length} ميزة • ترتيب {pkg.sortOrder}</p>
                              <p className="text-sm font-extrabold text-amber-600">{formatPrice(pkg.price)}</p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1.5">
                              <button
                                onClick={() => openEditPkg(pkg)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-amber-100 hover:text-amber-700"
                                aria-label={`تعديل ${pkg.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ kind: 'package', id: pkg.id, name: pkg.name })}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-red-100 hover:text-red-600"
                                aria-label={`حذف ${pkg.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ---- إدارة التصنيفات ---- */}
                {adminTab === 'categories' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-zinc-900">التصنيفات ({categories.length})</h3>
                      <Button
                        size="sm"
                        className="h-9 gap-1 rounded-full bg-amber-500 text-xs font-bold text-white hover:bg-amber-600"
                        onClick={openAddCat}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        إضافة تصنيف
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat.icon] ?? Zap
                        return (
                          <div key={cat.id} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
                            <div className="flex items-center gap-2">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
                                <Icon className="h-4.5 w-4.5 text-amber-600" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-1 text-xs font-bold text-zinc-900">{cat.name}</h4>
                                <p className="text-[10px] text-zinc-400">{cat._count?.products ?? 0} منتج</p>
                              </div>
                            </div>
                            <div className="mt-2.5 flex gap-1.5">
                              <button
                                onClick={() => openEditCat(cat)}
                                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-zinc-100 text-[10px] font-bold text-zinc-600 transition hover:bg-amber-100 hover:text-amber-700"
                                aria-label={`تعديل ${cat.name}`}
                              >
                                <Pencil className="h-3 w-3" /> تعديل
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ kind: 'category', id: cat.id, name: cat.name })}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition hover:bg-red-100 hover:text-red-600"
                                aria-label={`حذف ${cat.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* ---- الإعدادات ---- */}
                {adminTab === 'settings' && (
                  <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
                    <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-zinc-900">
                      <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                      إعدادات المحل
                    </h3>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-zinc-500">اسم المحل (يظهر في الهيدر)</label>
                      <Input
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="h-11 rounded-2xl bg-zinc-50 text-sm"
                        aria-label="اسم المحل"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-zinc-500">الوصف تحت الاسم</label>
                      <Input
                        value={settingsForm.storeTagline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
                        className="h-11 rounded-2xl bg-zinc-50 text-sm"
                        aria-label="وصف المحل"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-zinc-500">هاتف المحل</label>
                      <Input
                        value={settingsForm.storePhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storePhone: e.target.value })}
                        dir="ltr"
                        inputMode="tel"
                        className="h-11 rounded-2xl bg-zinc-50 text-left text-sm"
                        aria-label="هاتف المحل"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-zinc-500">رسوم التوصيل (ج.م)</label>
                        <Input
                          value={settingsForm.shippingFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: e.target.value })}
                          inputMode="decimal"
                          className="h-11 rounded-2xl bg-zinc-50 text-sm"
                          aria-label="رسوم التوصيل"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold text-zinc-500">توصيل مجاني فوق (ج.م)</label>
                        <Input
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })}
                          inputMode="decimal"
                          className="h-11 rounded-2xl bg-zinc-50 text-sm"
                          aria-label="حد الشحن المجاني"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-zinc-500">رمز إدارة جديد (اختياري — 4 إلى 8 أرقام)</label>
                      <Input
                        value={settingsForm.newPin}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newPin: e.target.value.replace(/\D/g, '') })}
                        placeholder="اتركه فارغاً لعدم التغيير"
                        type="password"
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={8}
                        className="h-11 rounded-2xl bg-zinc-50 text-left text-sm"
                        aria-label="رمز إدارة جديد"
                      />
                    </div>
                    <Button
                      className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
                      disabled={savingSettings}
                      onClick={saveSettings}
                    >
                      {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                      حفظ الإعدادات
                    </Button>
                    <p className="text-[10px] leading-4 text-zinc-400">
                      ملاحظة: اسم المحل ورسوم التوصيل تظهر للعملاء مباشرة بعد الحفظ، ورمز الإدارة الجديد يُطلب في الدخول القادم.
                    </p>

                    {/* أدوات النشر السحابي — إعداد قاعدة البيانات بعد النشر على Vercel */}
                    <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-zinc-900">
                        <CloudCog className="h-4 w-4 text-amber-600" />
                        إعداد النشر السحابي (مرة واحدة بعد النشر)
                      </h4>
                      <p className="mb-3 text-[10px] leading-4 text-zinc-500">
                        بعد نشر التطبيق على Vercel مع قاعدة Turso فارغة: اضغط الزر وسيتم إنشاء الجداول وتعبئة التصنيفات والمنتجات والباقات تلقائياً — بدون أي أوامر تقنية. آمن للتكرار ولا يمسح البيانات الموجودة.
                      </p>
                      <Button
                        className="h-11 w-full rounded-2xl bg-zinc-900 text-xs font-extrabold text-amber-400 hover:bg-zinc-800"
                        disabled={cloudSetupBusy}
                        onClick={runCloudSetup}
                      >
                        {cloudSetupBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudCog className="h-4 w-4" />}
                        تجهيز قاعدة البيانات السحابية
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== التنقل السفلي ===== */}
      <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-zinc-200 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="التنقل الرئيسي"
      >
        <div className="grid grid-cols-5">
          {([
            { id: 'home', label: 'الرئيسية', icon: HomeIcon },
            { id: 'packages', label: 'الباقات', icon: Package },
            { id: 'cart', label: 'السلة', icon: ShoppingCart },
            { id: 'orders', label: 'طلباتي', icon: ClipboardList },
            { id: 'admin', label: 'الإدارة', icon: Settings },
          ] as const).map((item) => {
            const isActive = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative">
                  <item.icon className={`h-5 w-5 ${isActive ? 'fill-amber-100' : ''}`} />
                  {item.id === 'cart' && cart.count > 0 && (
                    <span className="absolute -left-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {cart.count}
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-bold">{item.label}</span>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-amber-500" />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ===== حوار تفاصيل المنتج ===== */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-3xl p-0 sm:max-w-md [&>button]:hidden">
          {selectedProduct && (
            <div>
              <DialogTitle className="sr-only">{selectedProduct.name}</DialogTitle>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50">
                <ProductImage src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:bg-white"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4 text-zinc-700" />
                </button>
                {selectedProduct.badge && (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-white shadow">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold leading-6 text-zinc-900">{selectedProduct.name}</h3>
                    {selectedProduct.brand && <p className="mt-0.5 text-xs text-zinc-400">العلامة: {selectedProduct.brand}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1">
                    <Stars rating={selectedProduct.rating} />
                    <span className="text-[10px] font-bold text-zinc-600">{selectedProduct.rating}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-amber-600">{formatPrice(selectedProduct.price)}</span>
                  {selectedProduct.oldPrice && (
                    <span className="text-sm text-zinc-400 line-through">{formatPrice(selectedProduct.oldPrice)}</span>
                  )}
                </div>

                <p className="rounded-2xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">{selectedProduct.description}</p>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ضمان المحل
                  <span className="text-zinc-300">•</span>
                  <Truck className="h-3.5 w-3.5 text-amber-500" />
                  توصيل 1-3 أيام
                  <span className="text-zinc-300">•</span>
                  <span className={selectedProduct.stock <= 5 ? 'font-bold text-red-500' : ''}>
                    {selectedProduct.stock > 0 ? `متوفر ${selectedProduct.stock} قطعة` : 'نفذت الكمية'}
                  </span>
                </div>

                {selectedProduct.stock > 0 && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 p-1.5">
                      <button
                        onClick={() => setDialogQty((q) => Math.min(99, q + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-amber-50"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="h-4 w-4 text-zinc-700" />
                      </button>
                      <span className="min-w-7 text-center text-sm font-extrabold">{dialogQty}</span>
                      <button
                        onClick={() => setDialogQty((q) => Math.max(1, q - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-amber-50"
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="h-4 w-4 text-zinc-700" />
                      </button>
                    </div>
                    <Button
                      className="h-11 flex-1 rounded-2xl bg-amber-500 font-extrabold text-white shadow-md hover:bg-amber-600"
                      disabled={addingId === selectedProduct.id}
                      onClick={async () => {
                        await addToCart({ productId: selectedProduct.id, name: selectedProduct.name, quantity: dialogQty })
                        setSelectedProduct(null)
                      }}
                    >
                      {addingId === selectedProduct.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" />
                      )}
                      أضف للسلة • {formatPrice(selectedProduct.price * dialogQty)}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== حوار إتمام الطلب ===== */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-amber-600" />
              بيانات التوصيل
            </DialogTitle>
            <DialogDescription>
              الإجمالي المطلوب: <span className="font-extrabold text-amber-600">{formatPrice(grandTotal)}</span> (الدفع عند الاستلام)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="relative">
              <User className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="الاسم الكامل *"
                className="h-11 rounded-2xl bg-zinc-50 pr-10 text-sm"
                aria-label="الاسم الكامل"
              />
            </div>
            <div className="relative">
              <Phone className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="رقم الموبايل (01xxxxxxxxx) *"
                inputMode="tel"
                dir="ltr"
                className="h-11 rounded-2xl bg-zinc-50 pr-10 text-right text-sm"
                aria-label="رقم الموبايل"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="h-11 w-full appearance-none rounded-2xl bg-zinc-50 pr-10 pl-4 text-sm text-zinc-800 shadow-sm outline-none ring-amber-400 focus:ring-2"
                aria-label="المدينة"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="العنوان بالتفصيل (الشارع، رقم العمارة، الدور، علامة مميزة) *"
              rows={2}
              className="rounded-2xl bg-zinc-50 text-sm"
              aria-label="العنوان التفصيلي"
            />
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظات إضافية (اختياري)"
              rows={2}
              className="rounded-2xl bg-zinc-50 text-sm"
              aria-label="ملاحظات إضافية"
            />
            <Button
              className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
              disabled={submitting}
              onClick={submitOrder}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              تأكيد الطلب
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== حوار نجاح الطلب ===== */}
      <Dialog open={!!orderSuccess} onOpenChange={(open) => !open && setOrderSuccess(null)}>
        <DialogContent className="rounded-3xl text-center sm:max-w-sm">
          <DialogHeader className="items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <CheckCircle2 className="h-11 w-11 text-emerald-600" />
            </motion.div>
            <DialogTitle className="text-xl">تم استلام طلبك بنجاح! 🎉</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-1">
                <p>
                  رقم الطلب: <span className="font-mono font-extrabold text-zinc-900" dir="ltr">{orderSuccess?.orderNumber}</span>
                </p>
                <p>
                  الإجمالي: <span className="font-extrabold text-amber-600">{orderSuccess ? formatPrice(orderSuccess.total) : ''}</span>
                </p>
                <p className="text-xs leading-5">سيتواصل معك محل ELMASRY ELECTRIC خلال ساعات لتأكيد الطلب وموعد التوصيل</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              className="h-11 rounded-2xl font-bold"
              onClick={() => { setOrderSuccess(null); setTab('home') }}
            >
              متابعة التسوق
            </Button>
            <Button
              className="h-11 rounded-2xl bg-amber-500 font-bold text-white hover:bg-amber-600"
              onClick={() => { setOrderSuccess(null); setTab('orders') }}
            >
              تتبع في طلباتي
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== حوار دليل تثبيت التطبيق ===== */}
      <Dialog open={installGuideOpen} onOpenChange={setInstallGuideOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-amber-600" />
              تثبيت التطبيق على الهاتف
            </DialogTitle>
            <DialogDescription>
              ثبّت «ELMASRY ELECTRIC» كتطبيق مستقل بأيقونة على الشاشة الرئيسية — يعمل بملء الشاشة بدون شريط المتصفح
            </DialogDescription>
          </DialogHeader>

          {installPrompt && (
            <Button
              onClick={handleInstall}
              className="h-12 w-full rounded-2xl bg-amber-500 text-sm font-extrabold text-white hover:bg-amber-600"
            >
              <Download className="ml-1 h-4 w-4" />
              تثبيت الآن بضغطة واحدة
            </Button>
          )}

          <div className="space-y-3">
            {/* أندرويد — APK جاهز */}
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-l from-amber-50 to-orange-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                <span className="text-base">⚡</span> أندرويد — التطبيق الجاهز (APK) — الأسهل
              </h4>
              <a
                href="/elmasry-electric.apk"
                download="elmasry-electric.apk"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-sm font-extrabold text-white shadow-md transition hover:bg-amber-600"
              >
                <Download className="h-4 w-4" />
                تحميل التطبيق الجاهز الآن (APK)
              </a>
              <ol className="mt-3 list-inside list-decimal space-y-1.5 text-xs leading-5 text-zinc-600">
                <li>اضغط الزر أعلاه — سينزل ملف <span dir="ltr" className="font-mono font-bold">elmasry-electric.apk</span> في مجلد التنزيلات</li>
                <li>افتح الملف من الإشعارات أو تطبيق «الملفات»، واسمح بـ<b>«التثبيت من مصادر غير معروفة»</b> عند الطلب</li>
                <li>افتح تطبيق <b>المصري إلكتريك</b> من قائمة تطبيقاتك</li>
                <li>عند أول تشغيل: أدخل عنوان موقع متجرك (أو اتركه كما هو) واضغط <b>«فتح المتجر»</b></li>
              </ol>
              <p className="mt-2 rounded-xl bg-amber-100/70 p-2 text-[10px] leading-4 text-amber-800">
                ملاحظة: التطبيق يعرض متجرك عبر الإنترنت — يعمل بالكامل بعد نشر المتجر (Vercel)، ويحفظ عنوانك في المرة الأولى.
              </p>
            </div>

            {/* أندرويد — كروم */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                <span className="text-base">🤖</span> أندرويد (كروم) — تثبيت مباشر بدون ملفات
              </h4>
              <ol className="list-inside list-decimal space-y-1.5 text-xs leading-5 text-zinc-600">
                <li>افتح رابط المتجر في متصفح <b>Chrome</b> على هاتفك</li>
                <li>اضغط زر <b>«تثبيت»</b> الذهبي أعلى الشاشة، أو من قائمة المتصفح (⋮) اختر <b>«تثبيت التطبيق»</b></li>
                <li>وافق على التثبيت — ستظهر أيقونة <b>ELMASRY</b> على شاشتك الرئيسية مثل أي تطبيق آخر</li>
              </ol>
            </div>

            {/* آيفون */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                <span className="text-base">🍎</span> آيفون (سفاري)
              </h4>
              <ol className="list-inside list-decimal space-y-1.5 text-xs leading-5 text-zinc-600">
                <li>افتح رابط المتجر في متصفح <b>Safari</b></li>
                <li>اضغط زر <b>المشاركة</b> (المربع مع السهم للأعلى) أسفل الشاشة</li>
                <li>انزل واختر <b>«إضافة إلى الشاشة الرئيسية»</b> ثم اضغط <b>«إضافة»</b></li>
              </ol>
            </div>

          </div>

          {/* تحميل كود المشروع للنشر الدائم */}
          <a
            href="/elmasry-source-code.zip"
            download="elmasry-electric-source-code.zip"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 text-sm font-extrabold text-zinc-800 transition hover:bg-amber-100"
          >
            <Download className="h-4 w-4 text-amber-600" />
            تحميل كود المشروع للنشر الدائم (ZIP)
          </a>
          <p className="-mt-1 text-center text-[10px] leading-4 text-zinc-400">
            استخدمه للنشر الدائم: GitHub ← Turso ← Vercel (الشرح الكامل في المحادثة)
          </p>

          <p className="rounded-2xl bg-zinc-100 p-3 text-[11px] leading-5 text-zinc-500">
            💡 نصيحة: تطبيق الـ APK يفتح متجرك بملء الشاشة بأيقونته الخاصة — بعد نشر المتجر على الإنترنت (Vercel) يعمل تلقائياً، ويمكنك تغيير العنوان من شاشة الترحيب أو شاشة الخطأ وقتما تشاء، ويناسب توزيعه على العملاء.
          </p>
        </DialogContent>
      </Dialog>

      {/* ===== حوار إضافة/تعديل منتج (الإدارة) ===== */}
      <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {editingProduct ? <Pencil className="h-5 w-5 text-amber-600" /> : <PackagePlus className="h-5 w-5 text-amber-600" />}
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'عدّل بيانات المنتج ثم اضغط حفظ' : 'املأ بيانات المنتج الجديد ثم اضغط حفظ'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              value={pForm.name}
              onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
              placeholder="اسم المنتج * (مثال: سلك نحاس 2.5 مم)"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="اسم المنتج"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  value={pForm.price}
                  onChange={(e) => setPForm({ ...pForm, price: e.target.value })}
                  placeholder="السعر *"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-zinc-50 pr-12 text-sm"
                  aria-label="السعر"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">ج.م</span>
              </div>
              <div className="relative">
                <Input
                  value={pForm.oldPrice}
                  onChange={(e) => setPForm({ ...pForm, oldPrice: e.target.value })}
                  placeholder="قبل الخصم"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-zinc-50 pr-12 text-sm"
                  aria-label="السعر قبل الخصم"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">ج.م</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={pForm.categoryId}
                onChange={(e) => setPForm({ ...pForm, categoryId: e.target.value })}
                className="h-11 w-full appearance-none rounded-2xl bg-zinc-50 px-3 text-sm text-zinc-800 shadow-sm outline-none ring-amber-400 focus:ring-2"
                aria-label="التصنيف"
              >
                <option value="">اختر التصنيف *</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input
                value={pForm.stock}
                onChange={(e) => setPForm({ ...pForm, stock: e.target.value })}
                placeholder="الكمية المتاحة"
                inputMode="numeric"
                className="h-11 rounded-2xl bg-zinc-50 text-sm"
                aria-label="الكمية المتاحة"
              />
            </div>
            <Input
              value={pForm.brand}
              onChange={(e) => setPForm({ ...pForm, brand: e.target.value })}
              placeholder="العلامة التجارية (اختياري)"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="العلامة التجارية"
            />
            <Input
              value={pForm.badge}
              onChange={(e) => setPForm({ ...pForm, badge: e.target.value })}
              placeholder="شريط ترويجي (مثال: الأكثر مبيعاً) — اختياري"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="شريط ترويجي"
            />
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <span className="text-xs font-bold text-zinc-700">عرض المنتج في قسم «الأكثر مبيعاً»</span>
              <input
                type="checkbox"
                checked={pForm.isFeatured}
                onChange={(e) => setPForm({ ...pForm, isFeatured: e.target.checked })}
                className="h-5 w-5 accent-amber-500"
                aria-label="منتج مميز"
              />
            </label>
            <Textarea
              value={pForm.description}
              onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
              placeholder="وصف المنتج (اختياري)"
              rows={2}
              className="rounded-2xl bg-zinc-50 text-sm"
              aria-label="وصف المنتج"
            />
            <Input
              value={pForm.image}
              onChange={(e) => setPForm({ ...pForm, image: e.target.value })}
              placeholder="رابط صورة المنتج (اختياري)"
              dir="ltr"
              className="h-11 rounded-2xl bg-zinc-50 text-left text-xs"
              aria-label="رابط الصورة"
            />
            <PresetImagePicker value={pForm.image} onPick={(img) => setPForm({ ...pForm, image: img })} />
            <Button
              className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
              disabled={savingProduct}
              onClick={saveProduct}
            >
              {savingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== حوار إضافة/تعديل باقة (الإدارة) ===== */}
      <Dialog open={pkgFormOpen} onOpenChange={setPkgFormOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-amber-600" />
              {editingPkg ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingPkg ? 'عدّل بيانات الباقة ثم اضغط حفظ' : 'املأ بيانات الباقة الجديدة ثم اضغط حفظ'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              value={pkgForm.name}
              onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
              placeholder="اسم الباقة * (مثال: باقة تمديد شقة 100م)"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="اسم الباقة"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  value={pkgForm.price}
                  onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                  placeholder="السعر *"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-zinc-50 pr-12 text-sm"
                  aria-label="سعر الباقة"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">ج.م</span>
              </div>
              <div className="relative">
                <Input
                  value={pkgForm.oldPrice}
                  onChange={(e) => setPkgForm({ ...pkgForm, oldPrice: e.target.value })}
                  placeholder="قبل الخصم"
                  inputMode="decimal"
                  className="h-11 rounded-2xl bg-zinc-50 pr-12 text-sm"
                  aria-label="السعر قبل الخصم"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">ج.م</span>
              </div>
            </div>
            <Textarea
              value={pkgForm.description}
              onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
              placeholder="وصف الباقة (اختياري)"
              rows={2}
              className="rounded-2xl bg-zinc-50 text-sm"
              aria-label="وصف الباقة"
            />
            <Textarea
              value={pkgForm.featuresText}
              onChange={(e) => setPkgForm({ ...pkgForm, featuresText: e.target.value })}
              placeholder={'محتويات الباقة * — سطر لكل ميزة، مثال:\n3 لفات سلك نحاس 2.5 مم\n15 قاطع مينياتوري\n10 مفاتيح وبريزات'}
              rows={4}
              className="rounded-2xl bg-zinc-50 text-sm"
              aria-label="محتويات الباقة"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={pkgForm.badge}
                onChange={(e) => setPkgForm({ ...pkgForm, badge: e.target.value })}
                placeholder="شريط ترويجي"
                className="h-11 rounded-2xl bg-zinc-50 text-sm"
                aria-label="شريط ترويجي للباقة"
              />
              <Input
                value={pkgForm.sortOrder}
                onChange={(e) => setPkgForm({ ...pkgForm, sortOrder: e.target.value.replace(/\D/g, '') })}
                placeholder="ترتيب العرض"
                inputMode="numeric"
                className="h-11 rounded-2xl bg-zinc-50 text-sm"
                aria-label="ترتيب عرض الباقة"
              />
            </div>
            <Input
              value={pkgForm.image}
              onChange={(e) => setPkgForm({ ...pkgForm, image: e.target.value })}
              placeholder="رابط صورة الباقة (اختياري)"
              dir="ltr"
              className="h-11 rounded-2xl bg-zinc-50 text-left text-xs"
              aria-label="رابط صورة الباقة"
            />
            <PresetImagePicker value={pkgForm.image} onPick={(img) => setPkgForm({ ...pkgForm, image: img })} />
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
              <span className="text-xs font-bold text-zinc-700">باقة شائعة (إطار ذهبي وشفرة مميزة)</span>
              <input
                type="checkbox"
                checked={pkgForm.isPopular}
                onChange={(e) => setPkgForm({ ...pkgForm, isPopular: e.target.checked })}
                className="h-5 w-5 accent-amber-500"
                aria-label="باقة شائعة"
              />
            </label>
            <Button
              className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
              disabled={savingPkg}
              onClick={savePkg}
            >
              {savingPkg ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {editingPkg ? 'حفظ التعديلات' : 'إضافة الباقة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== حوار إضافة/تعديل تصنيف (الإدارة) ===== */}
      <Dialog open={catFormOpen} onOpenChange={setCatFormOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Tags className="h-5 w-5 text-amber-600" />
              {editingCat ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingCat ? 'عدّل بيانات التصنيف ثم اضغط حفظ' : 'اكتب اسم التصنيف واختر أيقونته'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              placeholder="اسم التصنيف * (مثال: لوحات توزيع)"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="اسم التصنيف"
            />
            <div>
              <p className="mb-1.5 text-[10px] font-bold text-zinc-500">الأيقونة:</p>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = CATEGORY_ICONS[opt.value] ?? Zap
                  const active = catForm.icon === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setCatForm({ ...catForm, icon: opt.value })}
                      className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 ring-1 transition ${
                        active ? 'bg-amber-500 text-white ring-amber-500' : 'bg-zinc-50 text-zinc-500 ring-zinc-100 hover:ring-amber-300'
                      }`}
                      aria-label={opt.label}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span className="text-[9px] font-bold">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <Input
              value={catForm.sortOrder}
              onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value.replace(/\D/g, '') })}
              placeholder="ترتيب العرض"
              inputMode="numeric"
              className="h-11 rounded-2xl bg-zinc-50 text-sm"
              aria-label="ترتيب عرض التصنيف"
            />
            <Button
              className="h-12 w-full rounded-2xl bg-amber-500 text-base font-extrabold text-white shadow-lg hover:bg-amber-600"
              disabled={savingCat}
              onClick={saveCat}
            >
              {savingCat ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {editingCat ? 'حفظ التعديلات' : 'إضافة التصنيف'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== تأكيد حذف (منتج / باقة / تصنيف) ===== */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              حذف {deleteTarget?.kind === 'category' ? 'التصنيف' : deleteTarget?.kind === 'package' ? 'الباقة' : 'المنتج'}؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف «{deleteTarget?.name}» نهائياً من المحل{deleteTarget?.kind === 'category' ? ' (لا يمكن حذف تصنيف يحتوي منتجات)' : ''}. لا يمكن التراجع عن هذه العملية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="rounded-2xl font-bold">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-red-600 font-bold text-white hover:bg-red-700"
              disabled={deletingBusy}
              onClick={(e) => { e.preventDefault(); confirmDelete() }}
            >
              {deletingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              نعم، احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
