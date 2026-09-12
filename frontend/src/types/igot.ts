export type CompetencyCategory = "Behavioural" | "Functional" | "Domain";

export interface Competency {
  id: string;
  name: string;
  score: number;
  target: number;
  category: CompetencyCategory;
}

export type PriorityLevel = "High" | "Medium" | "Low";

export interface SkillGap {
  id: string;
  competency: string;
  current: number;
  target: number;
  priority: PriorityLevel;
  evidence: string;
  action: string;
  category?: CompetencyCategory | undefined;
  rootCause?: string | undefined;
  estimatedHoursToClose?: number | undefined;
  recommendedCourseId?: string | undefined;
}

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type RecommendationTag =
  | "Priority Gap Closer"
  | "Cadre Core Essential"
  | "Elective Advancement"
  | "Cross-Functional";

export interface RecommendationRationale {
  gapAddressed: string;
  pointsDeficit: number;
  matchScore: number;
  projectedGain: number;
  urgency: PriorityLevel;
  whyRecommended: string;
  careerImpact: string;
  tag: RecommendationTag;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: CourseLevel;
  competency: string;
  rating: number;
  enrolled: number;
  progress?: number | undefined;
  description: string;
  outcomes: string[];
  reason?: string | undefined;
  isEnrolled?: boolean | undefined;
  recommendation?: RecommendationRationale | undefined;
}

export interface Learner {
  id: string;
  name: string;
  role: string;
  department: string;
  cadre: string;
  email: string;
  avatarInitials: string;
}

export interface AssessmentQuestion {
  id: string;
  competency: string;
  question: string;
  options: string[];
  answer: number;
}

export interface AssessmentAttempt {
  answers: Record<string, number>;
  submittedAt: string;
}

export interface AssessmentResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  competenciesAssessed: {
    competency: string;
    total: number;
    correct: number;
    score: number;
  }[];
  incorrectQuestions: {
    id: string;
    question: string;
    competency: string;
    selectedAnswer: string;
    correctAnswer: string;
  }[];
  recommendedAction: string;
  recommendedCourseId?: string | undefined;
  diagnosticInsights?: {
    cognitiveArea: string;
    behavioralObservation: string;
    suggestedIntervention: string;
  }[] | undefined;
}

export interface ReassessmentItem {
  competency: string;
  before: number;
  after: number;
  target: number;
}

export interface ProgressTrendPoint {
  month: string;
  score: number;
  coursesCompleted: number;
  hoursSpent: number;
}

export interface LearningTask {
  id: string;
  title: string;
  due: string;
  status: "urgent" | "upcoming" | "completed";
}

export interface LearningSummary {
  enrolledCourses: number;
  overallCompetency: number;
  skillGaps: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  learningHoursLogged: number;
}

export interface LearningPathwayStep {
  step: number;
  title: string;
  courseId: string;
  targetCompetency: string;
  estimatedHours: number;
  urgency: PriorityLevel;
  expectedOutcome: string;
  status: "pending" | "in_progress" | "completed";
}

export interface CompetencyAnalysisReport {
  overallHealthIndex: number;
  readinessBand: "Role Ready" | "Moderate Progression Required" | "Intensive Development Needed";
  readinessSummary: string;
  strengths: Competency[];
  criticalGaps: SkillGap[];
  moderateGaps: SkillGap[];
  learningPathway: LearningPathwayStep[];
  totalDeficitPoints: number;
  estimatedHoursToBenchmark: number;
}

/**
 * Phase 5: Structured Context Facts & AI Insight Interfaces
 */
export interface LearnerContextFacts {
  learner: Learner;
  competencies: Competency[];
  courses: Course[];
  skillGaps: SkillGap[];
  analysisReport: CompetencyAnalysisReport;
  recentAssessment?: AssessmentResult | null | undefined;
}

export interface DashboardAIInsight {
  headline: string;
  readinessAssessment: string;
  primaryDevelopmentFocus: string;
  recommendedImmediateAction: string;
  statutoryCadreAlignment: string;
}

export interface CompetencyAIInsight {
  competencyName: string;
  currentState: string;
  developmentNeed: string;
  likelyLearningFocus: string;
  explanation: string;
  recommendedAction: string;
  statusTone: "danger" | "warning" | "success";
}

export interface RecommendationAIExplanation {
  whyThisCourse: string;
  gapAddressedSummary: string;
  administrativeImpact: string;
  priorityReason: string;
  expectedLearningPurpose: string;
}

export interface PathwayAIExplanation {
  overallStrategy: string;
  stepExplanations: {
    step: number;
    title: string;
    targetCompetency: string;
    rationale: string;
    milestonePurpose: string;
  }[];
  estimatedCompletionImpact: string;
}

export interface AssessmentAIFeedback {
  executiveSummary: string;
  strengthsNarrative: string;
  developmentAreasNarrative: string;
  cadreBenchmarkImplications: string;
  recommendedNextAction: string;
}

