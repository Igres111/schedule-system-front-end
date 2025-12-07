import { type ScheduleResponse } from '../../types/types'

type GridJob = {
  id: string
  title: string
}

type ScheduleGridProps = {
  dates: string[]
  jobs: GridJob[]
  data: ScheduleResponse | null
  role: string
  hovered: string | null
  onHover: (id: string | null) => void
  onStatusChange: (id: string, status: number) => void
}

type ScheduleItem = NonNullable<ScheduleResponse['items']>[number]

type ShiftCardProps = {
  item: ScheduleItem
  isAdmin: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
  onStatusChange: (id: string, status: number) => void
}

const ShiftCard = ({ item, isAdmin, isHovered, onHover, onStatusChange }: ShiftCardProps) => {
  const userName = `${item.firstName ?? item.userFirstName ?? ''} ${item.lastName ?? item.userLastName ?? ''}`.trim()
  const user = userName || 'Unknown user'

  const statusLabel =
    item.statusName ??
    (item.status === 1
      ? 'Pending'
      : item.status === 2
        ? 'Approved'
        : item.status === 3
          ? 'Rejected'
          : item.status)

  return (
    <div
      className={`shift-card status-${item.status}`}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="shift-title">{statusLabel}</div>
      <div className="shift-user">{user || 'Unassigned'}</div>
      {isAdmin && isHovered && (
        <div className="approve-overlay">
          <div className="approve-title">Confirm?</div>
          <div className="approve-actions">
            <button type="button" className="approve-btn accept" onClick={() => onStatusChange(item.id, 2)}>
              Accept
            </button>
            <button type="button" className="approve-btn reject" onClick={() => onStatusChange(item.id, 3)}>
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleGrid({ dates, jobs, data, role, hovered, onHover, onStatusChange }: ScheduleGridProps) {
  const renderCell = (jobId: string, date: string) => {
    const items = data?.items?.filter((i) => i.jobId === jobId && i.date === date) || []
    if (!items.length) return null

    return items.map((item) => (
      <ShiftCard
        key={item.id}
        item={item}
        isAdmin={role.toLowerCase() === 'admin'}
        isHovered={hovered === item.id}
        onHover={onHover}
        onStatusChange={onStatusChange}
      />
    ))
  }

  return (
    <div
      className="schedule-grid"
      style={{ gridTemplateColumns: `200px repeat(${Math.max(dates.length, 1)}, minmax(140px, 1fr))` }}
    >
      <div className="grid-header empty" />
      {dates.map((d) => {
        const dateObj = new Date(d)
        const label = dateObj.toLocaleDateString(undefined, { weekday: 'short' })
        const full = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        return (
          <div className="grid-header" key={d}>
            <div className="day">{label}</div>
            <div className="full-date">{full}</div>
          </div>
        )
      })}

      {jobs.map((job) => (
        <div className="grid-row" key={job.id}>
          <div className="grid-job">{job.title}</div>
          {dates.map((d) => (
            <div className="grid-cell" key={`${job.id}-${d}`}>
              {renderCell(job.id, d)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default ScheduleGrid
