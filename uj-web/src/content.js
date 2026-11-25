// ============================================================
//  DEFAULT WEBSITE CONTENT (from the UJ company profile)
//  Company details, hero text, highlights and services can also be
//  edited live from Admin → Site content. Saved values there override
//  the defaults below.
// ============================================================

export const defaults = {
  company: {
    name: { en: 'Usama Javed Technology Solution', ar: 'أسامة جاويد للحلول التقنية' },
    short: { en: 'Usama Javed', ar: 'أسامة جاويد' },
    tagline: { en: 'Technology Solution', ar: 'للحلول التقنية' },
    phones: ['0563146409', '0557582603'],
    whatsapp: '971563146409',
    email: 'usamajavedu95@gmail.com',
    address: { en: 'Based in Dubai, serving all of the UAE', ar: 'مقرّنا دبي، ونخدم جميع أنحاء الإمارات' },
    hours: { en: 'Mon – Sat, 8:00 AM – 7:00 PM', ar: 'الإثنين – السبت، ٨ صباحًا – ٧ مساءً' },
  },
  hero: {
    title: { en: 'Reliable cabling, networking & security, done right.', ar: 'كابلات وشبكات وأنظمة أمان موثوقة، بتنفيذ احترافي.' },
    text: {
      en: 'Structured CAT6 and fiber optic networks and professionally configured CCTV systems for villas, offices and commercial projects across Dubai and the UAE.',
      ar: 'شبكات كابلات مهيكلة CAT6 وألياف ضوئية وأنظمة كاميرات مراقبة مُعدّة باحتراف للفلل والمكاتب والمشاريع التجارية في دبي وجميع أنحاء الإمارات.',
    },
  },
  highlights: [
    { value: '100%', label: { en: 'Cables tested & labeled', ar: 'كابلات مُختبرة ومُرقّمة' } },
    { value: 'CAT6', label: { en: '& fiber optic networks', ar: 'وشبكات الألياف الضوئية' } },
    { value: '24/7', label: { en: 'Remote CCTV viewing', ar: 'مشاهدة الكاميرات عن بُعد' } },
    { value: '4', label: { en: 'Step process, visit to handover', ar: 'خطوات من الزيارة حتى التسليم' } },
  ],
  services: [
    {
      key: 'cabling', icon: 'cable',
      title: { en: 'Structured Cabling: CAT6 & Fiber Optic Networking', ar: 'الكابلات المهيكلة: شبكات CAT6 والألياف الضوئية' },
      short: { en: 'CAT6 & Fiber Cabling', ar: 'كابلات CAT6 والألياف' },
      text: {
        en: 'We design and install structured cabling systems for fast, reliable connectivity, including CAT6 network cabling and fiber optic runs for homes, offices, and commercial spaces. Every cable is routed, labeled, tested, and terminated to a clean, professional standard.',
        ar: 'نصمم ونركّب أنظمة الكابلات المهيكلة لاتصال سريع وموثوق، بما في ذلك كابلات شبكات CAT6 وتمديدات الألياف الضوئية للمنازل والمكاتب والمساحات التجارية. يتم تمديد كل كابل وترقيمه واختباره وتوصيله وفق معايير احترافية ونظيفة.',
      },
      points: {
        en: ['CAT6 network cabling', 'Fiber optic runs', 'Routed, labeled & tested', 'Professional termination'],
        ar: ['كابلات شبكات CAT6', 'تمديدات الألياف الضوئية', 'تمديد وترقيم واختبار', 'توصيل احترافي'],
      },
    },
    {
      key: 'villa', icon: 'home',
      title: { en: 'Villa & Residential Cabling Solutions', ar: 'حلول كابلات الفلل والمساكن' },
      short: { en: 'Villa & Residential Wiring', ar: 'تمديدات الفلل والمساكن' },
      text: {
        en: "From new-build villas to renovation projects, we handle complete in-wall and structured cabling — network points, TV and data outlets, and organized cable management — planned around your home's layout for a tidy, long-lasting installation.",
        ar: 'من الفلل الجديدة إلى مشاريع التجديد، ننفّذ تمديدات الكابلات المهيكلة داخل الجدران بالكامل — نقاط الشبكة ومخارج التلفاز والبيانات وتنظيم الكابلات — وفق مخطط منزلك لتركيب مرتب يدوم طويلًا.',
      },
      points: {
        en: ['New-build & renovation', 'Network points', 'TV & data outlets', 'Organized cable management'],
        ar: ['فلل جديدة وتجديد', 'نقاط الشبكة', 'مخارج التلفاز والبيانات', 'تنظيم الكابلات'],
      },
    },
    {
      key: 'cctv', icon: 'camera',
      title: { en: 'CCTV Camera Installation & Security Systems', ar: 'تركيب كاميرات المراقبة وأنظمة الأمان' },
      short: { en: 'CCTV Camera Installation', ar: 'تركيب كاميرات المراقبة' },
      text: {
        en: 'Protect your property with a professionally installed CCTV system. We supply, install, and configure security cameras with DVR/NVR setups tailored to your property, including remote viewing setup so you can monitor your home or business from anywhere.',
        ar: 'احمِ عقارك بنظام كاميرات مراقبة مُركّب باحتراف. نوفّر ونركّب ونُعدّ كاميرات الأمان مع أنظمة DVR/NVR المناسبة لعقارك، مع إعداد المشاهدة عن بُعد لتراقب منزلك أو عملك من أي مكان.',
      },
      points: {
        en: ['Supply & installation', 'DVR / NVR setup', 'Remote viewing', 'Tailored to your property'],
        ar: ['توريد وتركيب', 'إعداد DVR / NVR', 'مشاهدة عن بُعد', 'مصمم حسب عقارك'],
      },
    },
  ],
}

export const about = {
  p1: {
    en: 'Usama Javed Technology Solution is a dedicated technology and infrastructure services provider specializing in structured cabling, networking, and security camera installation for homes and businesses. We work closely with villa owners, property developers, and commercial clients to plan and install dependable CAT6 and fiber optic networks alongside professionally configured CCTV security systems.',
    ar: 'أسامة جاويد للحلول التقنية مزوّد متخصص في خدمات التقنية والبنية التحتية، يركّز على الكابلات المهيكلة والشبكات وتركيب كاميرات المراقبة للمنازل والشركات. نعمل عن قرب مع ملّاك الفلل والمطورين العقاريين والعملاء التجاريين لتخطيط وتركيب شبكات CAT6 وألياف ضوئية موثوقة إلى جانب أنظمة مراقبة مُعدّة باحتراف.',
  },
  p2: {
    en: "From the first site visit to the final walkthrough, our approach stays the same: clean, well-organized cable work, honest communication, and installations built to perform reliably for years to come. Whether it's a single villa or a multi-unit commercial project, we bring the same level of care and attention to detail to every job.",
    ar: 'من الزيارة الأولى للموقع حتى جولة التسليم النهائية، يبقى نهجنا واحدًا: أعمال كابلات نظيفة ومنظمة، وتواصل صادق، وتركيبات مصممة لتعمل بموثوقية لسنوات. سواء كانت فيلا واحدة أو مشروعًا تجاريًا متعدد الوحدات، نقدّم نفس مستوى العناية والاهتمام بالتفاصيل في كل عمل.',
  },
  mission: {
    en: 'To deliver reliable, professionally installed cabling and security solutions that keep homes and businesses connected, protected, and future-ready.',
    ar: 'تقديم حلول كابلات وأمان موثوقة ومُركّبة باحتراف تُبقي المنازل والشركات متصلة ومحمية وجاهزة للمستقبل.',
  },
  approach: {
    en: 'Careful planning, tidy cable management, and quality materials on every job — paired with clear communication and dependable after-installation support.',
    ar: 'تخطيط دقيق وتنظيم مرتب للكابلات ومواد عالية الجودة في كل عمل — مع تواصل واضح ودعم موثوق بعد التركيب.',
  },
  promise: {
    en: "Your property's connectivity and security — done properly, the first time.",
    ar: 'اتصال عقارك وأمانه — بتنفيذ صحيح من المرة الأولى.',
  },
}

export const process = [
  { en: { t: 'Site Visit & Consultation', d: 'We visit your property, understand your needs and assess the site.' }, ar: { t: 'زيارة الموقع والاستشارة', d: 'نزور عقارك ونفهم احتياجاتك ونقيّم الموقع.' } },
  { en: { t: 'Planning & Quotation', d: 'A clear plan and a fair, transparent quotation with no hidden costs.' }, ar: { t: 'التخطيط وعرض السعر', d: 'خطة واضحة وعرض سعر عادل وشفاف بلا تكاليف مخفية.' } },
  { en: { t: 'Professional Installation', d: 'Tidy, well-organized installation using quality cables and equipment.' }, ar: { t: 'التركيب الاحترافي', d: 'تركيب مرتب ومنظم باستخدام كابلات ومعدات عالية الجودة.' } },
  { en: { t: 'Testing & Handover', d: 'Every run is tested and labeled before a full walkthrough and handover.' }, ar: { t: 'الاختبار والتسليم', d: 'يُختبر كل تمديد ويُرقّم قبل جولة كاملة والتسليم.' } },
]

export const whyUs = [
  { icon: 'shield', en: { t: 'Quality Workmanship', d: 'Careful, professional installation on every job, big or small.' }, ar: { t: 'جودة التنفيذ', d: 'تركيب دقيق واحترافي في كل عمل، كبيرًا كان أو صغيرًا.' } },
  { icon: 'clock', en: { t: 'Reliable & Timely Service', d: 'We respect your time and complete work efficiently, as scheduled.' }, ar: { t: 'خدمة موثوقة وفي الموعد', d: 'نحترم وقتك وننجز العمل بكفاءة وفق الجدول.' } },
  { icon: 'users', en: { t: 'Skilled Technicians', d: 'Experienced hands-on professionals who know cabling and security systems.' }, ar: { t: 'فنيون مهرة', d: 'محترفون ذوو خبرة عملية في الكابلات وأنظمة الأمان.' } },
  { icon: 'tool', en: { t: 'Modern Tools & Materials', d: 'Quality cabling, connectors, and equipment for lasting performance.' }, ar: { t: 'أدوات ومواد حديثة', d: 'كابلات وموصلات ومعدات عالية الجودة لأداء يدوم.' } },
  { icon: 'tag', en: { t: 'Honest, Competitive Pricing', d: 'Clear, fair pricing with no hidden surprises.' }, ar: { t: 'أسعار عادلة وتنافسية', d: 'تسعير واضح وعادل بلا مفاجآت مخفية.' } },
  { icon: 'headset', en: { t: 'After-Installation Support', d: "We're a call away if you need adjustments or assistance later." }, ar: { t: 'دعم بعد التركيب', d: 'نحن على بُعد اتصال إذا احتجت أي تعديل أو مساعدة لاحقًا.' } },
]

export const categories = [
  { key: 'cabling', en: 'Structured Cabling', ar: 'الكابلات المهيكلة' },
  { key: 'villa', en: 'Villa & Residential', ar: 'الفلل والمساكن' },
  { key: 'cctv', en: 'CCTV & Security', ar: 'المراقبة والأمان' },
]

export const projectStatuses = [
  { key: 'Completed', en: 'Completed', ar: 'مكتمل' },
  { key: 'Ongoing', en: 'Ongoing', ar: 'قيد التنفيذ' },
]

export const propertyTypes = [
  { key: 'villa', en: 'Villa', ar: 'فيلا' },
  { key: 'apartment', en: 'Apartment', ar: 'شقة' },
  { key: 'office', en: 'Office', ar: 'مكتب' },
  { key: 'commercial', en: 'Commercial / Retail', ar: 'تجاري / محلات' },
  { key: 'school', en: 'School / Education', ar: 'مدرسة / تعليم' },
  { key: 'development', en: 'Multi-unit development', ar: 'مشروع متعدد الوحدات' },
  { key: 'other', en: 'Other', ar: 'أخرى' },
]

// Shown only if the API can't be reached, so the portfolio is never empty.
export const fallbackProjects = [
  {
    id: 'f1', titleEn: 'Ash Mount School', titleAr: 'مدرسة آش ماونت',
    descriptionEn: 'Structured cabling and networking works for a school campus in Mudon, delivered with Orion Contracting.',
    descriptionAr: 'أعمال الكابلات المهيكلة والشبكات لحرم مدرسي في مدن، بالتعاون مع أوريون للمقاولات.',
    location: 'Mudon, Dubai', category: 'cabling', status: 'Completed', year: 2026, partner: 'Orion Contracting', isFeatured: true,
  },
  {
    id: 'f2', titleEn: 'Damac Lagoons', titleAr: 'داماك لاقونز',
    descriptionEn: 'Villa cabling, network points and data outlets for residential units in Damac Lagoons.',
    descriptionAr: 'تمديدات كابلات الفلل ونقاط الشبكة ومخارج البيانات للوحدات السكنية في داماك لاقونز.',
    location: 'Dubai', category: 'villa', status: 'Completed', year: 2026, partner: null, isFeatured: true,
  },
]

// "0563146409" → "+971 56 314 6409" for links and display
export const intlPhone = p => {
  const d = String(p).replace(/\D/g, '')
  const local = d.startsWith('971') ? d.slice(3) : d.replace(/^0/, '')
  return { tel: `+971${local}`, display: `+971 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`.trim() }
}

// Frequently asked questions (shown on the home page and marked up for Google)
export const faqs = [
  {
    en: { q: 'Do you install CAT6 and fiber optic cabling in Dubai?', a: 'Yes. We design and install structured CAT6 network cabling and fiber optic runs for villas, offices and commercial projects across Dubai and the UAE. Every cable is routed, labeled, tested and terminated to a professional standard.' },
    ar: { q: 'هل تقومون بتركيب كابلات CAT6 والألياف الضوئية في دبي؟', a: 'نعم. نصمم ونركّب كابلات شبكات CAT6 المهيكلة وتمديدات الألياف الضوئية للفلل والمكاتب والمشاريع التجارية في دبي وجميع أنحاء الإمارات، ويتم تمديد كل كابل وترقيمه واختباره وتوصيله وفق معايير احترافية.' },
  },
  {
    en: { q: 'Can you wire a new-build or renovated villa?', a: 'Yes. We handle complete in-wall and structured cabling for new-build villas and renovation projects, including network points, TV and data outlets and organized cable management planned around your home\'s layout.' },
    ar: { q: 'هل يمكنكم تمديد كابلات فيلا جديدة أو قيد التجديد؟', a: 'نعم. ننفّذ تمديدات الكابلات المهيكلة داخل الجدران بالكامل للفلل الجديدة ومشاريع التجديد، بما في ذلك نقاط الشبكة ومخارج التلفاز والبيانات وتنظيم الكابلات وفق مخطط منزلك.' },
  },
  {
    en: { q: 'Can I watch my CCTV cameras from my phone?', a: 'Yes. We supply, install and configure CCTV cameras with DVR/NVR systems and set up remote viewing, so you can monitor your home or business from anywhere.' },
    ar: { q: 'هل يمكنني مشاهدة كاميرات المراقبة من هاتفي؟', a: 'نعم. نوفّر ونركّب ونُعدّ كاميرات المراقبة مع أنظمة DVR/NVR ونجهّز المشاهدة عن بُعد، لتتمكن من مراقبة منزلك أو عملك من أي مكان.' },
  },
  {
    en: { q: 'How does your process work?', a: 'Four steps: a site visit and consultation, a clear plan and quotation, professional installation, then testing and handover. We stay a call away for support after installation.' },
    ar: { q: 'كيف تتم آلية العمل لديكم؟', a: 'أربع خطوات: زيارة الموقع والاستشارة، ثم خطة واضحة وعرض سعر، ثم التركيب الاحترافي، وأخيرًا الاختبار والتسليم. ونبقى على بُعد اتصال لتقديم الدعم بعد التركيب.' },
  },
  {
    en: { q: 'How do I get a quote?', a: 'Call or WhatsApp us on 0563146409 or 0557582603, email usamajavedu95@gmail.com, or send the quote form on this website. We are happy to visit your site and give you clear, fair pricing with no hidden costs.' },
    ar: { q: 'كيف أحصل على عرض سعر؟', a: 'اتصل بنا أو راسلنا عبر واتساب على 0563146409 أو 0557582603، أو عبر البريد usamajavedu95@gmail.com، أو أرسل نموذج طلب عرض السعر في هذا الموقع. يسعدنا زيارة موقعك وتقديم تسعير واضح وعادل بلا تكاليف مخفية.' },
  },
]
