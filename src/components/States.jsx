// Petits composants d'état : vide, erreur, squelettes de chargement.

export function EmptyState({ title, children, icon = '👾' }) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-pixel text-[0.65rem] leading-relaxed text-ink-strong">{title}</p>
      {children && <p className="max-w-sm text-sm text-muted">{children}</p>}
    </div>
  )
}

export function ErrorMessage({ children, onRetry }) {
  return (
    <div className="rounded-lg border border-[#c62828]/50 bg-[#c62828]/10 px-4 py-3 text-sm text-[#ff8a80]" role="alert">
      <p>{children}</p>
      {onRetry && (
        <button className="mt-2 font-semibold underline underline-offset-2" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="skeleton h-20 w-16 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-3.5 w-2/3" />
        <div className="skeleton h-3 w-1/4" />
      </div>
    </div>
  )
}
