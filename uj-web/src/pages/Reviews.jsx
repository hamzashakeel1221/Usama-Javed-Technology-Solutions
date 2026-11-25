import { useState } from 'react'
import { useLang } from '../i18n.jsx'
import { api } from '../api.js'
import useFetch from '../useFetch.js'
import useReveal from '../useReveal.js'
import { PageHero } from '../components/Section.jsx'
import ReviewCard from '../components/ReviewCard.jsx'
import Stars from '../components/Stars.jsx'
import Icon from '../components/Icon.jsx'

export default function Reviews() {
  const { t, lang } = useLang()
  const { data, loading } = useFetch(api.reviews)
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', website: '' })
  const [state, setState] = useState('idle')
  const avg = data?.length ? data.reduce((a, r) => a + r.rating, 0) / data.length : 0
  useReveal([data, lang])

  const submit = async e => {
    e.preventDefault()
    setState('sending')
    try {
      await api.submitReview(form)
      setState('done')
      setForm({ name: '', rating: 5, comment: '', website: '' })
    } catch (err) { setState(err.status === 429 ? 'limit' : 'error') }
  }

  return (
    <>
      <PageHero eyebrow={t.reviews.eyebrow} title={t.reviews.title} text={t.reviews.sub} />
      <section className="section">
        <div className="container reviews-layout">
          <div>
            {data?.length > 0 && (
              <div className="rating-summary reveal">
                <strong>{avg.toFixed(1)}</strong>
                <div><Stars value={Math.round(avg)} size={20} /><div className="muted small">{t.reviews.based} {data.length} {t.reviews.count}</div></div>
              </div>
            )}
            {loading ? <p className="muted">{t.common.loading}</p>
              : !data?.length ? <div className="empty"><Icon name="quote" size={40} /><p>{t.reviews.empty}</p></div>
              : <div className="grid-2">{data.map((r, i) => <ReviewCard key={r.id} review={r} className={`reveal d${(i % 2) + 1}`} />)}</div>}
          </div>
          <aside className="form-card sticky-card">
            <h2 className="h3">{t.reviews.write}</h2>
            {state === 'done' ? (
              <div className="done-box"><span className="ic-circle"><Icon name="check" size={30} /></span><p>{t.reviews.thanks}</p></div>
            ) : (
              <form onSubmit={submit} className="form">
                <label>{t.reviews.name}
                  <input required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
                <div className="field"><span>{t.reviews.rating}</span>
                  <Stars value={form.rating} onChange={rating => setForm({ ...form, rating })} />
                </div>
                <label>{t.reviews.comment}
                  <textarea required maxLength={1000} rows={5} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
                </label>
                <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                {state === 'error' && <p className="error">{t.common.error}</p>}
                {state === 'limit' && <p className="error">{t.common.tooMany}</p>}
                <button className="btn btn-orange btn-block" disabled={state === 'sending'}>{state === 'sending' ? t.common.sending : t.reviews.submit}</button>
              </form>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
