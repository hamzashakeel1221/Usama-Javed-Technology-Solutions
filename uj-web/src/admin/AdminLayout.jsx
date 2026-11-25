import { useEffect, useState, useCallback } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api, auth, statusName } from '../api.js'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'

export default function AdminLayout() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [, force] = useState(0)
  const [open, setOpen] = useState(false)
  const [counts, setCounts] = useState({ inquiries: 0, reviews: 0 })
  const name = (() => { try { return localStorage.getItem('uj-admin-name') || 'Admin' } catch { return 'Admin' } })()

  const loadCounts = useCallback(() => {
    if (!auth.isLoggedIn) return
    api.stats().then(s => setCounts({ inquiries: s.newInquiries, reviews: s.pendingReviews })).catch(() => {})
  }, [])

  useEffect(() => {
    const onLogout = () => force(n => n + 1)
    window.addEventListener('uj-logout', onLogout)
    window.addEventListener('uj-refresh-counts', loadCounts)
    return () => { window.removeEventListener('uj-logout', onLogout); window.removeEventListener('uj-refresh-counts', loadCounts) }
  }, [loadCounts])
  useEffect(() => { loadCounts(); setOpen(false) }, [pathname, loadCounts])

  if (!auth.isLoggedIn) return <Navigate to="/admin/login" replace />

  const logout = () => { auth.clear(); nav('/admin/login', { replace: true }) }
  const main = [
    ['/admin', 'dashboard', 'Dashboard', true],
    ['/admin/projects', 'building', 'Projects'],
    ['/admin/reviews', 'star', 'Reviews', false, counts.reviews],
    ['/admin/inquiries', 'inbox', 'Inquiries', false, counts.inquiries],
  ]
  const settings = [
    ['/admin/content', 'edit', 'Site content'],
    ['/admin/account', 'settings', 'Account'],
  ]
  const link = ([to, icon, label, end, badge]) => (
    <NavLink key={to} to={to} end={end}><Icon name={icon} size={19} /> {label}{badge > 0 && <span className="nav-badge">{badge}</span>}</NavLink>
  )
  return (
    <div className="admin" dir="ltr">
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <div className="admin-brand"><Logo light /></div>
        <div className="label">Manage</div>
        <nav>{main.map(link)}</nav>
        <div className="label">Settings</div>
        <nav>{settings.map(link)}</nav>
        <div className="admin-side-foot">
          <a href="/" target="_blank" rel="noopener"><Icon name="external" size={18} /> View website</a>
          <button onClick={logout}><Icon name="logout" size={18} /> Sign out</button>
        </div>
      </aside>
      {open && <div className="modal-backdrop" style={{ zIndex: 70, background: 'rgba(6,18,36,.4)' }} onClick={() => setOpen(false)} />}
      <div className="admin-main">
        <header className="admin-top">
          <button className="menu-btn icon-btn" onClick={() => setOpen(o => !o)} aria-label="Menu"><Icon name="menu" /></button>
          <span className="muted small">Usama Javed Technology Solution · Admin portal</span>
          <span className="admin-user"><span className="avatar">{name.charAt(0).toUpperCase()}</span>{name}</span>
        </header>
        <div className="admin-content"><Outlet /></div>
      </div>
    </div>
  )
}

export const refreshCounts = () => window.dispatchEvent(new Event('uj-refresh-counts'))
export { statusName }
