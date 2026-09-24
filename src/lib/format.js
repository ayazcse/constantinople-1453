export function fmtNum(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function fmtCompact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function fmtYear(y) {
  if (y === null || y === undefined) return '—'
  const n = Number(y)
  if (Number.isNaN(n)) return String(y)
  return n < 0 ? `${Math.abs(n)} BCE` : `${n} CE`
}

/** Build a lookup map source_id -> source record */
export function buildSourceMap(sources) {
  const map = new Map()
  for (const s of sources || []) map.set(s.source_id, s)
  return map
}

export const CONFIDENCE_COLORS = {
  High: { dot: 'bg-verdigris-bright', text: 'text-verdigris-bright', ring: 'ring-verdigris/40' },
  Medium: { dot: 'bg-gold', text: 'text-gold', ring: 'ring-gold/40' },
  Low: { dot: 'bg-ottoman-bright', text: 'text-ottoman-bright', ring: 'ring-ottoman/40' },
  'Not verified': { dot: 'bg-parchment-faint', text: 'text-parchment-faint', ring: 'ring-parchment-faint/40' },
}

export const TIER_LABEL = {
  'Tier 1': 'Tier 1 — Scholarly / primary',
  'Tier 2': 'Tier 2 — Institutional / reference',
  'Tier 3': 'Tier 3 — Popular / secondary',
}
