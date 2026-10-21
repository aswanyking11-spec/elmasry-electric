// بيانات الكتالوج الافتراضية لمحل ELMASRY ELECTRIC
// تُستخدم في: prisma/seed.ts (التطوير المحلي) و /api/setup (إعداد القاعدة السحابية بعد النشر)

export const IMG = {
  wire1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b6c9854f6f7b.jpeg',
  wire2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/32b479a2f787.jpg',
  cable1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e2a64c4f93b9.jpg',
  cable2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cefbeaa4bc12.jpg',
  pvc1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/598a1a194cb6.jpg',
  pvc2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a6ded3cfb63d.png',
  metalflex1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c981f7292d29.jpg',
  metalflex2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f52eb3f953d3.jpg',
  mcb1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/98e6c846b033.jpg',
  mcb2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5da054c6e66b.jpg',
  rcd1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/57400a6f723f.jpg',
  rcd2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ffbaa9f4f08e.jpg',
  distbox1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/93e7ade585db.jpg',
  ledbulb1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/326593f5a294.jpg',
  ledbulb2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/59bf6b73923d.jpg',
  fluor1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ab0cdb08ffac.jpg',
  flood1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e003442bfbf1.jpg',
  solderiron1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f4e530755be9.jpg',
  solderiron2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d8dd12f7731c.png',
  solderwire1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/67a10ebbf729.jpg',
  solderwire2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4cb59cc31b2a.jpg',
  switch1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a6ded3cfb63d.png',
  switch2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d2d6e4673395.jpeg',
  socket1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ac510486b540.jpg',
  tape1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f07778bd402c.png',
  tape2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/567cb561711a.jpg',
  ballast1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de5c10a9d9a5.jpg',
  ballast2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6f43e872c4c4.jpg',
  transformer1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7ddfbc3b7d2a.jpg',
  transformer2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9755793aae51.jpeg',
  plug1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/de1613827a9b.jpg',
  plug2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/69d7204f873f.jpg',
  kit1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/373e09817130.jpg',
  kit3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/64622b6e6d55.jpg',
  drill1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/28aed7638760.jpg',
  multimeter1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6d34ab8c01cf.jpg',
}

export interface SeedCategory {
  key: string
  name: string
  icon: string
  sortOrder: number
}

export const CATEGORIES: SeedCategory[] = [
  { key: 'cables', name: 'أسلاك وكابلات', icon: 'Cable', sortOrder: 1 },
  { key: 'lamps', name: 'لمبات وإنارة', icon: 'Lightbulb', sortOrder: 2 },
  { key: 'breakers', name: 'قواطع وفواصل', icon: 'Zap', sortOrder: 3 },
  { key: 'conduits', name: 'خراطيم ومواسير', icon: 'Layers', sortOrder: 4 },
  { key: 'soldering', name: 'لحام وستنشيل', icon: 'Flame', sortOrder: 5 },
  { key: 'switches', name: 'مفاتيح وأفياش', icon: 'Plug', sortOrder: 6 },
  { key: 'ballasts', name: 'دوايات ومحولات', icon: 'Cog', sortOrder: 7 },
  { key: 'insulation', name: 'عوازل ومواد', icon: 'ShieldCheck', sortOrder: 8 },
]

export interface SeedProduct {
  name: string
  description: string
  price: number
  oldPrice: number | null
  image: string
  categoryKey: string
  brand: string
  rating: number
  reviews: number
  stock: number
  isFeatured: boolean
  badge: string | null
}

export const PRODUCTS: SeedProduct[] = [
  // ===== أسلاك وكابلات =====
  { name: 'سلك نحاس مفرد 2.5 مم — لفة 100 متر', description: 'سلك نحاس نقي 2.5 مم للتمديدات الرئيسية والإضاءة، لفة 100 متر، معتمد ومطابق للمواصفات المصرية. يتحمل أحمال التكييف والسخانات.', price: 3450, oldPrice: 3800, image: IMG.wire1, categoryKey: 'cables', brand: 'النصر', rating: 4.9, reviews: 187, stock: 22, isFeatured: true, badge: 'الأكثر مبيعاً' },
  { name: 'سلك نحاس مفرد 1.5 مم — لفة 100 متر', description: 'سلك نحاس 1.5 مم مناسب لدوائر الإنارة والمفاتيح، لفة 100 متر بمقاس دقيق وعزل PVC عالي الجودة.', price: 2250, oldPrice: null, image: IMG.wire2, categoryKey: 'cables', brand: 'النصر', rating: 4.8, reviews: 142, stock: 30, isFeatured: true, badge: null },
  { name: 'كابل مسلح 3×2.5 مم — لفة 50 متر', description: 'كابل مسلح ثلاثي للتغذية الرئيسية والأعمال الخارجية، حماية ميكانيكية كاملة ضد الرطوبة والقوارض.', price: 4100, oldPrice: 4600, image: IMG.cable1, categoryKey: 'cables', brand: 'السويدي', rating: 4.7, reviews: 64, stock: 12, isFeatured: false, badge: 'خصم 11%' },
  { name: 'سلك نيون (توسعة) 2×0.75 — لفة 50 متر', description: 'سلك توسعة مزدوج مرن للتوصيلات المؤقتة والمصابيح المتحركة، لفة 50 متر.', price: 620, oldPrice: null, image: IMG.cable2, categoryKey: 'cables', brand: 'فلاش', rating: 4.5, reviews: 58, stock: 25, isFeatured: false, badge: null },

  // ===== لمبات وإنارة =====
  { name: 'لمبة ليد 12 وات — ضوء أبيض', description: 'لمبة ليد اقتصادية 12 وات بديلة للـ 100 وات، عمر تشغيل يصل إلى 25 ألف ساعة، توفير في الكهرباء حتى 85%.', price: 45, oldPrice: 60, image: IMG.ledbulb1, categoryKey: 'lamps', brand: 'توسان', rating: 4.7, reviews: 412, stock: 120, isFeatured: true, badge: 'خصم 25%' },
  { name: 'لمبة ليد 9 وات — ضوء دافئ', description: 'لمبة ليد 9 وات ضوء دافئ مريح للعين، مثالية للغرف والممرات، استهلاك منخفض جداً.', price: 38, oldPrice: null, image: IMG.ledbulb2, categoryKey: 'lamps', brand: 'أوشن', rating: 4.6, reviews: 298, stock: 150, isFeatured: false, badge: null },
  { name: 'لمبة فلورسنت نيون 4 قدم', description: 'لمبة نيون 4 قدم 36 وات إضاءة قوية للورش والمحلات والمكاتب، تعمل مع الدواية العادية.', price: 75, oldPrice: null, image: IMG.fluor1, categoryKey: 'lamps', brand: 'أوسرام', rating: 4.5, reviews: 96, stock: 60, isFeatured: false, badge: null },
  { name: 'كشاف ليد خارجي 50 وات', description: 'كشاف ليد خارجي 50 وات مقاوم للماء IP65، إضاءة قوية للواجهات والأسطح والجراجات مع حامل معدني.', price: 285, oldPrice: 340, image: IMG.flood1, categoryKey: 'lamps', brand: 'توسان', rating: 4.8, reviews: 154, stock: 35, isFeatured: true, badge: 'خصم 16%' },

  // ===== قواطع وفواصل =====
  { name: 'قاطع مينياتوري 16 أمبير — MCB', description: 'قاطع كهربائي مينياتوري 16 أمبير حماية من الحمل الزائد والقصر، جودة عالية وعمر تشغيل طويل.', price: 55, oldPrice: null, image: IMG.mcb1, categoryKey: 'breakers', brand: 'شنايدر', rating: 4.9, reviews: 267, stock: 90, isFeatured: true, badge: null },
  { name: 'قاطع مينياتوري 32 أمبير — MCB', description: 'قاطع 32 أمبير للتغذية الرئيسية للأجهزة الكبيرة (تكييف، سخان)، حماية موثوقة لخط الكهرباء.', price: 95, oldPrice: 115, image: IMG.mcb2, categoryKey: 'breakers', brand: 'شنايدر', rating: 4.8, reviews: 189, stock: 70, isFeatured: false, badge: 'خصم 17%' },
  { name: 'قاطع رئيسي 63 أمبير', description: 'قاطع رئيسي ثلاثي 63 أمبير للعدادات والمداخل الرئيسية، فصل وتوصيل آمن لكامل الوحدة السكنية.', price: 320, oldPrice: 380, image: IMG.rcd1, categoryKey: 'breakers', brand: 'ABB', rating: 4.8, reviews: 73, stock: 18, isFeatured: false, badge: 'خصم 16%' },
  { name: 'قاطع تفاضلي (أرضي) 40 أمبير', description: 'قاطع تفاضلي 30 مللي أمبير لحماية الأرواح من الصعقة الكهربائية، ضروري للمطبخ والحمامات.', price: 450, oldPrice: null, image: IMG.rcd2, categoryKey: 'breakers', brand: 'شنايدر', rating: 4.9, reviews: 88, stock: 15, isFeatured: false, badge: 'مهم للسلامة' },
  { name: 'علبة توزيع 12 خط — بوابة معدنية', description: 'علبة توزيع كهربائية 12 خط ببوابة معدنية بيضاء، تنظيم مثالي للقواطع داخل المنزل أو المحل.', price: 540, oldPrice: 620, image: IMG.distbox1, categoryKey: 'breakers', brand: 'فلاش', rating: 4.6, reviews: 51, stock: 14, isFeatured: false, badge: 'خصم 13%' },

  // ===== خراطيم ومواسير =====
  { name: 'خرطوم PVC أملس 25 مم — 3 متر', description: 'خرطوم كهرباء PVC أملس قطر 25 مم طول 3 متر، لحماية الأسلاك داخل الجدران والأسقف المستعارة.', price: 28, oldPrice: null, image: IMG.pvc1, categoryKey: 'conduits', brand: 'المنصورة', rating: 4.5, reviews: 204, stock: 200, isFeatured: false, badge: null },
  { name: 'خرطوم معدني مرن 20 مم — 3 متر', description: 'خرطوم معدني مرن (جالفا) 20 مم للمصانع والمرائب والأماكن التي تحتاج حماية ميكانيكية إضافية.', price: 45, oldPrice: 55, image: IMG.metalflex1, categoryKey: 'conduits', brand: 'النصر', rating: 4.6, reviews: 77, stock: 80, isFeatured: false, badge: 'خصم 18%' },
  { name: 'خرطوم مكروي 25 مم — 3 متر', description: 'خرطوم مكروي مرن 25 مم سهل التشكيل بأي اتجاه، مثالي لتمديدات الإضاءة والأسقف.', price: 32, oldPrice: null, image: IMG.metalflex2, categoryKey: 'conduits', brand: 'المنصورة', rating: 4.4, reviews: 112, stock: 100, isFeatured: false, badge: null },
  { name: 'خرطوم PVC أملس 16 مم — 3 متر', description: 'خرطوم PVC قطر 16 مم مناسب لدوائر الإنارة والمفاتيح، خفيف وسهل التركيب بالشكائر.', price: 20, oldPrice: null, image: IMG.pvc2, categoryKey: 'conduits', brand: 'المنصورة', rating: 4.5, reviews: 165, stock: 250, isFeatured: false, badge: null },

  // ===== لحام وستنشيل =====
  { name: 'مكواة لحام 60 واط', description: 'مكواة لحام 60 واط بتسخين سريع ورأس نحاس مطلي، مثالية لأعمال الستنشيل وتركيب الأسلاك.', price: 185, oldPrice: 220, image: IMG.solderiron1, categoryKey: 'soldering', brand: 'يوروسكي', rating: 4.6, reviews: 133, stock: 40, isFeatured: true, badge: 'خصم 16%' },
  { name: 'شريط لحام (قصدير) 100 جم', description: 'قصدير لحام بسلك رول 100 جرام سبيكة 60/40 مع فلاكس مدمج، لحام ناعم وقوي للأسلاك واللوحات.', price: 125, oldPrice: null, image: IMG.solderwire1, categoryKey: 'soldering', brand: 'الشرق', rating: 4.7, reviews: 98, stock: 55, isFeatured: false, badge: null },
  { name: 'حمض لحام (فلاكس) 50 جم', description: 'حمض لحام عالي النقاء 50 جرام، يساعد على لحام سريع ونظيف ويزيل الأكسدة عن النحاس.', price: 35, oldPrice: null, image: IMG.solderwire2, categoryKey: 'soldering', brand: 'الشرق', rating: 4.5, reviews: 64, stock: 70, isFeatured: false, badge: null },
  { name: 'طقم لحام كامل — مكواة + قصدير + حمض', description: 'طقم متكامل لأعمال اللحام: مكواة 60 واط + قصدير 100 جم + حمض لحام + حامل مكواة.', price: 320, oldPrice: 395, image: IMG.solderiron2, categoryKey: 'soldering', brand: 'يوروسكي', rating: 4.7, reviews: 42, stock: 20, isFeatured: true, badge: 'وفر 75 جنيه' },

  // ===== مفاتيح وأفياش =====
  { name: 'مفتاح كهربائي أحادي', description: 'مفتاح إضاءة أحادي بجودة عالية ونقاط تلامس نحاسية، تشغيل سلس وصوت خافت.', price: 32, oldPrice: null, image: IMG.switch1, categoryKey: 'switches', brand: 'فلاش', rating: 4.5, reviews: 231, stock: 180, isFeatured: false, badge: null },
  { name: 'مفتاح كهربائي مزدوج', description: 'مفتاح إضاءة مزدوج في وحدة واحدة، مقاس قياسي يناسب جميع العلب، ألوان ثابتة لا تتغير مع الوقت.', price: 48, oldPrice: null, image: IMG.switch2, categoryKey: 'switches', brand: 'فلاش', rating: 4.5, reviews: 176, stock: 140, isFeatured: false, badge: null },
  { name: 'أفياش (بريزة) أوروبي', description: 'بريزة كهربائية أوروبية بحماية أطفال وتلامس نحاسي قوي، تناسب جميع الأجهزة المنزلية.', price: 42, oldPrice: 50, image: IMG.socket1, categoryKey: 'switches', brand: 'توسان', rating: 4.6, reviews: 254, stock: 160, isFeatured: false, badge: 'خصم 16%' },
  { name: 'فيشة معدنية 16 أمبير', description: 'فيشة رجل معدنية 16 أمبير للأجهزة القوية (سخان، مكيف)، تلامس محكم وحرارة منخفضة.', price: 38, oldPrice: null, image: IMG.plug1, categoryKey: 'switches', brand: 'فلاش', rating: 4.4, reviews: 121, stock: 130, isFeatured: false, badge: null },
  { name: 'ريجلة توصيل 3 مخارج', description: 'ريجلة توصيل 3 مخارج بكيبل 1.5 متر وسلك نحاس 1.5 مم، للغسالات والثلاجات والأجهزة المتعددة.', price: 95, oldPrice: 120, image: IMG.plug2, categoryKey: 'switches', brand: 'توسان', rating: 4.6, reviews: 187, stock: 60, isFeatured: false, badge: 'خصم 21%' },

  // ===== دوايات ومحولات =====
  { name: 'دواية فلورسنت 40 وات', description: 'دواية (بالاست) 40 وات للنيون العادي، تشغيل سريع لللمبة وعمر طويل، جودة مضمونة.', price: 85, oldPrice: 95, image: IMG.ballast1, categoryKey: 'ballasts', brand: 'أوشن', rating: 4.5, reviews: 83, stock: 45, isFeatured: true, badge: 'خصم 11%' },
  { name: 'دواية إلكتروني 2×36 واط', description: 'دواية إلكتروني حديث بدون أمصال، إضاءة فورية بدون وميض وتوفير في الكهرباء، يعمل لنيونين.', price: 160, oldPrice: null, image: IMG.ballast2, categoryKey: 'ballasts', brand: 'أوسرام', rating: 4.7, reviews: 57, stock: 30, isFeatured: false, badge: null },
  { name: 'محول 12 فولت 5 أمبير', description: 'محول (أدرابر) 12 فولت 5 أمبير 60 واط، لتشغيل أجهزة الكاميرات والراوترات وشرائح الليد.', price: 210, oldPrice: null, image: IMG.transformer1, categoryKey: 'ballasts', brand: 'يوروسكي', rating: 4.6, reviews: 69, stock: 28, isFeatured: false, badge: null },
  { name: 'مصعد كهربائي (عداد) رقمي', description: 'عداد كهرباء رقمي دقيق لقياس استهلاك الوحدات السكنية والمحلات، شاشة واضحة وتثبيت سهل.', price: 680, oldPrice: 780, image: IMG.transformer2, categoryKey: 'ballasts', brand: 'شنايدر', rating: 4.7, reviews: 34, stock: 10, isFeatured: false, badge: 'خصم 13%' },

  // ===== عوازل ومواد =====
  { name: 'شريط عازل أسود — 10 قطع', description: 'شريط عازل كهربائي أسود عالي اللزوجة، تحمل حتى 600 فولت، عرض 19 مم — عرض 10 قطع بسعر موفر.', price: 95, oldPrice: 120, image: IMG.tape1, categoryKey: 'insulation', brand: '3M', rating: 4.8, reviews: 312, stock: 90, isFeatured: true, badge: 'خصم 21%' },
  { name: 'شريط عازل ملون — 6 قطع', description: 'شرائط عازلة ملونة (أحمر/أزرق/أصفر/أخضر) لترميز دوائر التمديدات حسب الكود الكهربائي.', price: 66, oldPrice: null, image: IMG.tape2, categoryKey: 'insulation', brand: '3M', rating: 4.6, reviews: 148, stock: 75, isFeatured: false, badge: null },
  { name: 'أفوميتر رقمي لفحص الكهرباء', description: 'أفوميتر رقمي لقياس الفولت والأمبير والمقاومة والاستمرارية، أساسي لكل كهربائي في الشغل اليومي.', price: 285, oldPrice: 350, image: IMG.multimeter1, categoryKey: 'insulation', brand: 'يوني تي', rating: 4.8, reviews: 203, stock: 25, isFeatured: true, badge: 'خصم 19%' },
  { name: 'مثقاب كهربائي 550 واط', description: 'مثقاب كهربائي 550 واط لتركيب العلب والمفاتيح والبرايات في الجدران، مع عدة كاملة.', price: 780, oldPrice: 890, image: IMG.drill1, categoryKey: 'insulation', brand: 'ديكو', rating: 4.7, reviews: 156, stock: 12, isFeatured: false, badge: 'خصم 12%' },
]

export interface SeedPackage {
  name: string
  description: string
  price: number
  oldPrice: number | null
  image: string
  features: string[]
  badge: string | null
  isPopular: boolean
  sortOrder: number
}

export const PACKAGES: SeedPackage[] = [
  {
    name: 'باقة تمديد شقة كاملة 120م',
    description: 'كل مستلزمات تمديد كهرباء شقة 120 متر — أسلاك وقواطع وخراطيم ومفاتيح',
    price: 8900, oldPrice: 10250, image: IMG.kit1,
    features: ['3 لفات سلك نحاس 2.5 مم', '2 لفة سلك نحاس 1.5 مم', '15 قاطع مينياتوري متنوع', '20 خرطوم PVC 25 مم', '10 مفاتيح + 8 بريزات', 'علبة توزيع 12 خط', 'شريط عازل + أطواق مجاناً'],
    badge: 'الأكثر طلباً', isPopular: true, sortOrder: 1,
  },
  {
    name: 'باقة إنارة المنزل الاقتصادية',
    description: 'استبدل كل لمباتك بليد موفر — وفر في فاتورة الكهرباء من أول شهر',
    price: 990, oldPrice: 1240, image: IMG.ledbulb1,
    features: ['20 لمبة ليد 9 وات', '10 لمبات ليد 12 وات', '2 كشاف ليد خارجي 50 وات', 'ضمان سنة على اللمبات', 'تركيب مجاني داخل المدينة'],
    badge: 'وفر 250 جنيه', isPopular: false, sortOrder: 2,
  },
  {
    name: 'بقة الورشة واللحام',
    description: 'معدات اللحام والستنشيل الأساسية لكل ورشة صغيرة أو كهربائي',
    price: 480, oldPrice: 590, image: IMG.kit3,
    features: ['مكواة لحام 60 واط', 'قصدير 100 جم', 'حمض لحام 50 جم', 'حامل مكواة معدني', 'أفوميتر رقمي للفحص'],
    badge: null, isPopular: false, sortOrder: 3,
  },
  {
    name: 'باقة الصيانة السريعة',
    description: 'قطع غيار أساسية للصيانة الفورية — لا تنتظر شراء القطعة عند العطل',
    price: 550, oldPrice: 680, image: IMG.mcb1,
    features: ['5 قواطع 16 أمبير + 3 قواطع 32 أمبير', '3 دوايات فلورسنت 40 وات', 'لمبات ليد متنوعة (10 قطع)', 'شريط عازل + فيشات وأفياش', 'خراطيم وأطواق تثبيت'],
    badge: null, isPopular: false, sortOrder: 4,
  },
]
