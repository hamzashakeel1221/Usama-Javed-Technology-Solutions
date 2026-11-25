import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link, NavLink } from './L.jsx'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { intlPhone } from '../content.js'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

export default function Header() {
  const { t, toggle, pick } = useLang()
  const { content } = useContent()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const c = content.company

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['about', 'services', 'projects', 'reviews', 'contact']
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-group">
            <span><Icon name="pin" size={14} /> {pick(c.address)}</span>
            <span><Icon name="clock" size={14} /> {pick(c.hours)}</span>
          </div>
          <div className="topbar-group">
            {c.phones.map(p => { const n = intlPhone(p); return <a key={p} href={`tel:${n.tel}`}><Icon name="phone" size={14} /> <span className="ltr">{p}</span></a> })}
            <a href={`mailto:${c.email}`}><Icon name="mail" size={14} /> {c.email}</a>
          </div>
        </div>
      </div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" aria-label={pick(c.name)}><Logo /></Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            <NavLink to="/" end>{t.nav.home}</NavLink>
            {links.map(k => <NavLink key={k} to={`/${k}`}>{t.nav[k]}</NavLink>)}
            <Link className="btn btn-orange btn-sm nav-cta" to="/contact">{t.nav.quote}</Link>
          </nav>
          <div className="header-actions">
            <button className="lang-btn" onClick={toggle} aria-label="Switch language / تغيير اللغة">
              <Icon name="globe" size={17} /> <span>{t.lang}</span>
            </button>
            <button className="menu-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu">
              <Icon name={open ? 'close' : 'menu'} size={26} />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
