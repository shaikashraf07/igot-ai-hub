import type {
  AssessmentQuestion,
  AssessmentResult,
  Competency,
  CompetencyAnalysisReport,
  Course,
  Learner,
  LearningSummary,
  LearningTask,
  ProgressTrendPoint,
  ReassessmentItem,
  SkillGap,
} from "@/types/igot";
import { computeLearningSummary, evaluateAssessment } from "./domain-logic";
import {
  generateCompetencyAnalysis,
  generateIntelligentRecommendations,
} from "./intelligence-engine";
import {
  mockStore,
  staticCourseCatalog,
  defaultBaselineCompetencies,
  assessmentQuestions,
} from "./mock-store";
import { supabaseStore } from "./supabase-store";
import { supabase } from "@/lib/supabase";

async function isRealSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const hasSession = data.session !== null;

  // If we have a real session, we always prioritize it regardless of local demo flag
  if (hasSession) {
    if (typeof window !== "undefined" && localStorage.getItem("igot_demo_mode") === "true") {
      localStorage.removeItem("igot_demo_mode");
    }
    return true;
  }

  return false;
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/**
 * iGOT Adapter Contract as defined in Engineering Guide Section 6 & Phase 2 Specification.
 * All course, competency, enrollment, and progress operations stay strictly behind this adapter.
 */
export interface IGOTAdapter {
  searchCourses(
    query?: string,
    filters?: { competency?: string; level?: string },
  ): Promise<Course[]>;
  getCourse(courseId: string): Promise<Course | null>;
  getCompetencies(): Promise<Competency[]>;
  getCourseCompetencies(courseId: string): Promise<string[]>;
  enrollUser(
    userId: string,
    courseId: string,
  ): Promise<{ success: boolean; course: Course | null }>;
  getUserProgress(userId: string): Promise<Course[]>;
  getUserCompletions(userId: string): Promise<Course[]>;
  updateUserCourseProgress(
    userId: string,
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }>;
}

export class MultiplexIGOTAdapter implements IGOTAdapter {
  async searchCourses(
    query = "",
    filters?: { competency?: string; level?: string },
  ): Promise<Course[]> {
    let allCourses: Course[] = staticCourseCatalog.map((c) => ({
      ...c,
      isEnrolled: false,
      progress: 0,
    }));

    if (await isRealSession()) {
      const userId = await getUserId();

      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);

        allCourses = staticCourseCatalog.map((course) => {
          const enrollment = enrollments.find((e) => e.course_id === course.id);

          if (enrollment) {
            return {
              ...course,
              isEnrolled: enrollment.is_enrolled,
              progress: enrollment.progress,
            };
          }

          return {
            ...course,
            isEnrolled: false,
            progress: 0,
          };
        });
      }
    } else {
      allCourses = mockStore.getCourses();
    }

    const q = query.trim().toLowerCase();

    return allCourses.filter((course) => {
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.provider.toLowerCase().includes(q) ||
        course.competency.toLowerCase().includes(q);

      const matchesCompetency =
        !filters?.competency ||
        filters.competency === "All" ||
        course.competency === filters.competency;

      const matchesLevel =
        !filters?.level || filters.level === "All" || course.level === filters.level;

      return matchesQuery && matchesCompetency && matchesLevel;
    });
  }

  async getCourse(courseId: string): Promise<Course | null> {
    if (await isRealSession()) {
      const course = staticCourseCatalog.find((c) => c.id === courseId);
      if (!course) return null;

      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        const enrollment = enrollments.find((e) => e.course_id === courseId);

        if (enrollment) {
          return {
            ...course,
            isEnrolled: enrollment.is_enrolled,
            progress: enrollment.progress,
          };
        }
      }

      return { ...course, isEnrolled: false, progress: 0 };
    }

    return mockStore.getCourse(courseId);
  }

  async getCompetencies(): Promise<Competency[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const comps = await supabaseStore.getCompetencies(userId);
        // Return what the database has — empty array means not yet assessed.
        // Do NOT auto-seed 50% scores for new users; that causes fake data to appear.
        return comps;
      }
    }
    return mockStore.getCompetencies();
  }

  async getCourseCompetencies(courseId: string): Promise<string[]> {
    const course =
      staticCourseCatalog.find((c) => c.id === courseId) ?? mockStore.getCourse(courseId);
    return course ? [course.competency, "Public Service Ethos", "Administrative Governance"] : [];
  }

  async enrollUser(
    _userId: string,
    courseId: string,
  ): Promise<{ success: boolean; course: Course | null }> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        await supabaseStore.upsertEnrollment(userId, courseId, 15, true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("igot_store_updated"));
        }
        const course = staticCourseCatalog.find((c) => c.id === courseId);
        if (course) return { success: true, course: { ...course, isEnrolled: true, progress: 15 } };
      }
    }
    const updated = mockStore.enrollCourse(courseId);
    return {
      success: Boolean(updated),
      course: updated,
    };
  }

  async getUserProgress(_userId: string): Promise<Course[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        return staticCourseCatalog
          .map((c) => {
            const e = enrollments.find((en) => en.course_id === c.id);
            if (e) return { ...c, isEnrolled: e.is_enrolled, progress: e.progress };
            return { ...c, isEnrolled: false, progress: 0 };
          })
          .filter((c) => c.isEnrolled && (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
      }
    }
    const courses = mockStore.getCourses();
    return courses.filter((c) => c.isEnrolled && (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
  }

  async getUserCompletions(_userId: string): Promise<Course[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        return staticCourseCatalog
          .map((c) => {
            const e = enrollments.find((en) => en.course_id === c.id);
            if (e) return { ...c, isEnrolled: e.is_enrolled, progress: e.progress };
            return { ...c, isEnrolled: false, progress: 0 };
          })
          .filter((c) => c.isEnrolled && (c.progress ?? 0) >= 100);
      }
    }
    const courses = mockStore.getCourses();
    return courses.filter((c) => c.isEnrolled && (c.progress ?? 0) >= 100);
  }

  async updateUserCourseProgress(
    _userId: string,
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }> {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        await supabaseStore.upsertEnrollment(userId, courseId, clampedProgress, true);

        const course = staticCourseCatalog.find((c) => c.id === courseId);
        if (course && clampedProgress >= 100) {
          // Boost competency
          const comps = await this.getCompetencies();
          let changed = false;
          const newComps = comps.map((comp) => {
            if (comp.name === course.competency && comp.score < comp.target) {
              changed = true;
              return { ...comp, score: Math.min(comp.target, comp.score + 18) };
            }
            return comp;
          });
          if (changed) {
            await supabaseStore.setCompetencies(userId, newComps);
            const snapshot: ReassessmentItem[] = newComps.map((comp) => ({
              competency: comp.name,
              before: comp.score < comp.target ? comp.score : Math.max(50, comp.score - 18),
              after:
                comp.score >= comp.target ? comp.score : Math.min(comp.target, comp.score + 18),
              target: comp.target,
            }));
            await supabaseStore.saveReassessmentSnapshot(userId, snapshot);
          }
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("igot_store_updated"));
        }
        return {
          success: true,
          course: course ? { ...course, isEnrolled: true, progress: clampedProgress } : null,
        };
      }
    }
    const updated = mockStore.updateCourseProgress(courseId, clampedProgress);
    return {
      success: Boolean(updated),
      course: updated,
    };
  }
}

/**
 * Official iGOT Karmayogi Live API Adapter (Architectural Boundary Stub)
 *
 * CONDITIONAL INTEGRATION BOUNDARY (Phase 10):
 * Requires authorized government API credentials, base URL, and signed certificate.
 * Since no official live endpoint, OAuth credentials, or authorized specification
 * have been provided to this project, this adapter safely defines the boundary contract
 * and defers live calls until authorized access is provisioned by the nodal authority.
 *
 * DO NOT scrape, reverse-engineer, or invent fake endpoints.
 */
export class OfficialIGOTAdapter implements IGOTAdapter {
  private readonly baseUrl: string | null;
  private readonly apiKey: string | null;

  constructor() {
    const env =
      typeof import.meta !== "undefined" && import.meta.env
        ? import.meta.env
        : typeof process !== "undefined"
          ? process.env
          : {};
    this.baseUrl = (env["VITE_IGOT_OFFICIAL_API_URL"] as string | undefined)?.trim() ?? null;
    this.apiKey = (env["VITE_IGOT_OFFICIAL_API_KEY"] as string | undefined)?.trim() ?? null;
  }

  isAuthorized(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  async searchCourses(
    _query?: string,
    _filters?: { competency?: string; level?: string },
  ): Promise<Course[]> {
    if (!this.isAuthorized()) {
      throw new Error(
        "Official iGOT live API is not authorized. No official endpoint/credentials provided. Using Mock/Multiplex adapter.",
      );
    }
    return [];
  }

  async getCourse(_courseId: string): Promise<Course | null> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return null;
  }

  async getCompetencies(): Promise<Competency[]> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return [];
  }

  async getCourseCompetencies(_courseId: string): Promise<string[]> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return [];
  }

  async enrollUser(
    _userId: string,
    _courseId: string,
  ): Promise<{ success: boolean; course: Course | null }> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return { success: false, course: null };
  }

  async getUserProgress(_userId: string): Promise<Course[]> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return [];
  }

  async getUserCompletions(_userId: string): Promise<Course[]> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return [];
  }

  async updateUserCourseProgress(
    _userId: string,
    _courseId: string,
    _progress: number,
  ): Promise<{ success: boolean; course: Course | null }> {
    if (!this.isAuthorized()) {
      throw new Error("Official iGOT API not authorized. Using Mock/Multiplex adapter.");
    }
    return { success: false, course: null };
  }
}

// Singleton adapter instance:
// MultiplexIGOTAdapter remains the authoritative operational adapter
// backing both Supabase authenticated users and offline/demo prototype modes.
export const igotAdapter: IGOTAdapter = new MultiplexIGOTAdapter();

export const courseService = {
  async searchCourses(
    query = "",
    filters?: { competency?: string; level?: string },
  ): Promise<Course[]> {
    return igotAdapter.searchCourses(query, filters);
  },

  async getCourse(id: string): Promise<Course | null> {
    return igotAdapter.getCourse(id);
  },

  async getEnrolledCourses(): Promise<Course[]> {
    const learner = await learnerService.getProfile();
    const [inProgress, completed] = await Promise.all([
      igotAdapter.getUserProgress(learner.id),
      igotAdapter.getUserCompletions(learner.id),
    ]);

    let catalog: Course[] = [];
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        catalog = staticCourseCatalog.map((c) => {
          const e = enrollments.find((en) => en.course_id === c.id);
          if (e) return { ...c, isEnrolled: e.is_enrolled, progress: e.progress };
          return { ...c, isEnrolled: false, progress: 0 };
        });
      }
    } else {
      catalog = mockStore.getCourses();
    }
    const notStarted = catalog.filter((c) => c.isEnrolled && (c.progress ?? 0) === 0);
    return [...inProgress, ...notStarted, ...completed];
  },

  async enrollCourse(courseId: string): Promise<{ success: boolean; course: Course | null }> {
    const learner = await learnerService.getProfile();
    return igotAdapter.enrollUser(learner.id, courseId);
  },

  async updateProgress(
    courseId: string,
    progress: number,
  ): Promise<{ success: boolean; course: Course | null }> {
    const learner = await learnerService.getProfile();
    return igotAdapter.updateUserCourseProgress(learner.id, courseId, progress);
  },

  async getRecommendations(filter?: "all" | "priority" | "core" | "quick"): Promise<Course[]> {
    const allCourses = await this.searchCourses();
    const competencies = await igotAdapter.getCompetencies();
    const learner = await learnerService.getProfile();
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
    const competencies = await igotAdapter.getCompetencies();
    const courses = await courseService.searchCourses();
    const learner = await learnerService.getProfile();
    const analysis = generateCompetencyAnalysis(competencies, courses, learner);
    return [...analysis.criticalGaps, ...analysis.moderateGaps];
  },

  async getAnalysisReport(): Promise<CompetencyAnalysisReport> {
    const competencies = await igotAdapter.getCompetencies();
    const courses = await courseService.searchCourses();
    const learner = await learnerService.getProfile();
    return generateCompetencyAnalysis(competencies, courses, learner);
  },

  async getSummary(): Promise<LearningSummary> {
    const courses = await courseService.searchCourses();
    const [competencies, gaps] = await Promise.all([
      igotAdapter.getCompetencies(),
      this.getSkillGaps(),
    ]);
    return computeLearningSummary(courses, competencies, gaps);
  },
};

export const assessmentService = {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    return assessmentQuestions;
  },

  async submitAssessment(answers: Record<string, number>): Promise<AssessmentResult> {
    const questions = assessmentQuestions;
    const result = evaluateAssessment(questions, answers);

    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        await supabaseStore.saveAssessmentResult(userId, result);

        // Sync diagnostic scores to competencies
        const competencies = await igotAdapter.getCompetencies();
        let changed = false;
        const updated = competencies.map((comp) => {
          const match = result.competenciesAssessed.find((ca) => ca.competency === comp.name);
          if (match) {
            changed = true;
            if (match.score === 0) {
              return { ...comp, score: Math.min(comp.score, 54) };
            } else if (match.score === 100 && comp.score < comp.target) {
              return { ...comp, score: Math.min(comp.target, comp.score + 10) };
            }
          }
          return comp;
        });
        if (changed) {
          await supabaseStore.setCompetencies(userId, updated);
        }

        // Generate and save updated reassessment snapshot following diagnostic assessment
        const snapshot: ReassessmentItem[] = updated.map((comp) => ({
          competency: comp.name,
          before: comp.score,
          after:
            comp.score < comp.target
              ? Math.min(100, Math.max(comp.target, comp.score + 18))
              : Math.min(100, comp.score + 4),
          target: comp.target,
        }));
        await supabaseStore.saveReassessmentSnapshot(userId, snapshot);
      }
    } else {
      mockStore.saveAssessmentResult(result);
      mockStore.syncDiagnosticAssessmentScores(result);
    }

    return result;
  },

  async getLatestResult(): Promise<AssessmentResult | null> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) return supabaseStore.getLatestAssessmentResult(userId);
      return null;
    }
    return (mockStore.getSavedAssessmentResult() as AssessmentResult) ?? null;
  },

  async getReassessmentComparison(): Promise<ReassessmentItem[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const snapshots = await supabaseStore.getLatestReassessmentSnapshot(userId);
        // Only return persisted snapshots from actual assessments.
        // Do NOT generate a fake snapshot for new users who have never
        // submitted an assessment — that would display fabricated data.
        return snapshots;
      }
    }
    return mockStore.getReassessment();
  },

  async applyReassessmentScores(): Promise<Competency[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        let snapshots = await supabaseStore.getLatestReassessmentSnapshot(userId);
        if (snapshots.length === 0) {
          snapshots = await this.getReassessmentComparison();
        }
        if (snapshots.length > 0) {
          const current = await igotAdapter.getCompetencies();
          const updated = current.map((comp) => {
            const match = snapshots.find((r) => r.competency === comp.name);
            return match ? { ...comp, score: match.after } : comp;
          });
          await supabaseStore.setCompetencies(userId, updated);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("igot_store_updated"));
          }
          return updated;
        }
      }
    }
    return mockStore.applyReassessmentScores();
  },
};

export const progressService = {
  async getTrendData(): Promise<ProgressTrendPoint[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        const completed = enrollments.filter((e) => (e.progress ?? 0) >= 100).length;
        const inProgress = enrollments.filter(
          (e) => (e.progress ?? 0) > 0 && (e.progress ?? 0) < 100,
        ).length;
        const comps = await igotAdapter.getCompetencies();
        const avgScore =
          comps.length > 0 ? Math.round(comps.reduce((a, b) => a + b.score, 0) / comps.length) : 0;
        const totalHours = completed * 6 + inProgress * 2;

        return [
          { month: "Sep", score: avgScore, coursesCompleted: completed, hoursSpent: totalHours },
        ];
      }
    }
    return mockStore.getProgressTrend();
  },

  async getTasks(): Promise<LearningTask[]> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const enrollments = await supabaseStore.getEnrollments(userId);
        const inProgress = enrollments.filter(
          (e) => (e.progress ?? 0) > 0 && (e.progress ?? 0) < 100,
        );
        if (inProgress.length === 0) {
          return [
            {
              id: "t1",
              title: "Complete Diagnostic Assessment",
              due: "Recommended",
              status: "urgent",
            },
            {
              id: "t2",
              title: "Explore and enroll in role-aligned courses",
              due: "Upcoming",
              status: "upcoming",
            },
          ];
        }
        return inProgress.map((e, idx) => {
          const course = staticCourseCatalog.find((c) => c.id === e.course_id);
          return {
            id: `t-${e.course_id}`,
            title: `Continue: ${course?.title || `Course ${e.course_id}`}`,
            due: idx === 0 ? "Due today" : "Due this week",
            status: idx === 0 ? ("urgent" as const) : ("upcoming" as const),
          };
        });
      }
    }
    return mockStore.getTasks();
  },

  async getProgressMetrics() {
    const [summary, trends, competencies] = await Promise.all([
      competencyService.getSummary(),
      this.getTrendData(),
      igotAdapter.getCompetencies(),
    ]);
    const totalHours =
      trends.reduce((acc, t) => acc + t.hoursSpent, 0) || summary.learningHoursLogged;
    return {
      overallScore: summary.overallCompetency,
      completedCourses: summary.completedCourses,
      inProgressCourses: summary.inProgressCourses,
      totalHours,
      competenciesCount: competencies.length,
      evaluationsPassedCount: summary.completedCourses,
    };
  },
};

export const learnerService = {
  async getProfile(): Promise<Learner> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        const profile = await supabaseStore.getLearner(userId);
        if (profile) return profile;
        // Profile row is missing but we have a real session.
        // Return a safe in-memory shell so we NEVER fall through to the shared
        // localStorage-backed mockStore (which would show another user's name).
        const { data: { user } } = await supabase.auth.getUser();
        const emailPart = user?.email?.split("@")[0] ?? "Learner";
        return {
          id: userId,
          name: emailPart,
          role: "Civil Servant",
          department: "",
          cadre: "Central Secretariat Service (CSS)",
          email: user?.email ?? "",
          avatarInitials: emailPart.slice(0, 2).toUpperCase(),
        };
      }
    }
    // Only fall back to mock/localStorage store when there is genuinely no Supabase session
    // (i.e. the user is in demo mode or the app is running without Supabase credentials).
    return mockStore.getLearner();
  },

  async updateProfile(learner: Learner): Promise<void> {
    if (await isRealSession()) {
      const userId = await getUserId();
      if (userId) {
        await supabaseStore.updateLearner(userId, learner);
        return;
      }
    }
    mockStore.setLearner(learner);
  },

  resetDemo(): void {
    mockStore.resetDemo();
  },
};
