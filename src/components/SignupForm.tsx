import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export type SignupFormValues = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  jobTitle: string
}

export interface SignupFormProps {
  defaultValues?: SignupFormValues
  onSubmit?: (values: SignupFormValues) => void
}

const emptyForm: SignupFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
}

function SignupForm({ defaultValues = emptyForm, onSubmit }: SignupFormProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<SignupFormValues>(defaultValues)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const signupUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Auth/signup`
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      setStatus('Passwords do not match.')
      return
    }

    setStatus(null)
    setError(null)
    setIsSubmitting(true)

    const payload = { ...form }

    fetch(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Request failed with status ${res.status}`)
        }
        return res
      })
      .then(() => {
        setStatus('Account created (201). Redirecting to login...')
        setForm(emptyForm)
        onSubmit?.(payload)
        setTimeout(() => navigate('/login'), 600)
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
        <div className="eyebrow">Auth - POST /api/Auth/signup</div>
        <h1>Create your account</h1>
        <p>Fill in the same fields shown in the API doc. Nothing is sent yet.</p>
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
            <span>Job title</span>
            <input
              type="text"
              name="jobTitle"
              placeholder="Product Manager"
              value={form.jobTitle}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="grid two">
          <label className="field">
            <span>First name</span>
            <input
              type="text"
              name="firstName"
              placeholder="Jane"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Last name</span>
            <input
              type="text"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="grid two">
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </label>
        </div>

        {error && <div className="status error">Error: {error}</div>}
        {status && !error && <div className="status">{status}</div>}

        <Link className="text-link" to="/login">
          Do you have an account? Login!
        </Link>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default SignupForm
