// Language-aware links: when the Arabic site is open (/ar/...), every internal
// link stays in Arabic. Each language gets its own URL so Google can index both.
import { Link as RLink, NavLink as RNavLink } from 'react-router-dom'
import { useLang } from '../i18n.jsx'

export const localize = (to, lang) => {
  if (lang !== 'ar' || typeof to !== 'string' || !to.startsWith('/')) return to
  return to === '/' ? '/ar' : to.startsWith('/?') || to.startsWith('/#') ? '/ar' + to.slice(1) : '/ar' + to
}

export function Link({ to, ...rest }) {
  const { lang } = useLang()
  return <RLink to={localize(to, lang)} {...rest} />
}

export function NavLink({ to, ...rest }) {
  const { lang } = useLang()
  return <RNavLink to={localize(to, lang)} {...rest} />
}
