import Panel from './Panel'

export default function KpiStat({ label, value, sub, accent = 'gold' }) {
  const accentClass = {
    gold: 'text-gold-bright',
    byz: 'text-byz-bright',
    ottoman: 'text-ottoman-bright',
    verdigris: 'text-verdigris-bright',
  }[accent]
  return (
    <Panel className="p-4 md:p-5">
      <div className="text-[11px] uppercase tracking-widish text-parchment-faint font-semibold mb-2">
        {label}
      </div>
      <div className={`font-display text-3xl md:text-4xl ${accentClass} tabular-nums leading-none`}>
        {value}
      </div>
      {sub && <div className="text-xs text-parchment-dim mt-2 leading-snug">{sub}</div>}
    </Panel>
  )
}
