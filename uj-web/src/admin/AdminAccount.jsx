import { useState } from 'react'
import { api } from '../api.js'
import { useToast } from './Toast.jsx'

export default function AdminAccount() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [toast, show] = useToast()
  const set = k => e => setF({ ...f, [k]: e.target.value })

  const submit = async e => {
    e.preventDefault(); setError('')
    if (f.next.length < 8) return setError('The new password must be at least 8 characters.')
    if (f.next !== f.confirm) return setError('The two new passwords do not match.')
    setBusy(true)
    try { await api.changePassword(f.current, f.next); setF({ current: '', next: '', confirm: '' }); show('Password changed') }
    catch (err) { setError(err.status === 400 ? (err.message || 'The current password is wrong.') : err.status === 429 ? 'Too many attempts. Try again in a few minutes.' : err.message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <div className="admin-head"><div><h1 className="admin-title">Account</h1><p className="admin-sub">Keep your admin login secure.</p></div></div>
      <form className="admin-card form" style={{ maxWidth: 520 }} onSubmit={submit}>
        <h2>Change password</h2>
        <label>Current password<input type="password" required autoComplete="current-password" value={f.current} onChange={set('current')} /></label>
        <label>New password <span className="hint">at least 8 characters</span><input type="password" required autoComplete="new-password" value={f.next} onChange={set('next')} /></label>
        <label>Confirm new password<input type="password" required autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-orange btn-sm" style={{ justifySelf: 'start' }} disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
      {toast}
    </>
  )
}
