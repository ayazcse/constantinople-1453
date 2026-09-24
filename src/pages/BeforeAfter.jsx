import { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import { buildSourceMap } from '../lib/format'

export default function BeforeAfter() {
  const { data, loading, error } = useDataMany(['before_after_comparison', 'sources'])
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Building the before/after comparison…" />
  if (error) return <ErrorBlock message={error} />

  const rows = data.before_after_comparison

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 06 — Before vs After 1453"
        title="Constantinople before, Istanbul after"
        blurb="Each dimension is tracked across three moments — before the siege, the immediate aftermath, and the longer Ottoman-era trajectory — and each claim is tagged Fact or Interpretation."
      />

      <div className="space-y-5">
        {rows.map((r) => (
          <Panel key={r.dimension} className="p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-xl text-parchment">{r.dimension}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase tracking-widish px-2 py-0.5 rounded-full border ${
                    r.fact_or_interpretation?.startsWith('Fact')
                      ? 'border-verdigris/40 text-verdigris-bright bg-verdigris/10'
                      : 'border-gold/40 text-gold bg-gold/10'
                  }`}
                >
                  {r.fact_or_interpretation}
                </span>
                <ConfidenceBadge level={r.confidence} />
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-stretch">
              <ComparisonCell label="Before 1453" text={r.before_1453} tone="byz" />
              <div className="hidden md:flex items-center justify-center text-parchment-faint">
                <ArrowRight size={18} />
              </div>
              <ComparisonCell label="Immediately after" text={r.after_1453_short_term} tone="ottoman" />
              <div className="hidden md:flex items-center justify-center text-parchment-faint">
                <ArrowRight size={18} />
              </div>
              <ComparisonCell label="Longer Ottoman era" text={r.after_1453_longer_term} tone="gold" />
            </div>

            <div className="mt-4 pt-3 border-t border-ink-line">
              <SourceCite ids={r.source_id_list} sourceMap={sourceMap} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function ComparisonCell({ label, text, tone }) {
  const toneClass = {
    byz: 'border-byz/30 bg-byz/5',
    ottoman: 'border-ottoman/30 bg-ottoman/5',
    gold: 'border-gold/30 bg-gold/5',
  }[tone]
  return (
    <div className={`rounded-lg border ${toneClass} p-3.5`}>
      <div className="text-[10px] uppercase tracking-widish text-parchment-faint mb-1.5">{label}</div>
      <p className="text-sm text-parchment-dim leading-relaxed">{text}</p>
    </div>
  )
}
