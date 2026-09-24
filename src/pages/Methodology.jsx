import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Workflow, Database, CheckCircle2, FileSpreadsheet, ArrowRight, ExternalLink } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'

const PIPELINE_STEPS = [
  { icon: Database, title: 'Raw data', desc: '13 hand-curated, sourced CSVs in /data/raw — every row cites at least one source_id (or explicitly says N/A).' },
  { icon: Workflow, title: 'Load & clean', desc: 'scripts/01_load_raw.py sanity-checks every file; 02_clean_transform.py types columns, parses dates, splits source-id lists.' },
  { icon: CheckCircle2, title: 'Validate', desc: '03_validate.py checks every source_id resolves, confidence levels are in the allowed set, coordinates fall in a sane bounding box, and ids are unique.' },
  { icon: FileSpreadsheet, title: 'Export', desc: '04_export.py writes data/processed/*.csv and public/data/{csv,json} — what this website and the Data Explorer actually read.' },
]

const TIER_COLOR = { 'Tier 1': 'text-verdigris-bright', 'Tier 2': 'text-gold', 'Tier 3': 'text-ottoman-bright' }

export default function Methodology() {
  const { data, loading, error } = useDataMany(['sources'])
  const [tierFilter, setTierFilter] = useState('All')

  if (loading) return <LoadingBlock label="Loading methodology & sources…" />
  if (error) return <ErrorBlock message={error} />

  const sources = data.sources
  const tierCounts = ['Tier 1', 'Tier 2', 'Tier 3'].map((t) => ({
    tier: t,
    count: sources.filter((s) => s.tier === t).length,
  }))
  const filtered = tierFilter === 'All' ? sources : sources.filter((s) => s.tier === tierFilter)

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Page 10 — Methodology & Sources"
        title="How this project decides what to trust"
        blurb="This page is the project's honesty mechanism: the pipeline that produced every chart, the tier system behind every source tag, and the full source register."
      />

      <Panel className="p-6 md:p-8">
        <h3 className="font-display text-xl text-parchment mb-5">The data pipeline</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {PIPELINE_STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex items-center gap-2 text-gold mb-2">
                <s.icon size={17} />
                <span className="text-[11px] uppercase tracking-widish text-parchment-faint">Step {i + 1}</span>
              </div>
              <h4 className="text-sm font-semibold text-parchment mb-1.5">{s.title}</h4>
              <p className="text-xs text-parchment-dim leading-relaxed">{s.desc}</p>
              {i < PIPELINE_STEPS.length - 1 && (
                <ArrowRight size={14} className="hidden md:block absolute -right-2.5 top-1 text-parchment-faint" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg bg-ink/60 border border-ink-line px-4 py-3 font-mono text-[11px] text-parchment-dim">
          python scripts/run_pipeline.py
          <span className="text-parchment-faint"> {'  '}# runs all four steps in order, stops on hard validation failures</span>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-5">
        <Panel className="p-6">
          <h3 className="font-display text-lg text-parchment mb-4">Source tier system</h3>
          <div className="space-y-3 text-sm">
            <TierRow tier="Tier 1" label="Scholarly / primary" desc="Peer-reviewed scholarship, edited primary-source translations, standard academic references (e.g. the Oxford Dictionary of Byzantium, Sphrantzes's chronicle)." count={tierCounts[0].count} />
            <TierRow tier="Tier 2" label="Institutional / reference" desc="Encyclopaedia Britannica, UNESCO, heritage-project databases, national statistics institutes — credible but not peer-reviewed scholarship." count={tierCounts[1].count} />
            <TierRow tier="Tier 3" label="Popular / secondary" desc="Educational nonprofits, travel and history blogs, news summaries — used for corroboration or when no better source was found, always flagged as such." count={tierCounts[2].count} />
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="font-display text-lg text-parchment mb-4">Known limitations</h3>
          <ul className="space-y-2.5 text-sm text-parchment-dim leading-relaxed list-disc list-inside marker:text-gold/60">
            <li>Several dimension figures (wall length, army size) genuinely conflict across sources — see the Source Claims Ledger in the Data Explorer rather than a single "true" number.</li>
            <li>Some Tier 3 sources could not be independently corroborated and are marked Low confidence rather than excluded outright, so the disagreement stays visible.</li>
            <li>Coordinates for most gates and campaign positions are approximate historical placements, not GPS surveys — three gates use published GPS values, everything else is labelled "Approximate" or "Schematic."</li>
            <li>The 1477 census breakdown by community is only partially verified — the Jewish figure is sourced directly; the rest is kept as an unverified residual rather than invented.</li>
            <li>General historical-knowledge rows (e.g. Tanzimat era, 1923 capital move to Ankara) are marked with source_ids of "N/A" and lower confidence, since this project's search process did not independently verify them.</li>
          </ul>
        </Panel>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl text-parchment">Full source register — {sources.length} entries</h3>
          <div className="flex gap-2">
            {['All', 'Tier 1', 'Tier 2', 'Tier 3'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  tierFilter === t ? 'border-gold/50 bg-gold/10 text-gold-bright' : 'border-ink-line text-parchment-faint'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto max-h-[520px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-ink-panel z-10">
                <tr>
                  {['ID', 'Title', 'Author', 'Tier', 'Type', 'Used in', 'Link'].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-parchment-dim whitespace-nowrap border-b border-ink-line">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.source_id} className="odd:bg-ink-panel/30 hover:bg-gold/5 align-top">
                    <td className="px-3 py-2 text-gold font-medium whitespace-nowrap">{s.source_id}</td>
                    <td className="px-3 py-2 text-parchment max-w-xs">{s.title}</td>
                    <td className="px-3 py-2 text-parchment-dim max-w-[160px]">{s.author}</td>
                    <td className={`px-3 py-2 font-medium whitespace-nowrap ${TIER_COLOR[s.tier]}`}>{s.tier}</td>
                    <td className="px-3 py-2 text-parchment-faint whitespace-nowrap">{s.source_type}</td>
                    <td className="px-3 py-2 text-parchment-faint max-w-[180px]">{s.used_in ? String(s.used_in).replace(/;/g, ', ') : '—'}</td>
                    <td className="px-3 py-2">
                      {s.url && s.url !== 'N/A' ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-gold hover:text-gold-bright inline-flex">
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="text-parchment-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <p className="text-xs text-parchment-faint mt-3">
          Want the raw file? <Link to="/explorer" className="text-gold hover:text-gold-bright underline underline-offset-2">Open the Data Explorer</Link> and download sources.csv directly.
        </p>
      </div>
    </div>
  )
}

function TierRow({ tier, label, desc, count }) {
  return (
    <div className="flex gap-3">
      <div className={`shrink-0 w-14 text-center rounded-md border border-ink-line py-1 text-[11px] font-semibold ${TIER_COLOR[tier]}`}>
        {count}
      </div>
      <div>
        <div className="text-parchment font-medium text-sm">{tier} <span className="text-parchment-faint font-normal">— {label}</span></div>
        <p className="text-xs text-parchment-dim leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
