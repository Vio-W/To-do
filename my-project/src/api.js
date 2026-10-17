const BASE = 'http://localhost:3000/api'

const TO_API = { 'To Do': 'TODO', 'In Progress': 'IN_PROGRESS', Done: 'DONE' }
const FROM_API = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

// server todo -> shape your UI already uses
const fromApi = (todo) => ({ ...todo, status: FROM_API[todo.status] })

// UI changes -> shape the server expects
const toApi = (changes) => {
  const copy = { ...changes }
  if (copy.status) copy.status = TO_API[copy.status]
  return copy
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  if (res.status === 204) return null
  return res.json()
}

export const getTasks = async () => (await request('/todos')).map(fromApi)

export const createTask = async (title) =>
  fromApi(
    await request('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, status: 'TODO' }),
    })
  )

export const updateTask = async (id, changes) =>
  fromApi(
    await request(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(toApi(changes)),
    })
  )

export const deleteTask = (id) => request(`/todos/${id}`, { method: 'DELETE' })

export const getProfile = () => request('/profile')

export const updateProfile = (changes) =>
  request('/profile', { method: 'PATCH', body: JSON.stringify(changes) })