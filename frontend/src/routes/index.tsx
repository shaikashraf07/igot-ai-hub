import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, Clock, Sparkles, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CourseCard } from "@/components/CourseCard";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import {
  Badge,
  Button,
  Card,
  Donut,
  PageHeader,
  ProgressBar,
  StatCard,
} from "@/components/ui/primitives";
import {
  competencyService,
  courseService,
  getPriorityCompetency,
  getRecommendedCourses,
  learnerService,
  progressService,
} from "@/services";
import type {
  Competency,
  CompetencyAnalysisReport,
  Course,
  DashboardAIInsight,
  Learner,
  LearningSummary,
  LearningTask,
} from "@/types/igot";
import { aiInsightService } from "@/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learner Dashboard | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Track competencies, skill gaps and recommended learning on the iGOT AI Hub competency-driven learning platform.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [analysis, setAnalysis] = useState<CompetencyAnalysisReport | null>(null);
  const [aiInsight, setAiInsight] = useState<DashboardAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [l, comps, sum, allRecs, t, report, insight] = await Promise.all([
        learnerService.getProfile(),
        competencyService.getCompetencies(),
        competencyService.getSummary(),
        courseService.getRecommendations(),
        progressService.getTasks(),
        competencyService.getAnalysisReport(),
        aiInsightService.getDashboardInsight(),
      ]);

      setLearner(l);
      setCompetencies(comps);
      setSummary(sum);
      setRecommendations(allRecs.slice(0, 3));
      setTasks(t);
      setAnalysis(report);
      setAiInsight(insight);
    } catch {
      setError("Failed to load learner dashboard information.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleStoreUpdate = () => loadData();
    window.addEventListener("igot_store_updated", handleStoreUpdate);
    return () => window.removeEventListener("igot_store_updated", handleStoreUpdate);
  }, []);

  const lowest = getPriorityCompetency(competencies);

  const learningJourney = summary
    ? [
        { label: "Completed", value: summary.completedCourses, color: "var(--success)" },
        { label: "In Progress", value: summary.inProgressCourses, color: "var(--secondary)" },
        { label: "Not Started", value: summary.notStartedCourses, color: "var(--border)" },
      ]
    : [];

  const completedCount = summary?.completedCourses ?? 0;
  const enrolledCount = summary?.enrolledCourses ?? 0;
  const gapsCount = competencies.length > 0 ? (summary?.skillGaps ?? 0) : 0;
  const isAssessed = competencies.length > 0;

  // 6-step Learner Journey steps status
  const journeySteps = [
    {
      step: 1,
      title: "Assess",
      desc: isAssessed ? "Baseline Verified" : "Take Diagnostic",
      to: "/assessments",
      status: isAssessed ? "completed" : "current",
      badge: isAssessed ? "Complete" : "Start",
    },
    {
      step: 2,
      title: "Analyze",
      desc: gapsCount > 0 ? `${gapsCount} Gaps Found` : isAssessed ? "Benchmarks Met" : "Pending Test",
      to: "/skill-gaps",
      status: isAssessed ? "completed" : "pending",
      badge: gapsCount > 0 ? `${gapsCount} Gaps` : "Analysis",
    },
    {
      step: 3,
      title: "Recommend",
      desc: `${recommendations.length} Modules Curated`,
      to: "/recommendations",
      status: isAssessed ? "completed" : "pending",
      badge: "AI Mapped",
    },
    {
      step: 4,
      title: "Learn",
      desc: enrolledCount > 0 ? `${enrolledCount} Enrolled` : "Pick a Course",
      to: "/my-learning",
      status: enrolledCount > 0 ? "current" : "pending",
      badge: `${enrolledCount} Active`,
    },
    {
      step: 5,
      title: "Reassess",
      desc: completedCount > 0 ? "Reassessment Ready" : "Complete Course",
      to: "/assessments/reassessment",
      status: completedCount > 0 ? "current" : "pending",
      badge: completedCount > 0 ? "Action Ready" : "Next Stage",
    },
    {
      step: 6,
      title: "Improve",
      desc: completedCount > 0 ? "Capability Gains Tracked" : "Continuous Uplift",
      to: "/progress",
      status: completedCount > 0 ? "completed" : "pending",
      badge: "Analytics",
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={`Good morning, ${learner?.name ? learner.name.split(" ")[0] : "Learner"}`}
        subtitle="Capacity Building & Continuous Competency Uplift for Civil Services (Mission Karmayogi)"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/assessments">
              <Button size="sm">
                <ClipboardCheck className="mr-1.5 h-4 w-4" aria-hidden="true" /> Take Diagnostic
              </Button>
            </Link>
            <Link to="/assessments/reassessment">
              <Button size="sm" variant="outline">
                <TrendingUp className="mr-1.5 h-4 w-4 text-secondary" aria-hidden="true" /> Reassessment Impact
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading your civil service competency dashboard..." count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* Institutional Learner Journey Workflow (Assess -> Analyze -> Recommend -> Learn -> Reassess -> Improve) */}
          <section className="gov-card mb-6 p-4 sm:p-5" aria-label="Capacity Building Cycle">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Capacity Building Workflow
                </span>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  The Competency-Driven Learning Cycle
                </h2>
              </div>
              <span className="hidden sm:inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                Mission Karmayogi Standard
              </span>
            </div>

            <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 list-none p-0">
              {journeySteps.map((s, idx) => (
                <li key={s.step} className="relative">
                  <Link
                    to={s.to}
                    className="focus-ring flex flex-col justify-between h-full rounded-md border border-border bg-surface-muted/40 p-2.5 sm:p-3 hover:border-secondary hover:bg-card transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {s.step}
                        </span>
                        <Badge
                          tone={
                            s.status === "completed"
                              ? "success"
                              : s.status === "current"
                                ? "accent"
                                : "neutral"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {s.badge}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-foreground">{s.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{s.desc}</p>
                    </div>
                    <div className="mt-2 text-[11px] font-semibold text-secondary flex items-center gap-0.5">
                      Open <span aria-hidden="true">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* AI Personalized Learning Insight (Restrained, Government Style) */}
          {aiInsight ? (
            <div className="gov-card mb-6 border-l-4 border-l-secondary bg-card p-5" role="region" aria-label="AI Personalized Learning Insight">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                      <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      AI Personalized Learning Insight
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                      Cadre Aligned
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{aiInsight.headline}</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {aiInsight.readinessAssessment}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">Primary Development Focus:</strong>{" "}
                      {aiInsight.primaryDevelopmentFocus}
                    </span>
                    <span>
                      <strong className="text-foreground">Recommended Action:</strong>{" "}
                      {aiInsight.recommendedImmediateAction}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 pt-1">
                  <Link to="/skill-gaps">
                    <Button size="sm" variant="secondary">
                      Review Action Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Enrolled Courses"
              value={summary?.enrolledCourses ?? 0}
              hint={`Across ${competencies.length} competency areas`}
            />
            <StatCard
              label="Overall Competency"
              value={
                competencies.length > 0
                  ? `${analysis?.overallHealthIndex ?? summary?.overallCompetency ?? 0}%`
                  : "Not assessed"
              }
              hint={analysis ? `${analysis.readinessBand}` : "Complete an assessment to begin"}
              tone="secondary"
            />
            <StatCard
              label="Identified Skill Gaps"
              value={competencies.length > 0 ? (summary?.skillGaps ?? 0) : "–"}
              hint={
                competencies.length > 0 && analysis
                  ? `${analysis.criticalGaps.length} critical · ${analysis.moderateGaps.length} moderate`
                  : "No assessment data yet"
              }
              tone="warning"
            />
            <StatCard
              label="Completed Courses"
              value={summary?.completedCourses ?? 0}
              hint={`${summary?.learningHoursLogged ?? 0} learning hours logged`}
              tone="success"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Competency Overview"
              subtitle="Assessed scores against your role requirements"
              action={
                <div className="flex items-center gap-3">
                  {analysis?.readinessBand ? (
                    <Badge
                      tone={
                        analysis.readinessBand === "Role Ready"
                          ? "success"
                          : analysis.readinessBand === "Moderate Progression Required"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {analysis.readinessBand}
                    </Badge>
                  ) : null}
                  <Link
                    to="/competency-profile"
                    className="focus-ring text-sm font-medium text-secondary hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              }
            >
              <ul className="space-y-4">
                {competencies.length === 0 ? (
                  <li className="rounded-md border border-border/60 bg-surface-muted/40 p-5 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No assessments taken yet</p>
                    <p className="mt-1 text-xs">Complete a diagnostic assessment to see your competency scores.</p>
                  </li>
                ) : (
                  competencies.map((c) => {
                    const isGap = lowest ? c.id === lowest.id : false;
                    return (
                      <li key={c.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {c.name}
                            {isGap ? <Badge tone="accent">Priority gap</Badge> : null}
                          </span>
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {c.score}%
                          </span>
                        </div>
                        <ProgressBar
                          value={c.score}
                          tone={isGap ? "accent" : c.score >= 80 ? "success" : "secondary"}
                        />
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>

            <Card title="Learning Journey" subtitle="Overall progress across enrolled courses">
              <Donut
                segments={learningJourney}
                centerValue={
                  competencies.length > 0
                    ? `${summary?.overallCompetency ?? 0}%`
                    : "–"
                }
                centerLabel="Overall"
              />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Recommended for You"
              subtitle="Based on your competency gaps and role requirements"
              action={
                <Link
                  to="/recommendations"
                  className="focus-ring text-sm font-medium text-secondary hover:underline"
                >
                  See all
                </Link>
              }
            >
              <div className="space-y-3">
                {recommendations.map((course) => (
                  <CourseCard key={course.id} course={course} variant="compact" />
                ))}
              </div>
            </Card>

            <Card title="Pending Tasks" subtitle="Keep your learning plan on track">
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start gap-3 rounded-md border border-border p-3"
                  >
                    <Clock
                      className={
                        t.status === "urgent"
                          ? "mt-0.5 h-4 w-4 text-destructive"
                          : "mt-0.5 h-4 w-4 text-muted-foreground"
                      }
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.due}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Reassessment & Capability Progression Highlight Banner */}
          <div className="mt-6 gov-card p-5 border-l-4 border-l-success bg-card" role="region" aria-label="Reassessment Impact Overview">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-success">
                    Post-Learning Verification
                  </span>
                  <Badge tone="success">Continuous Uplift Active</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Measure Reassessment Impact on Role Benchmarks
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Verify competency score progression following completion of modular courses. Compare your diagnostic baseline with reassessed capability levels to certify official public service proficiency.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link to="/assessments/reassessment">
                  <Button size="sm" variant="secondary">
                    <TrendingUp className="mr-1.5 h-4 w-4" aria-hidden="true" /> View Reassessment Impact
                  </Button>
                </Link>
                <Link to="/progress">
                  <Button size="sm" variant="outline">
                    Long-Term Analytics <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
