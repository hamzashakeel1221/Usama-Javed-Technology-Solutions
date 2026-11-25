import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { defaults } from '../content.js'
import { useContent, merge } from '../ContentContext.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from './Toast.jsx'

const ICONS = ['cable', 'home', 'camera', 'shield', 'wrench', 'building', 'globe', 'tool']
const clone = o => JSON.parse(JSON.stringify(o))

// Two inputs side by side: English + Arabic
function Bi({ label, value, onChange, area, rows = 3, max = 600 }) {
  const Tag = area ? 'textarea' : 'input'
  return (
    <>
      <label>{label} (English)<Tag rows={area ? rows : undefined} maxLength={max} value={value?.en ?? ''} onChange={e => onChange({ ...value, en: e.target.value })} /></label>
      <label>{label} (Arabic)<Tag rows={area ? rows : undefined} maxLength={max} dir="rtl" value={value?.ar ?? ''} onChange={e => onChange({ ...value, ar: e.target.value })} /></label>
    </>
  )
}

export default function AdminContent() {
  const { reload } = useContent()
  const [c, setC] = useState(null)
  const [tab, setTab] = useState('company')
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [toast, show] = useToast()

  useEffect(() => { api.content().then(x => setC(merge(clone(defaults), x || {}))).catch(() => setC(clone(defaults))) }, [])
  if (!c) return <p className="muted">Loading…</p>

  const up = fn => { const n = clone(c); fn(n); setC(n); setDirty(true) }
  const save = async () => {
    setBusy(true); setError('')
    const clean = clone(c)
    clean.services.forEach(s => { s.points = { en: (s.points?.en || []).filter(Boolean), ar: (s.points?.ar || []).filter(Boolean) } })
    clean.company.phones = clean.company.phones.filter(Boolean)
    try { await api.saveContent(clean); setC(clean); setDirty(false); reload(); show('Website content saved and live') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const resetAll = () => { if (window.confirm('Reset all content to the original company profile text? (Saved only when you press Save.)')) { setC(clone(defaults)); setDirty(true) } }

  const tabs = [['company', 'Company & contact'], ['hero', 'Home banner'], ['highlights', 'Highlights'], ['services', 'Services']]
  return (
    <>
      <div className="admin-head">
        <div><h1 className="admin-title">Site content</h1><p className="admin-sub">Change the website text in English and Arabic. Changes go live as soon as you save.</p></div>
        <a className="btn btn-outline btn-sm" href="/" target="_blank" rel="noopener"><Icon name="external" size={16} /> Preview website</a>
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>

      <div className="admin-card form">
        {tab === 'company' && (
          <div className="form-grid">
            <Bi label="Company name" value={c.company.name} onChange={v => up(n => { n.company.name = v })} max={150} />
            <Bi label="Short name (logo)" value={c.company.short} onChange={v => up(n => { n.company.short = v })} max={60} />
            <Bi label="Logo subtitle" value={c.company.tagline} onChange={v => up(n => { n.company.tagline = v })} max={60} />
            <label>Mobile number 1<input dir="ltr" value={c.company.phones[0] ?? ''} onChange={e => up(n => { n.company.phones[0] = e.target.value })} /></label>
            <label>Mobile number 2 <span className="hint">leave empty to hide</span><input dir="ltr" value={c.company.phones[1] ?? ''} onChange={e => up(n => { n.company.phones[1] = e.target.value; n.company.phones = n.company.phones.filter((p, i) => i === 0 || p) })} /></label>
            <label>Email<input type="email" dir="ltr" value={c.company.email} onChange={e => up(n => { n.company.email = e.target.value })} /></label>
            <label>WhatsApp number <span className="hint">digits with country code, e.g. 971563146409</span><input dir="ltr" value={c.company.whatsapp} onChange={e => up(n => { n.company.whatsapp = e.target.value.replace(/\D/g, '') })} /></label>
            <Bi label="Address / service area" value={c.company.address} onChange={v => up(n => { n.company.address = v })} max={150} />
            <Bi label="Working hours" value={c.company.hours} onChange={v => up(n => { n.company.hours = v })} max={100} />
          </div>
        )}
        {tab === 'hero' && (
          <div className="form-grid">
            <Bi label="Headline" value={c.hero.title} onChange={v => up(n => { n.hero.title = v })} area rows={2} max={150} />
            <Bi label="Intro text" value={c.hero.text} onChange={v => up(n => { n.hero.text = v })} area rows={4} max={400} />
          </div>
        )}
        {tab === 'highlights' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <p className="muted small" style={{ margin: 0 }}>The four figures shown under the home banner, e.g. "150+ projects completed".</p>
            {c.highlights.map((h, i) => (
              <div className="repeat" key={i}>
                <div className="repeat-head"><span className="t-title">Highlight {i + 1}</span>
                  <button className="icon-btn" onClick={() => up(n => { n.highlights.splice(i, 1) })} aria-label="Remove"><Icon name="trash" size={16} /></button></div>
                <div className="form-grid">
                  <label className="span-2">Big value<input maxLength={20} value={h.value} onChange={e => up(n => { n.highlights[i].value = e.target.value })} /></label>
                  <Bi label="Label" value={h.label} onChange={v => up(n => { n.highlights[i].label = v })} max={60} />
                </div>
              </div>
            ))}
            {c.highlights.length < 4 && <button className="btn btn-outline btn-sm" style={{ justifySelf: 'start' }} onClick={() => up(n => { n.highlights.push({ value: '', label: { en: '', ar: '' } }) })}><Icon name="plus" size={16} /> Add highlight</button>}
          </div>
        )}
        {tab === 'services' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {c.services.map((s, i) => (
              <div className="repeat" key={i}>
                <div className="repeat-head"><span className="t-title">Service {i + 1}</span>
                  <div className="row-gap">
                    <button className="icon-btn" disabled={i === 0} onClick={() => up(n => { [n.services[i - 1], n.services[i]] = [n.services[i], n.services[i - 1]] })} aria-label="Move up">↑</button>
                    <button className="icon-btn" disabled={i === c.services.length - 1} onClick={() => up(n => { [n.services[i + 1], n.services[i]] = [n.services[i], n.services[i + 1]] })} aria-label="Move down">↓</button>
                    <button className="icon-btn" onClick={() => window.confirm('Remove this service?') && up(n => { n.services.splice(i, 1) })} aria-label="Remove"><Icon name="trash" size={16} /></button>
                  </div>
                </div>
                <div className="form-grid">
                  <label>Icon
                    <select value={s.icon} onChange={e => up(n => { n.services[i].icon = e.target.value })}>{ICONS.map(ic => <option key={ic}>{ic}</option>)}</select>
                  </label>
                  <label>Link id <span className="hint">used in the URL, e.g. cctv</span><input value={s.key} onChange={e => up(n => { n.services[i].key = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} /></label>
                  <Bi label="Short name" value={s.short} onChange={v => up(n => { n.services[i].short = v })} max={60} />
                  <Bi label="Full title" value={s.title} onChange={v => up(n => { n.services[i].title = v })} max={120} />
                  <Bi label="Description" value={s.text} onChange={v => up(n => { n.services[i].text = v })} area rows={5} max={1200} />
                  <label>Key points (English) <span className="hint">one per line</span>
                    <textarea rows={4} value={(s.points?.en || []).join('\n')} onChange={e => up(n => { n.services[i].points = { ...n.services[i].points, en: e.target.value.split('\n') } })} /></label>
                  <label>Key points (Arabic) <span className="hint">one per line</span>
                    <textarea rows={4} dir="rtl" value={(s.points?.ar || []).join('\n')} onChange={e => up(n => { n.services[i].points = { ...n.services[i].points, ar: e.target.value.split('\n') } })} /></label>
                </div>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{ justifySelf: 'start' }} onClick={() => up(n => { n.services.push({ key: `service-${n.services.length + 1}`, icon: 'cable', short: { en: '', ar: '' }, title: { en: '', ar: '' }, text: { en: '', ar: '' }, points: { en: [], ar: [] } }) })}><Icon name="plus" size={16} /> Add service</button>
          </div>
        )}
      </div>

      <div className="save-bar">
        {error && <span className="error">{error}</span>}
        {dirty && !error && <span className="muted small">You have unsaved changes</span>}
        <button className="btn btn-outline btn-sm" onClick={resetAll}>Reset to profile text</button>
        <button className="btn btn-orange btn-sm" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </div>
      {toast}
    </>
  )
}
