import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { about } from '../content.js'
import useReveal from '../useReveal.js'
import { LogoMark } from '../components/Logo.jsx'
import Icon from '../components/Icon.jsx'
import SectionHead, { PageHero } from '../components/Section.jsx'
import Cta from '../components/Cta.jsx'
import { Steps, WhyGrid } from './Home.jsx'

export default function About() {
  const { t, pick, lang } = useLang()
  const { content } = useContent()
  useReveal([lang])
  return (
    <>
      <PageHero eyebrow={t.about.eyebrow} title={t.about.title} text={t.about.sub} />
      <section className="section">
        <div className="container split">
          <div className="reveal">
            <p className="lead" style={{ color: 'var(--ink)', fontSize: '1.2rem' }}>{pick(about.p1)}</p>
            <p className="lead" style={{ marginTop: 20 }}>{pick(about.p2)}</p>
          </div>
          <figure className="about-visual reveal d2">
            <span className="big-mark"><LogoMark size={84} id="abm2" /></span>
            <blockquote><Icon name="quote" size={34} />{pick(about.promise)}</blockquote>
            <figcaption>{pick(content.company.name)}</figcaption>
          </figure>
        </div>
        <div className="container mv" style={{ marginTop: 64 }}>
          <div className="mv-card reveal"><h3>{t.about.mission}</h3><p>{pick(about.mission)}</p></div>
          <div className="mv-card reveal d1"><h3>{t.about.approach}</h3><p>{pick(about.approach)}</p></div>
        </div>
      </section>
      <section className="section section-dark">
        <div className="container">
          <SectionHead eyebrow={t.process.eyebrow} title={t.process.title} text={t.process.sub} light />
          <Steps />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t.why.eyebrow} title={t.why.title} text={t.why.sub} />
          <WhyGrid />
        </div>
      </section>
      <Cta />
    </>
  )
}
