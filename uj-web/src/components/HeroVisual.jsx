import { useLang } from '../i18n.jsx'
import Icon from './Icon.jsx'

// Animated network lines behind the hero
export function HeroNet() {
  const pts = [[0, 210], [180, 140], [360, 250], [560, 150], [760, 260], [960, 130], [1160, 230], [1400, 160]]
  const d = 'M' + pts.map(p => p.join(',')).join(' L')
  const pts2 = [[0, 640], [220, 560], [430, 690], [660, 590], [900, 700], [1120, 600], [1400, 680]]
  const d2 = 'M' + pts2.map(p => p.join(',')).join(' L')
  return (
    <svg className="hero-net" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path className="wire" d={d} /><path className="pulse" d={d} />
      <path className="wire" d={d2} style={{ opacity: .5 }} /><path className="pulse" d={d2} style={{ animationDelay: '-3s', opacity: .6 }} />
      {pts.slice(1, -1).map(([x, y], i) => (
        <g key={i}><circle className="halo" cx={x} cy={y} r="5" style={{ animationDelay: `${i * .45}s` }} /><circle className="node" cx={x} cy={y} r="4.5" /></g>
      ))}
    </svg>
  )
}

// Glass "installation report" panel
export function StatusPanel() {
  const { t } = useLang()
  const icons = ['cable', 'globe', 'camera', 'shield']
  const ports = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div className="panel reveal d2">
      <div className="panel-head">
        <div><strong>{t.panel.title}</strong><small>{t.panel.sub}</small></div>
        <span className="live">LIVE</span>
      </div>
      <div className="ports" aria-hidden="true">
        {ports.map(i => <span key={i} className={`port ${[2, 9, 15].includes(i) ? 'or' : i % 5 === 3 ? '' : 'on'}`} />)}
      </div>
      <div className="panel-rows">
        {t.panel.rows.map((r, i) => (
          <div className="panel-row" key={r}>
            <span><Icon name={icons[i]} size={18} /> {r}</span>
            <span className="ok"><Icon name="check" size={14} /> {t.panel.vals[i]}</span>
          </div>
        ))}
      </div>
      <div className="panel-float">
        <span className="ic"><Icon name="shield" size={20} /></span>
        <span><strong>{t.panel.rows[0]}</strong><small>{t.panel.vals[0]} · 100%</small></span>
      </div>
    </div>
  )
}
