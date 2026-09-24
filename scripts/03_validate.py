"""
03_validate.py

Lightweight data-quality gate. Checks:
  1. Every source_id referenced anywhere (source_ids / source_id_list columns)
     actually exists in sources.csv.
  2. Every 'confidence' value is one of the allowed levels.
  3. Latitude/longitude values fall inside a generous bounding box around
     historic Istanbul (catches typo'd coordinates before they reach a map).
  4. No duplicate primary-key ids within a table.
  5. Key text fields (the ones a chart or card will render) are not empty.

This does not "fix" bad data - it reports it, loudly, so a human can decide.
Exit code is non-zero only for hard failures (broken source_id references);
everything else prints as a warning so the pipeline stays useful even while
a dataset is still being extended.
"""
from __future__ import annotations

import sys

import pandas as pd

from pipeline_utils import ALLOWED_CONFIDENCE, INTERIM_DIR, split_ids

# Istanbul-area bounding box, generous enough for all sites in this project
LAT_MIN, LAT_MAX = 40.85, 41.25
LON_MIN, LON_MAX = 28.70, 29.20

PK_COLUMNS = {
    "sources": "source_id",
    "locations": "location_id",
    "map_geometries": "feature_id",
    "campaign_timeline": "event_id",
    "historical_events": "event_id",
    "fortifications": "structure_id",
    "insights": "insight_id",
    "source_claims": "claim_id",
}

CONFIDENCE_TABLES = [
    "campaign_timeline",
    "historical_events",
    "fortifications",
    "population_context",
    "strategic_factors",
    "post_conquest_transformation",
    "before_after_comparison",
    "insights",
    "population_1477_households",
]


def load(name: str) -> pd.DataFrame:
    return pd.read_csv(INTERIM_DIR / f"{name}.csv", dtype=str, keep_default_na=False)


def collect_referenced_ids(df: pd.DataFrame) -> set[str]:
    ids: set[str] = set()
    for col in ("source_ids", "source_id_list"):
        if col in df.columns:
            for cell in df[col]:
                if not cell:
                    continue
                cleaned = cell.replace("[", "").replace("]", "").replace("'", "").replace('"', "")
                ids.update(split_ids(cleaned.replace(", ", ";")))
    ids.discard("N/A")
    return ids


def main() -> int:
    print("Validating interim data...\n")
    hard_failures: list[str] = []
    warnings: list[str] = []

    sources = load("sources")
    valid_source_ids = set(sources["source_id"])

    table_names = [
        "sources", "locations", "map_geometries", "campaign_timeline",
        "historical_events", "fortifications", "population_context",
        "population_1477_households", "strategic_factors",
        "post_conquest_transformation", "before_after_comparison",
        "insights", "source_claims",
    ]
    tables = {name: load(name) for name in table_names}

    for name, df in tables.items():
        if name == "sources":
            continue
        referenced = collect_referenced_ids(df)
        unknown = referenced - valid_source_ids
        if unknown:
            hard_failures.append(f"{name}: unknown source_id(s) referenced: {sorted(unknown)}")

    for name in CONFIDENCE_TABLES:
        df = tables[name]
        if "confidence" not in df.columns:
            continue
        bad = sorted(set(df["confidence"]) - ALLOWED_CONFIDENCE - {""})
        if bad:
            warnings.append(f"{name}: unexpected confidence value(s): {bad}")

    loc = tables["locations"]
    lat = pd.to_numeric(loc["lat"], errors="coerce")
    lon = pd.to_numeric(loc["lon"], errors="coerce")
    out_of_box = loc[(lat < LAT_MIN) | (lat > LAT_MAX) | (lon < LON_MIN) | (lon > LON_MAX)]
    if len(out_of_box):
        warnings.append(
            f"locations: {len(out_of_box)} row(s) outside the expected Istanbul bounding box: "
            f"{list(out_of_box['location_id'])}"
        )

    for name, pk in PK_COLUMNS.items():
        df = tables[name]
        dupes = df[pk][df[pk].duplicated()].tolist()
        if dupes:
            hard_failures.append(f"{name}: duplicate {pk} value(s): {dupes}")

    required_checks = {
        "campaign_timeline": ["event", "date"],
        "historical_events": ["event_name"],
        "insights": ["title", "evidence", "interpretation"],
        "strategic_factors": ["factor", "evidence"],
    }
    for name, cols in required_checks.items():
        df = tables[name]
        for col in cols:
            empty_rows = df[df[col].str.strip() == ""]
            if len(empty_rows):
                warnings.append(f"{name}.{col}: {len(empty_rows)} empty value(s)")

    print(f"Hard failures: {len(hard_failures)}")
    for f in hard_failures:
        print(f"  [FAIL] {f}")
    print(f"\nWarnings: {len(warnings)}")
    for w in warnings:
        print(f"  [WARN] {w}")

    if hard_failures:
        print("\nValidation FAILED - fix the issues above before exporting.")
        return 1

    print("\nValidation passed (see warnings above, if any).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
