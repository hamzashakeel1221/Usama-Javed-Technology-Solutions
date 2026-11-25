# What changed in UJ.Api (backend)

- **New fields on projects:** Category, Status (Completed / Ongoing), Year, Partner, IsFeatured, SortOrder.
- **New fields on inquiries:** Status (New / Contacted / Quoted / Won / Lost) and private Notes. There's a new `PUT /api/admin/inquiries/{id}` to update them.
- **New `SiteContent` table:** `GET /api/content` (public) and `PUT /api/admin/content` (admin). The admin edits company details, the hero text, highlights and services with these.
- **New `PUT /api/admin/account/password`:** lets the admin change their password.
- **Enums now go in and out as text** (for example "Approved"), and unknown review statuses are rejected.
- **Image uploads are checked by their first bytes**, not only the file extension.
- **`MapFallbackToFile("index.html")`:** links like /projects and /admin keep working after a page refresh when the site is served from wwwroot.
- **Startup stops with a clear message** if a required setting is missing.
- **On the first run**, the two projects from the company profile are added (Ash Mount School and Damac Lagoons).
- **Local settings live in `UJ.Api/appsettings.Development.json`**, which is not in Git because it holds passwords. Copy `UJ.Api/appsettings.Development.example.json` to `appsettings.Development.json` and fill in your PostgreSQL connection string, a long random JWT key, the first admin username and password, and (optionally) the Gmail app password for inquiry alerts. Use different values in production.

## First run
```
cd UJ.Api
copy appsettings.Development.example.json appsettings.Development.json   (then edit it)
dotnet tool install --global dotnet-ef     (once)
dotnet ef migrations add Initial
dotnet run --launch-profile http           (API on http://localhost:5277)
```
Then, in a second terminal:
```
cd uj-web
npm install
npm run dev                                (site on http://localhost:5173, admin at /admin)
```

## Run in VS Code
- Open the `E:\UJ.Website` folder in VS Code and press **Ctrl+Shift+B** ("UJ: Run website"). It opens two terminals: **UJ: API** (http://localhost:5277) and **UJ: Website** (http://localhost:5173, admin at /admin).
- To stop a server, click in its terminal and press **Ctrl+C**, or run **Tasks: Terminate Task** from the Command Palette. Press Ctrl+Shift+B again to start them.
- PostgreSQL must be running (it normally starts with Windows).

# SEO (added in v3)
- Every public page is pre-rendered to real HTML in English and Arabic (`/about`, `/ar/about`, …) when you run `npm run build` in `uj-web`. The output goes to `UJ.Api/wwwroot`.
- Each page has its own title, description, canonical link, hreflang (en/ar), Open Graph/Twitter share tags and schema.org data (ProfessionalService, Service, FAQPage, BreadcrumbList).
- `sitemap.xml`, `robots.txt`, a share image (`og-image.png`), app icons and `site.webmanifest` are generated as well.
- **When you buy your domain:** set it in `uj-web/src/seo.js` (`SITE_URL`), or set the `VITE_SITE_URL` environment variable, then run `npm run build` again. The default value is a placeholder.
- After going live, add the site to Google Search Console and submit `https://YOUR-DOMAIN/sitemap.xml`. Also create a free Google Business Profile with the same name, phones and Dubai location.
