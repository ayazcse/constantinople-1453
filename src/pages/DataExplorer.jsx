import { useMemo, useState } from 'react'
import { Search, Download, ArrowUpDown, Table2 } from 'lucide-react'
import { useData } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import SectionHeading from '../components/SectionHeading'

const DATASETS = [
  { key: 'campaign_timeline', label: 'Campaign Timeline' },
  { key: 'historical_events', label: 'Historical Events (macro)' },
  { key: 'fortifications', label: 'Fortifications' },
  { key: 'locations', label: 'Locations' },
  { key: 'population_context', label: 'Population Context' },
  { key: 'population_1477_households', label: '1477 Household Register' },
  { key: 'strategic_factors', label: 'Strategic Factors' },
  { key: 'post_conquest_transformation', label: 'Post-Conquest Transformation' },
  { key: 'before_after_comparison', label: 'Before vs After Comparison' },
  { key: 'insights', label: 'Analytical Insights' },
  { key: 'source_claims', label: 'Source Claims Ledger' },
  { key: 'sources', label: 'Sources Register' },
]

const HIDDEN_COLS = new Set(['source_id_list', 'dataset_used', 'coordinates_parsed'])

export default function DataExplorer() {
  const [datasetKey, setDatasetKey] = useState('campaign_timeline')
  const [query, setQuery] = useState('')
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState(1)

  const { data: rows, loading, error } = useData(datasetKey)

  const columns = useMemo(() => {
    if (!rows || !rows.length) return []
    return Object.keys(rows[0]).filter((c) => !HIDDEN_COLS.has(c))
  }, [rows])

  const filtered = useMemo(() => {
    if (!rows) return []
    let out = rows
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter((r) => columns.some((c) => String(r[c] ?? '').toLowerCase().includes(q)))
    }
    if (sortCol) {
      out = [...out].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol]
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir
        return String(av).localeCompare(String(bv)) * sortDir
      })
    }
    return out
  }, [rows, query, sortCol, sortDir, columns])

  function toggleSort(col) {
    if (sortCol === col) {
      setSortDir((d) => -d)
    } else {
      setSortCol(col)
      setSortDir(1)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Page 09 — Data Explorer"
        title="Every dataset, raw and downloadable"
        blurb="Filter, search, sort, and inspect the exact CSVs the rest of this project is built on. Nothing here is pre-summarized."
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {DATASETS.map((d) => (
            <button
              key={d.key}
              onClick={() => { setDatasetKey(d.key); setQuery(''); setSortCol(null) }}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                datasetKey === d.key
                  ? 'border-gold/50 bg-gold/10 text-gold-bright'
                  : 'border-ink-line text-parchment-faint hover:text-parchment-dim'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <a
          href={`/data/csv/${datasetKey}.csv`}
          download
          className="inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition shrink-0"
        >
          <Download size={14} /> Download {datasetKey}.csv
        </a>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${rows?.length ?? 0} records…`}
          className="w-full rounded-lg border border-ink-line bg-ink-panel/70 pl-9 pr-3 py-2.5 text-sm text-parchment placeholder:text-parchment-faint focus:outline-none focus:border-gold/40"
        />
      </div>

      {loading ? (
        <LoadingBlock label={`Loading ${datasetKey}…`} />
      ) : error ? (
        <ErrorBlock message={error} />
      ) : (
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-line text-xs text-parchment-faint">
            <div className="flex items-center gap-1.5"><Table2 size={13} /> {filtered.length} of {rows.length} rows</div>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-ink-panel z-10">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      onClick={() => toggleSort(c)}
                      className="text-left px-3 py-2.5 font-semibold text-parchment-dim whitespace-nowrap cursor-pointer hover:text-gold border-b border-ink-line select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        {c}
                        {sortCol === c && <ArrowUpDown size={11} className="text-gold" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="odd:bg-ink-panel/30 hover:bg-gold/5">
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2 text-parchment-dim align-top max-w-xs">
                        <span className="line-clamp-2">{formatCell(row[c])}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  )
}

function formatCell(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}
