import { useMemo, useState } from 'react'
import RestaurantForm from './RestaurantForm'
import { createRestaurant, deleteRestaurant, updateRestaurant } from '../api/restaurants'

export default function ManageRestaurants({ restaurants, cuisines, onChange, onBack }) {
  const [formMode, setFormMode] = useState(null) // null | 'add' | restaurant object being edited
  const [saving, setSaving] = useState(false)
  const [rowError, setRowError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const sorted = useMemo(
    () => [...restaurants].sort((a, b) => a.name.localeCompare(b.name)),
    [restaurants],
  )

  const handleAdd = async (form) => {
    setSaving(true)
    try {
      const created = await createRestaurant(form)
      onChange([...restaurants, created])
      setFormMode(null)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (form) => {
    setSaving(true)
    try {
      const updated = await updateRestaurant(formMode.id, form)
      onChange(restaurants.map((r) => (r.id === updated.id ? updated : r)))
      setFormMode(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (restaurant) => {
    if (!window.confirm(`Delete "${restaurant.name}"?`)) return
    setRowError(null)
    setDeletingId(restaurant.id)
    try {
      await deleteRestaurant(restaurant.id)
      onChange(restaurants.filter((r) => r.id !== restaurant.id))
    } catch (err) {
      setRowError(err.message || 'Failed to delete.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="panel panel-wide">
      <button className="back-link" onClick={onBack}>
        ← Back
      </button>
      <h1 className="title">Restaurant Library</h1>
      <p className="subtitle">{restaurants.length} restaurants, saved on the server.</p>

      {formMode && (
        <RestaurantForm
          initial={formMode === 'add' ? null : formMode}
          cuisines={cuisines}
          saving={saving}
          onCancel={() => setFormMode(null)}
          onSubmit={formMode === 'add' ? handleAdd : handleEdit}
        />
      )}

      {!formMode && (
        <button className="chip chip-solid add-button" onClick={() => setFormMode('add')}>
          + Add Restaurant
        </button>
      )}

      {rowError && <div className="form-error">{rowError}</div>}

      <ul className="restaurant-list">
        {sorted.map((r) => (
          <li key={r.id} className="restaurant-row">
            <span className="restaurant-row-emoji">{r.emoji}</span>
            <span className="restaurant-row-info">
              <span className="restaurant-row-name">{r.name}</span>
              <span className="restaurant-row-cuisine">{r.cuisine}</span>
              {r.blurb && <span className="restaurant-row-blurb">{r.blurb}</span>}
            </span>
            <span className="restaurant-row-actions">
              <button className="icon-button" onClick={() => setFormMode(r)} aria-label={`Edit ${r.name}`}>
                ✏️
              </button>
              <button
                className="icon-button"
                onClick={() => handleDelete(r)}
                disabled={deletingId === r.id}
                aria-label={`Delete ${r.name}`}
              >
                🗑️
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
