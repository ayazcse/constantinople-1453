import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import CategoryPill from '../components/CategoryPill'
import { buildSourceMap } from '../lib/format'

const CATEGORY_COLORS = {
  Political: '#8E5FB0',
  Military: '#C85252',
  Naval: '#57937F',
  Diplomatic: '#E8C579',
  Infrastructure: '#8C8570',
  'Post-conquest': '#C6A24E',
}

export default function Timeline() {
  const { data, loading, error } = useDataMany(['campaign_timeline', 'sources'])
  const [category, setCategory] = useState('All')
  const [phase, setPhase] = useState('All')
  const [selected, setSelected] = useState(null)

  const events = data.campaign_timeline
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  const categories = useMemo(
    () => (events ? ['All', ...Array.from(new Set(events.map((e) => e.category)))] : ['All']),
    [events]
  )
  const phases = useMemo(
    () => (events ? ['All', ...Array.from(new Set(events.map((e) => e.phase)))] : ['All']),
    [events]
  )

  const filtered = useMemo(() => {
    if (!events) return []
    return events.filter(
      (e) => (category === 'All' || e.category === category) && (phase === 'All' || e.phase === phase)
    )
  }, [events, category, phase])

  const chartData = useMemo(() => {
    if (!events) return []
    const byPhase = {}
    for (const e of events) {
      byPhase[e.phase] = byPhase[e.phase] || {}
      byPhase[e.phase][e.category] = (byPhase[e.phase][e.category] || 0) + 1
    }
    return Object.entries(byPhase).map(([ph, cats]) => ({ phase: ph.replace(/^\d+\.\s*/, ''), ...cats }))
  }, [events])

  if (loading) return <LoadingBlock label="Loading the campaign timeline…" />
  if (error) return <ErrorBlock message={error} />

  const active = selected || filtered[0]

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 02 — Campaign Timeline"
        title="From prelude to rebuilding, 1444–1481"
        blurb="Every dated event below carries a confidence level and a source list. Where sources disagree on a date, that's noted rather than silently picked for you."
      />

      <Panel className="p-5">
        <h3 className="text-sm font-semibold text-parchment mb-4">Events per phase, by category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2F42" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#8C8570', fontSize: 11 }} axisLine={{ stroke: '#2A2F42' }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="phase"
                width={190}
                tick={{ fill: '#C7BC9F', fontSize: 11 }}
                axisLine={{ stroke: '#2A2F42' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#1C2030', border: '1px solid #2A2F42', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#ECE3CE' }}
              />
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5 text-[11px] text-parchment-dim">
              <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
              {cat}
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {phases.map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                phase === p
                  ? 'border-gold/50 text-gold-bright bg-gold/10'
                  : 'border-ink-line text-parchment-faint hover:text-parchment-dim'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-2 max-h-[720px] overflow-y-auto pr-1">
          {filtered.map((e) => (
            <button
              key={e.event_id}
              onClick={() => setSelected(e)}
              className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                active?.event_id === e.event_id
                  ? 'border-gold/50 bg-gold/10'
                  : 'border-ink-line bg-ink-panel/50 hover:border-gold/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] tabular-nums text-gold/80">{e.date}</span>
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLORS[e.category] || '#8C8570' }}
                />
              </div>
              <div className="text-sm text-parchment leading-snug mt-1">{e.event}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-parchment-faint py-8 text-center">No events match these filters.</p>
          )}
        </div>

        <div className="lg:col-span-3">
          {active ? (
            <Panel className="p-6 sticky top-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-widish text-parchment-faint">{active.phase}</div>
                  <h3 className="font-display text-2xl text-parchment mt-1 leading-snug">{active.event}</h3>
                </div>
                <ConfidenceBadge level={active.confidence} />
              </div>

              <dl className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
                <div>
                  <dt className="text-parchment-faint text-xs uppercase tracking-wide mb-0.5">Date</dt>
                  <dd className="text-parchment tabular-nums">
                    {active.date}
                    {active.date_uncertainty_days > 0 && ` (±${active.date_uncertainty_days}d)`}
                  </dd>
                </div>
                <div>
                  <dt className="text-parchment-faint text-xs uppercase tracking-wide mb-0.5">Category</dt>
                  <dd><CategoryPill label={active.category} active size="sm" /></dd>
                </div>
                <div>
                  <dt className="text-parchment-faint text-xs uppercase tracking-wide mb-0.5">Actor(s)</dt>
                  <dd className="text-parchment">{active.actor || '—'}</dd>
                </div>
                <div>
                  <dt className="text-parchment-faint text-xs uppercase tracking-wide mb-0.5">Location</dt>
                  <dd className="text-parchment">{active.location || '—'}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <div className="text-parchment-faint text-xs uppercase tracking-wide mb-1">Context</div>
                <p className="text-parchment-dim text-sm leading-relaxed">{active.description}</p>
              </div>

              <div className="mt-4">
                <div className="text-parchment-faint text-xs uppercase tracking-wide mb-1">Analytical significance</div>
                <p className="text-parchment-dim text-sm leading-relaxed">{active.strategic_effect}</p>
              </div>

              {active.conflict_note && (
                <div className="mt-4 rounded-lg border border-gold/25 bg-gold/5 px-4 py-3">
                  <div className="text-gold text-xs uppercase tracking-wide mb-1 font-semibold">Source disagreement</div>
                  <p className="text-parchment-dim text-xs leading-relaxed">{active.conflict_note}</p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-ink-line">
                <SourceCite ids={active.source_id_list} sourceMap={sourceMap} />
              </div>
            </Panel>
          ) : (
            <p className="text-parchment-faint text-sm">Select an event to see details.</p>
          )}
        </div>
      </div>
    </div>
  )
}
