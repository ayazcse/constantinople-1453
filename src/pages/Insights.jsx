import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import { buildSourceMap } from '../lib/format'

export default function Insights() {
  const { data, loading, error } = useDataMany(['insights', 'sources'])
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Loading analytical insights…" />
  if (error) return <ErrorBlock message={error} />

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 08 — Analytical Insights"
        title="Nine findings, each traceable back to the data"
        blurb={`No "the Ottomans won because they were stronger." Every insight below names its evidence, states an interpretation distinct from that evidence, and carries a confidence level.`}
      />

      <div className="space-y-5">
        {data.insights.map((ins, i) => (
          <Panel key={ins.insight_id} className="p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-10 w-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                <span className="font-display text-gold-bright text-sm">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className="font-display text-xl text-parchment leading-snug">{ins.title}</h3>
                  <ConfidenceBadge level={ins.confidence} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widish text-verdigris-bright mb-1.5">
                      <span className="h-1 w-1 rounded-full bg-verdigris-bright" /> Evidence
                    </div>
                    <p className="text-sm text-parchment-dim leading-relaxed">{ins.evidence}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widish text-gold mb-1.5">
                      <Lightbulb size={11} /> Interpretation
                    </div>
                    <p className="text-sm text-parchment-dim leading-relaxed">{ins.interpretation}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-line">
                  <SourceCite ids={ins.source_id_list} sourceMap={sourceMap} />
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
