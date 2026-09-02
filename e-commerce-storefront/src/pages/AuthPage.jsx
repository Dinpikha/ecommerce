import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))

    try {
      if (mode === 'login') await login(data)
      else await register(data)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-3xl bg-card p-7">
        <p className="text-xs uppercase tracking-[.18em] text-coral">Northstar account</p>
        <h1 className="mt-3 font-serif text-4xl">{mode === 'login' ? 'Welcome back.' : 'Join the edit.'}</h1>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {mode === 'register' && (
            <input
              name="name"
              required
              placeholder="Name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3"
            />
          )}
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-background px-4 py-3"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => navigate(mode === 'login' ? '/register' : '/login')}
          className="mt-5 text-sm text-muted-foreground underline"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  )
}
