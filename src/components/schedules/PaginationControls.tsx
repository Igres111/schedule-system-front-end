type PaginationControlsProps = {
  pageNumber: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
}

function PaginationControls({ pageNumber, loading, onPrev, onNext }: PaginationControlsProps) {
  return (
    <div className="pagination-controls">
      <button type="button" className="button ghost" disabled={loading} onClick={onPrev}>
        {'<<'}
      </button>
      <div className="page-label">Page {pageNumber}</div>
      <button type="button" className="button ghost" disabled={loading} onClick={onNext}>
        {'>>'}
      </button>
    </div>
  )
}

export default PaginationControls
