export default function RangeBar({ label, min, max, unit, globalMax, color = '#C6A24E' }) {
  const hasData = min !== null && min !== undefined && !Number.isNaN(min)
  const hasMax = max !== null && max !== undefined && !Number.isNaN(max)
  if (!hasData && !hasMax) {
    return (
      <div className="flex items-center justify-between text-xs py-1.5">
        <span className="text-parchment-faint">{label}</span>
        <span className="text-parchment-faint italic">N/A — not found in sources reviewed</span>
      </div>
    )
  }
  const lo = hasData ? min : max
  const hi = hasMax ? max : min
  const leftPct = Math.max(0, (lo / globalMax) * 100)
  const widthPct = Math.max(1.5, ((hi - lo) / globalMax) * 100)

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-parchment-dim">{label}</span>
        <span className="text-parchment tabular-nums">
          {lo === hi ? `${lo} ${unit}` : `${lo}–${hi} ${unit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-line/70 relative overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color, opacity: 0.85 }}
        />
      </div>
    </div>
  )
}
