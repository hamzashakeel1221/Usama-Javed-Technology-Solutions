import { createContext, useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const dict = {
  en: {
    nav: { home: 'Home', about: 'About', services: 'Services', projects: 'Projects', reviews: 'Reviews', contact: 'Contact', quote: 'Get a free quote' },
    lang: 'العربية',
    hero: { eyebrow: 'Structured Cabling · Fiber & CAT6 Networking · CCTV Security', cta: 'Request a site visit', cta2: 'Explore our services', trusted: 'Recent work delivered at' },
    panel: { title: 'Network status', sub: 'Installation report', rows: ['CAT6 runs tested', 'Fiber backbone', 'CCTV cameras online', 'Remote viewing'], vals: ['Pass', 'Linked', 'Online', 'Active'] },
    about: { title: 'About Us', eyebrow: 'Who we are', sub: 'Who we are & what we stand for', mission: 'Our Mission', approach: 'Our Approach', more: 'More about us' },
    services: { title: 'Our Services', eyebrow: 'What we do', sub: 'Cabling, networking & security — done right', quote: 'Request a quote', learn: 'Learn more' },
    process: { title: 'How We Work', eyebrow: 'Our process', sub: 'A simple, transparent process from the first visit to handover.' },
    why: { title: 'Why Choose Us', eyebrow: 'Our difference', sub: 'What sets our service apart' },
    projects: {
      title: 'Our Projects', eyebrow: 'Portfolio', sub: 'Selected work we are proud of', all: 'View all projects', allCat: 'All',
      empty: 'No projects in this category yet.', status: 'Status', year: 'Year', partner: 'Contracting partner', location: 'Location',
      refs: 'Want to know more about our work? Contact us for references.', project: 'Project',
    },
    reviews: {
      title: 'What Our Clients Say', eyebrow: 'Testimonials', sub: 'Feedback from villa owners, developers and businesses we have worked with.',
      empty: 'Be the first to share your experience with us.', all: 'Read all reviews',
      write: 'Share your experience', name: 'Your name', rating: 'Your rating', comment: 'Your review',
      submit: 'Submit review', thanks: 'Thank you! Your review will appear once it has been approved.', based: 'based on', count: 'reviews',
    },
    contact: {
      title: "Let's Get You Connected", eyebrow: 'Contact us',
      sub: "Get in touch to discuss your cabling, networking, or CCTV installation project — we're happy to visit your site and provide guidance and a quote.",
      formTitle: 'Request a quote', name: 'Full name', company: 'Company (optional)', phone: 'Mobile number', email: 'Email address', service: 'Service needed',
      property: 'Property type', message: 'Tell us about your project', choose: 'Select…', send: 'Send request',
      thanks: 'Thank you! We received your request and will contact you shortly.',
      mobile: 'Mobile', mail: 'Email', area: 'Service area', hours: 'Working hours', whatsapp: 'Chat on WhatsApp', call: 'Call now',
      privacy: 'Your details are only used to reply to your request.',
    },
    cta: { title: "Let's get you connected", text: "Tell us about your property and we'll visit your site, advise you and provide a clear quote." },
    footer: { rights: 'All rights reserved.', quick: 'Company', services: 'Services', contact: 'Get in touch', line: 'Structured cabling • Fiber & CAT6 networking • CCTV security solutions' },
    common: { sending: 'Sending…', error: 'Something went wrong. Please try again, or call us directly.', tooMany: 'Too many attempts. Please wait a minute and try again.', loading: 'Loading…', notFound: 'This page could not be found.', back: 'Back to home', close: 'Close' },
  },
  ar: {
    nav: { home: 'الرئيسية', about: 'من نحن', services: 'خدماتنا', projects: 'مشاريعنا', reviews: 'آراء العملاء', contact: 'تواصل معنا', quote: 'اطلب عرض سعر مجاني' },
    lang: 'English',
    hero: { eyebrow: 'كابلات مهيكلة · شبكات الألياف و CAT6 · أنظمة المراقبة', cta: 'اطلب زيارة للموقع', cta2: 'تعرّف على خدماتنا', trusted: 'أعمال حديثة نفّذناها في' },
    panel: { title: 'حالة الشبكة', sub: 'تقرير التركيب', rows: ['اختبار تمديدات CAT6', 'العمود الفقري للألياف', 'الكاميرات المتصلة', 'المشاهدة عن بُعد'], vals: ['ناجح', 'متصل', 'تعمل', 'مفعّل'] },
    about: { title: 'من نحن', eyebrow: 'تعرّف علينا', sub: 'من نحن وما الذي نؤمن به', mission: 'رسالتنا', approach: 'نهجنا', more: 'المزيد عنا' },
    services: { title: 'خدماتنا', eyebrow: 'ماذا نقدّم', sub: 'كابلات وشبكات وأمان — بتنفيذ صحيح', quote: 'اطلب عرض سعر', learn: 'اعرف المزيد' },
    process: { title: 'كيف نعمل', eyebrow: 'خطوات العمل', sub: 'عملية بسيطة وشفافة من الزيارة الأولى حتى التسليم.' },
    why: { title: 'لماذا تختارنا', eyebrow: 'ما يميّزنا', sub: 'ما الذي يميّز خدمتنا' },
    projects: {
      title: 'مشاريعنا', eyebrow: 'أعمالنا', sub: 'مختارات من أعمال نفخر بها', all: 'عرض كل المشاريع', allCat: 'الكل',
      empty: 'لا توجد مشاريع في هذا التصنيف بعد.', status: 'الحالة', year: 'السنة', partner: 'شريك المقاولات', location: 'الموقع',
      refs: 'هل تريد معرفة المزيد عن أعمالنا؟ تواصل معنا للحصول على مراجع.', project: 'مشروع',
    },
    reviews: {
      title: 'ماذا يقول عملاؤنا', eyebrow: 'آراء العملاء', sub: 'آراء ملّاك الفلل والمطورين والشركات الذين عملنا معهم.',
      empty: 'كن أول من يشاركنا تجربته.', all: 'كل الآراء',
      write: 'شاركنا تجربتك', name: 'الاسم', rating: 'تقييمك', comment: 'رأيك',
      submit: 'إرسال الرأي', thanks: 'شكرًا لك! سيظهر رأيك بعد المراجعة والموافقة.', based: 'من', count: 'تقييمات',
    },
    contact: {
      title: 'لنبقِك متصلًا', eyebrow: 'تواصل معنا',
      sub: 'تواصل معنا لمناقشة مشروع الكابلات أو الشبكات أو كاميرات المراقبة — يسعدنا زيارة موقعك وتقديم المشورة وعرض السعر.',
      formTitle: 'اطلب عرض سعر', name: 'الاسم الكامل', company: 'الشركة (اختياري)', phone: 'رقم الجوال', email: 'البريد الإلكتروني', service: 'الخدمة المطلوبة',
      property: 'نوع العقار', message: 'أخبرنا عن مشروعك', choose: 'اختر…', send: 'إرسال الطلب',
      thanks: 'شكرًا لك! استلمنا طلبك وسنتواصل معك قريبًا.',
      mobile: 'الجوال', mail: 'البريد الإلكتروني', area: 'منطقة الخدمة', hours: 'ساعات العمل', whatsapp: 'تواصل عبر واتساب', call: 'اتصل الآن',
      privacy: 'نستخدم بياناتك فقط للرد على طلبك.',
    },
    cta: { title: 'لنبقِك متصلًا', text: 'أخبرنا عن عقارك وسنزور موقعك ونقدّم لك المشورة وعرض سعر واضح.' },
    footer: { rights: 'جميع الحقوق محفوظة.', quick: 'الشركة', services: 'الخدمات', contact: 'تواصل معنا', line: 'كابلات مهيكلة • شبكات الألياف و CAT6 • حلول المراقبة والأمان' },
    common: { sending: 'جارٍ الإرسال…', error: 'حدث خطأ. حاول مرة أخرى أو اتصل بنا مباشرة.', tooMany: 'محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.', loading: 'جارٍ التحميل…', notFound: 'تعذّر العثور على هذه الصفحة.', back: 'العودة للرئيسية', close: 'إغلاق' },
  },
}

const LangContext = createContext(null)

// The language comes from the URL: /ar/... is Arabic, everything else is English.
export const langFromPath = path => (path === '/ar' || path.startsWith('/ar/') ? 'ar' : 'en')
export const stripLang = path => (langFromPath(path) === 'ar' ? path.slice(3).replace(/\/$/, '') || '/' : path)

export function LangProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const lang = langFromPath(pathname)

  useEffect(() => {
    if (pathname.startsWith('/admin')) { document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr'; return }
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang, pathname])

  const t = dict[lang]
  const toggle = () => {
    const base = stripLang(pathname)
    navigate((lang === 'en' ? (base === '/' ? '/ar' : '/ar' + base) : base) + search + hash)
  }
  // pick({en, ar}) → text in the current language
  const pick = obj => (obj == null ? '' : typeof obj === 'string' ? obj : obj[lang] ?? obj.en)
  return <LangContext.Provider value={{ lang, t, toggle, pick }}>{children}</LangContext.Provider>
}

export { dict }

export const useLang = () => useContext(LangContext)
