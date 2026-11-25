# Usama Javed Technology Solution: website and admin portal

Bilingual (English / Arabic) website for a Dubai structured cabling, fiber and CCTV company, with an admin portal for projects, reviews, inquiries and site text.

**Stack:** React 19 + Vite (pre-rendered for SEO) · Cloudflare Workers (API in `worker/index.js`) · Cloudflare D1 database · same setup as CartWhim and MathWhiz World.

```
uj-web/        the website and admin portal (React)
worker/        the API: projects, reviews, inquiries, site content, admin login, photo uploads
migrations/    D1 tables (0001) and the two starting projects (0002)
wrangler.jsonc Cloudflare settings
dist/          build output (created by `npm run build`, not in Git)
```

## Deploy to Cloudflare

Cloudflare builds and deploys straight from GitHub on every push to `main`.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) open **Workers & Pages → Create → Import a repository** and pick this repository.
2. Project name: `uj-website` (must match `name` in `wrangler.jsonc`).
3. Build command: `npm run build`
4. Deploy command: `npm run cf-deploy`
   (deploys the Worker, creates the `uj-website` D1 database automatically on the first deploy, then applies the files in `migrations/`).
5. Click **Deploy**. The site goes live at `https://uj-website.<your-subdomain>.workers.dev`.
6. Open the Worker's **Settings → Variables and secrets** and add three secrets: `ADMIN_USERNAME`, `ADMIN_PASSWORD` (10+ characters) and `JWT_SECRET` (a long random string). They are kept on later deploys.
7. Go to `/admin`, sign in with that username and password. The first sign-in creates the admin account. Change the password later under **Account**.
8. When you have a domain: add it under **Settings → Domains & Routes** (its nameservers must point to Cloudflare). Then add a **build variable** `VITE_SITE_URL` with the full address (e.g. `https://www.ujtech.ae`) so the sitemap, canonical links and share tags use it, and redeploy.

Deploying from your own computer instead: `npx wrangler login`, then `npm run deploy`.

## Run it locally

```
npm install                       # installs wrangler
copy .dev.vars.example .dev.vars  # then set an admin username, password and JWT secret
npm run dev:api                   # API + local D1 database on http://localhost:8787
npm run dev                       # website on http://localhost:5173 (admin at /admin)
```

In VS Code, **Ctrl+Shift+B** starts both. `npm run preview` builds the whole site and runs it exactly as Cloudflare will, on http://localhost:8787.

## Good to know

- **Photos** uploaded in the admin portal are stored in the D1 database. Big photos are resized in the browser first (max 2000px, under 1.8 MB).
- **Reviews** stay hidden until approved in the admin portal. Forms have a hidden honeypot field and a per-IP rate limit.
- **SEO:** every public page is pre-rendered to real HTML in English and Arabic, with titles, descriptions, canonical and hreflang links, share tags, schema.org data, `sitemap.xml` and `robots.txt`. After going live, add the site to Google Search Console, submit `/sitemap.xml`, and create a Google Business Profile.
- **Text and company details** can be changed in the admin portal under **Site content**, without a code change.
