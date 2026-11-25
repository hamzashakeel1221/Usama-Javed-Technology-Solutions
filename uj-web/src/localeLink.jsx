// Drop-in replacements for react-router's Link and NavLink that keep the
// visitor in their language: on Arabic pages, to="/contact" goes to /ar/contact.
import { Link as RouterLink, NavLink as RouterNavLink } from 'react-router-dom'
import { useLang } from './i18n.jsx'
import { withLang } from './seo.js'

const localize = (to, lang) => {
  if (typeof to !== 'string' || !to.startsWith('/')) return to
  const [, path, rest] = to.match(/^([^?#]*)(.*)$/)
  return withLang(path || '/', lang) + rest
}

export function Link({ to, ...props }) {
  const { lang } = useLang()
  return <RouterLink to={localize(to, lang)} {...props} />
}

export function NavLink({ to, ...props }) {
  const { lang } = useLang()
  return <RouterNavLink to={localize(to, lang)} {...props} />
}
