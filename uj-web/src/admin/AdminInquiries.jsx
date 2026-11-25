import { useEffect, useState } from 'react'
import { api } from '../api.js'
import useFetch from '../useFetch.js'
import Icon from '../components/Icon.jsx'
import { useToast } from './Toast.jsx'
import { refreshCounts } from './AdminLayout.jsx'

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost']
const badge = { New: 'badge-orange', Contacted: 'badge-blue', Quoted: 'badge-amber', Won: 'badge-green', Lost: 'badge-grey' }

function exportCsv(rows) {
  const cols = ['createdAt', 'name', 'company', 'phone', 'email', 'service', 'propertyType', 'status', 'message', 'notes']
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `uj-inquiries-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click(); URL.revokeObjectURL(url)
}

export default function AdminInquiries() {
  const { data, loading, error, reload, setData } = useFetch(api.inquiries)
  const [sel, setSel] = useState(null)
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const [notes, setNotes] = useState('')
  const [toast, show] = useToast()
  const all = data ?? []
  const list = all.filter(i => (filter === 'All' || (filter === 'Unread' ? !i.isRead : (i.status || 'New') === filter)) &&
    (!q || `${i.name} ${i.company ?? ''} ${i.email} ${i.phone} ${i.message}`.toLowerCase().includes(q.toLowerCase())))
  const current = all.find(i => i.id === sel)
  useEffect(() => { setNotes(current?.notes ?? '') }, [current?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const patchLocal = (id, ch) => setData(d => d.map(x => x.id === id ? { ...x, ...ch } : x))
  const open = async i => {
    setSel(i.id)
    if (!i.isRead) { await api.markRead(i.id); patchLocal(i.id, { isRead: true }); refreshCounts() }
  }
  const setStatus = async status => {
    await api.updateInquiry(current.id, { status, notes: current.notes ?? null })
    patchLocal(current.id, { status }); show(`Marked as ${status}`)
  }
  const saveNotes = async () => {
    await api.updateInquiry(current.id, { status: current.status || 'New', notes: notes || null })
    patchLocal(current.id, { notes }); show('Notes saved')
  }
  const remove = async i => {
    if (!window.confirm(`Delete the inquiry from ${i.name}? This cannot be undone.`)) return
    await api.deleteInquiry(i.id); setSel(null); reload(); refreshCounts(); show('Inquiry deleted')
  }
  const filters = ['All', 'Unread', ...INQUIRY_STATUSES]
  const cnt = f => f === 'All' ? all.length : f === 'Unread' ? all.filter(i => !i.isRead).length : all.filter(i => (i.status || 'New') === f).length

  return (
    <>
      <div className="admin-head">
        <div><h1 className="admin-title">Inquiries</h1><p className="admin-sub">Quote requests from the contact form. Track each lead from new to won.</p></div>
        <button className="btn btn-outline btn-sm" onClick={() => exportCsv(list)} disabled={!list.length}><Icon name="download" size={16} /> Export CSV</button>
      </div>
      <div className="toolbar">
        <div className="tabs">{filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}<span className="tab-count">{cnt(f)}</span></button>)}</div>
        <div className="search"><Icon name="search" size={16} /><input placeholder="Search name, email, phone…" value={q} onChange={e => setQ(e.target.value)} /></div>
      </div>
      {error && <p className="error">{error.message}</p>}
      {loading ? <p className="muted">Loading…</p> : !list.length ? <div className="empty"><Icon name="inbox" size={40} /><p>No inquiries here.</p></div> : (
        <div className="inbox">
          <ul className="inbox-list admin-card" style={{ padding: 6 }}>
            {list.map(i => (
              <li key={i.id}>
                <button className={`${sel === i.id ? 'active' : ''} ${i.isRead ? '' : 'unread'}`} onClick={() => open(i)}>
                  <span className="row-between"><span className="t-title">{i.name}</span><small className="t-sub">{new Date(i.createdAt).toLocaleDateString()}</small></span>
                  <span className="row-between"><span className="t-sub">{i.service} · {i.propertyType}</span><span className={`badge ${badge[i.status || 'New']}`}>{i.status || 'New'}</span></span>
                  <span className="clip">{i.message}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="admin-card inbox-detail">
            {!current ? <div className="empty" style={{ border: 0 }}><Icon name="mail" size={40} /><p>Select an inquiry to read it.</p></div> : (
              <>
                <div className="row-between">
                  <div><h2 className="h3" style={{ margin: 0 }}>{current.name}</h2>{current.company && <span className="muted">{current.company}</span>}</div>
                  <button className="btn btn-danger btn-xs" onClick={() => remove(current)}><Icon name="trash" size={14} /> Delete</button>
                </div>
                <dl className="kv">
                  <dt>Email</dt><dd><a href={`mailto:${current.email}`}>{current.email}</a></dd>
                  <dt>Phone</dt><dd><a href={`tel:${current.phone}`}>{current.phone}</a></dd>
                  <dt>Service</dt><dd>{current.service}</dd>
                  <dt>Property</dt><dd>{current.propertyType}</dd>
                  <dt>Received</dt><dd>{new Date(current.createdAt).toLocaleString()}</dd>
                </dl>
                <p className="pre message">{current.message}</p>
                <div className="row-gap" style={{ marginBottom: 24 }}>
                  <a className="btn btn-primary btn-sm" href={`mailto:${current.email}?subject=${encodeURIComponent('Your quote request – Usama Javed Technology Solution')}`}><Icon name="mail" size={16} /> Reply by email</a>
                  <a className="btn btn-whatsapp btn-sm" href={`https://wa.me/${current.phone.replace(/\D/g, '').replace(/^0/, '971')}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={16} /> WhatsApp</a>
                  <a className="btn btn-outline btn-sm" href={`tel:${current.phone}`}><Icon name="phone" size={16} /> Call</a>
                </div>
                <div className="field" style={{ marginBottom: 18 }}><span className="t-title">Lead status</span>
                  <div className="status-picker">{INQUIRY_STATUSES.map(s => <button key={s} className={(current.status || 'New') === s ? 'active' : ''} onClick={() => setStatus(s)}>{s}</button>)}</div>
                </div>
                <div className="form">
                  <label>Private notes <span className="hint">only visible to admins</span>
                    <textarea rows={4} maxLength={4000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Site visit booked for Tuesday, quoted AED 4,500" />
                  </label>
                  <div className="row-gap end"><button className="btn btn-orange btn-sm" onClick={saveNotes} disabled={notes === (current.notes ?? '')}>Save notes</button></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {toast}
    </>
  )
}
