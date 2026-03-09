export default function TeamLoading() {
  return (
    <div className="container py-4">
      <div className="mb-4 space-y-2">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-4 h-10 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
