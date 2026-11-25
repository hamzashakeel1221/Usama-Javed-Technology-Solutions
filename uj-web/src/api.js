// Small fetch wrapper for the UJ.Api backend.
// In dev, Vite proxies /api to the API. In production the site is served by the API itself.
const BASE = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'uj-admin-token'

export const auth = {
  get token() { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set(token) { try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ } },
  clear() { try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } },
  get isLoggedIn() {
    const tok = this.token
    if (!tok) return false
    try {
      const { exp } = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return !exp || exp * 1000 > Date.now()
    } catch { return false }
  },
}

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

async function request(path, { method = 'GET', body, admin = false, form } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (admin && auth.token) headers.Authorization = `Bearer ${auth.token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  })

  if (res.status === 401 && admin) {
    auth.clear()
    window.dispatchEvent(new Event('uj-logout'))
  }
  if (!res.ok) {
    let msg = res.statusText
    try {
      const text = await res.text()
      if (text) {
        try {
          const j = JSON.parse(text)
          msg = j.title || j.detail || (j.errors && Object.values(j.errors).flat().join(' ')) || text
        } catch { msg = text }
      }
    } catch { /* ignore */ }
    throw new ApiError(res.status, msg)
  }
  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// The API returns review status as a number (0,1,2) unless a string enum converter is added.
export const STATUS = ['Pending', 'Approved', 'Rejected']
export const statusName = s => (typeof s === 'number' ? STATUS[s] : s)

export const api = {
  // public
  projects: () => request('/api/projects'),
  reviews: () => request('/api/reviews'),
  submitReview: data => request('/api/reviews', { method: 'POST', body: data }),
  submitInquiry: data => request('/api/inquiries', { method: 'POST', body: data }),

  content: () => request('/api/content'),

  // admin
  saveContent: c => request('/api/admin/content', { method: 'PUT', body: c, admin: true }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/admin/account/password', { method: 'PUT', body: { currentPassword, newPassword }, admin: true }),
  updateInquiry: (id, data) => request(`/api/admin/inquiries/${id}`, { method: 'PUT', body: data, admin: true }),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  stats: () => request('/api/admin/stats', { admin: true }),

  adminProjects: () => request('/api/admin/projects', { admin: true }),
  createProject: p => request('/api/admin/projects', { method: 'POST', body: p, admin: true }),
  updateProject: (id, p) => request(`/api/admin/projects/${id}`, { method: 'PUT', body: p, admin: true }),
  deleteProject: id => request(`/api/admin/projects/${id}`, { method: 'DELETE', admin: true }),
  uploadImage: file => {
    const form = new FormData()
    form.append('file', file)
    return request('/api/admin/projects/upload', { method: 'POST', form, admin: true })
  },

  adminReviews: () => request('/api/admin/reviews', { admin: true }),
  // Sent as a number so it works with the API's default JSON settings.
  setReviewStatus: (id, status) =>
    request(`/api/admin/reviews/${id}/status`, { method: 'PUT', body: { status: STATUS.indexOf(status) }, admin: true }),
  deleteReview: id => request(`/api/admin/reviews/${id}`, { method: 'DELETE', admin: true }),

  inquiries: () => request('/api/admin/inquiries', { admin: true }),
  markRead: id => request(`/api/admin/inquiries/${id}/read`, { method: 'PUT', admin: true }),
  deleteInquiry: id => request(`/api/admin/inquiries/${id}`, { method: 'DELETE', admin: true }),
}

export const imageSrc = url => (!url ? '' : /^https?:\/\//.test(url) ? url : BASE + url)
