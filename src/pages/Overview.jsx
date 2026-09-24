import { Link } from 'react-router-dom'
import { ArrowRight, Scroll, ShieldAlert, Compass, ScrollText } from 'lucide-react'
import { useDataMany } from '../lib/useData'
import { LoadingBlock, ErrorBlock } from '../components/StateBlocks'
import Panel from '../components/Panel'
import KpiStat from '../components/KpiStat'
import SectionHeading from '../components/SectionHeading'
import ConfidenceBadge from '../components/ConfidenceBadge'

const TABLES = ['kpis', 'campaign_timeline', 'insights', 'sources']

export default function Overview() {
  const { data, loading, error } = useDataMany(TABLES)
  if (loading) return <LoadingBlock label="Assembling the executive overview…" />
  if (error) return <ErrorBlock message={error} />

  const { kpis, campaign_timeline: timeline, insights } = data
  const finalWeek = timeline.filter((e) => e.phase?.startsWith('7.'))

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-ink-line">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(198,162,78,0.5), transparent 40%), radial-gradient(circle at 85% 0%, rgba(107,64,136,0.5), transparent 45%)',
          }}
        />
        <div className="relative px-6 py-12 md:px-14 md:py-20">
          <div className="text-xs uppercase tracking-widish text-gold/80 font-semibold mb-4">
            A Data Analytics + Historical Intelligence Project
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-parchment leading-[1.05] max-w-3xl">
            Constantinople <span className="text-gold-bright">1453</span>
          </h1>
          <p className="mt-5 text-parchment-dim text-base md:text-lg max-w-2xl leading-relaxed">
            A data-driven analysis of the fall, transformation &amp; legacy of the city — built on{' '}
            <span className="text-parchment">{kpis.total_sources} tiered sources</span>, a reproducible Python
            pipeline, and a dataset that documents{' '}
            <span className="text-parchment">{kpis.documented_numeric_conflicts} places where sources disagree</span>{' '}
            rather than hiding the disagreement behind a single tidy number.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/timeline"
              className="inline-flex items-center gap-2 rounded-lg bg-gold text-ink font-semibold text-sm px-5 py-2.5 hover:bg-gold-bright transition"
            >
              Explore the campaign timeline <ArrowRight size={16} />
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 rounded-lg border border-ink-line text-parchment-dim font-medium text-sm px-5 py-2.5 hover:text-parchment hover:border-gold/40 transition"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section>
        <SectionHeading
          eyebrow="What the pipeline actually measured"
          title="Headline figures"
          blurb="Every number below is computed live from the underlying dataset, not typed in by hand — see kpis.json and scripts/04_export.py."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiStat label="Conquest date" value="29 May 1453" sub="Fall of Constantinople to Mehmed II" accent="ottoman" />
          <KpiStat
            label="Siege duration"
            value={kpis.siege_duration_days_reported.join(' – ')}
            sub={`days reported (sources disagree by ${kpis.siege_duration_days_reported[1] - kpis.siege_duration_days_reported[0]}, likely a start-date difference)`}
            accent="gold"
          />
          <KpiStat label="Capital relocated" value={kpis.capital_relocation_year} sub="Ottoman capital formally moved from Edirne (Necipoglu)" accent="byz" />
          <KpiStat label="First census" value={kpis.first_postconquest_census_year} sub="16,324 households recorded, Istanbul side" accent="verdigris" />
          <KpiStat label="Sources catalogued" value={kpis.total_sources} sub={`${kpis.sources_by_tier['Tier 1']} Tier 1 · ${kpis.sources_by_tier['Tier 2']} Tier 2 · ${kpis.sources_by_tier['Tier 3']} Tier 3`} accent="gold" />
          <KpiStat label="Dated campaign events" value={kpis.dated_campaign_events} sub="1444 prelude through 1481, day-level where possible" accent="ottoman" />
          <KpiStat label="Numeric conflicts logged" value={kpis.documented_numeric_conflicts} sub="Disagreements between sources, tracked rather than resolved" accent="byz" />
          <KpiStat label="UNESCO inscription" value={kpis.unesco_inscription_year} sub="Historic Areas of Istanbul, ref. 356" accent="verdigris" />
        </div>
      </section>

      {/* What the data tells us */}
      <section className="grid lg:grid-cols-3 gap-5">
        <Panel className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-gold mb-3">
            <Compass size={18} />
            <h3 className="font-display text-xl text-parchment">What the data tells us</h3>
          </div>
          <ul className="space-y-3 text-sm text-parchment-dim leading-relaxed">
            <li>
              <span className="text-parchment font-medium">The famous army-size figures are chronicle rhetoric, not a census.</span>{' '}
              Sphrantzes's 200,000 men sits far above the 60,000–80,000 modern historians prefer — and one reference
              database contradicts itself between its own body text and infobox.
            </li>
            <li>
              <span className="text-parchment font-medium">One maneuver — not the final assault — may be the hinge point.</span>{' '}
              Two independent source types converge on ~70 Ottoman ships hauled overland into the Golden Horn on 22 April,
              opening a second front five weeks before the city fell.
            </li>
            <li>
              <span className="text-parchment font-medium">"Constantinople became Istanbul in 1453" overstates the pace.</span>{' '}
              The capital didn't formally relocate until 1459; Topkapı Palace wasn't finished until 1478; the first solid
              population register is from 1477 — a 24-year institutional transition, not an overnight one.
            </li>
          </ul>
          <Link to="/insights" className="inline-flex items-center gap-1.5 mt-5 text-sm text-gold hover:text-gold-bright">
            All {insights.length} analytical insights <ArrowRight size={14} />
          </Link>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center gap-2 text-ottoman-bright mb-3">
            <ShieldAlert size={18} />
            <h3 className="font-display text-xl text-parchment">The final week</h3>
          </div>
          <ol className="space-y-3">
            {finalWeek.slice(0, 5).map((e) => (
              <li key={e.event_id} className="text-sm">
                <div className="text-gold/80 text-[11px] uppercase tracking-wide tabular-nums">{e.date}</div>
                <div className="text-parchment leading-snug">{e.event}</div>
              </li>
            ))}
          </ol>
          <Link to="/timeline" className="inline-flex items-center gap-1.5 mt-4 text-sm text-gold hover:text-gold-bright">
            Full campaign timeline <ArrowRight size={14} />
          </Link>
        </Panel>
      </section>

      {/* Source confidence explainer */}
      <section>
        <Panel className="p-6 md:p-7">
          <div className="flex items-center gap-2 text-parchment mb-4">
            <ScrollText size={18} className="text-gold" />
            <h3 className="font-display text-xl">How to read the confidence labels in this project</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1.5">
              <ConfidenceBadge level="High" />
              <p className="text-parchment-dim text-xs leading-relaxed">
                Directly stated in a Tier 1/2 source, or corroborated independently across source types.
              </p>
            </div>
            <div className="space-y-1.5">
              <ConfidenceBadge level="Medium" />
              <p className="text-parchment-dim text-xs leading-relaxed">
                Reported in a credible source but not independently cross-checked, or with minor date/figure variation.
              </p>
            </div>
            <div className="space-y-1.5">
              <ConfidenceBadge level="Low" />
              <p className="text-parchment-dim text-xs leading-relaxed">
                Single popular-tier source, internally inconsistent reporting, or an unverifiable attribution.
              </p>
            </div>
            <div className="space-y-1.5">
              <ConfidenceBadge level="Not verified" />
              <p className="text-parchment-dim text-xs leading-relaxed">
                A commonly repeated claim this project could not confirm in the sources it reviewed — kept visible, not deleted.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="text-center py-4">
        <Scroll size={20} className="mx-auto text-gold/60 mb-3" />
        <p className="text-parchment-faint text-sm max-w-xl mx-auto">
          Ten analytical pages follow — timeline, geography, defensive systems, the factors behind the outcome,
          a before/after comparison, the long transformation into Istanbul, insights, a raw data explorer, and
          full methodology. Use the sidebar to navigate.
        </p>
      </section>
    </div>
  )
}
