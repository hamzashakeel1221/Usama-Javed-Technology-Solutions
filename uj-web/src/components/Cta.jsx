import { Link } from './L.jsx'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { intlPhone } from '../content.js'
import Icon from './Icon.jsx'

export default function Cta() {
  const { t } = useLang()
  const { content } = useContent()
  const phone = content.company.phones[0]
  return (
    <section className="cta">
      <svg className="cta-line" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,90 160,50 330,140 520,60 700,150 900,70 1200,120" fill="none" stroke="rgba(245,130,32,.35)" strokeWidth="1.2" />
        {[[160, 50], [330, 140], [520, 60], [700, 150], [900, 70]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill="#f58220" />)}
      </svg>
      <div className="container cta-inner">
        <div className="reveal">
          <span className="eyebrow light">{t.contact.eyebrow}</span>
          <h2 className="h2">{t.cta.title}</h2>
          <p>{t.cta.text}</p>
        </div>
        <div className="cta-actions reveal d2">
          <Link to="/contact" className="btn btn-orange">{t.nav.quote} <Icon name="arrow" size={18} className="arrow-ic flip-rtl" /></Link>
          <a href={`tel:${intlPhone(phone).tel}`} className="btn btn-ghost"><Icon name="phone" size={18} /> <span className="ltr">{phone}</span></a>
        </div>
      </div>
    </section>
  )
}
