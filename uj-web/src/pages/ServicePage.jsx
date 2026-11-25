import { Link } from '../components/L.jsx'
import { useLang } from '../i18n.jsx'
import { servicePages, serviceBySlug, servicePath, areas } from '../servicePages.js'
import useReveal from '../useReveal.js'
import Icon from '../components/Icon.jsx'
import SectionHead from '../components/Section.jsx'
import Cta from '../components/Cta.jsx'
import { Steps, WhyGrid } from './Home.jsx'

// One landing page per service, e.g. /services/cctv-installation-dubai
export default function ServicePage({ slug }) {
  const { t, lang } = useLang()
  useReveal([lang, slug])
  const page = serviceBySlug(slug)
  const p = page[lang]
  const ar = lang === 'ar'
  const others = servicePages.filter(s => s.slug !== slug)

  return (
    <>
      <section className="page-hero">
        <div className="hero-grid-bg" />
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">{t.nav.home}</Link>
            <Icon name="arrow" size={12} className="flip-rtl" />
            <Link to="/services">{t.nav.services}</Link>
            <Icon name="arrow" size={12} className="flip-rtl" />
            <span>{p.eyebrow.split(' · ')[0]}</span>
          </nav>
          <span className="eyebrow light">{p.eyebrow}</span>
          <h1 className="h1">{p.h1}</h1>
          <p className="lead">{p.intro}</p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <Link to={`/contact?service=${page.key}`} className="btn btn-orange">{t.nav.quote} <Icon name="arrow" size={18} className="arrow-ic flip-rtl" /></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={p.eyebrow} title={p.includedTitle} />
          <div className="grid-3 svc-incl">
            {p.included.map(([h, d], i) => (
              <article className={`why reveal d${(i % 3) + 1}`} key={h}>
                <span className="ic-circle"><Icon name={i === 0 ? page.icon : 'check'} size={24} /></span>
                <h3>{h}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">{p.forTitle}</span>
            <h2 className="h2">{ar ? 'نخدم المنازل والشركات في جميع أنحاء الإمارات' : 'Serving homes and businesses across the UAE'}</h2>
            <ul className="ticks" style={{ marginTop: 22 }}>{p.for.map(x => <li key={x}><Icon name="check" size={14} />{x}</li>)}</ul>
          </div>
          <div className="reveal d2">
            <h3 className="h3-sm">{ar ? 'الإمارات التي نخدمها' : 'Emirates we cover'}</h3>
            <p className="muted">{ar ? 'مقرّنا دبي، ونخدم جميع أنحاء الإمارات:' : 'Based in Dubai, serving all of the UAE:'}</p>
            <ul className="area-list">{areas[lang].map(a => <li key={a}>{a}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <SectionHead eyebrow={t.process.eyebrow} title={t.process.title} text={t.process.sub} light />
          <Steps dark />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t.why.eyebrow} title={t.why.title} text={t.why.sub} />
          <WhyGrid />
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="faq-title">
        <div className="container faq-wrap">
          <div className="reveal">
            <span className="eyebrow">{ar ? 'الأسئلة الشائعة' : 'FAQ'}</span>
            <h2 className="h2" id="faq-title">{ar ? 'أسئلة شائعة عن ' + p.topic : 'Questions about ' + p.topic}</h2>
            <p className="lead">{ar ? 'لم تجد إجابتك؟ اتصل بنا وسنساعدك.' : "Can't find your answer? Call us and we'll help."}</p>
            <Link to={`/contact?service=${page.key}`} className="btn btn-primary" style={{ marginTop: 28 }}>{t.services.quote} <Icon name="arrow" size={16} className="arrow-ic flip-rtl" /></Link>
          </div>
          <div className="faq reveal d2">
            {p.faqs.map(([q, a], i) => (
              <details key={q} open={i === 0}>
                <summary><h3>{q}</h3><span className="faq-ic" aria-hidden="true"><Icon name="plus" size={18} /></span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t.services.eyebrow} title={ar ? 'خدمات أخرى' : 'Related services'} />
          <div className="grid-2">
            {others.map(o => (
              <Link to={servicePath(o.slug)} className="why related reveal" key={o.slug}>
                <span className="ic-circle"><Icon name={o.icon} size={26} /></span>
                <h3>{o[lang].h1}</h3>
                <span className="link-arrow">{t.services.learn} <Icon name="arrow" size={16} className="flip-rtl" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  )
}
