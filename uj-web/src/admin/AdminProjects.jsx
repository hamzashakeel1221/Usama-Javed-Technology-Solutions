import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, imageSrc } from '../api.js'
import { categories, projectStatuses } from '../content.js'
import useFetch from '../useFetch.js'
import Icon from '../components/Icon.jsx'
import { useToast } from './Toast.jsx'

const blank = {
  titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', location: '', imageUrl: '',
  category: 'cabling', status: 'Completed', year: new Date().getFullYear(), partner: '', isFeatured: false, sortOrder: 0, isPublished: true,
}
const toForm = p => ({
  titleEn: p.titleEn, titleAr: p.titleAr, descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr,
  location: p.location ?? '', imageUrl: p.imageUrl ?? '', category: p.category || 'cabling', status: p.status || 'Completed',
  year: p.year ?? '', partner: p.partner ?? '', isFeatured: !!p.isFeatured, sortOrder: p.sortOrder ?? 0, isPublished: p.isPublished,
})
const catName = k => categories.find(c => c.key === k)?.en || k

export default function AdminProjects() {
  const { data, loading, error, reload } = useFetch(api.adminProjects)
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [toast, show] = useToast()

  useEffect(() => {
    if (params.get('new')) { setEditing({ ...blank }); setParams({}, { replace: true }) }
  }, [params, setParams])

  const list = (data ?? []).filter(p => (cat === 'all' || p.category === cat) &&
    (!q || `${p.titleEn} ${p.titleAr} ${p.location ?? ''} ${p.partner ?? ''}`.toLowerCase().includes(q.toLowerCase())))

  const remove = async p => {
    if (!window.confirm(`Delete "${p.titleEn}"? This cannot be undone.`)) return
    await api.deleteProject(p.id); reload(); show('Project deleted')
  }
  const patch = async (p, change, msg) => { await api.updateProject(p.id, { ...toForm(p), year: p.year ?? null, ...change }); reload(); show(msg) }

  return (
    <>
      <div className="admin-head">
        <div><h1 className="admin-title">Projects</h1><p className="admin-sub">Your portfolio. Published projects appear on the website, featured ones first.</p></div>
        <button className="btn btn-orange btn-sm" onClick={() => setEditing({ ...blank })}><Icon name="plus" size={16} /> Add project</button>
      </div>
      <div className="toolbar">
        <div className="search"><Icon name="search" size={16} /><input placeholder="Search projects…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="tabs">
          <button className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}>All<span className="tab-count">{data?.length ?? 0}</span></button>
          {categories.map(c => <button key={c.key} className={cat === c.key ? 'active' : ''} onClick={() => setCat(c.key)}>{c.en}</button>)}
        </div>
      </div>
      {error && <p className="error">{error.message}</p>}
      {loading ? <p className="muted">Loading…</p> : !list.length ? (
        <div className="empty"><Icon name="building" size={40} /><p>No projects found.</p><button className="btn btn-orange btn-sm" onClick={() => setEditing({ ...blank })}>Add your first project</button></div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Visibility</th><th style={{ textAlign: 'end' }}>Actions</th></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="row-gap" style={{ flexWrap: 'nowrap', gap: 14 }}>
                      <div className="thumb">{p.imageUrl ? <img src={imageSrc(p.imageUrl)} alt="" /> : <Icon name="image" size={22} />}</div>
                      <div>
                        <div className="t-title">{p.titleEn} {p.isFeatured && <span className="badge badge-orange" style={{ marginInlineStart: 6 }}>Featured</span>}</div>
                        <div className="t-sub" dir="rtl" style={{ textAlign: 'start' }}>{p.titleAr}</div>
                        <div className="t-sub">{[p.location, p.partner].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                  </td>
                  <td>{catName(p.category)}</td>
                  <td><span className={`badge ${p.status === 'Ongoing' ? 'badge-blue' : 'badge-green'}`}>{p.status}{p.year ? ` · ${p.year}` : ''}</span></td>
                  <td><span className={`badge ${p.isPublished ? 'badge-green' : 'badge-grey'}`}>{p.isPublished ? 'Published' : 'Hidden'}</span></td>
                  <td>
                    <div className="row-gap end" style={{ flexWrap: 'nowrap' }}>
                      <button className="btn btn-outline btn-xs" onClick={() => setEditing({ id: p.id, ...toForm(p) })}><Icon name="edit" size={14} /> Edit</button>
                      <button className="btn btn-outline btn-xs" onClick={() => patch(p, { isFeatured: !p.isFeatured }, p.isFeatured ? 'Removed from featured' : 'Marked as featured')}>{p.isFeatured ? 'Unfeature' : 'Feature'}</button>
                      <button className="btn btn-outline btn-xs" onClick={() => patch(p, { isPublished: !p.isPublished }, p.isPublished ? 'Project hidden' : 'Project published')}>{p.isPublished ? 'Hide' : 'Publish'}</button>
                      <button className="btn btn-danger btn-xs" onClick={() => remove(p)} aria-label="Delete"><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ProjectForm initial={editing} onClose={() => setEditing(null)} onSaved={msg => { setEditing(null); reload(); show(msg) }} />}
      {toast}
    </>
  )
}

function ProjectForm({ initial, onClose, onSaved }) {
  const { id, ...rest } = initial
  const [f, setF] = useState(rest)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const uploadFile = async file => {
    if (!file) return
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) { setError('Only JPG, PNG or WEBP images.'); return }
    if (file.size > 15 * 1024 * 1024) { setError('Image must be 15 MB or smaller.'); return }
    setUploading(true); setError('')
    try { const { url } = await api.uploadImage(file); setF(prev => ({ ...prev, imageUrl: url })) }
    catch (err) { setError(err.message || 'Upload failed.') }
    finally { setUploading(false) }
  }

  const save = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    const body = {
      ...f, location: f.location || null, imageUrl: f.imageUrl || null, partner: f.partner || null,
      year: f.year === '' ? null : Number(f.year), sortOrder: Number(f.sortOrder) || 0,
    }
    try { id ? await api.updateProject(id, body) : await api.createProject(body); onSaved(id ? 'Project updated' : 'Project added') }
    catch (err) { setError(err.message || 'Save failed.') }
    finally { setBusy(false) }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal modal-form form" onMouseDown={e => e.stopPropagation()} onSubmit={save}>
        <div className="row-between">
          <h2 className="h3">{id ? 'Edit project' : 'New project'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="form-grid">
          <div className="form-section">Title & description</div>
          <label>Title (English)<input required maxLength={150} value={f.titleEn} onChange={set('titleEn')} placeholder="e.g. Ash Mount School" /></label>
          <label>Title (Arabic)<input required maxLength={150} dir="rtl" value={f.titleAr} onChange={set('titleAr')} placeholder="مثال: مدرسة آش ماونت" /></label>
          <label>Description (English)<textarea required maxLength={2000} rows={4} value={f.descriptionEn} onChange={set('descriptionEn')} /></label>
          <label>Description (Arabic)<textarea required maxLength={2000} rows={4} dir="rtl" value={f.descriptionAr} onChange={set('descriptionAr')} /></label>

          <div className="form-section">Project details</div>
          <label>Category
            <select value={f.category} onChange={set('category')}>{categories.map(c => <option key={c.key} value={c.key}>{c.en}</option>)}</select>
          </label>
          <label>Status
            <select value={f.status} onChange={set('status')}>{projectStatuses.map(s => <option key={s.key} value={s.key}>{s.en}</option>)}</select>
          </label>
          <label>Location<input maxLength={150} value={f.location} onChange={set('location')} placeholder="e.g. Mudon, Dubai" /></label>
          <label>Year<input type="number" min="1990" max="2100" value={f.year} onChange={set('year')} /></label>
          <label>Contracting partner / client <span className="hint">optional</span><input maxLength={150} value={f.partner} onChange={set('partner')} placeholder="e.g. Orion Contracting" /></label>
          <label>Display order <span className="hint">lower numbers show first</span><input type="number" value={f.sortOrder} onChange={set('sortOrder')} /></label>

          <div className="form-section">Image</div>
          <div className={`upload-zone span-2 ${drag ? 'drag' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); uploadFile(e.dataTransfer.files?.[0]) }}>
            {f.imageUrl ? <img src={imageSrc(f.imageUrl)} alt="" /> : <span className="thumb"><Icon name="image" size={28} /></span>}
            <div style={{ display: 'grid', gap: 8 }}>
              <span className="muted small">Drag a photo here, or choose a file. JPG, PNG or WEBP. Large photos are resized automatically.</span>
              <div className="row-gap">
                <label className="btn btn-outline btn-xs" style={{ display: 'inline-flex' }}>
                  {uploading ? 'Uploading…' : f.imageUrl ? 'Replace image' : 'Choose image'}
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={e => { uploadFile(e.target.files?.[0]); e.target.value = '' }} />
                </label>
                {f.imageUrl && <button type="button" className="btn btn-danger btn-xs" onClick={() => setF({ ...f, imageUrl: '' })}>Remove</button>}
              </div>
            </div>
          </div>

          <div className="form-section">Visibility</div>
          <label className="switch"><input type="checkbox" checked={f.isPublished} onChange={set('isPublished')} /> Show on website</label>
          <label className="switch"><input type="checkbox" checked={f.isFeatured} onChange={set('isFeatured')} /> Feature on home page</label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="row-gap end">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-orange btn-sm" disabled={busy || uploading}>{busy ? 'Saving…' : id ? 'Save changes' : 'Add project'}</button>
        </div>
      </form>
    </div>
  )
}
