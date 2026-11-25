import { api } from './api.js'
import { fallbackProjects } from './content.js'
import useFetch from './useFetch.js'

// Published projects from the API; falls back to the profile projects if the API is unreachable.
export default function useProjects() {
  const r = useFetch(api.projects)
  // While pre-rendering (no browser) or if the API is down, show the profile projects
  if (typeof window === 'undefined') return { ...r, loading: false, data: fallbackProjects }
  const data = r.error ? fallbackProjects : r.data
  return { ...r, data }
}
