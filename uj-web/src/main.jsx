import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LangProvider } from './i18n.jsx'
import { ContentProvider } from './ContentContext.jsx'
import App from './App.jsx'
import './styles.css'

const app = (
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <ContentProvider>
          <App />
        </ContentProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>
)

const el = document.getElementById('root')
// Pages are pre-rendered at build time; take them over instead of rebuilding from scratch.
if (el.hasChildNodes()) hydrateRoot(el, app, { onRecoverableError: () => {} })
else createRoot(el).render(app)
