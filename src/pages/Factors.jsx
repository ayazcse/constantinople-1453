import { useMemo, useState } from 'react'
import { Scale } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import CategoryPill from '../components/CategoryPill'
import { buildSourceMap } from '../lib/format'

export default function Factors() {
  const { data, loading, error } = useDataMany(['strategic_factors', 'sources'])
  const [category, setCategory] = useState('All')
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Building the factor evidence matrix…" />
  if (error) return <ErrorBlock message={error} />

  const factors = data.strategic_factors
  const categories = ['All', ...Array.from(new Set(factors.map((f) => f.category)))]
  const filtered = category === 'All' ? factors : factors.filter((f) => f.category === category)

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 05 — Factors Behind the 1453 Outcome"
        title="A factor evidence matrix, not a fake scoreboard"
        blurb={`No "Factor A = 90%." Each of the ${factors.length} factors below is graded by evidence confidence and paired with a measurable indicator where one honestly exists — otherwise that's stated plainly too.`}
        right={
          <div className="flex items-center gap-2 text-xs text-parchment-faint">
            <Scale size={15} className="text-gold" /> Filter by category
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} size="md" />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map((f) => (
          <Panel key={f.factor_id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-widish text-parchment-faint">{f.factor_id} · {f.category}</span>
                <h3 className="font-display text-lg text-parchment leading-snug mt-0.5">{f.factor}</h3>
              </div>
              <ConfidenceBadge level={f.confidence} />
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-parchment-faint text-[11px] uppercase tracking-wide mb-1">Evidence</div>
                <p className="text-parchment-dim leading-relaxed">{f.evidence}</p>
              </div>
              <div>
                <div className="text-parchment-faint text-[11px] uppercase tracking-wide mb-1">Measurable indicator</div>
                <p className="text-parchment-dim leading-relaxed">{f.measurable_indicator}</p>
              </div>
              <div>
                <div className="text-parchment-faint text-[11px] uppercase tracking-wide mb-1">Interpretation</div>
                <p className="text-parchment-dim leading-relaxed">{f.historical_interpretation}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ink-line">
              <SourceCite ids={f.source_id_list} sourceMap={sourceMap} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
