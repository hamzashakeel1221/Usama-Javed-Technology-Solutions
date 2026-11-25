// ============================================================
//  SEO settings. Change SITE_URL to your real domain once you buy it
//  (e.g. https://www.ujtech.ae). It is used for canonical links,
//  hreflang, the sitemap and social share previews.
// ============================================================
import { defaults, faqs, about } from './content.js'
import { servicePages, servicePath, serviceByKey, areas } from './servicePages.js'

export const SITE_URL = (import.meta.env?.VITE_SITE_URL || 'https://www.ujtech.ae').replace(/\/$/, '')

export const PAGES = ['/', '/about', '/services', ...servicePages.map(s => servicePath(s.slug)), '/projects', '/reviews', '/contact']

const brand = { en: 'Usama Javed Technology Solution', ar: 'أسامة جاويد للحلول التقنية' }

export const meta = {
  '/': {
    en: { title: 'Structured Cabling, Fiber & CCTV Installation in Dubai & the UAE | Usama Javed Technology Solution', desc: 'CAT6 & fiber optic network cabling, villa wiring and CCTV camera installation in Dubai and across the UAE. Clean, tested and labeled installations with remote viewing and after-installation support. Free site visit & quote.' },
    ar: { title: 'تركيب الكابلات المهيكلة والألياف وكاميرات المراقبة في دبي والإمارات | أسامة جاويد للحلول التقنية', desc: 'تمديد كابلات شبكات CAT6 والألياف الضوئية وتمديدات الفلل وتركيب كاميرات المراقبة في دبي وجميع أنحاء الإمارات. تركيب نظيف ومُختبر ومُرقّم مع مشاهدة عن بُعد ودعم بعد التركيب. زيارة وعرض سعر مجاني.' },
  },
  '/about': {
    en: { title: 'About Us | Usama Javed Technology Solution, Dubai', desc: 'A Dubai-based technology and infrastructure company serving all of the UAE, specializing in structured cabling, networking and security camera installation for villa owners, developers and businesses.' },
    ar: { title: 'من نحن | أسامة جاويد للحلول التقنية، دبي', desc: 'شركة تقنية وبنية تحتية مقرّها دبي وتخدم جميع أنحاء الإمارات، متخصصة في الكابلات المهيكلة والشبكات وتركيب كاميرات المراقبة لملّاك الفلل والمطورين والشركات.' },
  },
  '/services': {
    en: { title: 'CAT6 & Fiber Cabling, Villa Wiring & CCTV Services in Dubai & the UAE', desc: 'Structured CAT6 and fiber optic networking, villa and residential cabling, and CCTV camera installation with DVR/NVR and remote viewing. Professional installation in Dubai and across the UAE.' },
    ar: { title: 'خدمات كابلات CAT6 والألياف وتمديدات الفلل وكاميرات المراقبة في دبي والإمارات', desc: 'شبكات CAT6 والألياف الضوئية المهيكلة، وتمديدات الفلل والمساكن، وتركيب كاميرات المراقبة مع DVR/NVR والمشاهدة عن بُعد. تركيب احترافي في دبي وجميع أنحاء الإمارات.' },
  },
  '/projects': {
    en: { title: 'Our Projects | Cabling & Networking Work in Dubai', desc: 'Selected structured cabling, networking and security projects delivered in Dubai, including Ash Mount School (Mudon) and Damac Lagoons.' },
    ar: { title: 'مشاريعنا | أعمال الكابلات والشبكات في دبي', desc: 'مختارات من مشاريع الكابلات المهيكلة والشبكات والأمان التي نفّذناها في دبي، منها مدرسة آش ماونت (مدن) وداماك لاقونز.' },
  },
  '/reviews': {
    en: { title: 'Client Reviews | Usama Javed Technology Solution', desc: 'Read what villa owners, developers and businesses in Dubai say about our cabling, networking and CCTV installation work, and share your own experience.' },
    ar: { title: 'آراء العملاء | أسامة جاويد للحلول التقنية', desc: 'اقرأ آراء ملّاك الفلل والمطورين والشركات في دبي حول أعمالنا في الكابلات والشبكات وكاميرات المراقبة، وشاركنا تجربتك.' },
  },
  '/contact': {
    en: { title: 'Contact Us & Free Quote | Cabling & CCTV Installation Dubai & UAE', desc: 'Call 0563146409 or 0557582603, WhatsApp or email us for a free site visit and quote for CAT6, fiber optic or CCTV installation in Dubai and across the UAE.' },
    ar: { title: 'تواصل معنا واطلب عرض سعر مجاني | كابلات وكاميرات مراقبة في دبي والإمارات', desc: 'اتصل على 0563146409 أو 0557582603 أو راسلنا عبر واتساب أو البريد لزيارة موقع وعرض سعر مجاني لتركيب CAT6 أو الألياف أو كاميرات المراقبة في دبي وجميع أنحاء الإمارات.' },
  },
}

// Service landing pages get their title/description from servicePages.js
servicePages.forEach(s => { meta[servicePath(s.slug)] = { en: { title: s.en.title, desc: s.en.desc }, ar: { title: s.ar.title, desc: s.ar.desc } } })

const crumbName = { '/about': 'about', '/services': 'services', '/projects': 'projects', '/reviews': 'reviews', '/contact': 'contact' }
const navNames = {
  en: { home: 'Home', about: 'About', services: 'Services', projects: 'Projects', reviews: 'Reviews', contact: 'Contact' },
  ar: { home: 'الرئيسية', about: 'من نحن', services: 'خدماتنا', projects: 'مشاريعنا', reviews: 'آراء العملاء', contact: 'تواصل معنا' },
}

export const urlFor = (base, lang) => SITE_URL + (lang === 'ar' ? (base === '/' ? '/ar' : '/ar' + base) : base)

const intl = p => '+971' + String(p).replace(/\D/g, '').replace(/^0/, '')

// Structured data (schema.org) for Google
export function jsonLd(base, lang, content = defaults) {
  const c = content.company
  const business = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': SITE_URL + '/#business',
    name: brand.en,
    alternateName: [brand.ar, 'UJ Technology Solution', 'UJ'],
    description: about.p1.en,
    url: SITE_URL + '/',
    logo: SITE_URL + '/logo-512.png',
    image: SITE_URL + '/og-image.png',
    telephone: c.phones.map(intl),
    email: c.email,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressRegion: 'Dubai', addressCountry: 'AE' },
    areaServed: [{ '@type': 'Country', name: 'United Arab Emirates' }, ...areas.en.map(a => ({ '@type': 'AdministrativeArea', name: a }))],
    slogan: about.promise.en,
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '19:00' }],
    contactPoint: c.phones.map(p => ({ '@type': 'ContactPoint', telephone: intl(p), contactType: 'customer service', areaServed: 'AE', availableLanguage: ['English', 'Arabic'] })),
    knowsAbout: ['Structured cabling', 'CAT6 network cabling', 'Fiber optic installation', 'Villa network wiring', 'CCTV installation', 'DVR/NVR setup', 'Remote CCTV viewing'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cabling, networking & security services',
      itemListElement: content.services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title.en, description: s.text.en, areaServed: 'United Arab Emirates', ...(serviceByKey(s.key) && { url: SITE_URL + servicePath(serviceByKey(s.key).slug) }) } })),
    },
  }
  const out = [business, {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE_URL + '/#website', url: SITE_URL + '/',
    name: brand.en, alternateName: brand.ar, inLanguage: ['en', 'ar'], publisher: { '@id': SITE_URL + '/#business' },
  }]
  if (base === '/') {
    out.push({
      '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[lang].q, acceptedAnswer: { '@type': 'Answer', text: f[lang].a } })),
    })
  } else if (crumbName[base]) {
    out.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: navNames[lang].home, item: urlFor('/', lang) },
        { '@type': 'ListItem', position: 2, name: navNames[lang][crumbName[base]], item: urlFor(base, lang) },
      ],
    })
  }
  const sp = servicePages.find(s => servicePath(s.slug) === base)
  if (sp) {
    const p = sp[lang]
    out.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: navNames[lang].home, item: urlFor('/', lang) },
        { '@type': 'ListItem', position: 2, name: navNames[lang].services, item: urlFor('/services', lang) },
        { '@type': 'ListItem', position: 3, name: p.h1, item: urlFor(base, lang) },
      ],
    }, {
      '@context': 'https://schema.org', '@type': 'Service', '@id': urlFor(base, lang) + '#service', name: p.h1, description: p.desc,
      serviceType: sp.en.topic, inLanguage: lang, url: urlFor(base, lang), provider: { '@id': SITE_URL + '/#business' },
      areaServed: [{ '@type': 'Country', name: 'United Arab Emirates' }, ...areas.en.map(a => ({ '@type': 'AdministrativeArea', name: a }))],
      hasOfferCatalog: { '@type': 'OfferCatalog', name: p.includedTitle, itemListElement: p.included.map(([n, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n, description: d } })) },
    }, {
      '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: p.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    })
  }
  if (base === '/services') {
    content.services.forEach(s => out.push({
      '@context': 'https://schema.org', '@type': 'Service', name: s.title[lang], description: s.text[lang], serviceType: s.short?.en || s.title.en,
      provider: { '@id': SITE_URL + '/#business' }, areaServed: { '@type': 'Country', name: 'United Arab Emirates' }, url: serviceByKey(s.key) ? urlFor(servicePath(serviceByKey(s.key).slug), lang) : urlFor('/services', lang) + '#' + s.key,
    }))
  }
  return out
}

// Everything that goes in <head> for a page (used both by the browser and the pre-renderer)
export function headFor(path, content = defaults) {
  if (path.length > 1) path = path.replace(/\/+$/, '')
  const lang = path === '/ar' || path.startsWith('/ar/') ? 'ar' : 'en'
  const base = lang === 'ar' ? path.slice(3) || '/' : path
  const m = meta[base]
  if (!m) return { lang, base, title: brand[lang], desc: '', robots: 'noindex, follow', links: [], og: [], ld: [] }
  const { title, desc } = m[lang]
  return {
    lang, base, title, desc, robots: 'index, follow, max-image-preview:large',
    links: [
      { rel: 'canonical', href: urlFor(base, lang) },
      { rel: 'alternate', hreflang: 'en', href: urlFor(base, 'en') },
      { rel: 'alternate', hreflang: 'ar', href: urlFor(base, 'ar') },
      { rel: 'alternate', hreflang: 'x-default', href: urlFor(base, 'en') },
    ],
    og: [
      ['property', 'og:type', 'website'], ['property', 'og:site_name', brand[lang]],
      ['property', 'og:title', title], ['property', 'og:description', desc], ['property', 'og:url', urlFor(base, lang)],
      ['property', 'og:image', SITE_URL + '/og-image.png'], ['property', 'og:image:width', '1200'], ['property', 'og:image:height', '630'],
      ['property', 'og:locale', lang === 'ar' ? 'ar_AE' : 'en_AE'], ['property', 'og:locale:alternate', lang === 'ar' ? 'en_AE' : 'ar_AE'],
      ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', title], ['name', 'twitter:description', desc],
      ['name', 'twitter:image', SITE_URL + '/og-image.png'],
    ],
    ld: jsonLd(base, lang, content),
  }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Same head as an HTML string (for the pre-rendered files)
export function headHtml(path) {
  const h = headFor(path)
  return [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.desc)}" />`,
    `<meta name="robots" content="${h.robots}" />`,
    ...h.links.map(l => `<link rel="${l.rel}"${l.hreflang ? ` hreflang="${l.hreflang}"` : ''} href="${esc(l.href)}" />`),
    ...h.og.map(([k, n, v]) => `<meta ${k}="${n}" content="${esc(v)}" />`),
    ...h.ld.map(d => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ')
}
