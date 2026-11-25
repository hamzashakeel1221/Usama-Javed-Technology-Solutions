# UJ website (React + Vite)

Public bilingual site (English / Arabic, with right-to-left layout) and the admin portal,
wired to the `UJ.Api` backend in the sibling folder.

## Run it locally

1. Start the API (`UJ.Api`), it listens on http://localhost:5277.
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173. The admin portal is at http://localhost:5173/admin.

Vite forwards `/api` and `/uploads` to the API, so no CORS setup is needed in development.
If your API runs on another port: `set VITE_API_TARGET=http://localhost:XXXX` (Windows) before `npm run dev`.

## Publish

`npm run build` writes the site into `../UJ.Api/wwwroot`, so the API serves the site itself.
For links like `/projects` to work after a page refresh, the API needs
`app.MapFallbackToFile("index.html");` after the endpoints in `Program.cs`.

## Where to change things

| What | File |
|---|---|
| Company name, phone, WhatsApp, email, address, hours | `src/content.js` |
| Services, property types, stats, "why choose us" | `src/content.js` |
| All page text in English and Arabic | `src/i18n.jsx` |
| Colours and fonts | top of `src/styles.css` |
| Logo / favicon | `src/components/Logo.jsx`, `public/favicon.svg` |

Projects, reviews and contact messages come from the API and are managed in the admin portal.

## Pages

- Public: Home, About, Services, Projects (with a detail popup), Reviews (with a "write a review" form), Contact (inquiry form + WhatsApp)
- Admin: Login, Dashboard (counts), Projects (add / edit / hide / delete, image upload), Reviews (approve / reject / delete), Inquiries (inbox, mark read, reply by email or WhatsApp)

Both forms include the hidden honeypot field the API checks, and show a friendly message when the API rate limit is hit.
