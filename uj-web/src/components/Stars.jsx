import Icon from './Icon.jsx'

export default function Stars({ value, onChange, size = 18 }) {
  return (
    <span className={`stars ${onChange ? 'stars-input' : ''}`} role={onChange ? 'radiogroup' : 'img'}
      aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map(n => onChange ? (
        <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={`${n}`}
          className={n <= value ? 'on' : ''} onClick={() => onChange(n)}>
          <Icon name="star" size={size + 6} />
        </button>
      ) : (
        <span key={n} className={n <= value ? 'on' : ''}><Icon name="star" size={size} /></span>
      ))}
    </span>
  )
}
