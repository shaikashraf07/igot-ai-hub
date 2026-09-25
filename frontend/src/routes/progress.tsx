import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import { aiInsightService, progressService, competencyService } from "@/services";
import type {
  Competency,
  CompetencyAnalysisReport,
  LearningSummary,
  PathwayAIExplanation,
  ProgressTrendPoint,
} from "@/types/igot";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Analytics | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Longitudinal competency progression, course completions, and assessment analytics for civil servants.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [trends, setTrends] = useState<ProgressTrendPoint[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [analysis, setAnalysis] = useState<CompetencyAnalysisReport | null>(null);
  const [pathwayAI, setPathwayAI] = useState<PathwayAIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [t, comps, sum, rep, pathAI] = await Promise.all([
        progressService.getTrendData(),
        competencyService.getCompetencies(),
        competencyService.getSummary(),
        competencyService.getAnalysisReport(),
        aiInsightService.getPathwayExplanation(),
      ]);
      setTrends(t);
      setCompetencies(comps);
      setSummary(sum);
      setAnalysis(rep);
      setPathwayAI(pathAI);
    } catch {
      setError("Failed to load progress and analytics metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("igot_store_updated", handleUpdate);
    return () => window.removeEventListener("igot_store_updated", handleUpdate);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Progress & Analytics"
          subtitle="Tracking long-term competency improvement, course completions, and official learning activity."
        />
        <LoadingState
          message="Generating capability analytics and learning progress charts..."
          count={4}
        />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Progress & Analytics"
          subtitle="Tracking long-term competency improvement, course completions, and official learning activity."
        />
        <ErrorState message={error} onRetry={loadData} />
      </AppLayout>
    );
  }

  const totalHistoricalHours = trends.reduce((acc, t) => acc + t.hoursSpent, 0);
  const totalHours = totalHistoricalHours + (summary?.learningHoursLogged ?? 0);
  const currentCompetencyScore = competencies.length > 0
    ? (analysis?.overallHealthIndex ?? summary?.overallCompetency ?? 0)
    : null; // null = not yet assessed
  const completedCourses = summary?.completedCourses ?? 0;
  const inProgressCourses = summary?.inProgressCourses ?? 0;
  const enrolledTotal = summary?.enrolledCourses ?? 0;

  return (
    <AppLayout>
      <PageHeader
        title="Progress & Analytics"
        subtitle="Tracking long-term competency improvement, course completions, and official learning activity."
        breadcrumbs={[{ label: "Progress & Analytics" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/assessments/reassessment">
              <Button variant="outline" size="sm">
                Reassessment Impact →
              </Button>
            </Link>
            <Link to="/skill-gaps">
              <Button variant="outline" size="sm">
                View Skill Gaps
              </Button>
            </Link>
            <Link to="/assessments">
              <Button size="sm">Take an assessment</Button>
            </Link>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Overall Competency Score</p>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {currentCompetencyScore !== null ? `${currentCompetencyScore}%` : "–"}
          </p>
          <p className="mt-1 text-xs text-success">
            {currentCompetencyScore === null
              ? "Complete an assessment to see your score"
              : analysis
                ? analysis.readinessBand
                : currentCompetencyScore >= 75
                ? "Benchmark achieved"
                : "Active capability buildup"}
          </p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Courses Completed</p>
            <BookOpen className="h-4 w-4 text-success" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">{completedCourses} Modules</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {inProgressCourses} in progress · {enrolledTotal} enrolled
          </p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Learning Hours Logged</p>
            <Clock className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">{totalHours} Hours</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalHours >= 50
              ? "50-hour civil service mandate met!"
              : `${Math.max(0, 50 - totalHours)} hrs to annual mandate`}
          </p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Evaluations Passed</p>
            <Award className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">5 of 5</p>
          <p className="mt-1 text-xs text-muted-foreground">100% submission pass rate</p>
        </div>
      </div>

      {/* Competency Deficit Burndown & Readiness Pathway */}
      {analysis && analysis.learningPathway.length > 0 ? (
        <div className="mt-6">
          <Card
            title="Competency Deficit Burndown & Target Projection"
            subtitle={
              pathwayAI?.overallStrategy ??
              "Trajectory to reach 100% compliance with designated cadre benchmarks"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Officer Cadre Status</p>
                <div className="mt-1 flex items-center gap-2">
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
                  <span className="text-xs text-muted-foreground">
                    Total Deficit: <strong>{analysis.totalDeficitPoints} points</strong> across all
                    competencies
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Est. Investment to Complete</p>
                <p className="text-lg font-bold text-primary">
                  {analysis.estimatedHoursToBenchmark} hours
                </p>
              </div>
            </div>

            {pathwayAI?.estimatedCompletionImpact ? (
              <div className="mt-3 rounded-md bg-secondary/5 border border-secondary/20 p-2.5 text-xs text-secondary font-medium">
                Strategic Impact: {pathwayAI.estimatedCompletionImpact}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {analysis.learningPathway.map((step) => (
                <div
                  key={step.step}
                  className="rounded-md border border-border bg-surface-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Milestone {step.step}</span>
                    <Badge
                      tone={
                        step.status === "completed"
                          ? "success"
                          : step.status === "in_progress"
                            ? "secondary"
                            : "neutral"
                      }
                    >
                      {step.status === "completed"
                        ? "Completed"
                        : step.status === "in_progress"
                          ? "In Progress"
                          : "Pending"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground line-clamp-1">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Target: <strong>{step.targetCompetency}</strong> · {step.estimatedHours}h
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Charts Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Competency Score Over Time */}
        <Card
          title="Competency Growth Trend (Past 6 Months)"
          subtitle="Aggregate evaluation scores across civil service benchmarks"
        >
          {trends.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No historical trend data available yet. Complete diagnostic assessments to plot competency growth.
            </p>
          ) : (
            <>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "Competency Index"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#123B66"
                      strokeWidth={3}
                      dot={{ fill: "#E87524", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>Overall Score (% Benchmark)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <span>Assessment checkpoints</span>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Monthly Learning Hours */}
        <Card
          title="Monthly Learning Hours"
          subtitle="Hours committed to self-paced modules and scenario exercises"
        >
          {trends.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No learning hours logged yet. Start an enrolled module to record hours.
            </p>
          ) : (
            <>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                    />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      unit="h"
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} hrs`, "Learning Time"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="hoursSpent" fill="#1F5A91" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
                  <span>Total Hours per Month</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Competency Current Distribution */}
      <div className="mt-6">
        <Card
          title="Active Competencies Summary"
          subtitle="Current operational readiness scores compared with required targets"
        >
          {competencies.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No competencies evaluated yet. Take a diagnostic assessment to measure operational readiness.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {competencies.map((c) => {
                const delta = c.target - c.score;
                const meets = c.score >= c.target;
                return (
                  <div key={c.id} className="rounded-md border border-border p-4 bg-surface-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      <Badge tone={meets ? "success" : delta > 15 ? "danger" : "warning"}>
                        {meets ? "Target Met" : `Gap: ${delta} pts`}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold tabular-nums text-primary">{c.score}%</span>
                      <span className="text-xs text-muted-foreground">Target: {c.target}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${meets ? "bg-success" : "bg-secondary"}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
