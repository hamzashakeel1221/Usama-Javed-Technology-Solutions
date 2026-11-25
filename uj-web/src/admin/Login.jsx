import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, auth } from '../api.js'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icon.jsx'
import { HeroNet } from '../components/HeroVisual.jsx'

export default function Login() {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (auth.isLoggedIn) return <Navigate to="/admin" replace />

  const submit = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const { token } = await api.login(username, password)
      auth.set(token)
      try { localStorage.setItem('uj-admin-name', username) } catch { /* ignore */ }
      nav('/admin', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Wrong username or password.'
        : err.status === 429 ? 'Too many attempts. Wait 5 minutes and try again.'
        : 'Could not reach the server. Is the API running?')
    } finally { setBusy(false) }
  }

  return (
    <div className="login-page" dir="ltr">
      <aside className="login-side">
        <HeroNet />
        <Logo light />
        <div style={{ position: 'relative' }}>
          <h2>Manage your website from one place.</h2>
          <p>Projects, client reviews, quote requests and website content — all in the UJ admin portal.</p>
        </div>
        <small style={{ position: 'relative', color: 'rgba(255,255,255,.45)' }}>Usama Javed Technology Solution</small>
      </aside>
      <main className="login-main">
        <form className="login-card form" onSubmit={submit}>
          <div>
            <h1>Welcome back</h1>
            <p className="muted" style={{ margin: 0 }}>Sign in to the admin portal.</p>
          </div>
          <label>Username<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label>
          <label>Password
            <span className="pw-wrap">
              <input required type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" className="icon-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon name="key" size={18} /></button>
            </span>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-orange btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <a href="/" className="link-arrow small" style={{ justifySelf: 'center' }}>Back to website</a>
        </form>
      </main>
    </div>
  )
}
