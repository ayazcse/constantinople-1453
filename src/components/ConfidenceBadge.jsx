import { CONFIDENCE_COLORS } from '../lib/format'

export default function ConfidenceBadge({ level, size = 'sm' }) {
  const c = CONFIDENCE_COLORS[level] || CONFIDENCE_COLORS['Not verified']
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 ${c.ring} ${pad} font-body font-medium tracking-wide text-parchment/90 bg-ink-panel/60`}
      title={`Evidence confidence: ${level}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  )
}
