export function LoadingBlock({ label = 'Loading dataset…' }) {
  return (
    <div className="flex items-center gap-3 text-parchment-dim text-sm py-16 justify-center">
      <span className="h-3 w-3 rounded-full bg-gold animate-pulse" />
      {label}
    </div>
  )
}

export function ErrorBlock({ message }) {
  return (
    <div className="rounded-lg border border-ottoman/40 bg-ottoman/10 text-ottoman-bright text-sm px-4 py-3">
      Couldn't load this dataset: {message}
    </div>
  )
}
