import { createContext, useContext, useEffect, useState } from 'react'
import { defaults } from './content.js'
import { api } from './api.js'

const Ctx = createContext({ content: defaults, reload: () => {} })

// Deep-merge saved content over the defaults (arrays are replaced as a whole)
export function merge(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over ?? base
  if (base && typeof base === 'object' && over && typeof over === 'object') {
    const out = { ...base }
    for (const k of Object.keys(over)) out[k] = merge(base[k], over[k])
    return out
  }
  return over === undefined || over === null || over === '' ? base : over
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaults)
  const reload = () => api.content().then(c => setContent(merge(defaults, c || {}))).catch(() => {})
  useEffect(() => { reload() }, [])
  return <Ctx.Provider value={{ content, reload }}>{children}</Ctx.Provider>
}

export const useContent = () => useContext(Ctx)
