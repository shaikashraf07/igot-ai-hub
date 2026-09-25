/**
 * Government Dataset Service (Phase 10)
 * Provides access to validated reference datasets, NSSTA training offerings,
 * MoSPI eSankhyiki catalogue links, and curated mappings with provenance.
 */

import {
  governmentCompetencies,
  nsstaTrainingCatalog,
  nsstaCalendar,
  mospiDatasetFamilies,
  officialSources,
  derivedTrainingMappings,
  syntheticProfiles,
  syntheticGaps,
} from "@/lib/government-reference-data";

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

export const governmentDatasetService = {
  /**
   * Returns official competency taxonomy across domains.
   */
  async getCompetencyTaxonomy(domain?: string): Promise<GovernmentCompetencyReference[]> {
    if (!domain || domain === "All") {
      return governmentCompetencies;
    }
    return governmentCompetencies.filter((c) => c.domain === domain);
  },

  /**
   * Returns unique competency domains in the official taxonomy.
   */
  async getCompetencyDomains(): Promise<string[]> {
    const domains = new Set(governmentCompetencies.map((c) => c.domain));
    return Array.from(domains);
  },

  /**
   * Returns NSSTA training catalogue offerings.
   */
  async getNSSTATrainingCatalog(): Promise<NSSTATrainingReference[]> {
    return nsstaTrainingCatalog;
  },

  /**
   * Returns verified partial NSSTA training calendar for FY2025-26.
   */
  async getNSSTACalendar(): Promise<NSSTACalendarItem[]> {
    return nsstaCalendar;
  },

  /**
   * Returns MoSPI eSankhyiki dataset families catalogue.
   */
  async getMoSPIDatasets(): Promise<MoSPIDatasetFamily[]> {
    return mospiDatasetFamilies;
  },

  /**
   * Returns the official source & provenance registry.
   */
  async getSourceRegistry(): Promise<OfficialSourceItem[]> {
    return officialSources;
  },

  /**
   * Returns derived/curated course-to-competency mappings.
   * Includes explicit prototype warning.
   */
  async getDerivedMappings(): Promise<DerivedCourseCompetencyMapping[]> {
    return derivedTrainingMappings;
  },

  /**
   * Finds related government dataset families and NSSTA training context for a given competency.
   */
  findContextForCompetency(competencyName: string): {
    matchedDatasets: MoSPIDatasetFamily[];
    matchedTrainings: NSSTATrainingReference[];
    curatedMapping?: DerivedCourseCompetencyMapping;
  } {
    const term = competencyName.toLowerCase();

    // Match MoSPI datasets
    const matchedDatasets = mospiDatasetFamilies.filter(
      (d) =>
        d.competency_area.toLowerCase().includes(term) ||
        d.dataset_family.toLowerCase().includes(term),
    );

    // Match NSSTA training
    const matchedTrainings = nsstaTrainingCatalog.filter(
      (t) =>
        t.topic.toLowerCase().includes(term) ||
        t.topic_detail.toLowerCase().includes(term),
    );

    // Match derived mappings
    const curatedMapping = derivedTrainingMappings.find((m) =>
      m.mapped_competencies.toLowerCase().includes(term),
    );

    return {
      matchedDatasets,
      matchedTrainings,
      ...(curatedMapping !== undefined ? { curatedMapping } : {}),
    };
  },

  /**
   * Finds curated mapping and disclaimer warning for a course.
   */
  findMappingForCourse(courseTitle: string): DerivedCourseCompetencyMapping | undefined {
    return derivedTrainingMappings.find(
      (m) =>
        m.training_or_course.toLowerCase().includes(courseTitle.toLowerCase()) ||
        courseTitle.toLowerCase().includes(m.training_or_course.toLowerCase()),
    );
  },

  /**
   * Access to synthetic demo dataset (STRICTLY ISOLATED).
   * Not to be combined with real authenticated learners.
   */
  getSyntheticBenchmark(): {
    learnerProfiles: SyntheticLearnerProfile[];
    gapRecords: SyntheticSkillGapRecord[];
  } {
    return {
      learnerProfiles: syntheticProfiles,
      gapRecords: syntheticGaps,
    };
  },
};
