import { Link } from './L.jsx'
import { useLang } from '../i18n.jsx'
import Icon from './Icon.jsx'

export default function SectionHead({ eyebrow, title, text, center = true, light = false }) {
  return (
    <div className={`section-head reveal ${center ? 'center' : ''}`}>
      {eyebrow && <span className={`eyebrow ${light ? 'light' : ''}`}>{eyebrow}</span>}
      <h2 className="h2">{title}</h2>
      {text && <p className="lead">{text}</p>}
    </div>
  )
}

export function PageHero({ eyebrow, title, text }) {
  const { t } = useLang()
  return (
    <section className="page-hero">
      <div className="hero-grid-bg" />
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">{t.nav.home}</Link>
          <Icon name="arrow" size={12} className="flip-rtl" />
          <span>{title}</span>
        </nav>
        {eyebrow && <span className="eyebrow light">{eyebrow}</span>}
        <h1 className="h1">{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </section>
  )
}
