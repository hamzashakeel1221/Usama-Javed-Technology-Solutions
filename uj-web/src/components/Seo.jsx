import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { headFor } from '../seo.js'
import { useContent } from '../ContentContext.jsx'

// Keeps <title>, meta description, canonical/hreflang links, social tags and
// structured data in sync with the current page while the visitor navigates.
export default function Seo() {
  const { pathname } = useLocation()
  const { content } = useContent()
  useEffect(() => {
    const isAdmin = pathname.startsWith('/admin')
    const h = isAdmin ? { title: 'Admin | Usama Javed Technology Solution', desc: '', robots: 'noindex, nofollow', links: [], og: [], ld: [] } : headFor(pathname, content)
    const head = document.head
    document.title = h.title
    head.querySelectorAll('[data-seo]').forEach(e => e.remove())
    // remove pre-rendered tags so they are not duplicated
    head.querySelectorAll('meta[name="description"],meta[name="robots"],link[rel="canonical"],link[rel="alternate"][hreflang],meta[property^="og:"],meta[name^="twitter:"],script[type="application/ld+json"]').forEach(e => e.remove())
    const add = (tag, attrs, text) => {
      const el = document.createElement(tag)
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      el.setAttribute('data-seo', '')
      if (text) el.textContent = text
      head.appendChild(el)
    }
    if (h.desc) add('meta', { name: 'description', content: h.desc })
    add('meta', { name: 'robots', content: h.robots })
    h.links.forEach(l => add('link', l))
    h.og.forEach(([k, n, v]) => add('meta', { [k]: n, content: v }))
    h.ld.forEach(d => add('script', { type: 'application/ld+json' }, JSON.stringify(d)))
  }, [pathname, content])
  return null
}
