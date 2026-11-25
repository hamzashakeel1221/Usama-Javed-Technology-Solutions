import { useState } from 'react'
import { Link } from '../components/L.jsx'
import { useLang } from '../i18n.jsx'
import { categories } from '../content.js'
import useProjects from '../useProjects.js'
import useReveal from '../useReveal.js'
import { PageHero } from '../components/Section.jsx'
import Icon from '../components/Icon.jsx'
import ProjectCard, { ProjectModal } from '../components/ProjectCard.jsx'
import Cta from '../components/Cta.jsx'

export default function Projects() {
  const { t, lang } = useLang()
  const { data, loading } = useProjects()
  const [open, setOpen] = useState(null)
  const [cat, setCat] = useState('all')
  const list = (data || []).filter(p => cat === 'all' || p.category === cat)
  useReveal([data, cat, lang])
  const used = categories.filter(c => (data || []).some(p => p.category === c.key))

  return (
    <>
      <PageHero eyebrow={t.projects.eyebrow} title={t.projects.title} text={t.projects.sub} />
      <section className="section">
        <div className="container">
          {used.length > 1 && (
            <div className="filters" role="tablist">
              <button className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}>{t.projects.allCat}</button>
              {used.map(c => <button key={c.key} className={cat === c.key ? 'active' : ''} onClick={() => setCat(c.key)}>{c[lang]}</button>)}
            </div>
          )}
          {loading ? <p className="muted">{t.common.loading}</p>
            : !list.length ? <p className="muted">{t.projects.empty}</p>
            : <div className="grid-2">{list.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={setOpen} className={`reveal d${(i % 2) + 1}`} />)}</div>}
          <div className="refs reveal">
            <span>{t.projects.refs}</span>
            <Link to="/contact" className="btn btn-orange btn-sm">{t.nav.contact} <Icon name="arrow" size={16} className="arrow-ic flip-rtl" /></Link>
          </div>
        </div>
      </section>
      <Cta />
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </>
  )
}
