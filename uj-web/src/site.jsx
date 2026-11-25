import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, apiMode } from './api.js'
import { defaultContent } from './content.js'

// Website content = defaults from content.js, overridden by whatever the admin saved.
const SiteContext = createContext(null)

export function mergeContent(saved) {
  const out = {}
  for (const key of Object.keys(defaultContent)) {
    const def = defaultContent[key]
    const val = saved?.[key]
    if (val == null) out[key] = def
    else if (Array.isArray(def)) out[key] = Array.isArray(val) ? val : def
    else out[key] = { ...def, ...val }
  }
  return out
}

export function SiteProvider({ children }) {
  const [saved, setSaved] = useState(null)
  const [mode, setMode] = useState('live')

  const reload = useCallback(() => api.content().then(setSaved).catch(() => setSaved({})), [])
  useEffect(() => { reload(); apiMode().then(setMode) }, [reload])

  return (
    <SiteContext.Provider value={{ site: mergeContent(saved), loaded: saved !== null, mode, reload }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)

// Small helpers used across pages
export const telHref = phone => `tel:${String(phone).replace(/[^\d+]/g, '')}`
export const waHref = (num, text) => `https://wa.me/${String(num).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
export const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean)
