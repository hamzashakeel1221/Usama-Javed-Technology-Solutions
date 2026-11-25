import { Link } from './L.jsx'
import { serviceByKey, servicePath } from '../servicePages.js'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { about, intlPhone } from '../content.js'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

export default function Footer() {
  const { t, pick, lang } = useLang()
  const { content } = useContent()
  const c = content.company
  return (
    <>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-about">
            <Logo light />
            <p>{pick(about.mission)}</p>
          </div>
          <div>
            <h3>{t.footer.quick}</h3>
            <ul>
              {['about', 'projects', 'reviews', 'contact'].map(k => <li key={k}><Link to={`/${k}`}>{t.nav[k]}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3>{t.footer.services}</h3>
            <ul>
              {content.services.map(s => <li key={s.key}><Link to={serviceByKey(s.key) ? servicePath(serviceByKey(s.key).slug) : `/services#${s.key}`}>{s.short?.[lang] || s.title[lang]}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3>{t.footer.contact}</h3>
            <ul className="footer-contact">
              {c.phones.map(p => <li key={p}><Icon name="phone" size={16} /><a href={`tel:${intlPhone(p).tel}`} className="ltr">{p}</a></li>)}
              <li><Icon name="mail" size={16} /><a href={`mailto:${c.email}`}>{c.email}</a></li>
              <li><Icon name="pin" size={16} /><span>{pick(c.address)}</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <span>© {new Date().getFullYear()} {pick(c.name)}. {t.footer.rights}</span>
            <span>{t.footer.line}</span>
          </div>
        </div>
      </footer>
      <a className="wa-float" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label={t.contact.whatsapp}>
        <Icon name="chat" size={28} />
      </a>
    </>
  )
}
