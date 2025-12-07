import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/schedules/PageHeader'
import PaginationControls from '../components/schedules/PaginationControls'
import ScheduleGrid from '../components/schedules/ScheduleGrid'
import { type ScheduleResponse } from '../types/types'

type GridJob = {
  id: string
  title: string
}

function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [basePeriod] = useState(searchParams.get('Period') ?? 'week')
  const [pageNumber, setPageNumber] = useState(Number(searchParams.get('PageNumber')) || 1)
  const [pageSize] = useState(10)
  const [data, setData] = useState<ScheduleResponse | null>(null)
  const [jobCache, setJobCache] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const getJobTitle = (item: { jobId: string; jobName?: string; jobTitle?: string }) =>
    item.jobName || item.jobTitle || item.jobId || 'Job'

  const schedulesUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Schedules`
  }, [])

  const updateStatusUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Schedules`
  }, [])

  const userJobUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, '') ?? ''
    return `${base}/api/Users/job`
  }, [])

  const role = useMemo(() => (localStorage.getItem('authRole') || '').trim(), [])

  const computedPeriod = useMemo(() => {
    if (pageNumber >= 5) return 'year'
    if (pageNumber >= 2) return 'month'
    return basePeriod || 'week'
  }, [pageNumber, basePeriod])

  const fetchData = () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    params.append('Period', computedPeriod)
    params.append('PageNumber', '1')
    params.append('PageSize', pageSize.toString())

    const token = (localStorage.getItem('authToken') || '').trim().replace(/^"|"$/g, '')
    if (!token) {
      setError('Not authenticated. Please log in first.')
      setLoading(false)
      return
    }

    const requestUrl = `${schedulesUrl}?${params.toString()}`

    fetch(requestUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Request failed with status ${res.status}`)
        }
        const raw = await res.text()
        try {
          const parsed = JSON.parse(raw) as ScheduleResponse
          return parsed
        } catch {
          throw new Error('Failed to parse schedules response.')
        }
      })
      .then((json) => {
        if (json?.items?.length) {
          const updates: Record<string, string> = {}
          json.items.forEach((item) => {
            const title = getJobTitle(item)
            updates[item.jobId] = title
          })
          setJobCache((prev) => ({ ...prev, ...updates }))
        }
        setData(json)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
      .finally(() => setLoading(false))
  }

  const handleStatusChange = (scheduleId: string, status: number) => {
    const token = (localStorage.getItem('authToken') || '').trim().replace(/^"|"$/g, '')
    if (!token) {
      setError('Not authenticated. Please log in first.')
      return
    }

    fetch(`${updateStatusUrl}/${scheduleId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to update status (${res.status})`)
        }
        return res
      })
      .then(() => fetchData())
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      })
  }

  useEffect(() => {
    const token = (localStorage.getItem('authToken') || '').trim().replace(/^"|"$/g, '')
    if (!token) return

    fetch(userJobUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          return
        }
        const raw = await res.text()
        try {
          const parsed = JSON.parse(raw) as
            | { jobId: string; jobName?: string }
            | Array<{ jobId: string; jobName?: string }>

          const items = Array.isArray(parsed) ? parsed : [parsed]
          if (!items.length) return

          const updates: Record<string, string> = {}
          items.forEach((item) => {
            if (item?.jobId) {
              updates[item.jobId] = item.jobName || item.jobId
            }
          })

          if (Object.keys(updates).length) {
            setJobCache((prev) => ({
              ...prev,
              ...updates,
            }))
          }
        } catch {
          return
        }
      })
      .catch(() => undefined)
  }, [userJobUrl])

  useEffect(() => {
    const nextParams = {
      Period: computedPeriod,
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    }
    const currentPeriod = searchParams.get('Period') ?? ''
    const currentPage = searchParams.get('PageNumber') ?? ''
    const currentSize = searchParams.get('PageSize') ?? ''
    if (
      currentPeriod !== nextParams.Period ||
      currentPage !== nextParams.PageNumber ||
      currentSize !== nextParams.PageSize
    ) {
      setSearchParams(nextParams)
    }
  }, [computedPeriod, pageNumber, pageSize, searchParams, setSearchParams])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [computedPeriod, pageNumber, pageSize])

  const dates = useMemo(() => {
    const result: string[] = []
    const baseStart = new Date()
    baseStart.setHours(0, 0, 0, 0)

    const start = new Date(baseStart)
    start.setDate(start.getDate() + (pageNumber - 1) * 7)

    const toLocalYMD = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      result.push(toLocalYMD(d))
    }

    return result
  }, [pageNumber])

  const jobs = useMemo<GridJob[]>(() => {
    const byId = new Map<string, string>()

    if (data?.items?.length) {
      data.items.forEach((item) => {
        const title = getJobTitle(item as { jobId: string; jobName?: string; jobTitle?: string })
        byId.set(item.jobId, title)
      })
    }

    Object.entries(jobCache).forEach(([jobId, title]) => {
      if (!byId.has(jobId)) {
        byId.set(jobId, title)
      }
    })

    if (byId.size === 0) return []

    return Array.from(byId.entries()).map(([id, title]) => ({ id, title }))
  }, [data, jobCache])

  const headerRange = useMemo(() => {
    if (!dates.length) return 'No dates'
    const first = new Date(dates[0])
    const last = new Date(dates[dates.length - 1])
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    return `${first.toLocaleDateString(undefined, opts)} - ${last.toLocaleDateString(undefined, opts)}`
  }, [dates])

  return (
    <div className="schedules-page">
      <div className="page-top">
        <PageHeader headerRange={headerRange} />
        <PaginationControls
          pageNumber={pageNumber}
          loading={loading}
          onPrev={() => {
            const next = Math.max(1, pageNumber - 1)
            setPageNumber(next)
          }}
          onNext={() => {
            const next = pageNumber + 1
            setPageNumber(next)
          }}
        />
      </div>

      {error && <div className="status error">Error: {error}</div>}

      <ScheduleGrid
        dates={dates}
        jobs={jobs}
        data={data}
        role={role}
        hovered={hovered}
        onHover={setHovered}
        onStatusChange={handleStatusChange}
      />

      <div className="actions bottom">
        <Link className="button ghost" to="/schedules/new">
          + Add new appointment
        </Link>
      </div>
    </div>
  )
}

export default SchedulesPage
