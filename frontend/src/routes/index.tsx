import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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

  return (
    <AppLayout>
      <PageHeader
        title={`Good morning, ${learner?.name ? learner.name.split(" ")[0] : "Learner"}`}
        subtitle="Continue your competency journey and build capabilities for better public service."
        actions={
          <Link to="/assessments">
            <Button>Take an assessment</Button>
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading your civil service competency dashboard..." count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          {/* AI Personalized Learning Insight (Restrained, Government Style) */}
          {aiInsight ? (
            <div className="gov-card mb-6 border-l-4 border-l-secondary bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      AI Personalized Learning Insight
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-medium text-secondary">
                      Cadre Aligned
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {aiInsight.headline}
                  </h3>
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
          value={summary?.enrolledCourses ?? 12}
          hint={`Across ${competencies.length || 5} competencies`}
        />
        <StatCard
          label="Overall Competency"
          value={`${analysis?.overallHealthIndex ?? summary?.overallCompetency ?? 78}%`}
          hint={analysis ? `${analysis.readinessBand}` : "+4 points this month"}
          tone="secondary"
        />
        <StatCard
          label="Identified Skill Gaps"
          value={summary?.skillGaps ?? 4}
          hint={analysis ? `${analysis.criticalGaps.length} critical · ${analysis.moderateGaps.length} moderate` : "2 marked high priority"}
          tone="warning"
        />
        <StatCard
          label="Completed Courses"
          value={summary?.completedCourses ?? 3}
          hint={`${summary?.learningHoursLogged ?? 18} learning hours logged`}
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
            {competencies.map((c) => {
              const isGap = lowest ? c.id === lowest.id : false;
              return (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {c.name}
                      {isGap ? <Badge tone="accent">Priority gap</Badge> : null}
                    </span>
                    <span className="text-sm tabular-nums text-muted-foreground">{c.score}%</span>
                  </div>
                  <ProgressBar
                    value={c.score}
                    tone={isGap ? "accent" : c.score >= 80 ? "success" : "secondary"}
                  />
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Learning Journey" subtitle="Overall progress across enrolled courses">
          <Donut
            segments={learningJourney}
            centerValue={`${summary?.overallCompetency ?? 78}%`}
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
              <li key={t.id} className="flex items-start gap-3 rounded-md border border-border p-3">
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
        </>
      )}
    </AppLayout>
  );
}
