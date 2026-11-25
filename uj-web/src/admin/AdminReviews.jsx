import { useState } from 'react'
import { api, statusName } from '../api.js'
import useFetch from '../useFetch.js'
import Stars from '../components/Stars.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from './Toast.jsx'
import { refreshCounts } from './AdminLayout.jsx'

const tabs = ['Pending', 'Approved', 'Rejected', 'All']

export default function AdminReviews() {
  const { data, loading, error, reload } = useFetch(api.adminReviews)
  const [tab, setTab] = useState('Pending')
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const [toast, show] = useToast()
  const list = (data ?? []).filter(r => (tab === 'All' || statusName(r.status) === tab) &&
    (!q || `${r.name} ${r.comment}`.toLowerCase().includes(q.toLowerCase())))
  const count = s => (data ?? []).filter(r => statusName(r.status) === s).length

  const act = async (fn, msg) => { setErr(''); try { await fn(); reload(); refreshCounts(); show(msg) } catch (e) { setErr(e.message) } }

  return (
    <>
      <div className="admin-head">
        <div><h1 className="admin-title">Reviews</h1><p className="admin-sub">New reviews stay hidden until you approve them.</p></div>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {tabs.map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}{t !== 'All' && <span className="tab-count">{count(t)}</span>}</button>)}
        </div>
        <div className="search"><Icon name="search" size={16} /><input placeholder="Search reviews…" value={q} onChange={e => setQ(e.target.value)} /></div>
      </div>
      {(error || err) && <p className="error">{error?.message || err}</p>}
      {loading ? <p className="muted">Loading…</p> : !list.length ? <div className="empty"><Icon name="star" size={40} /><p>No {tab === 'All' ? '' : tab.toLowerCase()} reviews.</p></div> : (
        <div className="admin-list">
          {list.map(r => {
            const s = statusName(r.status)
            return (
              <div className="admin-card" key={r.id}>
                <div className="row-between">
                  <div className="row-gap" style={{ gap: 12 }}>
                    <span className="avatar">{r.name.charAt(0).toUpperCase()}</span>
                    <div><div className="t-title">{r.name}</div><Stars value={r.rating} size={14} /></div>
                  </div>
                  <span className={`badge ${s === 'Approved' ? 'badge-green' : s === 'Rejected' ? 'badge-red' : 'badge-amber'}`}>{s}</span>
                </div>
                <p className="pre" style={{ color: 'var(--ink)' }}>{r.comment}</p>
                <div className="row-between">
                  <small className="muted">{new Date(r.createdAt).toLocaleString()}</small>
                  <div className="row-gap">
                    {s !== 'Approved' && <button className="btn btn-orange btn-xs" onClick={() => act(() => api.setReviewStatus(r.id, 'Approved'), 'Review approved and published')}><Icon name="check" size={14} /> Approve</button>}
                    {s !== 'Rejected' && <button className="btn btn-outline btn-xs" onClick={() => act(() => api.setReviewStatus(r.id, 'Rejected'), 'Review rejected')}>{s === 'Approved' ? 'Unpublish' : 'Reject'}</button>}
                    <button className="btn btn-danger btn-xs" onClick={() => window.confirm('Delete this review permanently?') && act(() => api.deleteReview(r.id), 'Review deleted')}><Icon name="trash" size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {toast}
    </>
  )
}
