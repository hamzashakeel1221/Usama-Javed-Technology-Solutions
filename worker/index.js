// UJ website backend on Cloudflare Workers.
// The built site (../dist) is served by Cloudflare's static assets; this Worker only
// handles /api/*, /uploads/* and the /admin app shell. Data lives in the D1 database "DB".
//
// Secrets (Worker → Settings → Variables and secrets, or .dev.vars locally):
//   ADMIN_USERNAME, ADMIN_PASSWORD  first sign-in creates the admin account with these
//   JWT_SECRET                      long random string used to sign admin logins

const enc = new TextEncoder()
const MAX_IMAGE = 1_900_000 // D1 stores values up to 2 MB; the admin page shrinks big photos first

// ---------- small helpers ----------
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
const error = (status, title, errors) => json(errors ? { title, errors } : { title }, status)
const noContent = () => new Response(null, { status: 204 })

class HttpError extends Error {
  constructor(status, title, errors) { super(title); this.status = status; this.errors = errors }
}

async function readJson(req) {
  try { return await req.json() } catch { throw new HttpError(400, 'The request body must be valid JSON.') }
}

const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64urlText = s => b64url(enc.encode(s))
const fromB64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0))
const toHex = b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('')
const fromHex = h => new Uint8Array((h.match(/.{2}/g) ?? []).map(x => parseInt(x, 16)))

// ---------- validation (same rules as the old .NET DTOs) ----------
function check(body, rules) {
  const errors = {}
  const out = {}
  for (const [key, r] of Object.entries(rules)) {
    let v = body?.[key]
    if (typeof v === 'string') v = v.trim()
    const empty = v === undefined || v === null || v === ''
    if (empty) {
      if (r.required) errors[key] = [`${r.label ?? key} is required.`]
      else out[key] = r.default ?? null
      continue
    }
    if (r.type === 'int') {
      const n = Number(v)
      if (!Number.isInteger(n) || (r.min !== undefined && n < r.min) || (r.max !== undefined && n > r.max))
        errors[key] = [`${r.label ?? key} must be a whole number${r.min !== undefined ? ` between ${r.min} and ${r.max}` : ''}.`]
      else out[key] = n
    } else if (r.type === 'bool') {
      out[key] = v === true || v === 'true' || v === 1
    } else {
      v = String(v)
      if (r.max && v.length > r.max) errors[key] = [`${r.label ?? key} must be at most ${r.max} characters.`]
      else if (r.min && v.length < r.min) errors[key] = [`${r.label ?? key} must be at least ${r.min} characters.`]
      else if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[key] = ['Please enter a valid email address.']
      else if (r.oneOf && !r.oneOf.includes(v)) errors[key] = [`${r.label ?? key} is not a valid choice.`]
      else out[key] = v
    }
  }
  if (Object.keys(errors).length) throw new HttpError(400, 'Please check the form.', errors)
  return out
}

// ---------- passwords (PBKDF2, same approach as MathWhiz/CartWhim) ----------
const ITERATIONS = 100_000
async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return ['pbkdf2', ITERATIONS, toHex(salt), toHex(await pbkdf2(password, salt, ITERATIONS))].join(':')
}
async function verifyPassword(password, stored) {
  const [, iter, salt, hash] = String(stored).split(':')
  if (!iter || !salt || !hash) return false
  return safeEqualBytes(new Uint8Array(await pbkdf2(password, fromHex(salt), Number(iter))), fromHex(hash))
}
function safeEqualBytes(a, b) {
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}
const safeEqual = (a, b) => safeEqualBytes(enc.encode(String(a)), enc.encode(String(b)))

// ---------- admin login tokens (JWT, HS256, 8 hours) ----------
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}
async function createToken(env, user) {
  const now = Math.floor(Date.now() / 1000)
  const head = b64urlText(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64urlText(JSON.stringify({ sub: String(user.id), name: user.username, iat: now, exp: now + 8 * 3600 }))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.JWT_SECRET), enc.encode(`${head}.${body}`))
  return `${head}.${body}.${b64url(sig)}`
}
async function requireAdmin(req, env) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('Authorization') || '')
  const parts = m?.[1].split('.')
  if (!parts || parts.length !== 3) throw new HttpError(401, 'Please sign in.')
  let payload
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env.JWT_SECRET), fromB64url(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`))
    payload = ok && JSON.parse(new TextDecoder().decode(fromB64url(parts[1])))
  } catch { payload = null }
  if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) throw new HttpError(401, 'Please sign in again.')
  const user = await env.DB.prepare('SELECT id, username FROM admin_users WHERE id = ?').bind(Number(payload.sub)).first()
  if (!user) throw new HttpError(401, 'Please sign in again.')
  return user
}

// ---------- rate limiting (per IP, stored in D1 so it works across Cloudflare locations) ----------
async function rateLimit(req, env, bucket, limit, windowSec) {
  const ip = req.headers.get('CF-Connecting-IP') || 'local'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at < ?3 THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < ?3 THEN ?2 ELSE rate_limits.reset_at END
     RETURNING count, reset_at`,
  ).bind(key, now + windowSec * 1000, now).first()
  if (row && row.count > limit) {
    const retry = Math.max(1, Math.ceil((row.reset_at - now) / 1000))
    throw new HttpError(429, 'Too many attempts. Please wait a minute and try again.', undefined, retry)
  }
  // Tidy old rows now and then
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM rate_limits WHERE reset_at < ?').bind(now).run()
}

// ---------- row mappers (keep the same JSON shape the .NET API returned) ----------
const project = r => r && ({
  id: r.id, titleEn: r.title_en, titleAr: r.title_ar, descriptionEn: r.description_en, descriptionAr: r.description_ar,
  location: r.location, imageUrl: r.image_url, category: r.category, status: r.status, year: r.year, partner: r.partner,
  isFeatured: !!r.is_featured, sortOrder: r.sort_order, isPublished: !!r.is_published, createdAt: r.created_at,
})
const review = r => r && ({ id: r.id, name: r.name, rating: r.rating, comment: r.comment, status: r.status, createdAt: r.created_at })
const inquiry = r => r && ({
  id: r.id, name: r.name, company: r.company, phone: r.phone, email: r.email, service: r.service,
  propertyType: r.property_type, message: r.message, isRead: !!r.is_read, status: r.status, notes: r.notes, createdAt: r.created_at,
})

const PROJECT_RULES = {
  titleEn: { required: true, max: 150, label: 'English title' },
  titleAr: { required: true, max: 150, label: 'Arabic title' },
  descriptionEn: { required: true, max: 2000, label: 'English description' },
  descriptionAr: { required: true, max: 2000, label: 'Arabic description' },
  location: { max: 150 },
  imageUrl: { max: 300 },
  category: { required: true, max: 50 },
  status: { required: true, max: 30 },
  year: { type: 'int', min: 1990, max: 2100 },
  partner: { max: 150 },
  isFeatured: { type: 'bool', default: false },
  sortOrder: { type: 'int', default: 0 },
  isPublished: { type: 'bool', default: true },
}
const projectParams = p => [p.titleEn, p.titleAr, p.descriptionEn, p.descriptionAr, p.location, p.imageUrl, p.category,
  p.status, p.year, p.partner, p.isFeatured ? 1 : 0, p.sortOrder ?? 0, p.isPublished === false ? 0 : 1]
const PROJECT_ORDER = 'ORDER BY is_featured DESC, sort_order ASC, created_at DESC'
const REVIEW_STATUSES = ['Pending', 'Approved', 'Rejected']
const INQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost']
const nowIso = () => new Date().toISOString()

// ---------- routes ----------
const routes = []
const route = (method, pattern, handler) =>
  routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>\\d+)') + '/?$'), handler })

// Auth
route('POST', '/api/auth/login', async (req, env) => {
  await rateLimit(req, env, 'login', 5, 300)
  const b = check(await readJson(req), { username: { required: true, max: 100 }, password: { required: true, max: 200 } })
  let user = await env.DB.prepare('SELECT * FROM admin_users WHERE username = ?').bind(b.username).first()

  // First sign-in: no admin yet, so accept the ADMIN_USERNAME / ADMIN_PASSWORD secrets and create the account
  if (!user) {
    const { count } = await env.DB.prepare('SELECT COUNT(*) AS count FROM admin_users').first()
    if (count === 0 && env.ADMIN_USERNAME && env.ADMIN_PASSWORD &&
        safeEqual(b.username, env.ADMIN_USERNAME) && safeEqual(b.password, env.ADMIN_PASSWORD)) {
      user = await env.DB.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?) RETURNING *')
        .bind(b.username, await hashPassword(b.password)).first()
    }
  } else if (!(await verifyPassword(b.password, user.password_hash))) user = null

  if (!user) return error(401, 'Wrong username or password.')
  return json({ token: await createToken(env, user) })
})

route('PUT', '/api/admin/account/password', async (req, env) => {
  const admin = await requireAdmin(req, env)
  await rateLimit(req, env, 'login', 5, 300)
  const b = check(await readJson(req), {
    currentPassword: { required: true, max: 200, label: 'Current password' },
    newPassword: { required: true, min: 8, max: 100, label: 'New password' },
  })
  const row = await env.DB.prepare('SELECT password_hash FROM admin_users WHERE id = ?').bind(admin.id).first()
  if (!(await verifyPassword(b.currentPassword, row.password_hash))) return error(400, 'The current password is wrong.')
  await env.DB.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').bind(await hashPassword(b.newPassword), admin.id).run()
  return json({ ok: true })
})

// Site content
route('GET', '/api/content', async (req, env) => {
  const row = await env.DB.prepare("SELECT json FROM site_content WHERE key = 'site'").first()
  return new Response(row?.json ?? '{}', { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } })
})
route('PUT', '/api/admin/content', async (req, env) => {
  await requireAdmin(req, env)
  const body = await readJson(req)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return error(400, 'Content must be a JSON object.')
  const text = JSON.stringify(body)
  if (text.length > 200_000) return error(400, 'Content is too large.')
  await env.DB.prepare(`INSERT INTO site_content (key, json, updated_at) VALUES ('site', ?1, ?2)
    ON CONFLICT(key) DO UPDATE SET json = ?1, updated_at = ?2`).bind(text, nowIso()).run()
  return json({ ok: true })
})

// Projects
route('GET', '/api/projects', async (req, env) => {
  const { results } = await env.DB.prepare(`SELECT * FROM projects WHERE is_published = 1 ${PROJECT_ORDER}`).all()
  return json(results.map(project), 200, { 'Cache-Control': 'no-cache' })
})
route('GET', '/api/admin/projects', async (req, env) => {
  await requireAdmin(req, env)
  const { results } = await env.DB.prepare(`SELECT * FROM projects ${PROJECT_ORDER}`).all()
  return json(results.map(project))
})
route('POST', '/api/admin/projects', async (req, env) => {
  await requireAdmin(req, env)
  const p = check(await readJson(req), PROJECT_RULES)
  const row = await env.DB.prepare(`INSERT INTO projects (title_en, title_ar, description_en, description_ar, location, image_url,
      category, status, year, partner, is_featured, sort_order, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`).bind(...projectParams(p), nowIso()).first()
  return json(project(row), 201, { Location: `/api/admin/projects/${row.id}` })
})
route('PUT', '/api/admin/projects/:id', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const p = check(await readJson(req), PROJECT_RULES)
  const row = await env.DB.prepare(`UPDATE projects SET title_en = ?, title_ar = ?, description_en = ?, description_ar = ?,
      location = ?, image_url = ?, category = ?, status = ?, year = ?, partner = ?, is_featured = ?, sort_order = ?,
      is_published = ? WHERE id = ? RETURNING *`).bind(...projectParams(p), Number(id)).first()
  return row ? json(project(row)) : error(404, 'Project not found.')
})
route('DELETE', '/api/admin/projects/:id', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const row = await env.DB.prepare('DELETE FROM projects WHERE id = ? RETURNING image_url').bind(Number(id)).first()
  if (!row) return error(404, 'Project not found.')
  await deleteUnusedImage(env, row.image_url)
  return noContent()
})

// Image upload: stored in D1, served from /uploads/<name>
route('POST', '/api/admin/projects/upload', async (req, env) => {
  await requireAdmin(req, env)
  let file
  try { file = (await req.formData()).get('file') } catch { file = null }
  if (!file || typeof file === 'string') return error(400, 'Please choose an image.')
  if (file.size === 0 || file.size > MAX_IMAGE) return error(400, 'Images must be under 1.9 MB. Please use a smaller photo.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  const h = bytes.subarray(0, 12)
  const type = h[0] === 0xff && h[1] === 0xd8 ? ['jpg', 'image/jpeg']
    : h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4e && h[3] === 0x47 ? ['png', 'image/png']
    : h[0] === 0x52 && h[1] === 0x49 && h[8] === 0x57 && h[9] === 0x45 ? ['webp', 'image/webp'] : null
  if (!type) return error(400, 'Only JPG, PNG or WebP images are allowed.')
  const name = `${crypto.randomUUID()}.${type[0]}`
  await env.DB.prepare('INSERT INTO uploads (name, content_type, data, size, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(name, type[1], bytes, bytes.length, nowIso()).run()
  return json({ url: `/uploads/${name}` })
})

async function deleteUnusedImage(env, url) {
  const name = /^\/uploads\/([\w-]+\.\w+)$/.exec(url || '')?.[1]
  if (!name) return
  const used = await env.DB.prepare('SELECT 1 FROM projects WHERE image_url = ? LIMIT 1').bind(url).first()
  if (!used) await env.DB.prepare('DELETE FROM uploads WHERE name = ?').bind(name).run()
}

// Reviews
route('GET', '/api/reviews', async (req, env) => {
  const { results } = await env.DB.prepare(
    "SELECT id, name, rating, comment, created_at FROM reviews WHERE status = 'Approved' ORDER BY created_at DESC").all()
  return json(results.map(r => ({ id: r.id, name: r.name, rating: r.rating, comment: r.comment, createdAt: r.created_at })), 200, { 'Cache-Control': 'no-cache' })
})
route('POST', '/api/reviews', async (req, env) => {
  await rateLimit(req, env, 'forms', 5, 60)
  const body = await readJson(req)
  if (body?.website) return json({ ok: true }) // honeypot: bots fill the hidden field
  const r = check(body, {
    name: { required: true, max: 100, label: 'Name' },
    rating: { required: true, type: 'int', min: 1, max: 5, label: 'Rating' },
    comment: { required: true, max: 1000, label: 'Comment' },
  })
  await env.DB.prepare("INSERT INTO reviews (name, rating, comment, status, created_at) VALUES (?, ?, ?, 'Pending', ?)")
    .bind(r.name, r.rating, r.comment, nowIso()).run()
  return json({ ok: true })
})
route('GET', '/api/admin/reviews', async (req, env) => {
  await requireAdmin(req, env)
  const { results } = await env.DB.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all()
  return json(results.map(review))
})
route('PUT', '/api/admin/reviews/:id/status', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const { status } = await readJson(req)
  const name = typeof status === 'number' ? REVIEW_STATUSES[status] : REVIEW_STATUSES.find(s => s.toLowerCase() === String(status).toLowerCase())
  if (!name) return error(400, 'Unknown status.')
  const row = await env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ? RETURNING *').bind(name, Number(id)).first()
  return row ? json(review(row)) : error(404, 'Review not found.')
})
route('DELETE', '/api/admin/reviews/:id', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const row = await env.DB.prepare('DELETE FROM reviews WHERE id = ? RETURNING id').bind(Number(id)).first()
  return row ? noContent() : error(404, 'Review not found.')
})

// Inquiries (contact form)
route('POST', '/api/inquiries', async (req, env) => {
  await rateLimit(req, env, 'forms', 5, 60)
  const body = await readJson(req)
  if (body?.website) return json({ ok: true }) // honeypot
  const i = check(body, {
    name: { required: true, max: 100, label: 'Name' },
    company: { max: 100 },
    phone: { required: true, max: 30, label: 'Phone' },
    email: { required: true, max: 150, email: true, label: 'Email' },
    service: { required: true, max: 100, label: 'Service' },
    propertyType: { required: true, max: 50, label: 'Property type' },
    message: { required: true, max: 2000, label: 'Message' },
  })
  await env.DB.prepare(`INSERT INTO inquiries (name, company, phone, email, service, property_type, message, is_read, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'New', ?)`)
    .bind(i.name, i.company, i.phone, i.email, i.service, i.propertyType, i.message, nowIso()).run()
  return json({ ok: true })
})
route('GET', '/api/admin/inquiries', async (req, env) => {
  await requireAdmin(req, env)
  const { results } = await env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all()
  return json(results.map(inquiry))
})
route('PUT', '/api/admin/inquiries/:id/read', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const row = await env.DB.prepare('UPDATE inquiries SET is_read = 1 WHERE id = ? RETURNING *').bind(Number(id)).first()
  return row ? json(inquiry(row)) : error(404, 'Inquiry not found.')
})
route('PUT', '/api/admin/inquiries/:id', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const b = check(await readJson(req), { status: { required: true, oneOf: INQUIRY_STATUSES }, notes: { max: 4000 } })
  const row = await env.DB.prepare('UPDATE inquiries SET status = ?, notes = ?, is_read = 1 WHERE id = ? RETURNING *')
    .bind(b.status, b.notes, Number(id)).first()
  return row ? json(inquiry(row)) : error(404, 'Inquiry not found.')
})
route('DELETE', '/api/admin/inquiries/:id', async (req, env, { id }) => {
  await requireAdmin(req, env)
  const row = await env.DB.prepare('DELETE FROM inquiries WHERE id = ? RETURNING id').bind(Number(id)).first()
  return row ? noContent() : error(404, 'Inquiry not found.')
})

// Dashboard numbers
route('GET', '/api/admin/stats', async (req, env) => {
  await requireAdmin(req, env)
  const row = await env.DB.prepare(`SELECT
      (SELECT COUNT(*) FROM inquiries WHERE is_read = 0) AS newInquiries,
      (SELECT COUNT(*) FROM reviews WHERE status = 'Pending') AS pendingReviews,
      (SELECT COUNT(*) FROM projects) AS projects`).first()
  return json(row)
})

// ---------- entry point ----------
async function handleApi(req, env, url) {
  const missing = ['JWT_SECRET'].filter(k => !env[k])
  if (missing.length && url.pathname.startsWith('/api/a')) // /api/auth and /api/admin need the secret
    return error(500, `Server setup incomplete: add the ${missing.join(', ')} secret in Cloudflare.`)

  const matches = routes.filter(r => r.re.test(url.pathname))
  if (!matches.length) return error(404, 'Not found.')
  const r = matches.find(r => r.method === req.method || (req.method === 'HEAD' && r.method === 'GET'))
  if (!r) return error(405, 'Method not allowed.')
  try {
    return await r.handler(req, env, r.re.exec(url.pathname).groups ?? {})
  } catch (e) {
    if (e instanceof HttpError) return error(e.status, e.message, e.errors)
    console.error(e)
    return error(500, 'Something went wrong. Please try again.')
  }
}

async function serveUpload(env, name) {
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(name)) return new Response('Not found', { status: 404 })
  const row = await env.DB.prepare('SELECT content_type, data FROM uploads WHERE name = ?').bind(name).first()
  if (!row) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(row.data), {
    headers: { 'Content-Type': row.content_type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  })
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const path = url.pathname

    if (path.startsWith('/api/')) return handleApi(req, env, url)
    if (path.startsWith('/uploads/')) return serveUpload(env, path.slice('/uploads/'.length))

    // /admin and its sub-pages run in the browser: send the plain app shell (spa.html)
    if (path === '/admin' || path.startsWith('/admin/')) {
      const shell = await env.ASSETS.fetch(new Request(new URL('/spa', url), { headers: req.headers }))
      return new Response(shell.body, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex', 'X-Frame-Options': 'DENY' },
      })
    }
    return env.ASSETS.fetch(req)
  },
}
