/**
 * Phase 10 Government Dataset Types
 * Defines data structures for NSSTA / MoSPI reference datasets,
 * derived mappings, and synthetic testing records.
 */

export type DataClassification =
  | "SOURCE_REFERENCE" // Authoritative government reference/taxonomy
  | "DERIVED_CURATED"   // Algorithmically or manually curated mappings (not official)
  | "SYNTHETIC_TEST";   // Simulated test/demo profiles (not real employees)

/**
 * 01_competency_taxonomy_official
 * Official SIH26101 / MoSPI competency taxonomy across 4 domains.
 */
export interface GovernmentCompetencyReference {
  competency_id: string;
  domain: "Statistical" | "Technical" | "Digital Governance" | "Behavioural/Managerial";
  competency: string;
  source_type: string;
  source: string;
}

/**
 * 02_nssta_training_catalogue_source_derived
 * NSSTA training catalogue offerings and programme contexts.
 */
export interface NSSTATrainingReference {
  training_id: string;
  topic: string;
  programme_context: string;
  topic_detail: string;
  source_type: string;
}

/**
 * 03_nssta_training_calendar_verified_partial
 * Verified partial indexed rows from the official MoSPI NSSTA Advance Training Calendar FY2025-26.
 */
export interface NSSTACalendarItem {
  week: string;
  programme: string;
  duration_days: string;
  topic: string;
  batch_size: string;
  venue_or_institute: string;
  source_type: string;
  coverage_note: string;
}

/**
 * 04_mospi_esankhyiki_dataset_families
 * Official MoSPI eSankhyiki dataset families and competency areas.
 */
export interface MoSPIDatasetFamily {
  product_code: string;
  dataset_family: string;
  competency_area: string;
  source_note: string;
  official_catalogue: string;
  download_status: string;
}

/**
 * 05_official_source_registry
 * Provenance registry tracking source authorities and official URLs.
 */
export interface OfficialSourceItem {
  area: string;
  resource: string;
  purpose: string;
  authority: string;
  url: string;
}

/**
 * 06_derived_course_competency_mapping
 * Derived / Curated prototype mappings between courses and competencies.
 * Marked with explicit mapping_status and disclaimer warning.
 */
export interface DerivedCourseCompetencyMapping {
  training_or_course: string;
  mapped_competencies: string;
  mapping_status: "derived/curated";
  warning: string;
}

/**
 * 07_synthetic_learner_competency_profiles
 * Synthetic learner profiles for prototype simulation.
 * STRICTLY ISOLATED from authenticated user tables.
 */
export interface SyntheticLearnerProfile {
  learner_id: string;
  designation: string;
  department: string;
  role: string;
  education: string;
  experience_years: string;
  completed_trainings: string;
  priority_area: string;
  scores: Record<string, number>;
}

/**
 * 08_synthetic_skill_gap_records
 * Synthetic gap records for testing/demonstration.
 */
export interface SyntheticSkillGapRecord {
  learner_id: string;
  competency: string;
  current_score: number;
  required_score: number;
  gap: number;
  priority: "High" | "Medium" | "Low";
}
