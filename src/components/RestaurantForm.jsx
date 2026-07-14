import { useState } from 'react'

const emptyForm = { name: '', cuisine: '', emoji: '', blurb: '' }

export default function RestaurantForm({ initial, cuisines, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm)
  const [error, setError] = useState(null)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.cuisine.trim()) {
      setError('Name and cuisine are required.')
      return
    }
    setError(null)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
  }

  return (
    <form className="restaurant-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={form.name} onChange={update('name')} placeholder="e.g. Golden Dragon" autoFocus />
      </label>
      <label>
        Cuisine
        <input
          value={form.cuisine}
          onChange={update('cuisine')}
          placeholder="e.g. Chinese"
          list="cuisine-options"
        />
        <datalist id="cuisine-options">
          {cuisines.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label>
        Emoji <span className="label-hint">(optional)</span>
        <input value={form.emoji} onChange={update('emoji')} placeholder="🍽️" />
      </label>
      <label>
        Blurb <span className="label-hint">(optional)</span>
        <input value={form.blurb} onChange={update('blurb')} placeholder="Short tagline" />
      </label>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="text-button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="chip chip-solid" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
