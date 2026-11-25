import { useLang } from '../i18n.jsx'
import { useContent } from '../ContentContext.jsx'

// The UJ mark: rounded navy tile, "UJ" monogram and an orange cable running
// from a connector node to an RJ45-style plug (based on the company profile logo).
export function LogoMark({ size = 44, id = 'lm' }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c4a7a" />
          <stop offset="1" stopColor="#0a1a30" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="61" height="61" rx="15" fill={`url(#${id}-bg)`} stroke="#f58220" strokeOpacity=".75" strokeWidth="1.5" />
      <text x="32" y="36" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontWeight="800" fontSize="25" fill="#fff" letterSpacing="-.5">UJ</text>
      <g fill="none" stroke="#f58220" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="46" r="3.4" />
        <path d="M18.4 46.5 C 26 50, 36 50, 43.5 46.5" />
        <rect x="43.5" y="41.5" width="7.5" height="8" rx="1.6" />
        <path d="M45.8 41.5v-3M48.8 41.5v-3" />
      </g>
      <g fill="#f58220"><circle cx="26" cy="49" r="1.3" /><circle cx="35" cy="49" r="1.3" /></g>
    </svg>
  )
}

export default function Logo({ light = false, compact = false }) {
  const { pick } = useLang()
  const { content } = useContent()
  return (
    <span className={`logo ${light ? 'logo-light' : ''}`}>
      <LogoMark id={light ? 'lml' : 'lmd'} />
      {!compact && (
        <span className="logo-words">
          <span className="logo-name">{pick(content.company.short)}</span>
          <span className="logo-tag">{pick(content.company.tagline)}</span>
        </span>
      )}
    </span>
  )
}
