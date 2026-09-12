import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import { aiInsightService, competencyService, learnerService } from "@/services";
import type { Competency, CompetencyAIInsight, CompetencyAnalysisReport, Learner } from "@/types/igot";

export const Route = createFileRoute("/competency-profile")({
  head: () => ({
    meta: [
      { title: "Competency Profile | iGOT AI Hub" },
      {
        name: "description",
        content:
          "View assessed competency scores, strengths and development areas against your role requirements.",
      },
    ],
  }),
  component: CompetencyProfile,
});

function CompetencyProfile() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [analysis, setAnalysis] = useState<CompetencyAnalysisReport | null>(null);
  const [compInsights, setCompInsights] = useState<Record<string, CompetencyAIInsight>>({});
  const [learner, setLearner] = useState<Learner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [comps, l, rep, insights] = await Promise.all([
        competencyService.getCompetencies(),
        learnerService.getProfile(),
        competencyService.getAnalysisReport(),
        aiInsightService.getCompetencyInsights(),
      ]);
      setCompetencies(comps);
      setLearner(l);
      setAnalysis(rep);
      setCompInsights(insights);
    } catch {
      setError("Unable to load officer competency profile.");
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
          title="Competency Profile"
          subtitle="Loading official competency matrix..."
        />
        <LoadingState message="Retrieving assessed competencies and role targets..." count={3} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Competency Profile"
          subtitle="Civil service competency evaluation"
        />
        <ErrorState message={error} onRetry={loadData} />
      </AppLayout>
    );
  }

  const strengths = competencies.filter((c) => c.score >= c.target);
  const gaps = competencies.filter((c) => c.score < c.target);

  return (
    <AppLayout>
      <PageHeader
        title="Competency Profile"
        subtitle={`${learner?.role ?? "Under Secretary"} · ${learner?.cadre ?? "Central Secretariat Service"}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/skill-gaps">
              <Button variant="outline" size="sm">
                <Sparkles className="mr-1.5 h-4 w-4 text-secondary" /> Learning Pathway
              </Button>
            </Link>
            <Link to="/assessments">
              <Button size="sm">
                <ClipboardCheck className="mr-1.5 h-4 w-4" /> Diagnostic Assessment
              </Button>
            </Link>
          </div>
        }
      />

      {/* Officer Cadre Compliance Banner */}
      {analysis ? (
        <Card className="mb-6 border-l-4 border-l-primary">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Cadre Benchmark Compliance Overview
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">
                  Capability Readiness Index: {analysis.overallHealthIndex}%
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

            <div className="flex items-center gap-5 rounded-md bg-surface-muted p-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Strengths</p>
                <p className="text-xl font-bold text-success">{analysis.strengths.length}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Critical Gaps</p>
                <p className="text-xl font-bold text-accent">{analysis.criticalGaps.length}</p>
              </div>
              <div className="h-7 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Hours</p>
                <p className="text-xl font-bold text-primary">{analysis.estimatedHoursToBenchmark}h</p>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card
        title="Assessed Competencies"
        subtitle="Current score compared with your role target matrix"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Competency</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Progress</th>
                <th className="py-2 font-medium">Score</th>
                <th className="py-2 font-medium">Target</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c) => {
                const meetsTarget = c.score >= c.target;
                const deficit = c.target - c.score;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3 text-muted-foreground">{c.category}</td>
                    <td className="w-56 py-3">
                      <ProgressBar
                        value={c.score}
                        tone={meetsTarget ? "success" : "secondary"}
                      />
                    </td>
                    <td className="py-3 tabular-nums font-semibold text-foreground">{c.score}%</td>
                    <td className="py-3 tabular-nums text-muted-foreground">{c.target}%</td>
                    <td className="py-3">
                      {meetsTarget ? (
                        <Badge tone="success">Meets target</Badge>
                      ) : deficit > 15 ? (
                        <Badge tone="danger">Significant gap</Badge>
                      ) : (
                        <Badge tone="warning">Below target</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card title="Strengths" subtitle="Competencies at or above role requirement">
          <ul className="space-y-3">
            {strengths.map((c) => {
              const insight = compInsights[c.name];
              return (
                <li
                  key={c.id}
                  className="rounded-md border border-border p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                    </div>
                    <Badge tone="success">{c.score}%</Badge>
                  </div>
                  {insight ? (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/60">
                      {insight.explanation}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Development Areas" subtitle="Competencies below role requirement">
          <ul className="space-y-3">
            {gaps.map((c) => {
              const matchedGap = analysis?.criticalGaps.find((g) => g.competency === c.name) ??
                analysis?.moderateGaps.find((g) => g.competency === c.name);
              const insight = compInsights[c.name];

              return (
                <li
                  key={c.id}
                  className="rounded-md border border-border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <Badge tone={c.target - c.score > 15 ? "danger" : "warning"}>
                      {c.target - c.score} points to target
                    </Badge>
                  </div>
                  {insight ? (
                    <div className="space-y-1 rounded bg-surface-muted/60 p-2.5 text-xs">
                      <p className="text-foreground/90">
                        <strong className="text-primary">Diagnostic Analysis: </strong>
                        {insight.explanation}
                      </p>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Remediation: </strong>
                        {insight.recommendedAction}
                      </p>
                    </div>
                  ) : matchedGap?.rootCause ? (
                    <p className="text-xs text-muted-foreground border-l-2 border-l-secondary pl-2">
                      {matchedGap.rootCause}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-end pt-1">
                    <Link to="/recommendations">
                      <span className="inline-flex items-center text-xs font-medium text-secondary hover:underline">
                        Recommended modules <ArrowRight className="ml-1 h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}
