// In-browser stand-in for UJ.Api, used only in development when the API is not running.
// Data is kept in localStorage under "uj-demo-db". Clear it to start over.
import { seedProjects } from './content.js'

const KEY = 'uj-demo-db'
const now = () => new Date().toISOString()

function seed() {
  return {
    nextId: 100,
    content: {},
    projects: seedProjects.map(p => ({ ...p })),
    reviews: [
      { id: 1, name: 'Sample review (demo)', company: 'Villa owner, Dubai', rating: 5, comment: 'This is a sample review so you can see how reviews look. Real reviews appear here once clients submit them and you approve them.', status: 'Approved', isFeatured: true, createdAt: now() },
      { id: 2, name: 'Pending sample (demo)', company: '', rating: 4, comment: 'A sample review waiting for approval in the admin portal.', status: 'Pending', isFeatured: false, createdAt: now() },
    ],
    inquiries: [
      { id: 1, name: 'Sample inquiry (demo)', company: '', phone: '+971 50 000 0000', email: 'client@example.com', service: 'CCTV Installation & Security Systems', propertyType: 'Villa', message: 'This is a sample inquiry so you can try the inbox.', isRead: false, stage: 'New', notes: '', createdAt: now() },
    ],
  }
}

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.projects) return d } catch { /* ignore */ }
  const d = seed(); save(d); return d
}
function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* storage full */ } }

const err = (status, message) => Object.assign(new Error(message), { status })
const delay = v => new Promise(r => setTimeout(() => r(v), 120))
const fakeToken = user => {
  const b = o => btoa(JSON.stringify(o)).replace(/=+$/, '')
  return `${b({ alg: 'none' })}.${b({ unique_name: user, exp: Math.floor(Date.now() / 1000) + 8 * 3600 })}.demo`
}
const fileToDataUrl = file => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
})

export const demo = {
  async handle(path, { method, body, form }) {
    const d = load()
    const m = path.match(/^\/api\/(.+?)\/?$/)
    const p = m ? m[1] : ''
    const id = Number(p.split('/')[2]) // admin/<thing>/<id>[/action]
    const sortProjects = list => [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || new Date(b.createdAt) - new Date(a.createdAt))
    let out = null

    if (p === 'content') out = d.content
    else if (p === 'projects') out = sortProjects(d.projects.filter(x => x.isPublished))
    else if (p === 'reviews' && method === 'GET') out = d.reviews.filter(r => r.status === 'Approved')
    else if (p === 'reviews') { if (!body.website) d.reviews.unshift({ id: d.nextId++, name: body.name, company: body.company || '', rating: body.rating, comment: body.comment, status: 'Pending', isFeatured: false, createdAt: now() }) }
    else if (p === 'inquiries') { if (!body.website) d.inquiries.unshift({ ...body, website: undefined, id: d.nextId++, isRead: false, stage: 'New', notes: '', createdAt: now() }) }
    else if (p === 'auth/login') {
      if (!body.username || !body.password) throw err(401, 'Unauthorized')
      out = { token: fakeToken(body.username) }
    }
    else if (p === 'admin/account/password') { if (!body.newPassword || body.newPassword.length < 8) throw err(400, 'The new password must be at least 8 characters.') }
    else if (p === 'admin/stats') {
      const approved = d.reviews.filter(r => r.status === 'Approved')
      out = {
        newInquiries: d.inquiries.filter(i => !i.isRead).length, totalInquiries: d.inquiries.length,
        pendingReviews: d.reviews.filter(r => r.status === 'Pending').length, approvedReviews: approved.length,
        projects: d.projects.length, publishedProjects: d.projects.filter(x => x.isPublished).length,
        averageRating: approved.length ? approved.reduce((a, r) => a + r.rating, 0) / approved.length : 0,
      }
    }
    else if (p.startsWith('admin/content/')) {
      const key = p.split('/')[2]
      if (method === 'DELETE') delete d.content[key]; else d.content[key] = body
    }
    else if (p === 'admin/upload' || p === 'admin/projects/upload') {
      const file = form.get('file')
      if (file.size > 2 * 1024 * 1024) throw err(400, 'In demo mode images must be 2 MB or smaller.')
      out = { url: await fileToDataUrl(file) }
    }
    else if (p.startsWith('admin/projects')) {
      if (method === 'GET') out = sortProjects(d.projects)
      else if (method === 'POST') { out = { ...body, id: d.nextId++, createdAt: now() }; d.projects.push(out) }
      else if (method === 'PUT') { const i = d.projects.findIndex(x => x.id === id); d.projects[i] = out = { ...d.projects[i], ...body } }
      else if (method === 'DELETE') d.projects = d.projects.filter(x => x.id !== id)
    }
    else if (p.startsWith('admin/reviews')) {
      if (method === 'GET') out = d.reviews
      else if (method === 'POST') { out = { ...body, id: d.nextId++, createdAt: now() }; d.reviews.unshift(out) }
      else if (method === 'PUT' && p.endsWith('/status')) { const r = d.reviews.find(x => x.id === id); r.status = ['Pending', 'Approved', 'Rejected'][body.status]; out = r }
      else if (method === 'PUT') { const i = d.reviews.findIndex(x => x.id === id); d.reviews[i] = out = { ...d.reviews[i], ...body } }
      else if (method === 'DELETE') d.reviews = d.reviews.filter(x => x.id !== id)
    }
    else if (p.startsWith('admin/inquiries')) {
      if (method === 'GET') out = d.inquiries
      else if (method === 'PUT' && p.endsWith('/read')) { const x = d.inquiries.find(i => i.id === id); x.isRead = true; out = x }
      else if (method === 'PUT') { const x = d.inquiries.find(i => i.id === id); Object.assign(x, body); out = x }
      else if (method === 'DELETE') d.inquiries = d.inquiries.filter(x => x.id !== id)
    }
    else throw err(404, 'Not found')

    save(d)
    return delay(out == null ? null : JSON.parse(JSON.stringify(out)))
  },
}
