type StatusMessageProps = {
  tone?: 'default' | 'error'
  children: string
}

function StatusMessage({ tone = 'default', children }: StatusMessageProps) {
  const className = tone === 'error' ? 'status error' : 'status'
  return <div className={className}>{tone === 'error' ? `Error: ${children}` : children}</div>
}

export default StatusMessage
