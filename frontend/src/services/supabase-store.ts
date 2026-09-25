import { supabase } from "@/lib/supabase";
import type { AssessmentResult, Competency, Learner, ReassessmentItem } from "@/types/igot";

export const supabaseStore = {
  async getLearner(userId: string): Promise<Learner | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      console.warn(
        "Profile not found in Supabase, attempting to recover from Auth metadata...",
        error,
      );

      // Fallback: If profile row is missing, try to get info from auth user metadata and auto-provision
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata as Record<string, unknown> | undefined;
        const metadataName = (metadata?.["full_name"] ?? metadata?.["name"]) as string | undefined;
        const emailFirst = user.email ? user.email.split("@")[0] : undefined;
        const resolvedName = metadataName || emailFirst || "Learner";
        const resolvedRole = (metadata?.["role"] as string | undefined) || "Under Secretary";
        const resolvedDept =
          (metadata?.["department"] as string | undefined) ||
          "Ministry of Personnel, Public Grievances & Pensions";
        const resolvedCadre =
          (metadata?.["cadre"] as string | undefined) || "Central Secretariat Service (CSS)";
        const avatarInitials = resolvedName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        // Auto-provision profile row in Supabase so subsequent lookups succeed
        const { error: insertErr } = await supabase.from("profiles").upsert({
          id: user.id,
          name: resolvedName,
          role: resolvedRole,
          department: resolvedDept,
          cadre: resolvedCadre,
          avatar_initials: avatarInitials,
          updated_at: new Date().toISOString(),
        });

        if (insertErr) {
          console.error("Auto-provisioning profile failed:", insertErr.message);
        }

        return {
          id: user.id,
          name: resolvedName,
          role: resolvedRole,
          department: resolvedDept,
          cadre: resolvedCadre,
          email: user.email || "",
          avatarInitials,
        };
      }
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      role: data.role,
      department: data.department,
      cadre: data.cadre,
      email: (await supabase.auth.getUser()).data.user?.email || "",
      avatarInitials: data.avatar_initials,
    };
  },

  async updateLearner(userId: string, learner: Partial<Learner>): Promise<void> {
    const updateData: {
      name?: string;
      avatar_initials?: string;
      role?: string;
      department?: string;
      cadre?: string;
      updated_at?: string;
    } = {};
    if (learner.name) {
      updateData.name = learner.name;
      updateData.avatar_initials = learner.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (learner.role) updateData.role = learner.role;
    if (learner.department) updateData.department = learner.department;
    if (learner.cadre) updateData.cadre = learner.cadre;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...updateData,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("Failed to update profile", error);
    }
  },

  async getCompetencies(userId: string): Promise<Competency[]> {
    const { data, error } = await supabase.from("competencies").select("*").eq("user_id", userId);

    if (error) {
      console.error("Failed to fetch competencies", error);
      return [];
    }

    return data.map((c) => ({
      id: c.comp_key,
      name: c.name,
      score: c.score,
      target: c.target,
      category: c.category as Competency["category"],
    }));
  },

  async setCompetencies(userId: string, competencies: Competency[]): Promise<void> {
    // Upsert competencies
    const rows = competencies.map((c) => ({
      user_id: userId,
      comp_key: c.id,
      name: c.name,
      score: c.score,
      target: c.target,
      category: c.category,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("competencies")
      .upsert(rows, { onConflict: "user_id,comp_key" });

    if (error) {
      console.error("Failed to set competencies", error);
    }
  },

  async getEnrollments(
    userId: string,
  ): Promise<{ course_id: string; is_enrolled: boolean; progress: number }[]> {
    const { data, error } = await supabase
      .from("enrollments")
      .select("course_id, is_enrolled, progress")
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to fetch enrollments", error);
      return [];
    }

    return data || [];
  },

  async upsertEnrollment(
    userId: string,
    courseId: string,
    progress: number,
    isEnrolled: boolean = true,
  ): Promise<void> {
    const { error } = await supabase.from("enrollments").upsert(
      {
        user_id: userId,
        course_id: courseId,
        progress,
        is_enrolled: isEnrolled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" },
    );

    if (error) {
      console.error("Failed to upsert enrollment", error);
    }
  },

  async saveAssessmentResult(userId: string, result: AssessmentResult): Promise<void> {
    const { error } = await supabase.from("assessment_results").insert({
      user_id: userId,
      score_percentage: result.scorePercentage,
      correct_answers: result.correctAnswers,
      total_questions: result.totalQuestions,
      competencies_assessed: result.competenciesAssessed,
      incorrect_questions: result.incorrectQuestions,
      recommended_action: result.recommendedAction,
      recommended_course_id: result.recommendedCourseId,
      diagnostic_insights: result.diagnosticInsights,
    });

    if (error) {
      console.error("Failed to save assessment result", error);
    }
  },

  async getLatestAssessmentResult(userId: string): Promise<AssessmentResult | null> {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      scorePercentage: data.score_percentage,
      correctAnswers: data.correct_answers,
      totalQuestions: data.total_questions,
      competenciesAssessed: data.competencies_assessed,
      incorrectQuestions: data.incorrect_questions,
      recommendedAction: data.recommended_action,
      recommendedCourseId: data.recommended_course_id,
      diagnosticInsights: data.diagnostic_insights,
    } as AssessmentResult;
  },

  async saveReassessmentSnapshot(userId: string, snapshot: ReassessmentItem[]): Promise<void> {
    const { error } = await supabase.from("reassessment_snapshots").insert({
      user_id: userId,
      snapshot: snapshot,
    });

    if (error) {
      console.error("Failed to save reassessment snapshot", error);
    }
  },

  async getLatestReassessmentSnapshot(userId: string): Promise<ReassessmentItem[]> {
    const { data, error } = await supabase
      .from("reassessment_snapshots")
      .select("snapshot")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return [];
    }

    return data.snapshot as unknown as ReassessmentItem[];
  },
};
