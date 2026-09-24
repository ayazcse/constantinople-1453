import { useMemo } from 'react'
import { ShieldHalf } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import RangeBar from '../components/RangeBar'
import { buildSourceMap } from '../lib/format'

const ROLE_COLOR = {
  Primary: 'text-ottoman-bright border-ottoman/40 bg-ottoman/10',
  'Primary (naval)': 'text-ottoman-bright border-ottoman/40 bg-ottoman/10',
  'Primary (naval interdiction)': 'text-ottoman-bright border-ottoman/40 bg-ottoman/10',
  Supporting: 'text-verdigris-bright border-verdigris/40 bg-verdigris/10',
  'Supporting (naval interdiction)': 'text-verdigris-bright border-verdigris/40 bg-verdigris/10',
}

export default function Defensive() {
  const { data, loading, error } = useDataMany(['fortifications', 'sources'])
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Loading the defensive system dataset…" />
  if (error) return <ErrorBlock message={error} />

  const forts = data.fortifications
  const globalMaxLength = Math.max(...forts.map((f) => f.length_m_max || 0), 100)
  const globalMaxHeight = Math.max(...forts.map((f) => f.height_m_max || 0), 5)
  const globalMaxThickness = Math.max(...forts.map((f) => f.thickness_m_max || 0), 2)
  const globalMaxTowers = Math.max(...forts.map((f) => f.tower_count_max || 0), 10)
  const globalMaxMoat = Math.max(...forts.map((f) => f.moat_width_m_max || 0), 10)

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 04 — Defensive System Analysis"
        title="The fortifications, evidence-graded"
        blurb="No invented 'strength scores.' Each structure is classified by strategic role and evidence confidence, with dimension ranges shown as ranges — not false precision."
      />

      <div className="grid md:grid-cols-2 gap-5">
        {forts.map((f) => (
          <Panel key={f.structure_id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldHalf size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-parchment leading-snug">{f.structure}</h3>
                  <p className="text-xs text-parchment-faint mt-0.5">{f.construction_period}</p>
                </div>
              </div>
              <ConfidenceBadge level={f.confidence} />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${ROLE_COLOR[f.strategic_role] || 'text-parchment-dim border-ink-line'}`}>
                {f.strategic_role}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-ink-line text-parchment-faint">
                {f.defensive_role}
              </span>
            </div>

            <div className="mt-4 divide-y divide-ink-line/60">
              <RangeBar label="Length" min={f.length_m_min} max={f.length_m_max} unit="m" globalMax={globalMaxLength} color="#C6A24E" />
              <RangeBar label="Height" min={f.height_m_min} max={f.height_m_max} unit="m" globalMax={globalMaxHeight} color="#8E5FB0" />
              <RangeBar label="Thickness" min={f.thickness_m_min} max={f.thickness_m_max} unit="m" globalMax={globalMaxThickness} color="#57937F" />
              <RangeBar label="Towers" min={f.tower_count_min} max={f.tower_count_max} unit="" globalMax={globalMaxTowers} color="#E8C579" />
              <RangeBar label="Moat width" min={f.moat_width_m_min} max={f.moat_width_m_max} unit="m" globalMax={globalMaxMoat} color="#C85252" />
            </div>

            {f.length_note && (
              <p className="text-[11px] text-parchment-faint mt-3 leading-relaxed italic">{f.length_note}</p>
            )}

            <p className="text-sm text-parchment-dim mt-3 leading-relaxed">
              <span className="text-parchment-faint text-xs uppercase tracking-wide block mb-0.5">Condition in 1453</span>
              {f.condition_1453}
            </p>

            {f.conflict_note && (
              <div className="mt-3 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[11px] text-parchment-dim leading-relaxed">
                <span className="text-gold font-semibold uppercase tracking-wide">Note: </span>
                {f.conflict_note}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-ink-line">
              <SourceCite ids={f.source_id_list} sourceMap={sourceMap} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
