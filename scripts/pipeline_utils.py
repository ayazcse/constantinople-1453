"""
Shared helpers for the Constantinople 1453 data pipeline.

The pipeline is intentionally simple and dependency-light (pandas + numpy only)
so that a beginner/intermediate developer can read every step. Run the whole
pipeline with:

    python scripts/run_pipeline.py

which calls, in order: 01_load_raw -> 02_clean_transform -> 03_validate -> 04_export.
"""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
INTERIM_DIR = ROOT / "data" / "interim"
PROCESSED_DIR = ROOT / "data" / "processed"
PUBLIC_CSV_DIR = ROOT / "public" / "data" / "csv"
PUBLIC_JSON_DIR = ROOT / "public" / "data" / "json"

ALLOWED_CONFIDENCE = {"High", "Medium", "Low", "Not verified"}
ALLOWED_TIER = {"Tier 1", "Tier 2", "Tier 3"}

RAW_FILES = [
    "sources.csv",
    "locations.csv",
    "map_geometries.csv",
    "campaign_timeline.csv",
    "historical_events.csv",
    "fortifications.csv",
    "population_context.csv",
    "population_1477_households.csv",
    "strategic_factors.csv",
    "post_conquest_transformation.csv",
    "before_after_comparison.csv",
    "insights.csv",
    "source_claims.csv",
]


def ensure_dirs() -> None:
    for d in (INTERIM_DIR, PROCESSED_DIR, PUBLIC_CSV_DIR, PUBLIC_JSON_DIR):
        d.mkdir(parents=True, exist_ok=True)


def read_raw(name: str) -> pd.DataFrame:
    path = RAW_DIR / name
    df = pd.read_csv(path, dtype=str, keep_default_na=False)
    # Normalize whitespace-only cells to empty string, and empty string -> NA
    # for genuinely numeric columns is handled per-script; here we just strip.
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
    return df


def split_ids(cell: str) -> list[str]:
    """Split a ';'-separated id list cell into a clean list, dropping blanks."""
    if not cell:
        return []
    return [x.strip() for x in cell.split(";") if x.strip()]


def to_num(series: pd.Series) -> pd.Series:
    """Convert a string series to nullable float, treating '' as missing."""
    return pd.to_numeric(series.replace("", pd.NA), errors="coerce")


def write_json(obj, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2, default=str)


def df_to_records(df: pd.DataFrame) -> list[dict]:
    """Convert a DataFrame to a list of plain dicts, replacing NaN with None."""
    return json.loads(df.to_json(orient="records", date_format="iso"))
