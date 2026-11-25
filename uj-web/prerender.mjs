// Runs after `vite build`: writes a real HTML file for every public page in
// both languages, plus sitemap.xml and robots.txt. Search engines then see the
// full content and the right title/description without running JavaScript.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(root, '../UJ.Api/wwwroot')
const { render, headHtml, PAGES, SITE_URL, urlFor } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const template = fs.readFileSync(path.join(out, 'index.html'), 'utf8')

// Plain app shell (no page content) for /admin and unknown URLs
fs.writeFileSync(path.join(out, 'spa.html'),
  template.replace('<!--app-head-->', '<title>Usama Javed Technology Solution</title>\n    <meta name="robots" content="noindex" />').replace('<!--app-html-->', ''))

const routes = PAGES.flatMap(p => [p, p === '/' ? '/ar' : '/ar' + p])
for (const url of routes) {
  const lang = url.startsWith('/ar') ? 'ar' : 'en'
  const html = template
    .replace('<html lang="en" dir="ltr">', `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace('<!--app-head-->', headHtml(url))
    .replace('<!--app-html-->', render(url))
  const file = url === '/' ? path.join(out, 'index.html') : path.join(out, url.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  console.log('  prerendered', url)
}

// Real "page not found" page (the API sends it with a 404 status, so Google drops dead URLs)
fs.writeFileSync(path.join(out, '404.html'), template.replace('<!--app-head-->', headHtml('/404')).replace('<!--app-html-->', render('/404')))
console.log('  prerendered 404.html')

const today =new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.flatMap(p => ['en', 'ar'].map(l => `  <url>
    <loc>${urlFor(p, l)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === '/' || p === '/projects' || p === '/reviews' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p === '/' ? '1.0' : p === '/services' || p.startsWith('/services/') || p === '/contact' ? '0.9' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${urlFor(p, 'en')}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${urlFor(p, 'ar')}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(p, 'en')}" />
  </url>`)).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log('  sitemap.xml + robots.txt written for', SITE_URL)
