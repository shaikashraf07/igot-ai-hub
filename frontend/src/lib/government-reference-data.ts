/**
 * Phase 10 Government Reference Data Repository
 * Loads and provides typed access to the audited STATsense / MoSPI / NSSTA dataset pack.
 * All records include explicit source provenance and data classifications.
 */

import rawData from "./government-reference-data.json";
import type {
  GovernmentCompetencyReference,
  NSSTATrainingReference,
  NSSTACalendarItem,
  MoSPIDatasetFamily,
  OfficialSourceItem,
  DerivedCourseCompetencyMapping,
  SyntheticLearnerProfile,
  SyntheticSkillGapRecord,
} from "@/types/government-data";

/**
 * 01_Competencies — Official SIH26101 / MoSPI Competency Taxonomy (33 items)
 * Classification: SOURCE / REFERENCE DATA
 */
export const governmentCompetencies: GovernmentCompetencyReference[] =
  (rawData["01_competency_taxonomy_official"] as GovernmentCompetencyReference[]) || [];

/**
 * 02_NSSTA_Training — Official NSSTA/MoSPI Source-Derived Training Catalogue (16 items)
 * Classification: SOURCE / REFERENCE DATA
 */
export const nsstaTrainingCatalog: NSSTATrainingReference[] =
  (rawData["02_nssta_training_catalogue_source_derived"] as NSSTATrainingReference[]) || [];

/**
 * 03_NSSTA_Calendar — Verified Partial Advance Training Calendar FY2025-26 (12 items)
 * Classification: SOURCE / REFERENCE DATA (PARTIAL INDEXED)
 */
export const nsstaCalendar: NSSTACalendarItem[] =
  (rawData["03_nssta_training_calendar_verified_partial"] as NSSTACalendarItem[]) || [];

/**
 * 04_MoSPI_Datasets — MoSPI eSankhyiki Dataset Families (19 items)
 * Classification: SOURCE / REFERENCE DATA (CATALOGUE LAYER)
 */
export const mospiDatasetFamilies: MoSPIDatasetFamily[] =
  (rawData["04_mospi_esankhyiki_dataset_families"] as MoSPIDatasetFamily[]) || [];

/**
 * 05_Sources — Official Source & Provenance Registry (8 items)
 * Classification: SOURCE / REFERENCE DATA (PROVENANCE)
 */
export const officialSources: OfficialSourceItem[] =
  (rawData["05_official_source_registry"] as OfficialSourceItem[]) || [];

/**
 * 06_Derived_Mapping — Curated Course-to-Competency Prototype Mappings (12 items)
 * Classification: DERIVED / CURATED DATA
 * IMPORTANT: This is a prototype inference and is NOT an official government mapping.
 */
export const derivedTrainingMappings: DerivedCourseCompetencyMapping[] =
  (rawData["06_derived_course_competency_mapping"] as DerivedCourseCompetencyMapping[]) || [];

/**
 * 07_Synthetic_Learners — 100 Synthetic Learner Profiles (SYN-001 to SYN-100)
 * Classification: SYNTHETIC DATA
 * STRICTLY ISOLATED: Used for offline testing / benchmarks only. Never stored in real user tables.
 */
export const syntheticProfiles: SyntheticLearnerProfile[] = (
  (rawData["07_synthetic_learner_competency_profiles"] as Record<string, string>[]) || []
).map((row) => {
  // Destructure known scalar fields; remaining entries are competency scores
  const knownKeys = [
    "learner_id",
    "designation",
    "department",
    "role",
    "education",
    "experience_years",
    "completed_trainings",
    "priority_area",
  ] as const;

  const scores: Record<string, number> = {};
  for (const [comp, val] of Object.entries(row)) {
    if (!knownKeys.includes(comp as (typeof knownKeys)[number])) {
      const parsed = parseInt(val, 10);
      scores[comp] = isNaN(parsed) ? 0 : parsed;
    }
  }

  return {
    learner_id: row["learner_id"] ?? "",
    designation: row["designation"] ?? "",
    department: row["department"] ?? "",
    role: row["role"] ?? "",
    education: row["education"] ?? "",
    experience_years: row["experience_years"] ?? "",
    completed_trainings: row["completed_trainings"] ?? "",
    priority_area: row["priority_area"] ?? "",
    scores,
  };
});

/**
 * 08_Synthetic_Gaps — 2,674 Synthetic Skill Gap Records
 * Classification: SYNTHETIC DATA
 * STRICTLY ISOLATED: Never presented as actual workforce measurements.
 */
export const syntheticGaps: SyntheticSkillGapRecord[] = (
  (rawData["08_synthetic_skill_gap_records"] as Record<string, string>[]) || []
).map((row) => ({
  learner_id: row["learner_id"] ?? "",
  competency: row["competency"] ?? "",
  current_score: parseInt(row["current_score"] ?? "0", 10) || 0,
  required_score: parseInt(row["required_score"] ?? "0", 10) || 0,
  gap: parseInt(row["gap"] ?? "0", 10) || 0,
  priority: (row["priority"] as "High" | "Medium" | "Low") || "Low",
}));
