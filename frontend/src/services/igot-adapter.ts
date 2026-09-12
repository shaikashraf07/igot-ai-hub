import type {
  AssessmentQuestion,
  AssessmentResult,
  Competency,
  CompetencyAnalysisReport,
  Course,
  Learner,
  LearningSummary,
  ProgressTrendPoint,
  ReassessmentItem,
  SkillGap,
} from "@/types/igot";
import {
  computeLearningSummary,
  evaluateAssessment,
} from "./domain-logic";
import {
  generateCompetencyAnalysis,
  generateIntelligentRecommendations,
} from "./intelligence-engine";
import { mockStore } from "./mock-store";

/**
 * iGOT Adapter Contract as defined in Engineering Guide Section 6 & Phase 2 Specification.
 * All course, competency, enrollment, and progress operations stay strictly behind this adapter.
 */
export interface IGOTAdapter {
  searchCourses(query?: string, filters?: { competency?: string; level?: string }): Promise<Course[]>;
  getCourse(courseId: string): Promise<Course | null>;
  getCompetencies(): Promise<Competency[]>;
  getCourseCompetencies(courseId: string): Promise<string[]>;
  enrollUser(userId: string, courseId: string): Promise<{ success: boolean; course: Course | null }>;
  getUserProgress(userId: string): Promise<Course[]>;
  getUserCompletions(userId: string): Promise<Course[]>;
  updateUserCourseProgress(
    userId: string,
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }>;
}

/**
 * Mock implementation of the iGOT Adapter.
 * Backed by localStorage and the reactive mock store.
 * Can be swapped with OfficialIGOTAdapter when official APIs become available.
 */
export class MockIGOTAdapter implements IGOTAdapter {
  async searchCourses(query = "", filters?: { competency?: string; level?: string }): Promise<Course[]> {
    const allCourses = mockStore.getCourses();
    const q = query.trim().toLowerCase();
    return allCourses.filter((course) => {
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.provider.toLowerCase().includes(q) ||
        course.competency.toLowerCase().includes(q);

      const matchesCompetency =
        !filters?.competency || filters.competency === "All" || course.competency === filters.competency;

      const matchesLevel =
        !filters?.level || filters.level === "All" || course.level === filters.level;

      return matchesQuery && matchesCompetency && matchesLevel;
    });
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return mockStore.getCourse(courseId);
  }

  async getCompetencies(): Promise<Competency[]> {
    return mockStore.getCompetencies();
  }

  async getCourseCompetencies(courseId: string): Promise<string[]> {
    const course = mockStore.getCourse(courseId);
    return course ? [course.competency, "Public Service Ethos", "Administrative Governance"] : [];
  }

  async enrollUser(_userId: string, courseId: string): Promise<{ success: boolean; course: Course | null }> {
    const updated = mockStore.enrollCourse(courseId);
    return {
      success: Boolean(updated),
      course: updated,
    };
  }

  async getUserProgress(_userId: string): Promise<Course[]> {
    const courses = mockStore.getCourses();
    return courses.filter((c) => c.isEnrolled && (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
  }

  async getUserCompletions(_userId: string): Promise<Course[]> {
    const courses = mockStore.getCourses();
    return courses.filter((c) => c.isEnrolled && (c.progress ?? 0) >= 100);
  }

  async updateUserCourseProgress(
    _userId: string,
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }> {
    const updated = mockStore.updateCourseProgress(courseId, progress);
    return {
      success: Boolean(updated),
      course: updated,
    };
  }
}

// Singleton adapter instance
export const igotAdapter: IGOTAdapter = new MockIGOTAdapter();

/**
 * Application Services consumed by frontend components.
 * Fully decoupled from raw mock datasets.
 */
export const courseService = {
  async searchCourses(query = "", filters?: { competency?: string; level?: string }): Promise<Course[]> {
    return igotAdapter.searchCourses(query, filters);
  },

  async getCourse(id: string): Promise<Course | null> {
    return igotAdapter.getCourse(id);
  },

  async getEnrolledCourses(): Promise<Course[]> {
    const learner = mockStore.getLearner();
    const [inProgress, completed] = await Promise.all([
      igotAdapter.getUserProgress(learner.id),
      igotAdapter.getUserCompletions(learner.id),
    ]);
    const allCourses = mockStore.getCourses();
    const notStarted = allCourses.filter((c) => c.isEnrolled && (c.progress ?? 0) === 0);
    return [...inProgress, ...notStarted, ...completed];
  },

  async enrollCourse(courseId: string): Promise<{ success: boolean; course: Course | null }> {
    const learner = mockStore.getLearner();
    return igotAdapter.enrollUser(learner.id, courseId);
  },

  async updateProgress(
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }> {
    const learner = mockStore.getLearner();
    return igotAdapter.updateUserCourseProgress(learner.id, courseId, progress);
  },

  async getRecommendations(filter?: "all" | "priority" | "core" | "quick"): Promise<Course[]> {
    const [allCourses, competencies] = await Promise.all([
      mockStore.getCourses(),
      igotAdapter.getCompetencies(),
    ]);
    const learner = mockStore.getLearner();
    return generateIntelligentRecommendations(allCourses, competencies, learner, filter);
  },

  async getCourseCompetencies(courseId: string): Promise<string[]> {
    return igotAdapter.getCourseCompetencies(courseId);
  },
};

export const competencyService = {
  async getCompetencies(): Promise<Competency[]> {
    return igotAdapter.getCompetencies();
  },

  async getSkillGaps(): Promise<SkillGap[]> {
    const [competencies, courses] = await Promise.all([
      igotAdapter.getCompetencies(),
      mockStore.getCourses(),
    ]);
    const learner = mockStore.getLearner();
    const analysis = generateCompetencyAnalysis(competencies, courses, learner);
    return [...analysis.criticalGaps, ...analysis.moderateGaps];
  },

  async getAnalysisReport(): Promise<CompetencyAnalysisReport> {
    const [competencies, courses] = await Promise.all([
      igotAdapter.getCompetencies(),
      mockStore.getCourses(),
    ]);
    const learner = mockStore.getLearner();
    return generateCompetencyAnalysis(competencies, courses, learner);
  },

  async getSummary(): Promise<LearningSummary> {
    const [courses, competencies, gaps] = await Promise.all([
      mockStore.getCourses(),
      igotAdapter.getCompetencies(),
      this.getSkillGaps(),
    ]);
    return computeLearningSummary(courses, competencies, gaps);
  },
};

export const assessmentService = {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    return mockStore.getAssessmentQuestions();
  },

  async submitAssessment(answers: Record<string, number>): Promise<AssessmentResult> {
    const questions = mockStore.getAssessmentQuestions();
    const result = evaluateAssessment(questions, answers);
    mockStore.saveAssessmentResult(result);
    mockStore.syncDiagnosticAssessmentScores(result);
    return result;
  },

  async getLatestResult(): Promise<AssessmentResult | null> {
    return (mockStore.getSavedAssessmentResult() as AssessmentResult) ?? null;
  },

  async getReassessmentComparison(): Promise<ReassessmentItem[]> {
    return mockStore.getReassessment();
  },

  async applyReassessmentScores(): Promise<Competency[]> {
    return mockStore.applyReassessmentScores();
  },
};

export const progressService = {
  async getTrendData(): Promise<ProgressTrendPoint[]> {
    return mockStore.getProgressTrend();
  },

  async getTasks() {
    return mockStore.getTasks();
  },

  async getProgressMetrics() {
    const [summary, trends, competencies] = await Promise.all([
      competencyService.getSummary(),
      mockStore.getProgressTrend(),
      igotAdapter.getCompetencies(),
    ]);
    const totalHours = trends.reduce((acc, t) => acc + t.hoursSpent, 0) + summary.learningHoursLogged;
    return {
      overallScore: summary.overallCompetency,
      completedCourses: summary.completedCourses,
      inProgressCourses: summary.inProgressCourses,
      totalHours,
      competenciesCount: competencies.length,
      evaluationsPassedCount: 5,
    };
  },
};

export const learnerService = {
  async getProfile(): Promise<Learner> {
    return mockStore.getLearner();
  },

  async updateProfile(learner: Learner): Promise<void> {
    mockStore.setLearner(learner);
  },

  resetDemo(): void {
    mockStore.resetDemo();
  },
};
