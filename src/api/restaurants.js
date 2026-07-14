const BASE = '/api/restaurants'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export function fetchRestaurants() {
  return fetch(BASE).then(handle)
}

export function createRestaurant(payload) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle)
}

export function updateRestaurant(id, payload) {
  return fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle)
}

export function deleteRestaurant(id) {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handle)
}
