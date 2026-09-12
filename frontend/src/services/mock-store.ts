import type {
  AssessmentQuestion,
  Competency,
  Course,
  Learner,
  LearningTask,
  ProgressTrendPoint,
  ReassessmentItem,
  SkillGap,
} from "@/types/igot";
import { deriveSkillGaps } from "./domain-logic";

const STORAGE_KEY_COURSES = "igot_courses_v2";
const STORAGE_KEY_COMPETENCIES = "igot_competencies_v2";
const STORAGE_KEY_LEARNER = "igot_learner_v2";
const STORAGE_KEY_ASSESSMENT_RESULTS = "igot_assessment_results_v2";
const STORAGE_KEY_REASSESSMENT = "igot_reassessment_v2";

export const initialLearner: Learner = {
  id: "l1",
  name: "Ashraf",
  role: "Under Secretary",
  department: "Ministry of Personnel, Public Grievances & Pensions",
  cadre: "Central Secretariat Service (CSS)",
  email: "ashraf@gov.in",
  avatarInitials: "A",
};

export const initialCompetencies: Competency[] = [
  { id: "decision", name: "Decision Making", score: 54, target: 80, category: "Behavioural" },
  { id: "leadership", name: "Leadership", score: 68, target: 80, category: "Behavioural" },
  { id: "problem", name: "Problem Solving", score: 73, target: 80, category: "Functional" },
  { id: "communication", name: "Communication", score: 82, target: 85, category: "Behavioural" },
  { id: "digital", name: "Digital Skills", score: 91, target: 85, category: "Functional" },
];

export const initialCourses: Course[] = [
  {
    id: "c1",
    title: "Evidence-Based Decision Making for Administrators",
    provider: "Capacity Building Commission",
    duration: "6 hours",
    level: "Intermediate",
    competency: "Decision Making",
    rating: 4.6,
    enrolled: 12480,
    progress: 0,
    isEnrolled: false,
    description:
      "Learn structured approaches to administrative decision making using data, precedent and stakeholder analysis in a public service context.",
    outcomes: [
      "Apply structured decision frameworks to policy choices",
      "Weigh evidence, risk and public interest",
      "Document decisions defensibly for audit and review",
    ],
    reason: "Addresses your largest gap: Decision Making is 26 points below your role target.",
  },
  {
    id: "c2",
    title: "Leading Teams in Public Administration",
    provider: "LBSNAA",
    duration: "8 hours",
    level: "Intermediate",
    competency: "Leadership",
    rating: 4.4,
    enrolled: 9310,
    progress: 0,
    isEnrolled: false,
    description:
      "Build practical leadership habits for government teams: delegation, feedback, motivation and managing change in a hierarchy.",
    outcomes: [
      "Delegate effectively across grades",
      "Run productive review meetings",
      "Support team members through change",
    ],
    reason: "Targets the delegation gap identified in your Leadership competency review.",
  },
  {
    id: "c3",
    title: "Root Cause Analysis in Governance",
    provider: "iGOT AI Hub",
    duration: "3 hours",
    level: "Beginner",
    competency: "Problem Solving",
    rating: 4.2,
    enrolled: 5602,
    progress: 0,
    isEnrolled: false,
    description:
      "A short, practical module on diagnosing recurring service delivery problems using cause-effect analysis.",
    outcomes: [
      "Map causes behind recurring grievances",
      "Prioritise interventions by impact",
      "Design simple corrective action plans",
    ],
    reason: "Closes a 7-point gap in Problem Solving against your role benchmark.",
  },
  {
    id: "c4",
    title: "Official Drafting and Noting",
    provider: "ISTM",
    duration: "4 hours",
    level: "Beginner",
    competency: "Communication",
    rating: 4.7,
    enrolled: 21870,
    progress: 100,
    isEnrolled: true,
    description:
      "Standards and conventions for notes, drafts and official correspondence in government offices.",
    outcomes: [
      "Draft clear, compliant official notes",
      "Use correct forms of communication",
      "Reduce revision cycles on files",
    ],
    reason: "Lifts Communication into your target band with a short time commitment.",
  },
  {
    id: "c5",
    title: "Digital Public Infrastructure Essentials",
    provider: "NeGD",
    duration: "5 hours",
    level: "Advanced",
    competency: "Digital Skills",
    rating: 4.5,
    enrolled: 15230,
    progress: 40,
    isEnrolled: true,
    description:
      "Understand the building blocks of India's digital public infrastructure and how to apply them in departmental service design.",
    outcomes: [
      "Explain identity, payments and data exchange layers",
      "Identify DPI opportunities in your department",
      "Assess privacy and inclusion considerations",
    ],
  },
  {
    id: "c6",
    title: "Public Grievance Redressal Excellence",
    provider: "DARPG",
    duration: "2 hours",
    level: "Beginner",
    competency: "Problem Solving",
    rating: 4.3,
    enrolled: 18400,
    progress: 0,
    isEnrolled: false,
    description:
      "Handle citizen grievances with empathy, speed and accountability using the CPGRAMS workflow.",
    outcomes: [
      "Triage grievances by severity",
      "Communicate outcomes clearly to citizens",
      "Track resolution quality",
    ],
  },
  {
    id: "c7",
    title: "Citizen-Centric Service Delivery",
    provider: "DARPG & IIPA",
    duration: "4 hours",
    level: "Beginner",
    competency: "Problem Solving",
    rating: 4.8,
    enrolled: 14350,
    progress: 100,
    isEnrolled: true,
    description:
      "Master citizen charter principles, proactive disclosures, and service quality benchmarks for public offices.",
    outcomes: [
      "Formulate actionable Citizen's Charters",
      "Implement user feedback mechanisms",
      "Streamline frontline delivery points",
    ],
  },
  {
    id: "c8",
    title: "Public Procurement and GeM Portal Guidelines",
    provider: "Government e-Marketplace",
    duration: "7 hours",
    level: "Intermediate",
    competency: "Functional",
    rating: 4.5,
    enrolled: 29800,
    progress: 100,
    isEnrolled: true,
    description:
      "Comprehensive walk-through of General Financial Rules (GFR) compliance and end-to-end direct purchase and bidding on GeM.",
    outcomes: [
      "Navigate GeM portal rules and compliance",
      "Execute transparent bid processes",
      "Verify vendor certifications and delivery milestones",
    ],
  },
  {
    id: "c9",
    title: "Ethics and Accountability in Civil Service",
    provider: "LBSNAA",
    duration: "3 hours",
    level: "Beginner",
    competency: "Communication",
    rating: 4.9,
    enrolled: 32400,
    progress: 65,
    isEnrolled: true,
    description:
      "Case studies and dilemma resolutions on impartiality, integrity, and ethical leadership in public governance.",
    outcomes: [
      "Resolve ethical conflicts of interest",
      "Uphold constitutional values in decision making",
      "Foster accountability within administrative units",
    ],
  },
  {
    id: "c10",
    title: "Right to Information (RTI): Practical Implementation",
    provider: "DoPT & CIC",
    duration: "3 hours",
    level: "Beginner",
    competency: "Decision Making",
    rating: 4.6,
    enrolled: 19500,
    progress: 0,
    isEnrolled: false,
    description:
      "Statutory timelines, exempt categories under Section 8, and best practices for Public Information Officers (PIOs).",
    outcomes: [
      "Process first and second appeals accurately",
      "Distinguish disclosure mandates and exemptions",
      "Maintain Section 4 proactive records",
    ],
  },
  {
    id: "c11",
    title: "Data Analytics for Public Policy & Administration",
    provider: "NIC & Capacity Building Commission",
    duration: "6 hours",
    level: "Advanced",
    competency: "Digital Skills",
    rating: 4.7,
    enrolled: 8900,
    progress: 0,
    isEnrolled: false,
    description:
      "Transform administrative datasets into actionable dashboard metrics to evaluate flagship scheme progress.",
    outcomes: [
      "Interpret district and national indicators",
      "Detect scheme anomalies and delivery leakages",
      "Communicate statistical findings to leadership",
    ],
  },
  {
    id: "c12",
    title: "Crisis Communication & Disaster Management",
    provider: "NIDM",
    duration: "5 hours",
    level: "Intermediate",
    competency: "Leadership",
    rating: 4.6,
    enrolled: 11200,
    progress: 0,
    isEnrolled: false,
    description:
      "Standard Operating Procedures for inter-departmental coordination, rumor prevention, and citizen alerting during emergencies.",
    outcomes: [
      "Coordinate emergency communication protocols",
      "Deploy rapid assessment checklists",
      "Manage media briefings and verified briefings",
    ],
  },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "q1",
    competency: "Decision Making",
    question:
      "A scheme's field data conflicts with the district report submitted to you. What is the most appropriate first step?",
    options: [
      "Accept the district report as the official record",
      "Reconcile both sources and document the discrepancy before deciding",
      "Escalate immediately to the Secretary without analysis",
      "Suspend the scheme until clarity is obtained",
    ],
    answer: 1,
  },
  {
    id: "q2",
    competency: "Leadership",
    question: "Your team repeatedly misses file movement timelines. The most effective response is to:",
    options: [
      "Issue a written warning to all staff",
      "Take over the pending files yourself",
      "Diagnose bottlenecks with the team and reallocate work with clear owners",
      "Extend all deadlines by two weeks",
    ],
    answer: 2,
  },
  {
    id: "q3",
    competency: "Problem Solving",
    question: "Recurring grievances point to one sub-office. The best analytical approach is:",
    options: [
      "Root cause analysis of the sub-office process",
      "Increase staffing at that sub-office",
      "Transfer the officer in charge",
      "Close grievances faster to improve metrics",
    ],
    answer: 0,
  },
  {
    id: "q4",
    competency: "Communication",
    question: "A note to a higher authority should primarily:",
    options: [
      "Include every document received on the subject",
      "State the issue, options, and a clear recommendation",
      "Avoid recommendations to remain neutral",
      "Use technical language to show depth",
    ],
    answer: 1,
  },
  {
    id: "q5",
    competency: "Digital Skills",
    question: "Before publishing a departmental dataset, you must first ensure:",
    options: [
      "It is available in PDF format",
      "Personal data is removed or anonymised as per policy",
      "It is shared on social media",
      "It is password protected",
    ],
    answer: 1,
  },
];

export const initialReassessmentData: ReassessmentItem[] = [
  { competency: "Decision Making", before: 54, after: 80, target: 80 },
  { competency: "Leadership", before: 68, after: 80, target: 80 },
  { competency: "Problem Solving", before: 73, after: 82, target: 80 },
  { competency: "Communication", before: 82, after: 86, target: 85 },
  { competency: "Digital Skills", before: 91, after: 94, target: 85 },
];

export const progressTrendData: ProgressTrendPoint[] = [
  { month: "Apr", score: 61, coursesCompleted: 0, hoursSpent: 4 },
  { month: "May", score: 64, coursesCompleted: 1, hoursSpent: 8 },
  { month: "Jun", score: 66, coursesCompleted: 1, hoursSpent: 12 },
  { month: "Jul", score: 70, coursesCompleted: 2, hoursSpent: 16 },
  { month: "Aug", score: 74, coursesCompleted: 2, hoursSpent: 22 },
  { month: "Sep", score: 78, coursesCompleted: 3, hoursSpent: 28 },
];

export const tasksData: LearningTask[] = [
  { id: "t1", title: "Complete Module 3 — Decision frameworks", due: "Due today", status: "urgent" },
  { id: "t2", title: "Leadership competency reassessment", due: "Due in 3 days", status: "upcoming" },
  { id: "t3", title: "Submit reflection note — Root Cause Analysis", due: "Due in 6 days", status: "upcoming" },
];

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("igot_store_updated"));
  } catch (err) {
    console.error("Failed saving to localStorage", err);
  }
}

export const mockStore = {
  getLearner(): Learner {
    return getStored(STORAGE_KEY_LEARNER, initialLearner);
  },

  setLearner(learner: Learner): void {
    setStored(STORAGE_KEY_LEARNER, learner);
  },

  getCourses(): Course[] {
    return getStored(STORAGE_KEY_COURSES, initialCourses);
  },

  getCourse(id: string): Course | null {
    const courses = this.getCourses();
    return courses.find((c) => c.id === id) ?? null;
  },

  enrollCourse(courseId: string): Course | null {
    const courses = this.getCourses();
    let updated: Course | null = null;
    const newCourses = courses.map((c) => {
      if (c.id === courseId) {
        updated = {
          ...c,
          isEnrolled: true,
          progress: c.progress && c.progress > 0 ? c.progress : 15,
        };
        return updated;
      }
      return c;
    });
    if (updated) {
      setStored(STORAGE_KEY_COURSES, newCourses);
    }
    return updated;
  },

  updateCourseProgress(courseId: string, progress: number): Course | null {
    const courses = this.getCourses();
    let updated: Course | null = null;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    const newCourses = courses.map((c) => {
      if (c.id === courseId) {
        updated = {
          ...c,
          isEnrolled: true,
          progress: clampedProgress,
        };
        return updated;
      }
      return c;
    });

    if (updated) {
      setStored(STORAGE_KEY_COURSES, newCourses);

      // If a course is completed, dynamically elevate the associated competency
      if (clampedProgress >= 100) {
        this.boostCompetencyForCourse(updated);
      }
    }
    return updated;
  },

  boostCompetencyForCourse(course: Course): void {
    const competencies = this.getCompetencies();
    let changed = false;

    const newCompetencies = competencies.map((comp) => {
      if (comp.name === course.competency && comp.score < comp.target) {
        changed = true;
        // Raise score by up to 18 points toward target
        const newScore = Math.min(comp.target, comp.score + 18);
        return { ...comp, score: newScore };
      }
      return comp;
    });

    if (changed) {
      this.updateCompetencies(newCompetencies);
    }
  },

  getCompetencies(): Competency[] {
    return getStored(STORAGE_KEY_COMPETENCIES, initialCompetencies);
  },

  updateCompetencies(competencies: Competency[]): void {
    setStored(STORAGE_KEY_COMPETENCIES, competencies);
  },

  getSkillGaps(): SkillGap[] {
    return deriveSkillGaps(this.getCompetencies());
  },

  getAssessmentQuestions(): AssessmentQuestion[] {
    return assessmentQuestions;
  },

  getReassessment(): ReassessmentItem[] {
    return getStored(STORAGE_KEY_REASSESSMENT, initialReassessmentData);
  },

  applyReassessmentScores(): Competency[] {
    const reassessment = this.getReassessment();
    const current = this.getCompetencies();

    const updated = current.map((comp) => {
      const match = reassessment.find((r) => r.competency === comp.name);
      return match ? { ...comp, score: match.after } : comp;
    });

    this.updateCompetencies(updated);
    return updated;
  },

  getProgressTrend(): ProgressTrendPoint[] {
    return progressTrendData;
  },

  getTasks(): LearningTask[] {
    return tasksData;
  },

  saveAssessmentResult(result: unknown): void {
    setStored(STORAGE_KEY_ASSESSMENT_RESULTS, result);
  },

  syncDiagnosticAssessmentScores(result: {
    competenciesAssessed: { competency: string; score: number }[];
  }): void {
    const competencies = this.getCompetencies();
    let changed = false;
    const updated = competencies.map((comp) => {
      const match = result.competenciesAssessed.find((ca) => ca.competency === comp.name);
      if (match) {
        changed = true;
        // If question was missed (score 0), establish baseline gap (e.g. 54% or current)
        // If question answered correctly (score 100), adjust or confirm score
        if (match.score === 0) {
          return { ...comp, score: Math.min(comp.score, 54) };
        } else if (match.score === 100 && comp.score < comp.target) {
          return { ...comp, score: Math.min(comp.target, comp.score + 5) };
        }
      }
      return comp;
    });
    if (changed) {
      this.updateCompetencies(updated);
    }
  },

  getSavedAssessmentResult(): unknown {
    return getStored(STORAGE_KEY_ASSESSMENT_RESULTS, null);
  },

  resetDemo(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_COURSES);
        localStorage.removeItem(STORAGE_KEY_COMPETENCIES);
        localStorage.removeItem(STORAGE_KEY_LEARNER);
        localStorage.removeItem(STORAGE_KEY_ASSESSMENT_RESULTS);
        localStorage.removeItem(STORAGE_KEY_REASSESSMENT);
        window.dispatchEvent(new Event("igot_store_updated"));
      } catch (e) {
        console.error("Failed resetting demo data", e);
      }
    }
  },
};
