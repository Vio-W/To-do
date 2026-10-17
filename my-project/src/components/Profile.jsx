import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../api'

const inputClass =
  'w-full h-10 px-3 bg-slate-100 text-slate-900 placeholder-slate-400 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 rounded-xl focus:outline-none transition-colors duration-200'

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '' })
  const [draft, setDraft] = useState(user)
  const [editing, setEditing] = useState(false)

  // load the profile from the API once
  useEffect(() => {
    getProfile()
      .then((p) => setUser({ name: p.username, email: p.email }))
      .catch(() => console.error('Could not load profile'))
  }, [])

  const save = async () => {
    if (draft.name.trim() === '') return
    try {
      const p = await updateProfile({
        username: draft.name.trim(),
        email: draft.email.trim(),
      })
      setUser({ name: p.username, email: p.email })
      setEditing(false)
    } catch {
      alert('Could not save. Check that the email is valid.')
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 w-full mb-5">
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Username"
        />
        <input
          className={inputClass}
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          placeholder="Email"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            className="h-9 px-4 bg-purple-800 text-white font-bold rounded-xl cursor-pointer hover:bg-purple-900 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="h-9 px-4 text-slate-500 dark:text-slate-400 cursor-pointer hover:opacity-70 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full mb-5">
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
        <div className="w-7 h-7 rounded-full bg-purple-800 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold truncate">{user.name}</span>
        <span className="text-sm text-slate-400 truncate hidden sm:inline">{user.email}</span>
      </div>
      <button
        onClick={() => {
          setDraft(user)
          setEditing(true)
        }}
        className="text-sm text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer shrink-0"
      >
        Edit profile
      </button>
    </div>
  )
}