import { useCallback, useState } from 'react'
import Icon from '../components/Icon.jsx'

export function useToast() {
  const [msg, setMsg] = useState(null)
  const show = useCallback(m => { setMsg(m); setTimeout(() => setMsg(null), 2600) }, [])
  const node = msg ? <div className="toast" role="status"><Icon name="check" size={18} /> {msg}</div> : null
  return [node, show]
}
