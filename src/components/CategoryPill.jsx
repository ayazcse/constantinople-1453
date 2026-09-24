const PALETTE = [
  'text-byz-bright border-byz/40 bg-byz/10',
  'text-ottoman-bright border-ottoman/40 bg-ottoman/10',
  'text-verdigris-bright border-verdigris/40 bg-verdigris/10',
  'text-gold-bright border-gold/40 bg-gold/10',
]

function hashColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export default function CategoryPill({ label, active = false, onClick, size = 'sm' }) {
  const colorClass = hashColor(label)
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center rounded-full border font-medium tracking-wide transition ${pad} ${
        active ? colorClass : 'text-parchment-faint border-ink-line bg-ink-panel/50 hover:text-parchment-dim'
      }`}
    >
      {label}
    </Comp>
  )
}
