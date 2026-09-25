/**
 * Mock iGOT data service.
 * All screens read through these functions so a real iGOT API can be
 * connected later without changing any UI component.
 */

export type Competency = {
  id: string;
  name: string;
  score: number;
  target: number;
  category: string;
};

export type SkillGap = {
  id: string;
  competency: string;
  current: number;
  target: number;
  priority: "High" | "Medium" | "Low";
  evidence: string;
  action: string;
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  competency: string;
  rating: number;
  enrolled: number;
  progress?: number;
  description: string;
  outcomes: string[];
  reason?: string;
};

export type Learner = {
  name: string;
  role: string;
  department: string;
  cadre: string;
};

export const learner: Learner = {
  name: "Ashraf",
  role: "Under Secretary",
  department: "Ministry of Personnel, Public Grievances & Pensions",
  cadre: "Central Secretariat Service",
};

export const summary = {
  enrolledCourses: 12,
  overallCompetency: 78,
  skillGaps: 4,
  completedCourses: 3,
};

export const competencies: Competency[] = [
  { id: "communication", name: "Communication", score: 82, target: 85, category: "Behavioural" },
  { id: "leadership", name: "Leadership", score: 68, target: 80, category: "Behavioural" },
  { id: "digital", name: "Digital Skills", score: 91, target: 85, category: "Functional" },
  { id: "decision", name: "Decision Making", score: 54, target: 80, category: "Behavioural" },
  { id: "problem", name: "Problem Solving", score: 73, target: 80, category: "Functional" },
];

export const learningJourney = [
  { label: "Completed", value: 3, color: "var(--success)" },
  { label: "In Progress", value: 6, color: "var(--secondary)" },
  { label: "Not Started", value: 3, color: "var(--border)" },
];

export const skillGaps: SkillGap[] = [
  {
    id: "g1",
    competency: "Decision Making",
    current: 54,
    target: 80,
    priority: "High",
    evidence: "Assessment score 54% · 3 of 8 scenario questions incorrect",
    action: "Complete Evidence-Based Decision Making for Administrators",
  },
  {
    id: "g2",
    competency: "Leadership",
    current: 68,
    target: 80,
    priority: "High",
    evidence: "Supervisor review flagged team delegation as an area to develop",
    action: "Enrol in Leading Teams in Public Administration",
  },
  {
    id: "g3",
    competency: "Problem Solving",
    current: 73,
    target: 80,
    priority: "Medium",
    evidence: "Case-study assessment below role benchmark by 7 points",
    action: "Practice module: Root Cause Analysis in Governance",
  },
  {
    id: "g4",
    competency: "Communication",
    current: 82,
    target: 85,
    priority: "Low",
    evidence: "Written communication sample slightly below target band",
    action: "Short course: Official Drafting and Noting",
  },
];

export const courses: Course[] = [
  {
    id: "c1",
    title: "Evidence-Based Decision Making for Administrators",
    provider: "Capacity Building Commission",
    duration: "6 hours",
    level: "Intermediate",
    competency: "Decision Making",
    rating: 4.6,
    enrolled: 12480,
    progress: 35,
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
    progress: 60,
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
    progress: 20,
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
    description:
      "Handle citizen grievances with empathy, speed and accountability using the CPGRAMS workflow.",
    outcomes: [
      "Triage grievances by severity",
      "Communicate outcomes clearly to citizens",
      "Track resolution quality",
    ],
  },
];

export const assessmentQuestions = [
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
    question:
      "Your team repeatedly misses file movement timelines. The most effective response is to:",
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

export const reassessment = [
  { competency: "Communication", before: 74, after: 82 },
  { competency: "Leadership", before: 61, after: 68 },
  { competency: "Digital Skills", before: 84, after: 91 },
  { competency: "Decision Making", before: 48, after: 54 },
  { competency: "Problem Solving", before: 66, after: 73 },
];

export const progressTrend = [
  { month: "Apr", score: 61 },
  { month: "May", score: 64 },
  { month: "Jun", score: 66 },
  { month: "Jul", score: 70 },
  { month: "Aug", score: 74 },
  { month: "Sep", score: 78 },
];

export const tasks = [
  {
    id: "t1",
    title: "Complete Module 3 — Decision frameworks",
    due: "Due today",
    status: "urgent",
  },
  {
    id: "t2",
    title: "Leadership competency reassessment",
    due: "Due in 3 days",
    status: "upcoming",
  },
  {
    id: "t3",
    title: "Submit reflection note — Root Cause Analysis",
    due: "Due in 6 days",
    status: "upcoming",
  },
];

/* Service layer — swap these implementations for real iGOT API calls. */
export const igotService = {
  getLearner: async () => learner,
  getSummary: async () => summary,
  getCompetencies: async () => competencies,
  getSkillGaps: async () => skillGaps,
  getCourses: async () => courses,
  getCourse: async (id: string) => courses.find((c) => c.id === id) ?? null,
  getRecommendations: async () => courses.filter((c) => c.reason),
};
