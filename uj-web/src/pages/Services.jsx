import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from '../components/L.jsx'
import { serviceByKey, servicePath } from '../servicePages.js'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import useReveal from '../useReveal.js'
import Icon from '../components/Icon.jsx'
import SectionHead, { PageHero } from '../components/Section.jsx'
import Cta from '../components/Cta.jsx'
import { Steps } from './Home.jsx'

export default function Services() {
  const { t, lang } = useLang()
  const { content } = useContent()
  const { hash } = useLocation()
  useReveal([lang])
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
  }, [hash])

  return (
    <>
      <PageHero eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.sub} />
      <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="container">
          {content.services.map((s, i) => (
            <article className="svc-detail" id={s.key} key={s.key}>
              <div className="svc-art reveal">
                <span className="ic-circle"><Icon name={s.icon} size={56} /></span>
                <span className="num">0{i + 1}</span>
              </div>
              <div className="reveal d2">
                <span className="eyebrow">0{i + 1} · {s.short?.[lang]}</span>
                <h2 className="h2">{s.title[lang]}</h2>
                <p className="lead">{s.text[lang]}</p>
                <ul className="ticks" style={{ marginTop: 26 }}>{(s.points?.[lang] || []).map(p => <li key={p}><Icon name="check" size={14} />{p}</li>)}</ul>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <Link to={`/contact?service=${s.key}`} className="btn btn-primary">{t.services.quote} <Icon name="arrow" size={16} className="arrow-ic flip-rtl" /></Link>
                  {serviceByKey(s.key) && <Link to={servicePath(serviceByKey(s.key).slug)} className="btn btn-outline">{t.services.learn}</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section section-dark">
        <div className="container">
          <SectionHead eyebrow={t.process.eyebrow} title={t.process.title} text={t.process.sub} light />
          <Steps />
        </div>
      </section>
      <Cta />
    </>
  )
}
