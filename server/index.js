import express from 'express'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data', 'restaurants.json')
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 5177
const HOST = process.env.HOST || '0.0.0.0'

let restaurants = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'))
let saveQueue = Promise.resolve()

function persist() {
  const snapshot = JSON.stringify(restaurants, null, 2) + '\n'
  saveQueue = saveQueue.then(() => fs.writeFile(DATA_FILE, snapshot))
  return saveQueue
}

function nextId() {
  return restaurants.reduce((max, r) => Math.max(max, r.id), 0) + 1
}

function validatePayload(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const cuisine = typeof body?.cuisine === 'string' ? body.cuisine.trim() : ''
  if (!name || !cuisine) return null
  return {
    name,
    cuisine,
    emoji: (typeof body?.emoji === 'string' && body.emoji.trim()) || '🍽️',
    blurb: (typeof body?.blurb === 'string' && body.blurb.trim()) || '',
  }
}

const app = express()
app.use(express.json())

app.get('/api/restaurants', (req, res) => {
  res.json(restaurants)
})

app.post('/api/restaurants', async (req, res) => {
  const fields = validatePayload(req.body)
  if (!fields) return res.status(400).json({ error: 'name and cuisine are required' })
  const entry = { id: nextId(), ...fields }
  restaurants.push(entry)
  await persist()
  res.status(201).json(entry)
})

app.put('/api/restaurants/:id', async (req, res) => {
  const id = Number(req.params.id)
  const existing = restaurants.find((r) => r.id === id)
  if (!existing) return res.status(404).json({ error: 'restaurant not found' })
  const fields = validatePayload(req.body)
  if (!fields) return res.status(400).json({ error: 'name and cuisine are required' })
  Object.assign(existing, fields)
  await persist()
  res.json(existing)
})

app.delete('/api/restaurants/:id', async (req, res) => {
  const id = Number(req.params.id)
  const before = restaurants.length
  restaurants = restaurants.filter((r) => r.id !== id)
  if (restaurants.length === before) return res.status(404).json({ error: 'restaurant not found' })
  await persist()
  res.status(204).end()
})

// Production: serve the built frontend from the same process/port.
app.use(express.static(DIST_DIR))
app.use((req, res) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return res.status(404).end()
  res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => {
    if (err) res.status(404).end()
  })
})

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address)
}

app.listen(PORT, HOST, () => {
  console.log(`Server running:`)
  console.log(`  http://localhost:${PORT}`)
  for (const ip of lanAddresses()) {
    console.log(`  http://${ip}:${PORT}  <- use this from other devices`)
  }
})
