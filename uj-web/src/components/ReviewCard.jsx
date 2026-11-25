import { useLang } from '../i18n.jsx'
import Stars from './Stars.jsx'
import Icon from './Icon.jsx'

export default function ReviewCard({ review, className = '' }) {
  const { lang } = useLang()
  const date = new Date(review.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', { year: 'numeric', month: 'long' })
  return (
    <figure className={`rev ${className}`}>
      <div className="row-between"><Icon name="quote" size={30} className="q" /><Stars value={review.rating} /></div>
      <blockquote>{review.comment}</blockquote>
      <figcaption>
        <span className="avatar">{review.name.trim().charAt(0).toUpperCase()}</span>
        <span><strong>{review.name}</strong><small>{date}</small></span>
      </figcaption>
    </figure>
  )
}
