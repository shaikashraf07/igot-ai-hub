import type {
  AssessmentQuestion,
  AssessmentResult,
  Competency,
  Course,
  LearningSummary,
  PriorityLevel,
  SkillGap,
} from "@/types/igot";
import { generateDiagnosticInsights } from "./intelligence-engine";

/**
 * Competency action & evidence metadata for dynamic gap derivations.
 */
const COMPETENCY_METADATA: Record<string, { evidence: string; action: string; courseId: string }> = {
  "Decision Making": {
    evidence: "Assessment score indicates structured decision frameworks and data reconciliation need development",
    action: "Complete Evidence-Based Decision Making for Administrators",
    courseId: "c1",
  },
  Leadership: {
    evidence: "Supervisor review flagged team delegation and hierarchy management as areas to develop",
    action: "Enrol in Leading Teams in Public Administration",
    courseId: "c2",
  },
  "Problem Solving": {
    evidence: "Case-study assessment below role benchmark; recurring grievance handling needs structured RCA",
    action: "Practice module: Root Cause Analysis in Governance",
    courseId: "c3",
  },
  Communication: {
    evidence: "Official note drafting and correspondence sample slightly below target band",
    action: "Short course: Official Drafting and Noting",
    courseId: "c4",
  },
  "Digital Skills": {
    evidence: "DPI and data protection compliance needs refresher for departmental service design",
    action: "Study module: Digital Public Infrastructure Essentials",
    courseId: "c5",
  },
};

/**
 * Safely find the competency with the highest priority deficit below benchmark target.
 * Returns null if all competencies meet or exceed role targets.
 */
export function getPriorityCompetency(competencies: Competency[]): Competency | null {
  if (!competencies || competencies.length === 0) return null;
  const gaps = competencies.filter((c) => c.score < c.target);
  if (gaps.length === 0) return null;
  return [...gaps].sort((a, b) => (b.target - b.score) - (a.target - a.score))[0] ?? null;
}

/**
 * Calculates gap points between current score and target.
 */
export function calculateSkillGap(current: number, target: number): number {
  return Math.max(0, target - current);
}

/**
 * Returns a priority level based on gap points.
 */
export function getGapSeverity(gap: number): PriorityLevel {
  if (gap >= 20) return "High";
  if (gap >= 10) return "Medium";
  return "Low";
}

/**
 * Returns badge tone for priority level.
 */
export function getPriorityTone(priority: PriorityLevel): "danger" | "warning" | "neutral" {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    default:
      return "neutral";
  }
}

/**
 * Dynamically derives skill gaps from current competency levels against benchmarks.
 */
export function deriveSkillGaps(competencies: Competency[]): SkillGap[] {
  return competencies
    .filter((c) => c.score < c.target)
    .map((c) => {
      const gap = c.target - c.score;
      const meta = COMPETENCY_METADATA[c.name] ?? {
        evidence: `Score of ${c.score}% is ${gap} points below role benchmark of ${c.target}%`,
        action: `Complete recommended modular capacity building courses for ${c.name}`,
        courseId: "c1",
      };
      return {
        id: `gap-${c.id}`,
        competency: c.name,
        current: c.score,
        target: c.target,
        priority: getGapSeverity(gap),
        evidence: meta.evidence,
        action: meta.action,
      };
    })
    .sort((a, b) => {
      const pOrder: Record<PriorityLevel, number> = { High: 0, Medium: 1, Low: 2 };
      const diff = pOrder[a.priority] - pOrder[b.priority];
      return diff !== 0 ? diff : (b.target - b.current) - (a.target - a.current);
    });
}

/**
 * Dynamically derives course recommendations based on active competency gaps.
 */
export function deriveRecommendations(courses: Course[], competencies: Competency[]): Course[] {
  const gaps = deriveSkillGaps(competencies);
  const gapMap = new Map<string, SkillGap>();
  gaps.forEach((g) => gapMap.set(g.competency, g));

  const recommended: Course[] = [];

  // Match courses targeting active gaps first
  for (const gap of gaps) {
    const matchingCourses = courses.filter(
      (c) => c.competency === gap.competency && (c.progress ?? 0) < 100,
    );
    for (const course of matchingCourses) {
      if (!recommended.some((r) => r.id === course.id)) {
        recommended.push({
          ...course,
          reason: `Addresses your ${gap.priority.toLowerCase()}-priority gap in ${gap.competency} (${gap.target - gap.current} points below target).`,
        });
      }
    }
  }

  // Include courses that already had a preset reason if not completed
  for (const course of courses) {
    if (course.reason && (course.progress ?? 0) < 100 && !recommended.some((r) => r.id === course.id)) {
      recommended.push(course);
    }
  }

  return recommended;
}

/**
 * Filters courses with recommendation reasons.
 */
export function getRecommendedCourses(courses: Course[]): Course[] {
  return courses.filter((c) => Boolean(c.reason));
}

/**
 * Computes live summary metrics from the courses, competencies, and gaps state.
 */
export function computeLearningSummary(
  courses: Course[],
  competencies: Competency[],
  skillGaps: SkillGap[],
): LearningSummary {
  const enrolled = courses.filter((c) => c.isEnrolled || (c.progress ?? 0) > 0);
  const completed = enrolled.filter((c) => (c.progress ?? 0) >= 100);
  const inProgress = enrolled.filter((c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
  const notStarted = enrolled.filter((c) => (c.progress ?? 0) === 0);

  const avgCompetency =
    competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.score, 0) / competencies.length)
      : 0;

  return {
    enrolledCourses: enrolled.length,
    overallCompetency: avgCompetency,
    skillGaps: skillGaps.length,
    completedCourses: completed.length,
    inProgressCourses: inProgress.length,
    notStartedCourses: notStarted.length,
    learningHoursLogged: 18 + completed.length * 6 + inProgress.length * 2,
  };
}

/**
 * Evaluates assessment answers against questions and formats structured results.
 */
export function evaluateAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, number>,
): AssessmentResult {
  let correctCount = 0;
  const incorrectQuestions: AssessmentResult["incorrectQuestions"] = [];
  const competencyMap: Record<string, { total: number; correct: number }> = {};

  for (const q of questions) {
    const compStat = competencyMap[q.competency] ?? { total: 0, correct: 0 };
    compStat.total += 1;

    const selected = answers[q.id];
    if (selected === q.answer) {
      correctCount += 1;
      compStat.correct += 1;
    } else {
      incorrectQuestions.push({
        id: q.id,
        question: q.question,
        competency: q.competency,
        selectedAnswer: selected !== undefined ? (q.options[selected] ?? "Not answered") : "Not answered",
        correctAnswer: q.options[q.answer] ?? "Standard policy answer",
      });
    }
    competencyMap[q.competency] = compStat;
  }

  const scorePercentage = Math.round((correctCount / questions.length) * 100);

  const competenciesAssessed = Object.entries(competencyMap).map(([competency, data]) => ({
    competency,
    total: data.total,
    correct: data.correct,
    score: Math.round((data.correct / data.total) * 100),
  }));

  // Find lowest scoring competency to recommend next action
  const lowestAssessed = [...competenciesAssessed].sort((a, b) => a.score - b.score)[0];
  const recommendedAction = lowestAssessed
    ? `Strengthen ${lowestAssessed.competency} capabilities with targeted modular learning before taking the reassessment.`
    : "Review official guidelines and practice scenario-based problem solving.";

  const diagnosticInsights = generateDiagnosticInsights(answers, questions);

  return {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    scorePercentage,
    competenciesAssessed,
    incorrectQuestions,
    recommendedAction,
    recommendedCourseId: "c1",
    diagnosticInsights,
  };
}
