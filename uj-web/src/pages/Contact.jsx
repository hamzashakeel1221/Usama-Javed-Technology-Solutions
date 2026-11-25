import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'
import { api } from '../api.js'
import { propertyTypes, intlPhone } from '../content.js'
import useReveal from '../useReveal.js'
import { PageHero } from '../components/Section.jsx'
import Icon from '../components/Icon.jsx'

const empty = { name: '', company: '', phone: '', email: '', service: '', propertyType: '', message: '', website: '' }

export default function Contact() {
  const { t, lang, pick } = useLang()
  const { content } = useContent()
  const [params] = useSearchParams()
  const preset = content.services.find(s => s.key === params.get('service'))
  const [form, setForm] = useState({ ...empty, service: preset ? (preset.short?.en || preset.title.en) : '' })
  const [state, setState] = useState('idle')
  const set = k => e => setForm({ ...form, [k]: e.target.value })
  useReveal([lang])
  const c = content.company

  const submit = async e => {
    e.preventDefault()
    setState('sending')
    try {
      await api.submitInquiry({ ...form, company: form.company || null })
      setState('done')
      setForm(empty)
    } catch (err) { setState(err.status === 429 ? 'limit' : 'error') }
  }

  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.title} text={t.contact.sub} />
      <section className="section">
        <div className="container contact-layout">
          <aside className="contact-panel reveal">
            <h2>{pick(c.name)}</h2>
            {c.phones.map(p => (
              <a key={p} href={`tel:${intlPhone(p).tel}`} className="info-item"><span className="ic"><Icon name="phone" /></span><div><small>{t.contact.mobile}</small><strong className="ltr">{p}</strong></div></a>
            ))}
            <a href={`mailto:${c.email}`} className="info-item"><span className="ic"><Icon name="mail" /></span><div><small>{t.contact.mail}</small><strong>{c.email}</strong></div></a>
            <div className="info-item"><span className="ic"><Icon name="pin" /></span><div><small>{t.contact.area}</small><strong>{pick(c.address)}</strong></div></div>
            <div className="info-item"><span className="ic"><Icon name="clock" /></span><div><small>{t.contact.hours}</small><strong>{pick(c.hours)}</strong></div></div>
            <a className="btn btn-whatsapp btn-block" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ marginTop: 8 }}>
              <Icon name="chat" size={18} /> {t.contact.whatsapp}
            </a>
          </aside>

          <div className="form-card reveal d2">
            {state === 'done' ? (
              <div className="done-box"><span className="ic-circle"><Icon name="check" size={30} /></span><p>{t.contact.thanks}</p></div>
            ) : (
              <form onSubmit={submit} className="form">
                <h2 className="h3">{t.contact.formTitle}</h2>
                <div className="form-grid">
                  <label>{t.contact.name}<input required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} /></label>
                  <label>{t.contact.company}<input maxLength={100} autoComplete="organization" value={form.company} onChange={set('company')} /></label>
                  <label>{t.contact.phone}<input required type="tel" maxLength={30} autoComplete="tel" dir="ltr" placeholder="05X XXX XXXX" value={form.phone} onChange={set('phone')} /></label>
                  <label>{t.contact.email}<input required type="email" maxLength={150} autoComplete="email" dir="ltr" value={form.email} onChange={set('email')} /></label>
                  <label>{t.contact.service}
                    <select required value={form.service} onChange={set('service')}>
                      <option value="">{t.contact.choose}</option>
                      {content.services.map(s => { const v = s.short?.en || s.title.en; return <option key={s.key} value={v}>{s.short?.[lang] || s.title[lang]}</option> })}
                      <option value="Other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                    </select>
                  </label>
                  <label>{t.contact.property}
                    <select required value={form.propertyType} onChange={set('propertyType')}>
                      <option value="">{t.contact.choose}</option>
                      {propertyTypes.map(p => <option key={p.key} value={p.en}>{p[lang]}</option>)}
                    </select>
                  </label>
                  <label className="span-2">{t.contact.message}
                    <textarea required maxLength={2000} rows={6} value={form.message} onChange={set('message')} />
                  </label>
                </div>
                <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set('website')} />
                {state === 'error' && <p className="error">{t.common.error}</p>}
                {state === 'limit' && <p className="error">{t.common.tooMany}</p>}
                <button className="btn btn-orange btn-block" disabled={state === 'sending'}>
                  {state === 'sending' ? t.common.sending : t.contact.send} <Icon name="arrow" size={18} className="arrow-ic flip-rtl" />
                </button>
                <p className="muted small center" style={{ margin: 0 }}>{t.contact.privacy}</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
