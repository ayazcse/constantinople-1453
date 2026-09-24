"""
run_pipeline.py

Runs the full reproducible data pipeline in order:

  RAW DATA (data/raw/*.csv, hand-curated and sourced)
    -> 01_load_raw     (sanity check every file parses)
    -> 02_clean_transform (typed, tidy interim tables in data/interim/)
    -> 03_validate     (referential integrity, confidence levels, coordinates)
    -> 04_export       (data/processed/, public/data/csv/, public/data/json/)

Usage:
    python scripts/run_pipeline.py
"""
from __future__ import annotations

import sys

import importlib


def run_step(module_name: str):
    print("=" * 70)
    print(f"STEP: {module_name}")
    print("=" * 70)
    mod = importlib.import_module(module_name)
    result = mod.main()
    print()
    return result


def main() -> int:
    run_step("01_load_raw")
    run_step("02_clean_transform")
    validate_exit_code = run_step("03_validate")
    if validate_exit_code:
        print("Pipeline stopped: validation failed.")
        return validate_exit_code
    run_step("04_export")
    print("Pipeline complete. Processed data is in data/processed/, "
          "and the frontend can read public/data/json/*.json")
    return 0


if __name__ == "__main__":
    sys.path.insert(0, ".")
    sys.exit(main())
