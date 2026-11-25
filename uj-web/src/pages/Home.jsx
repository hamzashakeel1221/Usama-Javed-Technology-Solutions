import { useState } from 'react'
import { Link } from '../components/L.jsx'
import { serviceByKey, servicePath } from '../servicePages.js'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { api } from '../api.js'
import { about, process, whyUs, faqs, intlPhone } from '../content.js'
import useFetch from '../useFetch.js'
import useProjects from '../useProjects.js'
import useReveal from '../useReveal.js'
import Icon from '../components/Icon.jsx'
import { LogoMark } from '../components/Logo.jsx'
import SectionHead from '../components/Section.jsx'
import ProjectCard, { ProjectModal } from '../components/ProjectCard.jsx'
import ReviewCard from '../components/ReviewCard.jsx'
import Cta from '../components/Cta.jsx'
import { HeroNet, StatusPanel } from '../components/HeroVisual.jsx'

export function ServiceCards({ services }) {
  const { t, lang } = useLang()
  return (
    <div className="svc-grid">
      {services.map((s, i) => (
        <article className={`svc reveal d${i + 1}`} key={s.key}>
          <span className="svc-num">0{i + 1}</span>
          <span className="ic-circle"><Icon name={s.icon} size={32} /></span>
          <h3>{s.title[lang]}</h3>
          <p>{s.text[lang]}</p>
          <ul className="ticks">{(s.points?.[lang] || []).map(p => <li key={p}><Icon name="check" size={14} />{p}</li>)}</ul>
          <Link to={serviceByKey(s.key) ? servicePath(serviceByKey(s.key).slug) : `/services#${s.key}`} className="link-arrow">{t.services.learn} <Icon name="arrow" size={16} className="flip-rtl" /></Link>
        </article>
      ))}
    </div>
  )
}

export function Steps({ dark = false }) {
  const { lang } = useLang()
  return (
    <div className="steps">
      {process.map((s, i) => (
        <div className={`step reveal d${i + 1}`} key={i}>
          <div className="step-num">{i + 1}</div>
          <h3>{s[lang].t}</h3>
          <p>{s[lang].d}</p>
        </div>
      ))}
    </div>
  )
}

export function WhyGrid() {
  const { lang, pick } = useLang()
  return (
    <>
      <div className="why-grid">
        {whyUs.map((w, i) => (
          <div className={`why reveal d${(i % 3) + 1}`} key={w.en.t}>
            <span className="ic-circle"><Icon name={w.icon} size={26} /></span>
            <h3>{w[lang].t}</h3>
            <p>{w[lang].d}</p>
          </div>
        ))}
      </div>
      <div className="promise reveal"><span>{pick(about.promise)}</span><Icon name="shield" size={28} /></div>
    </>
  )
}

export default function Home() {
  const { t, lang, pick } = useLang()
  const { content } = useContent()
  const projects = useProjects()
  const reviews = useFetch(api.reviews)
  const [open, setOpen] = useState(null)
  useReveal([projects.data, reviews.data, lang])
  const c = content.company

  return (
    <>
      <section className="hero">
        <div className="hero-grid-bg" />
        <HeroNet />
        <div className="container hero-inner">
          <div>
            <div className="hero-chips reveal">
              {content.services.map(s => <span className="chip" key={s.key}>{s.short?.[lang] || s.title[lang]}</span>)}
            </div>
            <h1 className="display reveal d1">{pick(content.hero.title)}</h1>
            <p className="hero-text reveal d2">{pick(content.hero.text)}</p>
            <div className="hero-actions reveal d3">
              <Link to="/contact" className="btn btn-orange">{t.hero.cta} <Icon name="arrow" size={18} className="arrow-ic flip-rtl" /></Link>
              <Link to="/services" className="btn btn-ghost">{t.hero.cta2}</Link>
            </div>
            <div className="hero-contact reveal d4">
              {c.phones.slice(0, 1).map(p => (
                <a key={p} href={`tel:${intlPhone(p).tel}`}><span className="ic"><Icon name="phone" size={18} /></span><span><small>{t.contact.mobile}</small><strong className="ltr">{p}</strong></span></a>
              ))}
              <a href={`mailto:${c.email}`}><span className="ic"><Icon name="mail" size={18} /></span><span><small>{t.contact.mail}</small><strong>{c.email}</strong></span></a>
            </div>
          </div>
          <StatusPanel />
        </div>
      </section>

      <section className="highlights">
        <div className="container highlights-grid">
          {content.highlights.map((h, i) => (
            <div className={`hl reveal d${i + 1}`} key={i}><strong><bdi>{h.value}</bdi></strong><small>{pick(h.label)}</small></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="reveal">
            <span className="eyebrow">{t.about.eyebrow}</span>
            <h2 className="h2">{t.about.sub}</h2>
            <p className="lead">{pick(about.p1)}</p>
            <div className="mv">
              <div className="mv-card"><h3>{t.about.mission}</h3><p>{pick(about.mission)}</p></div>
              <div className="mv-card"><h3>{t.about.approach}</h3><p>{pick(about.approach)}</p></div>
            </div>
            <div className="mt-sm" style={{ marginTop: 28 }}><Link to="/about" className="link-arrow">{t.about.more} <Icon name="arrow" size={16} className="flip-rtl" /></Link></div>
          </div>
          <figure className="about-visual reveal d2">
            <span className="big-mark"><LogoMark size={84} id="abm" /></span>
            <blockquote><Icon name="quote" size={34} />{pick(about.promise)}</blockquote>
            <figcaption>{pick(c.name)}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.sub} />
          <ServiceCards services={content.services} />
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

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-row">
            <SectionHead eyebrow={t.projects.eyebrow} title={t.projects.title} text={t.projects.sub} center={false} />
            <Link to="/projects" className="btn btn-outline reveal">{t.projects.all} <Icon name="arrow" size={16} className="arrow-ic flip-rtl" /></Link>
          </div>
          {projects.loading ? <p className="muted">{t.common.loading}</p> : (
            <div className="grid-2">
              {(projects.data || []).slice(0, 4).map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setOpen} className={`reveal d${(i % 2) + 1}`} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t.reviews.eyebrow} title={t.reviews.title} text={t.reviews.sub} />
          {reviews.data?.length ? (
            <div className="grid-3">{reviews.data.slice(0, 3).map((r, i) => <ReviewCard key={r.id} review={r} className={`reveal d${i + 1}`} />)}</div>
          ) : !reviews.loading && <p className="center muted reveal">{t.reviews.empty}</p>}
          <div className="center mt reveal"><Link to="/reviews" className="btn btn-outline">{reviews.data?.length ? t.reviews.all : t.reviews.write}</Link></div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="faq-title">
        <div className="container faq-wrap">
          <div className="reveal">
            <span className="eyebrow">{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</span>
            <h2 className="h2" id="faq-title">{lang === 'ar' ? 'أسئلة يطرحها عملاؤنا' : 'Questions our clients ask'}</h2>
            <p className="lead">{lang === 'ar' ? 'لم تجد إجابتك؟ اتصل بنا وسنساعدك.' : "Can't find your answer? Call us and we'll help."}</p>
            <Link to="/contact" className="btn btn-primary" style={{ marginTop: 28 }}>{t.nav.contact} <Icon name="arrow" size={16} className="arrow-ic flip-rtl" /></Link>
          </div>
          <div className="faq reveal d2">
            {faqs.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary><h3>{f[lang].q}</h3><span className="faq-ic" aria-hidden="true"><Icon name="plus" size={18} /></span></summary>
                <p>{f[lang].a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Cta />
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </>
  )
}
