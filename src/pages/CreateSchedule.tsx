import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import StatusMessage from '../components/ui/StatusMessage'

type CreateSchedulePayload = {
  jobId: string
  date: string
}

type JobInfo = {
  jobId: string
  jobName: string
}

function CreateSchedulePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<CreateSchedulePayload>({
    jobId: searchParams.get('jobId') ?? '',
    date: '',
  })
  const [job, setJob] = useState<JobInfo | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = useMemo(
    () => (localStorage.getItem('authToken') || '').trim().replace(/^"|"$/g, ''),
    []
  )
  const [jobError, setJobError] = useState<string | null>(() =>
    token ? null : 'Not authenticated. Please log in first.'
  )

  const createUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Schedules`
  }, [])

  const userJobUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Users/job`
  }, [])

  const today = useMemo(() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!token) return

    fetch(userJobUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load your job (status ${res.status})`)
        }
        return res.json() as Promise<JobInfo>
      })
      .then((info) => {
        setJob(info)
        setForm((prev) => ({ ...prev, jobId: info.jobId }))
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unable to load job info.'
        setJobError(message)
      })
  }, [token, userJobUrl])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setError(null)

    if (!job?.jobId) {
      setError('Job info not loaded. Please try again.')
      return
    }

    const token = (localStorage.getItem('authToken') || '').trim().replace(/^"|"$/g, '')
    if (!token) {
      setError('Not authenticated. Please log in first.')
      return
    }

    setIsSubmitting(true)

    fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, jobId: job.jobId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Request failed with status ${res.status}`)
        }
        return res.text()
      })
      .then(() => {
        setStatus('Appointment created.')
        setTimeout(() => navigate('/schedules'), 600)
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
        <div className="eyebrow">Schedules · POST /api/Schedules</div>
        <h1>New appointment</h1>
        <p>Job ID must match your job. Provide a date to schedule.</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid two">
          <label className="field">
            <span>Job</span>
            <input
              type="text"
              name="jobName"
              placeholder="Your job"
              value={job?.jobName ?? ''}
              readOnly
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={today}
              required
            />
          </label>
        </div>

        {jobError && <StatusMessage tone="error">{jobError}</StatusMessage>}
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        {status && !error && <StatusMessage>{status}</StatusMessage>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create appointment'}
        </Button>

        <Link className="text-link" to="/schedules">
          ← Back to schedules
        </Link>
      </form>
    </div>
  )
}

export default CreateSchedulePage
