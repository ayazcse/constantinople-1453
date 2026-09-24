# Constantinople 1453
### A Data-Driven Analysis of the Fall, Transformation & Legacy

A portfolio-grade data analytics project: a reproducible Python pipeline over a hand-sourced
historical dataset, feeding a 10-page interactive React dashboard. Every number is traceable to
a cited source; every place sources disagree is documented rather than hidden.

**This is not a Wikipedia summary with charts bolted on.** It's built the way a real analytics
project is built: raw sourced data → cleaning → validation → transformation → visualization →
insights, with a full methodology page and a downloadable data explorer.

---

## What's inside

```
constantinople-1453/
├── data/
│   ├── raw/           13 hand-curated, sourced CSVs (the source of truth)
│   ├── interim/        cleaned/typed intermediate tables (generated)
│   └── processed/      final analysis-ready CSVs (generated)
├── scripts/            the Python pipeline (01 → 02 → 03 → 04)
├── public/data/
│   ├── csv/             copies of the processed CSVs the app can offer as downloads
│   └── json/            what the React app actually fetches
├── src/
│   ├── components/      shared UI (ConfidenceBadge, SourceCite, RangeBar, Layout, ...)
│   ├── pages/            the 10 dashboard pages
│   └── lib/               data-fetching hooks and formatting helpers
└── docs/METHODOLOGY.md   longer write-up of sourcing standards and known limitations
```

## Quick start

You need **Node.js 18+** and **Python 3.10+**. Everything else installs locally.

```bash
# 1. Install frontend dependencies
npm install

# 2. (Optional) Re-run the data pipeline — the repo already ships with generated
#    output in data/processed/ and public/data/, so this step is optional unless
#    you edit a file in data/raw/.
pip install pandas numpy --break-system-packages   # or use a virtualenv
python scripts/run_pipeline.py

# 3. Start the dev server
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). The map page (Geography &
Strategy) loads tiles from a public tile server, so it needs an internet connection; everything
else works fully offline once `npm install` has completed.

To build a static production bundle:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built bundle locally to sanity-check it
```

## The data pipeline

```
data/raw/*.csv  (source of truth, every row cites a source or says N/A)
      │
      ▼  scripts/01_load_raw.py        — sanity-checks every file parses
      ▼  scripts/02_clean_transform.py  — types columns, parses dates, derives fields
      ▼  scripts/03_validate.py         — referential integrity + sanity checks
      ▼  scripts/04_export.py           — writes data/processed/ and public/data/{csv,json}
      │
      ▼
public/data/json/*.json  (what the React app fetches)
public/data/csv/*.csv    (what the Data Explorer lets you download)
```

Run the whole thing with `python scripts/run_pipeline.py`. Validation is a hard gate — a broken
`source_id` reference, a duplicate primary key, or a bad confidence value stops the pipeline
before it can export anything.

## The 10 pages

| # | Page | What it does |
|---|------|---------------|
| 01 | Executive Overview | Hero, live-computed KPIs, confidence-level legend |
| 02 | Campaign Timeline | 44 dated events (1444–1481), filterable, with per-event source citations |
| 03 | Geography & Strategy | Leaflet map of walls, gates, water, and strategic sites, with an analytical panel |
| 04 | Defensive Systems | Fortification dimensions as honest ranges, not fake precision |
| 05 | Factors Behind 1453 | A factor evidence matrix — no invented percentages |
| 06 | Before vs After | Dimension-by-dimension comparison, each claim tagged Fact or Interpretation |
| 07 | Into Istanbul | Log-scale population chart, 4th century → 2025, plus a macro event timeline |
| 08 | Analytical Insights | 9 findings, each with evidence, interpretation, and confidence |
| 09 | Data Explorer | Every dataset, searchable/sortable, with real CSV downloads |
| 10 | Methodology & Sources | The pipeline explained, source tiers, and the full 45-source register |

## Design decisions worth knowing about

- **No fabricated numbers.** Where sources disagree (e.g. Ottoman army size ranges from
  60,000 to 200,000 depending on the source), the dataset keeps both and flags the disagreement
  in `data/raw/source_claims.csv` — see Insight 01 and 09 on the Insights page.
- **Confidence, not certainty.** Every factual row carries `High` / `Medium` / `Low` / `Not verified`,
  computed from how many independent source tiers corroborate it.
- **Coordinates are labelled by quality.** A handful of wall gates use published GPS coordinates;
  everything else is marked `Approximate` or `Schematic` rather than presented as surveyed.

## Extending the dataset

Add a row to the relevant CSV in `data/raw/`, cite a `source_id` (adding a new one to
`sources.csv` first if needed), then re-run `python scripts/run_pipeline.py`. Validation will
tell you immediately if a citation doesn't resolve.
