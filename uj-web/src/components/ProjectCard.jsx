import { useEffect } from 'react'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { imageSrc } from '../api.js'
import { categories, projectStatuses } from '../content.js'
import Icon from './Icon.jsx'

const iconFor = (services, cat) => services.find(s => s.key === cat)?.icon || 'cable'

function Media({ project, title }) {
  const { content } = useContent()
  return (
    <div className="proj-img">
      {project.imageUrl
        ? <img src={imageSrc(project.imageUrl)} alt={title} loading="lazy" />
        : <span className="ph"><span className="ic-circle"><Icon name={iconFor(content.services, project.category)} size={36} /></span></span>}
    </div>
  )
}

export function useProjectText(p) {
  const { lang } = useLang()
  const cat = categories.find(c => c.key === p.category)
  const st = projectStatuses.find(s => s.key === p.status)
  return {
    title: lang === 'ar' ? p.titleAr : p.titleEn,
    desc: lang === 'ar' ? p.descriptionAr : p.descriptionEn,
    cat: cat ? cat[lang] : p.category,
    status: st ? st[lang] : p.status,
  }
}

function Meta({ project, text }) {
  const { t } = useLang()
  return (
    <dl className="proj-meta">
      <div><dt>{t.projects.status}</dt><dd>{text.status}</dd></div>
      {project.year && <div><dt>{t.projects.year}</dt><dd>{project.year}</dd></div>}
      {project.partner && <div><dt>{t.projects.partner}</dt><dd>{project.partner}</dd></div>}
    </dl>
  )
}

export default function ProjectCard({ project, index, onOpen, className = '' }) {
  const { t } = useLang()
  const text = useProjectText(project)
  return (
    <button className={`proj ${className}`} onClick={() => onOpen?.(project)}>
      <Media project={project} title={text.title} />
      <span className={`proj-badge ${project.status === 'Ongoing' ? 'ongoing' : ''}`}>{text.status}{project.year ? ` • ${project.year}` : ''}</span>
      <div className="proj-body">
        <span className="proj-kicker">{t.projects.project} {String(index + 1).padStart(2, '0')} · {text.cat}</span>
        <h3>{text.title}</h3>
        {project.location && <span className="proj-loc"><Icon name="pin" size={16} /> {project.location}</span>}
        <Meta project={project} text={text} />
      </div>
    </button>
  )
}

export function ProjectModal({ project, onClose }) {
  const { t } = useLang()
  useEffect(() => {
    if (!project) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [project, onClose])
  if (!project) return null
  return <ModalInner project={project} onClose={onClose} t={t} />
}

function ModalInner({ project, onClose, t }) {
  const text = useProjectText(project)
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={text.title}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t.common.close}><Icon name="close" /></button>
        <Media project={project} title={text.title} />
        <div className="modal-body">
          <span className="proj-kicker">{text.cat}</span>
          <h2 className="h2" style={{ marginTop: 6 }}>{text.title}</h2>
          {project.location && <span className="proj-loc"><Icon name="pin" size={16} /> {project.location}</span>}
          <p className="lead pre" style={{ marginTop: 18 }}>{text.desc}</p>
          <Meta project={project} text={text} />
        </div>
      </div>
    </div>
  )
}
