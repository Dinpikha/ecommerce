import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { formatDate } from '../utils/format'

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      await profileService.update(form)
      setMessage('Profile updated.')
    } catch {
      setError(
        'Profile update is not available yet. Backend needs PATCH /auth/me with phone, address, city, state, pincode fields.',
      )
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
      <h1 className="mt-2 font-serif text-5xl">Profile</h1>

      <div className="mt-10 rounded-3xl bg-card p-7">
        <p className="text-sm text-muted-foreground">Member since {formatDate(user?.created_at)}</p>

        {message && <p className="mt-4 text-sm text-coral">{message}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <input
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <input
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="Phone"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <input
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Address"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
              className="rounded-xl border border-border bg-background px-4 py-3"
            />
            <input
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="State"
              className="rounded-xl border border-border bg-background px-4 py-3"
            />
            <input
              value={form.pincode}
              onChange={(e) => updateField('pincode', e.target.value)}
              placeholder="Pincode"
              className="rounded-xl border border-border bg-background px-4 py-3"
            />
          </div>
          <button className="rounded-full bg-primary px-5 py-3 text-primary-foreground">Save changes</button>
        </form>
      </div>
    </main>
  )
}
