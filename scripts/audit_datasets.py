import zipfile
import csv
import io
import json

print("=== DETAILED DATASET AUDIT ===")

with zipfile.ZipFile("STATsense_FAST_COMPLETE_DATASET_PACK.zip", "r") as z:
    # 01 Competencies
    print("\n--- 01 COMPETENCIES BY DOMAIN ---")
    with z.open("01_competency_taxonomy_official.csv") as f:
        reader = csv.DictReader(io.StringIO(f.read().decode("utf-8")))
        domains = {}
        for r in reader:
            domains.setdefault(r["domain"], []).append(r["competency"])
        for d, comps in domains.items():
            print(f"Domain: {d} ({len(comps)} items)")
            print("  ", ", ".join(comps))

    # 02 NSSTA Training
    print("\n--- 02 NSSTA TRAINING TOPICS ---")
    with z.open("02_nssta_training_catalogue_source_derived.csv") as f:
        reader = csv.DictReader(io.StringIO(f.read().decode("utf-8")))
        for r in reader:
            print(f"{r['training_id']}: {r['topic']} [{r['programme_context']}]")

    # 03 NSSTA Calendar
    print("\n--- 03 NSSTA CALENDAR (FY2025-26 Indexed) ---")
    with z.open("03_nssta_training_calendar_verified_partial.csv") as f:
        reader = csv.DictReader(io.StringIO(f.read().decode("utf-8")))
        for r in reader:
            print(f"{r['week']} | {r['programme']} | {r['topic']} ({r['duration_days']} days, Batch: {r['batch_size']})")

    # 04 MoSPI Datasets
    print("\n--- 04 MoSPI DATASET FAMILIES ---")
    with z.open("04_mospi_esankhyiki_dataset_families.csv") as f:
        reader = csv.DictReader(io.StringIO(f.read().decode("utf-8")))
        for r in reader:
            print(f"[{r['product_code']}] {r['dataset_family']} -> Area: {r['competency_area']}")

    # 06 Derived Mapping
    print("\n--- 06 DERIVED MAPPING ---")
    with z.open("06_derived_course_competency_mapping.csv") as f:
        reader = csv.DictReader(io.StringIO(f.read().decode("utf-8")))
        for r in reader:
            print(f"Course: {r['training_or_course']} => {r['mapped_competencies']} [{r['mapping_status']}]")

    # 07 Synthetic Learners Sample
    print("\n--- 07 SYNTHETIC LEARNERS (Count & Roles) ---")
    with z.open("07_synthetic_learner_competency_profiles.csv") as f:
        reader = list(csv.DictReader(io.StringIO(f.read().decode("utf-8"))))
        print(f"Total synthetic profiles: {len(reader)}")
        designations = set(r["designation"] for r in reader)
        departments = set(r["department"] for r in reader)
        print("Designations:", designations)
        print("Departments:", departments)

    # 08 Synthetic Gaps
    print("\n--- 08 SYNTHETIC SKILL GAPS ---")
    with z.open("08_synthetic_skill_gap_records.csv") as f:
        reader = list(csv.DictReader(io.StringIO(f.read().decode("utf-8"))))
        print(f"Total synthetic gap records: {len(reader)}")
        priorities = {}
        for r in reader:
            priorities[r["priority"]] = priorities.get(r["priority"], 0) + 1
        print("Priorities breakdown:", priorities)
