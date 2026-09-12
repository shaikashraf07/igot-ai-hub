import type {
  AssessmentQuestion,
  AssessmentResult,
  Competency,
  CompetencyAnalysisReport,
  Course,
  Learner,
  LearningPathwayStep,
  PriorityLevel,
  RecommendationRationale,
  RecommendationTag,
  SkillGap,
} from "@/types/igot";
import { calculateSkillGap, getGapSeverity } from "./domain-logic";

/**
 * Intelligent Competency Metadata with Cadre and Civil Service Role Context
 */
interface CompetencyIntelligenceMeta {
  cadreRelevance: string;
  rootCauses: string[];
  recommendedCourseId: string;
  defaultHours: number;
}

const COMPETENCY_INTEL_MAP: Record<string, CompetencyIntelligenceMeta> = {
  "Decision Making": {
    cadreRelevance:
      "Critical for Under Secretary rank in Central Secretariat Service (CSS). Involves inter-ministerial file noting, cabinet notes, and statutory compliance.",
    rootCauses: [
      "Field data reconciliation anomalies without documented discrepancy justification",
      "Over-reliance on hierarchical precedent rather than evidence-based data synthesis",
    ],
    recommendedCourseId: "c1",
    defaultHours: 6,
  },
  Leadership: {
    cadreRelevance:
      "Core supervisory responsibility for Section Officers and Assistants. Dictates file clearance velocity and branch team cohesion.",
    rootCauses: [
      "Work distribution bottlenecks and single-point review dependencies",
      "Hesitation in cross-cadre delegation during high-priority parliamentary sessions",
    ],
    recommendedCourseId: "c2",
    defaultHours: 8,
  },
  "Problem Solving": {
    cadreRelevance:
      "Essential for public grievance redressal workflows on CPGRAMS and citizen-facing service touchpoints.",
    rootCauses: [
      "Symptomatic disposal of grievances without underlying process root cause diagnosis",
      "Lack of cause-effect diagramming in recurring departmental delivery leakages",
    ],
    recommendedCourseId: "c3",
    defaultHours: 3,
  },
  Communication: {
    cadreRelevance:
      "Statutory precision in official notes, O.M. drafts, and parliamentary question replies under Central Secretariat Manual of Office Procedure (CSMOP).",
    rootCauses: [
      "Unclear recommendation framing in higher-authority submission notes",
      "Excessive background attachments obscuring the actionable policy decision",
    ],
    recommendedCourseId: "c4",
    defaultHours: 4,
  },
  "Digital Skills": {
    cadreRelevance:
      "National Digital Public Infrastructure (DPI) adoption, e-Office 7.0 proficiency, and Digital Personal Data Protection (DPDP) compliance.",
    rootCauses: [
      "Inadequate anonymization check prior to open departmental dataset publishing",
    ],
    recommendedCourseId: "c5",
    defaultHours: 5,
  },
};

/**
 * Calculates a multi-factor recommendation match score (0-100%)
 */
export function calculateCourseMatchScore(
  course: Course,
  competencies: Competency[],
  learner: Learner,
): { score: number; rationale: RecommendationRationale } {
  const comp = competencies.find((c) => c.name === course.competency);
  const currentScore = comp ? comp.score : 70;
  const targetScore = comp ? comp.target : 80;
  const gap = calculateSkillGap(currentScore, targetScore);
  const urgency = getGapSeverity(gap);

  // Factor 1: Gap Severity Weight (0 - 50 points)
  let gapScore = 15;
  if (gap >= 20) gapScore = 50;
  else if (gap >= 10) gapScore = 38;
  else if (gap > 0) gapScore = 26;

  // Factor 2: Cadre & Role Fit Weight (0 - 25 points)
  let roleFit = 18;
  if (learner.role.toLowerCase().includes("under secretary") || learner.cadre.includes("CSS")) {
    if (course.competency === "Decision Making" || course.competency === "Leadership") {
      roleFit = 25;
    } else {
      roleFit = 20;
    }
  }

  // Factor 3: Provider Authority & Rating (0 - 15 points)
  const providerUpper = course.provider.toUpperCase();
  let providerScore = 10;
  if (providerUpper.includes("CBC") || providerUpper.includes("LBSNAA") || providerUpper.includes("ISTM")) {
    providerScore = 15;
  } else if (providerUpper.includes("NEGD") || providerUpper.includes("DARPG")) {
    providerScore = 13;
  }

  // Factor 4: Course Rating / Popularity (0 - 10 points)
  const ratingScore = Math.min(10, Math.round((course.rating / 5) * 10));

  const totalScore = Math.min(99, gapScore + roleFit + providerScore + ratingScore);

  // Determine Recommendation Tag
  let tag: RecommendationTag = "Elective Advancement";
  if (gap >= 15) {
    tag = "Priority Gap Closer";
  } else if (course.competency === "Leadership" || course.competency === "Communication") {
    tag = "Cadre Core Essential";
  } else if (course.competency === "Digital Skills" || course.competency === "Functional") {
    tag = "Cross-Functional";
  }

  const intel = COMPETENCY_INTEL_MAP[course.competency];
  const projectedGain = gap > 0 ? Math.min(gap, 18) : 5;

  const rationale: RecommendationRationale = {
    gapAddressed: course.competency,
    pointsDeficit: gap,
    matchScore: totalScore,
    projectedGain,
    urgency,
    whyRecommended:
      gap > 0
        ? `Directly addresses your ${urgency.toLowerCase()}-priority ${gap}-point deficit in ${course.competency} to meet the ${targetScore}% cadre target.`
        : `Consolidates your verified capability in ${course.competency} for elective career progression.`,
    careerImpact: intel
      ? intel.cadreRelevance
      : "Strengthens administrative output and compliance under Mission Karmayogi standards.",
    tag,
  };

  return { score: totalScore, rationale };
}

/**
 * Generates an intelligent, personalized recommendation catalog
 */
export function generateIntelligentRecommendations(
  courses: Course[],
  competencies: Competency[],
  learner: Learner,
  filter: "all" | "priority" | "core" | "quick" = "all",
): Course[] {
  const scored = courses
    .filter((c) => (c.progress ?? 0) < 100) // Exclude completed courses
    .map((c) => {
      const { score, rationale } = calculateCourseMatchScore(c, competencies, learner);
      return {
        ...c,
        reason: rationale.whyRecommended,
        recommendation: rationale,
      };
    })
    .sort((a, b) => {
      const scoreA = a.recommendation?.matchScore ?? 0;
      const scoreB = b.recommendation?.matchScore ?? 0;
      return scoreB - scoreA;
    });

  if (filter === "priority") {
    return scored.filter((c) => c.recommendation?.tag === "Priority Gap Closer");
  }
  if (filter === "core") {
    return scored.filter((c) => c.recommendation?.tag === "Cadre Core Essential" || c.recommendation?.tag === "Priority Gap Closer");
  }
  if (filter === "quick") {
    return scored.filter((c) => {
      const hours = parseInt(c.duration, 10);
      return !isNaN(hours) ? hours <= 4 : false;
    });
  }

  return scored;
}

/**
 * Generates an end-to-end Competency Analysis Report
 */
export function generateCompetencyAnalysis(
  competencies: Competency[],
  courses: Course[],
  learner: Learner,
): CompetencyAnalysisReport {
  const gaps = competencies.filter((c) => c.score < c.target);
  const strengths = competencies.filter((c) => c.score >= c.target);

  const totalDeficitPoints = gaps.reduce((acc, c) => acc + (c.target - c.score), 0);
  const avgScore =
    competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.score, 0) / competencies.length)
      : 0;

  // Readiness classification
  let readinessBand: CompetencyAnalysisReport["readinessBand"] = "Role Ready";
  let readinessSummary =
    "All assessed competencies meet or exceed Designated Cadre Benchmarks. Officer is eligible for advanced elective programs.";

  if (gaps.some((g) => g.target - g.score >= 15)) {
    readinessBand = "Intensive Development Needed";
    const largestGap = [...gaps].sort((a, b) => (b.target - b.score) - (a.target - a.score))[0];
    readinessSummary = `Critical gap identified in ${largestGap?.name} (${largestGap?.score}% vs ${largestGap?.target}% benchmark). Targeted capacity building required prior to quarterly cadre review.`;
  } else if (gaps.length > 0) {
    readinessBand = "Moderate Progression Required";
    readinessSummary = `Officer is within 10 points of all cadre benchmarks. Minor modular adjustments will achieve 100% compliance.`;
  }

  // Enhanced Skill Gaps with Root Causes
  const criticalGaps: SkillGap[] = [];
  const moderateGaps: SkillGap[] = [];

  for (const g of gaps) {
    const deficit = g.target - g.score;
    const intel = COMPETENCY_INTEL_MAP[g.name];
    const skillGap: SkillGap = {
      id: `gap-${g.id}`,
      competency: g.name,
      current: g.score,
      target: g.target,
      priority: getGapSeverity(deficit),
      evidence: `Assessment score of ${g.score}% is ${deficit} points below designated benchmark of ${g.target}%.`,
      action: intel ? `Complete course: ${courses.find((c) => c.id === intel.recommendedCourseId)?.title ?? "Targeted module"}` : "Undertake targeted modular study",
      category: g.category,
      rootCause: intel?.rootCauses[0] ?? "Knowledge retention gap identified in administrative scenario evaluation.",
      estimatedHoursToClose: intel?.defaultHours ?? 4,
      recommendedCourseId: intel?.recommendedCourseId,
    };

    if (deficit >= 15) {
      criticalGaps.push(skillGap);
    } else {
      moderateGaps.push(skillGap);
    }
  }

  // Sequenced Learning Pathway
  const learningPathway: LearningPathwayStep[] = [];
  const sortedGaps = [...gaps].sort((a, b) => (b.target - b.score) - (a.target - a.score));

  sortedGaps.slice(0, 3).forEach((gap, index) => {
    const intel = COMPETENCY_INTEL_MAP[gap.name];
    const matchedCourse = courses.find((c) => c.id === intel?.recommendedCourseId) ?? courses.find((c) => c.competency === gap.name);

    if (matchedCourse) {
      learningPathway.push({
        step: index + 1,
        title: matchedCourse.title,
        courseId: matchedCourse.id,
        targetCompetency: gap.name,
        estimatedHours: intel?.defaultHours ?? 4,
        urgency: getGapSeverity(gap.target - gap.score),
        expectedOutcome: `Close ${gap.target - gap.score}-point deficit and elevate ${gap.name} score to role target (${gap.target}%).`,
        status: (matchedCourse.progress ?? 0) >= 100 ? "completed" : (matchedCourse.progress ?? 0) > 0 ? "in_progress" : "pending",
      });
    }
  });

  const estimatedHoursToBenchmark = learningPathway.reduce((acc, s) => acc + s.estimatedHours, 0);

  return {
    overallHealthIndex: avgScore,
    readinessBand,
    readinessSummary,
    strengths,
    criticalGaps,
    moderateGaps,
    learningPathway,
    totalDeficitPoints,
    estimatedHoursToBenchmark,
  };
}

/**
 * Diagnostic Cognitive Observations for Assessment Results
 */
export function generateDiagnosticInsights(answers: Record<string, number>, questions: AssessmentQuestion[]) {
  const insights: AssessmentResult["diagnosticInsights"] = [];

  const insightDictionary: Record<string, { failureInsight: string; intervention: string }> = {
    q1: {
      failureInsight:
        "Reliance on official district report despite contradictory ground field data indicates vulnerability in evidence reconciliation.",
      intervention: "Apply structured evidence synthesis and discrepancy documentation before formal file noting.",
    },
    q2: {
      failureInsight:
        "Temptation to issue blanket administrative warnings or take over files personally reveals delegation friction in team hierarchy.",
      intervention: "Adopt root-cause bottleneck diagnosis and assign explicit task ownership with interim milestone reviews.",
    },
    q3: {
      failureInsight:
        "Preference for transferring staff or closing grievance tickets prematurely rather than diagnosing procedural flaws.",
      intervention: "Perform Ishikawa / 5-Why root cause analysis on recurring sub-office grievances under CPGRAMS.",
    },
    q4: {
      failureInsight:
        "Submitting voluminous uncurated documentation rather than a crisp options-and-recommendation note.",
      intervention: "Strict adherence to CSMOP Chapter 7 official noting formats.",
    },
    q5: {
      failureInsight:
        "Overlooking data anonymization before departmental dataset disclosure.",
      intervention: "Mandatory compliance with DPDP Act 2023 and open data anonymization protocols.",
    },
  };

  for (const q of questions) {
    if (answers[q.id] !== undefined && answers[q.id] !== q.answer) {
      const entry = insightDictionary[q.id];
      if (entry) {
        insights.push({
          cognitiveArea: q.competency,
          behavioralObservation: entry.failureInsight,
          suggestedIntervention: entry.intervention,
        });
      }
    }
  }

  return insights;
}
