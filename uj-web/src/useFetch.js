import { useEffect, useState, useCallback } from 'react'

export default function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return fn().then(setData).catch(setError).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, error, loading, reload: load, setData }
}
