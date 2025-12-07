type PageHeaderProps = {
  headerRange: string
}

function PageHeader({ headerRange }: PageHeaderProps) {
  return (
    <div>
      <div className="eyebrow">Schedules Aú GET /api/Schedules</div>
      <h1>ShiftController</h1>
      <p className="muted">{headerRange}</p>
    </div>
  )
}

export default PageHeader
