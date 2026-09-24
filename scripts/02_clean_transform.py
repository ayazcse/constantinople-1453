"""
02_clean_transform.py

Turns the raw, source-of-truth CSVs into a tidy interim layer:
  - trims whitespace (already done on load)
  - converts numeric-looking columns to real numbers
  - parses dates into ISO strings where a full date exists
  - computes a few small derived fields used later by the charts
    (e.g. a siege-day offset for the campaign timeline)
  - splits ';'-separated id lists into real Python lists

Nothing here invents data. Where a raw value is genuinely a range (min/max),
both bounds are kept; where a raw value is missing, it stays missing (NaN)
rather than being filled in.
"""
from __future__ import annotations

import datetime as dt

import pandas as pd

from pipeline_utils import (
    INTERIM_DIR,
    RAW_DIR,
    ensure_dirs,
    read_raw,
    split_ids,
    to_num,
)

SIEGE_START = dt.date(1453, 4, 6)  # conventional start date, used only as a chart axis anchor


def clean_sources(df: pd.DataFrame) -> pd.DataFrame:
    df["dataset_used"] = df["used_in"].apply(split_ids)
    return df


def parse_partial_date(row) -> str | None:
    """Best-effort ISO date for rows that have year/month/day precision info.

    campaign_timeline.csv 'date' column holds values like '1453-05-29',
    '1453-04', or '1453'. We normalize all of these to a sortable string
    and, separately, to a plottable day offset from the siege start where
    day-level precision exists.
    """
    raw = str(row.get("date", "")).strip()
    return raw or None


def clean_campaign_timeline(df: pd.DataFrame) -> pd.DataFrame:
    df["source_id_list"] = df["source_ids"].apply(split_ids)
    df["date_iso"] = df.apply(parse_partial_date, axis=1)

    def day_offset(value: str | None):
        if not value:
            return None
        parts = value.split("-")
        if len(parts) == 3:
            try:
                d = dt.date(int(parts[0]), int(parts[1]), int(parts[2]))
                return (d - SIEGE_START).days
            except ValueError:
                return None
        return None

    df["siege_day_offset"] = df["date_iso"].apply(day_offset)
    df["date_uncertainty_days"] = to_num(df["date_uncertainty_days"]).fillna(0).astype(int)
    df = df.sort_values(
        by=["date_iso", "event_id"], key=lambda s: s.fillna("9999")
    ).reset_index(drop=True)
    return df


def clean_historical_events(df: pd.DataFrame) -> pd.DataFrame:
    df["source_id_list"] = df["source_ids"].apply(split_ids)
    df["year_start"] = to_num(df["year_start"])
    df["year_end"] = to_num(df["year_end"])
    df = df.sort_values("year_start").reset_index(drop=True)
    return df


def clean_locations(df: pd.DataFrame) -> pd.DataFrame:
    df["lat"] = to_num(df["lat"])
    df["lon"] = to_num(df["lon"])
    df["source_id_list"] = df["source_ids"].apply(split_ids)
    return df


def clean_map_geometries(df: pd.DataFrame) -> pd.DataFrame:
    import json as _json

    df["source_id_list"] = df["source_ids"].apply(split_ids)
    # coordinates column is stored as a JSON-like list-of-lists string; parse it now
    df["coordinates_parsed"] = df["coordinates"].apply(_json.loads)
    return df


def clean_fortifications(df: pd.DataFrame) -> pd.DataFrame:
    num_cols = [c for c in df.columns if c.endswith(("_min", "_max"))]
    for c in num_cols:
        df[c] = to_num(df[c])
    df["source_id_list"] = df["source_ids"].apply(split_ids)
    return df


def clean_population_context(df: pd.DataFrame) -> pd.DataFrame:
    for c in ["year_numeric", "population_estimate", "population_low", "population_high"]:
        df[c] = to_num(df[c])
    df["source_id_list"] = df["source_ids"].apply(split_ids)
    # A single "display" point value for charts that need one number:
    # prefer the point estimate; otherwise the midpoint of low/high; otherwise NaN.
    def display_value(row):
        if pd.notna(row["population_estimate"]):
            return row["population_estimate"]
        if pd.notna(row["population_low"]) and pd.notna(row["population_high"]):
            return (row["population_low"] + row["population_high"]) / 2
        if pd.notna(row["population_high"]):
            return row["population_high"]
        return None

    df["display_value"] = df.apply(display_value, axis=1)
    df["is_range_only"] = df["population_estimate"].isna() & df["population_low"].notna()
    df = df.sort_values("year_numeric").reset_index(drop=True)
    return df


def clean_generic_ids(df: pd.DataFrame, col: str = "source_ids") -> pd.DataFrame:
    if col in df.columns:
        df["source_id_list"] = df[col].apply(split_ids)
    return df


def main() -> None:
    ensure_dirs()
    print("Cleaning and transforming raw data...\n")

    sources = clean_sources(read_raw("sources.csv"))
    locations = clean_locations(read_raw("locations.csv"))
    map_geometries = clean_map_geometries(read_raw("map_geometries.csv"))
    campaign_timeline = clean_campaign_timeline(read_raw("campaign_timeline.csv"))
    historical_events = clean_historical_events(read_raw("historical_events.csv"))
    fortifications = clean_fortifications(read_raw("fortifications.csv"))
    population_context = clean_population_context(read_raw("population_context.csv"))
    population_1477 = clean_generic_ids(read_raw("population_1477_households.csv"))
    strategic_factors = clean_generic_ids(read_raw("strategic_factors.csv"))
    post_conquest = clean_generic_ids(read_raw("post_conquest_transformation.csv"))
    before_after = clean_generic_ids(read_raw("before_after_comparison.csv"))
    insights = clean_generic_ids(read_raw("insights.csv"))
    source_claims = clean_generic_ids(read_raw("source_claims.csv"))

    tables = {
        "sources": sources,
        "locations": locations,
        "map_geometries": map_geometries,
        "campaign_timeline": campaign_timeline,
        "historical_events": historical_events,
        "fortifications": fortifications,
        "population_context": population_context,
        "population_1477_households": population_1477,
        "strategic_factors": strategic_factors,
        "post_conquest_transformation": post_conquest,
        "before_after_comparison": before_after,
        "insights": insights,
        "source_claims": source_claims,
    }

    for name, df in tables.items():
        out = INTERIM_DIR / f"{name}.csv"
        # map_geometries has a Python-object column (coordinates_parsed); drop it for the CSV
        df_to_write = df.drop(columns=["coordinates_parsed"]) if "coordinates_parsed" in df.columns else df
        df_to_write.to_csv(out, index=False)
        print(f"  wrote interim/{name}.csv  ({len(df)} rows)")

    print("\nDone.")


if __name__ == "__main__":
    main()
