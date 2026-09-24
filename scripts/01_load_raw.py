"""
01_load_raw.py

Loads every raw CSV in /data/raw, checks it parses, and prints a short
inventory (row count + columns) so problems are caught immediately rather
than surfacing later as a broken chart.
"""
from __future__ import annotations

from pipeline_utils import RAW_DIR, RAW_FILES, ensure_dirs, read_raw


def main() -> dict:
    ensure_dirs()
    inventory = {}
    print(f"Loading raw data from: {RAW_DIR}\n")
    for name in RAW_FILES:
        df = read_raw(name)
        inventory[name] = {"rows": len(df), "columns": list(df.columns)}
        print(f"  {name:<40} {len(df):>4} rows, {len(df.columns):>2} columns")
    print("\nAll raw files loaded successfully.")
    return inventory


if __name__ == "__main__":
    main()
