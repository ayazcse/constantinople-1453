"""
04_export.py

Final pipeline stage:
  - copies the interim tables into /data/processed (the clean, analysis-ready
    datasets a data analyst would hand off)
  - copies the same CSVs into /public/data/csv (so the React app's Data
    Explorer page can offer real "download CSV" buttons backed by real files)
  - writes /public/data/json/*.json for every table, for the React app to fetch
  - computes a small set of defensible, non-invented KPIs into kpis.json
"""
from __future__ import annotations

import json
import shutil

import pandas as pd

from pipeline_utils import (
    INTERIM_DIR,
    PROCESSED_DIR,
    PUBLIC_CSV_DIR,
    PUBLIC_JSON_DIR,
    df_to_records,
    ensure_dirs,
    split_ids,
)

TABLES = [
    "sources", "locations", "map_geometries", "campaign_timeline",
    "historical_events", "fortifications", "population_context",
    "population_1477_households", "strategic_factors",
    "post_conquest_transformation", "before_after_comparison",
    "insights", "source_claims",
]


def load(name: str) -> pd.DataFrame:
    return pd.read_csv(INTERIM_DIR / f"{name}.csv", keep_default_na=True)


def compute_kpis(tables: dict[str, pd.DataFrame]) -> dict:
    sources = tables["sources"]
    campaign = tables["campaign_timeline"]
    claims = tables["source_claims"]
    insights = tables["insights"]
    fortifications = tables["fortifications"]
    strategic = tables["strategic_factors"]

    tier1 = int((sources["tier"] == "Tier 1").sum())
    tier2 = int((sources["tier"] == "Tier 2").sum())
    tier3 = int((sources["tier"] == "Tier 3").sum())

    duration_rows = claims[claims["topic"].str.startswith("Siege duration")]
    durations = sorted(set(int(v) for v in duration_rows["claim_value"]))

    return {
        "generated_from": "data/interim/*.csv via scripts/04_export.py",
        "total_sources": int(len(sources)),
        "sources_by_tier": {"Tier 1": tier1, "Tier 2": tier2, "Tier 3": tier3},
        "dated_campaign_events": int(len(campaign)),
        "documented_numeric_conflicts": int(len(claims)),
        "analytical_insights": int(len(insights)),
        "fortification_structures_catalogued": int(len(fortifications)),
        "strategic_factors_analyzed": int(len(strategic)),
        "siege_duration_days_reported": durations,
        "conquest_date": "1453-05-29",
        "siege_open_date_conventional": "1453-04-06",
        "capital_relocation_year": 1459,
        "first_postconquest_census_year": 1477,
        "unesco_inscription_year": 1985,
    }


def main() -> None:
    ensure_dirs()
    tables = {name: load(name) for name in TABLES}

    print("Exporting processed CSVs...")
    for name, df in tables.items():
        processed_path = PROCESSED_DIR / f"{name}.csv"
        df.to_csv(processed_path, index=False)
        public_path = PUBLIC_CSV_DIR / f"{name}.csv"
        shutil.copyfile(processed_path, public_path)
        print(f"  {name}.csv -> processed/ and public/data/csv/")

    print("\nExporting JSON for the frontend...")
    for name, df in tables.items():
        records = df_to_records(df)
        for row in records:
            for k in list(row.keys()):
                if k.endswith("_list") and isinstance(row[k], str):
                    cleaned = row[k].replace("[", "").replace("]", "").replace("'", "")
                    row[k] = split_ids(cleaned.replace(", ", ";"))
            if name == "map_geometries" and isinstance(row.get("coordinates"), str):
                row["coordinates"] = json.loads(row["coordinates"])
        out_path = PUBLIC_JSON_DIR / f"{name}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        print(f"  {name}.json ({len(records)} records)")

    kpis = compute_kpis(tables)
    with open(PUBLIC_JSON_DIR / "kpis.json", "w", encoding="utf-8") as f:
        json.dump(kpis, f, ensure_ascii=False, indent=2)
    print("  kpis.json")

    manifest = {
        "tables": TABLES,
        "kpis": "kpis.json",
        "note": "Every table here traces back to /data/raw/*.csv and /data/raw/sources.csv. "
                "See docs/METHODOLOGY.md for the full pipeline description.",
    }
    with open(PUBLIC_JSON_DIR / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("  manifest.json")

    print("\nExport complete.")


if __name__ == "__main__":
    main()
