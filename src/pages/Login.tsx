import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type LoginFormValues = {
  email: string
  password: string
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' })
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Auth/login`
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setError(null)
    setIsSubmitting(true)

    fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Request failed with status ${res.status}`)
        }
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          return res.json()
        }
        return res.text()
      })
      .then((body: unknown) => {
        let token = ''
        let role: string | undefined

        if (typeof body === 'string') {
          const trimmed = body.trim()
          // if it's JSON in text/plain, try to parse it
          if (trimmed.startsWith('{')) {
            try {
              const parsed = JSON.parse(trimmed)
              token = String(
                (parsed as Record<string, unknown>).accessToken ??
                  (parsed as Record<string, unknown>).token ??
                  '',
              ).trim()
              if ('role' in parsed) {
                role = String((parsed as Record<string, unknown>).role ?? '').trim()
              }
            } catch {
              token = trimmed.replace(/^"|"$/g, '')
            }
          } else {
            token = trimmed.replace(/^"|"$/g, '')
          }
        } else if (body && typeof body === 'object') {
          token = String(
            (body as Record<string, unknown>).accessToken ??
              (body as Record<string, unknown>).token ??
              '',
          ).trim()
          if ('role' in body) {
            role = String((body as Record<string, unknown>).role ?? '').trim()
          }
        }

        if (!token) {
          throw new Error('Login succeeded but no token was returned.')
        }

        localStorage.setItem('authToken', token)
        if (role) {
          localStorage.setItem('authRole', role)
        }
        setStatus('Logged in (200).')
        navigate('/schedules?Period=week&PageNumber=1&PageSize=5')
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div className="signup-card">
      <header className="card-head">
        <div className="eyebrow">Auth - POST /api/Auth/login</div>
        <h1>Welcome back</h1>
        <p>Enter your credentials to sign in.</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid two">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {error && <div className="status error">Error: {error}</div>}
        {status && !error && <div className="status">{status}</div>}

        <Link className="text-link" to="/">
          Need an account? Sign up
        </Link>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
