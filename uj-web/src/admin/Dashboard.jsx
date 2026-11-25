import { Link } from 'react-router-dom'
import { api, statusName } from '../api.js'
import useFetch from '../useFetch.js'
import Icon from '../components/Icon.jsx'
import Stars from '../components/Stars.jsx'
import { INQUIRY_STATUSES } from './AdminInquiries.jsx'

const fetchAll = () => Promise.all([api.adminProjects(), api.adminReviews(), api.inquiries()])
  .then(([projects, reviews, inquiries]) => ({ projects, reviews, inquiries }))

export default function Dashboard() {
  const { data, loading, error } = useFetch(fetchAll)
  const p = data?.projects ?? [], r = data?.reviews ?? [], q = data?.inquiries ?? []
  const approved = r.filter(x => statusName(x.status) === 'Approved')
  const avg = approved.length ? (approved.reduce((a, x) => a + x.rating, 0) / approved.length).toFixed(1) : '–'
  const hour = new Date().getHours()
  const tiles = [
    ['New inquiries', q.filter(i => !i.isRead).length, 'inbox', '/admin/inquiries'],
    ['Reviews to moderate', r.filter(x => statusName(x.status) === 'Pending').length, 'star', '/admin/reviews'],
    ['Published projects', p.filter(x => x.isPublished).length, 'building', '/admin/projects'],
    ['Average rating', avg, 'shield', '/admin/reviews'],
  ]
  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="admin-title">Good {hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'} 👋</h1>
          <p className="admin-sub">Here is what is happening on your website.</p>
        </div>
        <div className="row-gap">
          <Link className="btn btn-outline btn-sm" to="/admin/content"><Icon name="edit" size={16} /> Edit site content</Link>
          <Link className="btn btn-orange btn-sm" to="/admin/projects?new=1"><Icon name="plus" size={16} /> Add project</Link>
        </div>
      </div>
      {error && <p className="error">Could not load data: {error.message}</p>}
      <div className="tiles">
        {tiles.map(([label, num, icon, to]) => (
          <Link to={to} className="tile" key={label}>
            <span className="tile-top"><span className="tile-icon"><Icon name={icon} /></span><Icon name="arrow" size={16} className="muted" /></span>
            <span className="tile-num">{loading ? '–' : num}</span>
            <span className="tile-label">{label}</span>
          </Link>
        ))}
      </div>
      <div className="dash-grid">
        <div className="admin-card">
          <div className="row-between"><h2>Latest inquiries</h2><Link to="/admin/inquiries" className="link-arrow small">Open inbox <Icon name="arrow" size={14} /></Link></div>
          {!q.length ? <p className="muted">No inquiries yet.</p> : (
            <ul className="mini-list">
              {q.slice(0, 5).map(i => (
                <li key={i.id}>
                  <span><span className="t">{i.name}</span><br /><span className="t-sub">{i.service} · {i.propertyType}</span></span>
                  <span className="t-sub">{new Date(i.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <h2 style={{ marginTop: 24 }}>Sales pipeline</h2>
          <div className="pipeline">
            {INQUIRY_STATUSES.map(s => <div className="pipe" key={s}><strong>{q.filter(i => (i.status || 'New') === s).length}</strong><small>{s}</small></div>)}
          </div>
        </div>
        <div className="admin-card">
          <div className="row-between"><h2>Reviews waiting for approval</h2><Link to="/admin/reviews" className="link-arrow small">Moderate <Icon name="arrow" size={14} /></Link></div>
          {!r.filter(x => statusName(x.status) === 'Pending').length ? <p className="muted">All caught up. 🎉</p> : (
            <ul className="mini-list">
              {r.filter(x => statusName(x.status) === 'Pending').slice(0, 5).map(x => (
                <li key={x.id}><span><span className="t">{x.name}</span> <Stars value={x.rating} size={12} /><br /><span className="t-sub">{x.comment.slice(0, 70)}{x.comment.length > 70 ? '…' : ''}</span></span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
