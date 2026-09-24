import { useMemo, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'
import SourceCite from '../components/SourceCite'
import { buildSourceMap, fmtNum } from '../lib/format'

const CONF_COLOR = { High: '#57937F', Medium: '#C6A24E', Low: '#C85252' }

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="bg-ink-panel border border-ink-line rounded-lg px-3 py-2.5 text-xs max-w-[260px] shadow-panel">
      <div className="text-parchment font-medium mb-1">{p.period_label}</div>
      <div className="text-gold tabular-nums mb-1">
        {p.is_range_only ? `${fmtNum(p.population_low)}–${fmtNum(p.population_high)}` : fmtNum(p.display_value)} people
      </div>
      <div className="text-parchment-faint">{p.method}</div>
    </div>
  )
}

export default function Transformation() {
  const { data, loading, error } = useDataMany(['population_context', 'historical_events', 'sources'])
  const [logScale, setLogScale] = useState(true)
  const sourceMap = useMemo(() => buildSourceMap(data.sources), [data.sources])

  if (loading) return <LoadingBlock label="Charting the long transformation…" />
  if (error) return <ErrorBlock message={error} />

  const pop = data.population_context.filter((p) => p.display_value !== null && p.year_numeric !== null)
  const lineData = pop.map((p) => ({ year_numeric: p.year_numeric, display_value: p.display_value }))
  const events = data.historical_events

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 07 — The Transformation into Istanbul"
        title="From 40,000 souls to 15.75 million, unevenly"
        blurb="Population figures come from very different methods across 16 centuries — chronicle guesses, tax registers, national censuses, administrative registers. The chart says so; treat the early centuries as order-of-magnitude, not survey data."
        right={
          <button
            onClick={() => setLogScale((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-full border border-ink-line text-parchment-dim hover:border-gold/40 hover:text-parchment transition"
          >
            {logScale ? 'Log scale' : 'Linear scale'} — click to toggle
          </button>
        }
      />

      <Panel className="p-5">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2A2F42" strokeDasharray="3 3" />
              <XAxis
                dataKey="year_numeric"
                type="number"
                domain={[300, 2030]}
                tick={{ fill: '#8C8570', fontSize: 11 }}
                axisLine={{ stroke: '#2A2F42' }}
                tickLine={false}
                tickFormatter={(y) => (y < 1000 ? `${y}` : y)}
              />
              <YAxis
                dataKey="display_value"
                scale={logScale ? 'log' : 'linear'}
                domain={logScale ? [10000, 20000000] : [0, 16000000]}
                tick={{ fill: '#8C8570', fontSize: 11 }}
                axisLine={{ stroke: '#2A2F42' }}
                tickLine={false}
                tickFormatter={(v) => (v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : v)}
                width={54}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                data={lineData}
                dataKey="display_value"
                stroke="#3A3F55"
                strokeWidth={1.5}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Scatter
                data={pop}
                dataKey="display_value"
                fill="#C6A24E"
                shape={(props) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.is_range_only ? 4 : 5.5}
                      fill={CONF_COLOR[payload.confidence] || '#C6A24E'}
                      stroke="#10121A"
                      strokeWidth={1.5}
                      opacity={payload.is_range_only ? 0.6 : 0.95}
                    />
                  )
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-parchment-faint">
          {Object.entries(CONF_COLOR).map(([k, c]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {k} confidence
            </div>
          ))}
          <span className="italic">Hollow-ish dots = range-only estimate, no single point figure</span>
        </div>
      </Panel>

      {/* Century timeline of macro events */}
      <Panel className="p-5 md:p-6">
        <div className="flex items-center gap-2 text-gold mb-4">
          <TrendingUp size={17} />
          <h3 className="font-display text-xl text-parchment">Macro timeline: 330 – present</h3>
        </div>
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.event_id} className="flex gap-4">
              <div className="w-24 shrink-0 text-right">
                <span className="text-xs tabular-nums text-gold/80">{e.year_start}{e.year_end !== e.year_start ? `–${e.year_end}` : ''}</span>
              </div>
              <div className="w-px bg-ink-line relative shrink-0">
                <span className="absolute -left-[3.5px] top-0.5 h-2 w-2 rounded-full bg-gold" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-medium text-parchment">{e.event_name}</h4>
                  <ConfidenceBadge level={e.confidence} />
                </div>
                <p className="text-xs text-parchment-dim mt-1 leading-relaxed">{e.description}</p>
                <div className="mt-1.5">
                  <SourceCite ids={e.source_id_list} sourceMap={sourceMap} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
