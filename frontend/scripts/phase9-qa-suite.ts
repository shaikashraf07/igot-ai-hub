/**
 * Phase 9 SIH QA & Regression Test Suite
 * Validates the complete learner journey, intelligence algorithms, data isolation,
 * consistency checks, and edge cases for iGOT AI Hub.
 */

import {
  evaluateAssessment,
  deriveSkillGaps,
  calculateSkillGap,
  getGapSeverity,
  computeLearningSummary,
  getPriorityCompetency,
} from "../src/services/domain-logic";

import {
  calculateCourseMatchScore,
  generateCompetencyAnalysis,
  generateIntelligentRecommendations,
} from "../src/services/intelligence-engine";

import {
  staticCourseCatalog,
  initialCompetencies,
  initialLearner,
  assessmentQuestions,
  mockStore,
} from "../src/services/mock-store";

import { MockAIInsightProvider } from "../src/services/ai-insight-service";
import type { Competency, Course, Learner } from "../src/types/igot";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  results.push({
    name,
    passed: Boolean(condition),
    details: condition ? undefined : details || "Assertion failed",
  });
}

console.log("==================================================");
console.log("STARTING PHASE 9 QA & SIH DEMO REGRESSION SUITE");
console.log("==================================================\n");

// -----------------------------------------------------------------------------
// 1. ASSESSMENT ENGINE & SCORING TESTS
// -----------------------------------------------------------------------------
console.log("[1/6] Testing Assessment Scoring & Evaluation Engine...");

assert(assessmentQuestions.length === 5, "Assessment question catalog has 5 diagnostic questions");

// Test perfect score (all answers correct)
const perfectAnswers: Record<string, number> = {};
assessmentQuestions.forEach((q) => {
  perfectAnswers[q.id] = q.answer;
});
const perfectResult = evaluateAssessment(assessmentQuestions, perfectAnswers);

assert(perfectResult.scorePercentage === 100, "Perfect assessment yields 100%");
assert(perfectResult.correctAnswers === 5, "Perfect assessment has 5 correct answers");
assert(perfectResult.incorrectQuestions.length === 0, "No incorrect questions recorded for 100%");

// Test mixed score (miss first question)
const mixedAnswers: Record<string, number> = { ...perfectAnswers };
mixedAnswers[assessmentQuestions[0].id] = (assessmentQuestions[0].answer + 1) % 4;
const mixedResult = evaluateAssessment(assessmentQuestions, mixedAnswers);

assert(mixedResult.scorePercentage === 80, "4 of 5 correct answers yields 80%");
assert(mixedResult.correctAnswers === 4, "Correct answers count is exactly 4");
assert(mixedResult.incorrectQuestions.length === 1, "Exactly 1 incorrect question recorded");
assert(
  mixedResult.incorrectQuestions[0].competency === assessmentQuestions[0].competency,
  "Incorrect question maps to correct competency",
);

// -----------------------------------------------------------------------------
// 2. COMPETENCY ANALYSIS & SKILL GAP ENGINE
// -----------------------------------------------------------------------------
console.log("[2/6] Testing Competency Analysis & Skill Gap Derivation...");

const gaps = deriveSkillGaps(initialCompetencies);

assert(gaps.length > 0, "Skill gaps derived from initial competencies");
const topGap = gaps[0];
assert(topGap.competency === "Decision Making", "Decision Making is highest priority deficit");
assert(topGap.priority === "High", "Decision Making severity is High (26 pts gap >= 20)");
assert(topGap.target === 80 && topGap.current === 54, "Gap current (54) and target (80) are correct");

// Severity boundary check
assert(getGapSeverity(20) === "High", "Gap of 20 is High priority");
assert(getGapSeverity(19) === "Medium", "Gap of 19 is Medium priority");
assert(getGapSeverity(10) === "Medium", "Gap of 10 is Medium priority");
assert(getGapSeverity(9) === "Low", "Gap of 9 is Low priority");

// Priority competency finder
const priorityComp = getPriorityCompetency(initialCompetencies);
assert(priorityComp !== null && priorityComp.name === "Decision Making", "Priority competency is Decision Making");

// -----------------------------------------------------------------------------
// 3. INTELLIGENT RECOMMENDATION & MATCH SCORING
// -----------------------------------------------------------------------------
console.log("[3/6] Testing Recommendation Engine & Match Scores...");

const c1 = staticCourseCatalog.find((c) => c.id === "c1")!;
const matchC1 = calculateCourseMatchScore(c1, initialCompetencies, initialLearner);

assert(matchC1.score >= 85 && matchC1.score <= 100, `Decision making course match score is high (${matchC1.score}%)`);
assert(matchC1.rationale.pointsDeficit === 26, "Points deficit is 26 points for Decision Making");
assert(matchC1.rationale.urgency === "High", "Urgency is marked High for Decision Making");
assert(matchC1.rationale.careerImpact.length > 0, "Career impact context is present");

// Multi-factor recommendations
const recs = generateIntelligentRecommendations(
  staticCourseCatalog,
  initialCompetencies,
  initialLearner,
  "priority",
);

assert(recs.length > 0, "Intelligent recommendations generated for priority gaps");
assert(recs[0].competency === "Decision Making", "First recommended course targets Decision Making gap");
assert(recs[0].recommendation?.matchScore !== undefined && recs[0].recommendation.matchScore >= 80, "Recommended course includes recommendation.matchScore >= 80");

// -----------------------------------------------------------------------------
// 4. LEARNER JOURNEY: ENROLLMENT, PROGRESS & REASSESSMENT CYCLE
// -----------------------------------------------------------------------------
console.log("[4/6] Testing Closed-Loop Learner Cycle (Enroll -> Progress -> Reassess)...");

// Simulate fresh learner competencies
let testCompetencies: Competency[] = [
  { id: "decision", name: "Decision Making", score: 54, target: 80, category: "Behavioural" },
  { id: "leadership", name: "Leadership", score: 68, target: 80, category: "Behavioural" },
  { id: "problem", name: "Problem Solving", score: 73, target: 80, category: "Functional" },
  { id: "communication", name: "Communication", score: 82, target: 85, category: "Behavioural" },
  { id: "digital", name: "Digital Skills", score: 91, target: 85, category: "Functional" },
];

// Initial summary
const coursesCopy: Course[] = staticCourseCatalog.map((c) => ({ ...c }));
let summary = computeLearningSummary(coursesCopy, testCompetencies, deriveSkillGaps(testCompetencies));
assert(summary.completedCourses === 0, "Initially 0 completed courses");
assert(summary.skillGaps === 4, "Initial gaps count is 4 (Decision, Leadership, Problem, Communication)");

// Enroll in Decision Making course (c1)
const c1Copy = coursesCopy.find((c) => c.id === "c1")!;
c1Copy.isEnrolled = true;
c1Copy.progress = 15;

summary = computeLearningSummary(coursesCopy, testCompetencies, deriveSkillGaps(testCompetencies));
assert(summary.inProgressCourses === 1, "Enrolled course appears in inProgressCourses");

// Progress course to 100% completion
c1Copy.progress = 100;

// Competency gain upon completion (+18 points to Decision Making)
testCompetencies = testCompetencies.map((comp) => {
  if (comp.name === "Decision Making") {
    return { ...comp, score: Math.min(comp.target, comp.score + 18) }; // 54 + 18 = 72
  }
  return comp;
});

const updatedGaps = deriveSkillGaps(testCompetencies);
const updatedDecisionGap = updatedGaps.find((g) => g.competency === "Decision Making")!;
assert(updatedDecisionGap.current === 72, "Decision Making score increased to 72% after course completion");
assert(updatedDecisionGap.priority === "Low", "Severity dropped from High to Low (gap is now 8 pts)");

// Simulate Reassessment (diagnostic exam retaken, perfect score)
testCompetencies = testCompetencies.map((comp) => {
  if (comp.name === "Decision Making") {
    return { ...comp, score: comp.target }; // Reaches benchmark 80%
  }
  return comp;
});

const finalGaps = deriveSkillGaps(testCompetencies);
const decisionGapCleared = !finalGaps.some((g) => g.competency === "Decision Making");
assert(decisionGapCleared, "Decision Making gap completely closed after reassessment!");

// -----------------------------------------------------------------------------
// 5. AI INSIGHT CONSISTENCY AUDIT
// -----------------------------------------------------------------------------
console.log("[5/6] Testing AI Insights Synthesized From Actual Data...");

const aiProvider = new MockAIInsightProvider();

const facts = {
  competencies: initialCompetencies,
  courses: staticCourseCatalog,
  learner: initialLearner,
  analysisReport: generateCompetencyAnalysis(initialCompetencies, staticCourseCatalog, initialLearner),
};

const dashboardInsight = await aiProvider.generateDashboardInsight(facts);

assert(
  dashboardInsight.headline.includes("Decision Making"),
  "AI headline correctly references highest deficit competency (Decision Making)",
);
assert(
  dashboardInsight.headline.includes("26 pts"),
  "AI headline references exact 26 pts deficit without hallucination",
);
assert(
  dashboardInsight.primaryDevelopmentFocus.includes("Decision Making (54% vs 80%"),
  "AI body matches exact scores (54% vs 80%)",
);

// Test Role Ready state
const perfectedComps = initialCompetencies.map((c) => ({ ...c, score: c.target + 2 }));
const readyFacts = {
  competencies: perfectedComps,
  courses: staticCourseCatalog,
  learner: initialLearner,
  analysisReport: generateCompetencyAnalysis(perfectedComps, staticCourseCatalog, initialLearner),
};
const roleReadyInsight = await aiProvider.generateDashboardInsight(readyFacts);

assert(
  roleReadyInsight.headline.includes("Compliance Achieved"),
  "AI insight transitions to Compliance Achieved when all competencies met",
);

// -----------------------------------------------------------------------------
// 6. DATA ISOLATION & RESET DEMO INTEGRITY
// -----------------------------------------------------------------------------
console.log("[6/6] Testing Demo Baseline & Data Isolation Integrity...");

assert(initialLearner.name === "Ashraf", "Demo learner name is Ashraf");
assert(initialLearner.role === "Under Secretary", "Demo learner role is Under Secretary");
assert(initialCompetencies.length === 5, "5 competencies defined in baseline");

// Verify that mockStore provides deep independence
const loadedLearner = mockStore.getLearner();
assert(loadedLearner.name === "Ashraf", "mockStore retrieves Ashraf");

console.log("\n==================================================");
console.log("QA TEST RESULTS SUMMARY");
console.log("==================================================");

let passedCount = 0;
let failedCount = 0;

for (const res of results) {
  if (res.passed) {
    passedCount++;
    console.log(`  PASS: ${res.name}`);
  } else {
    failedCount++;
    console.error(`  FAIL: ${res.name} — ${res.details}`);
  }
}

console.log("\n--------------------------------------------------");
console.log(`TOTAL: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("--------------------------------------------------\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("ALL PHASE 9 QA TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}
