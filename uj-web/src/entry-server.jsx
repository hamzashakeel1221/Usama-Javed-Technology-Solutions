// Used only at build time to pre-render each page to static HTML (better SEO).
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { LangProvider } from './i18n.jsx'
import { ContentProvider } from './ContentContext.jsx'
import App from './App.jsx'
export { headHtml, PAGES, SITE_URL, urlFor } from './seo.js'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <LangProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </LangProvider>
    </StaticRouter>,
  )
}
