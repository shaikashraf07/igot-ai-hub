import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { EmptyState, ErrorState, LoadingState } from "@/components/FeedbackStates";
import {
  aiInsightService,
  calculateSkillGap,
  competencyService,
  getPriorityTone,
} from "@/services";
import type {
  CompetencyAIInsight,
  CompetencyAnalysisReport,
  PathwayAIExplanation,
  SkillGap,
} from "@/types/igot";

export const Route = createFileRoute("/skill-gaps")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analysis | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Understand each competency gap with current score, target, priority, evidence and recommended action.",
      },
    ],
  }),
  component: SkillGapPage,
});

function SkillGapPage() {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [analysis, setAnalysis] = useState<CompetencyAnalysisReport | null>(null);
  const [compInsights, setCompInsights] = useState<Record<string, CompetencyAIInsight>>({});
  const [pathwayAI, setPathwayAI] = useState<PathwayAIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGaps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resGaps, resAnalysis, insights, pathwayExp] = await Promise.all([
        competencyService.getSkillGaps(),
        competencyService.getAnalysisReport(),
        aiInsightService.getCompetencyInsights(),
        aiInsightService.getPathwayExplanation(),
      ]);
      setGaps(resGaps);
      setAnalysis(resAnalysis);
      setCompInsights(insights);
      setPathwayAI(pathwayExp);
    } catch {
      setError("Unable to analyze competency gaps.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGaps();

    const handleUpdate = () => loadGaps();
    window.addEventListener("igot_store_updated", handleUpdate);
    return () => window.removeEventListener("igot_store_updated", handleUpdate);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Skill Gap Analysis"
          subtitle="Where your current competency levels fall short of your role requirements, and what to do next."
        />
        <LoadingState message="Analyzing role benchmarks and active capability gaps..." count={3} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Skill Gap Analysis"
          subtitle="Where your current competency levels fall short of your role requirements, and what to do next."
        />
        <ErrorState message={error} onRetry={loadGaps} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Where your current competency levels fall short of your role requirements, and what to do next."
        actions={
          <Link to="/assessments">
            <Button variant="secondary">
              <ClipboardCheck className="mr-1.5 h-4 w-4" /> Take Diagnostic Assessment
            </Button>
          </Link>
        }
      />

      {analysis ? (
        <div className="mb-6 space-y-4">
          {/* Executive Readiness Card */}
          <Card className="border-l-4 border-l-primary bg-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Executive Competency Analysis & Readiness
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    Officer Capability Health Index: {analysis.overallHealthIndex}%
                  </h2>
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
                </div>
                <p className="mt-2 max-w-3xl text-sm text-foreground/90">
                  {analysis.readinessSummary}
                </p>
              </div>

              <div className="flex items-center gap-6 rounded-md bg-surface-muted p-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total Deficit
                  </p>
                  <p className="text-xl font-bold text-accent">{analysis.totalDeficitPoints} pts</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Est. Time to Target
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {analysis.estimatedHoursToBenchmark} hrs
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Sequenced Learning Pathway with AI Progression Narrative */}
          {analysis.learningPathway && analysis.learningPathway.length > 0 ? (
            <Card
              title="Sequenced Learning Pathway"
              subtitle={pathwayAI?.overallStrategy ?? "Prioritized step-by-step roadmap to eliminate role benchmark deficits"}
            >
              <div className="grid gap-3 md:grid-cols-3">
                {analysis.learningPathway.map((step) => {
                  const aiStep = pathwayAI?.stepExplanations.find((s) => s.step === step.step);
                  return (
                    <div
                      key={step.step}
                      className="relative flex flex-col justify-between rounded-md border border-border bg-surface-muted/40 p-3.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                            {step.step}
                          </span>
                          <Badge tone={step.urgency === "High" ? "danger" : "warning"}>
                            {step.urgency} Urgency
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Target: <strong>{step.targetCompetency}</strong> · Est: {step.estimatedHours} hrs
                        </p>
                        <p className="mt-2 text-xs text-foreground/90">
                          {step.expectedOutcome}
                        </p>
                        {aiStep ? (
                          <div className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-primary">Why: </span>
                            {aiStep.rationale}
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 border-t border-border pt-2">
                        <Link to="/courses/$courseId" params={{ courseId: step.courseId }}>
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            {step.status === "completed" ? "Completed" : `Start Step ${step.step}`}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pathwayAI?.estimatedCompletionImpact ? (
                <div className="mt-3 rounded-md bg-secondary/5 border border-secondary/20 p-2.5 text-xs text-secondary font-medium">
                  Impact Projection: {pathwayAI.estimatedCompletionImpact}
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>
      ) : null}

      {gaps.length === 0 ? (
        <EmptyState
          title="All Competency Benchmarks Met!"
          description="Congratulations! Your assessed scores currently meet or exceed all designated benchmarks for your cadre and designation."
          action={
            <Link to="/courses">
              <Button size="sm">Explore Elective Modules</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {gaps.map((g) => {
            const gapPoints = calculateSkillGap(g.current, g.target);
            const tone = getPriorityTone(g.priority);
            const insight = compInsights[g.competency];

            return (
              <Card key={g.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{g.competency}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Gap of {gapPoints} points to role target
                    </p>
                  </div>
                  <Badge tone={tone}>{g.priority} priority</Badge>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Current</p>
                    <p className="text-2xl font-semibold text-primary">{g.current}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Target</p>
                    <p className="text-2xl font-semibold text-primary">{g.target}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Deficit</p>
                    <p className="text-2xl font-semibold text-accent">{gapPoints} pts</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar
                    value={g.current}
                    tone={g.priority === "High" ? "danger" : "secondary"}
                  />
                </div>

                <dl className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-surface-muted p-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Evidence
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">{g.evidence}</dd>
                  </div>
                  <div className="rounded-md bg-surface-muted p-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recommended action
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">{g.action}</dd>
                  </div>
                  {g.rootCause ? (
                    <div className="rounded-md border-l-2 border-l-secondary bg-surface-muted p-3 md:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-secondary">
                        Cognitive Root Cause Diagnosis
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{g.rootCause}</dd>
                      {g.estimatedHoursToClose ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Estimated effort to bridge benchmark deficit:{" "}
                          <strong>{g.estimatedHoursToClose} hours</strong>
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </dl>

                {insight ? (
                  <div className="mt-4 space-y-1.5 rounded-md border border-secondary/25 bg-secondary/5 p-3.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold uppercase tracking-wider text-secondary">
                        AI Explainable Gap Diagnostic
                      </span>
                      <Badge tone={insight.statusTone} className="px-1.5 py-0 text-[10px]">
                        {insight.currentState}
                      </Badge>
                    </div>
                    <p className="leading-relaxed text-foreground/90">
                      <strong className="text-foreground">Why this gap matters: </strong>
                      {insight.explanation}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Development Need: </strong>
                      {insight.developmentNeed} — {insight.likelyLearningFocus}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Recommended Action: </strong>
                      {insight.recommendedAction}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {g.recommendedCourseId ? (
                    <Link to="/courses/$courseId" params={{ courseId: g.recommendedCourseId }}>
                      <Button size="sm">
                        Start Recommended Module <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : null}
                  <Link to="/recommendations">
                    <Button size="sm" variant="outline">
                      View all recommendations
                    </Button>
                  </Link>
                  <Link to="/assessments/reassessment">
                    <Button size="sm" variant="outline">
                      Check Reassessment Impact
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
