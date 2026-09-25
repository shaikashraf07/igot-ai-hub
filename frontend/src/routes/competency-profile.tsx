import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import {
  aiInsightService,
  competencyService,
  learnerService,
  governmentDatasetService,
} from "@/services";
import type {
  Competency,
  CompetencyAIInsight,
  CompetencyAnalysisReport,
  Learner,
} from "@/types/igot";
import type { GovernmentCompetencyReference } from "@/types/government-data";

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
  const [refTaxonomy, setRefTaxonomy] = useState<GovernmentCompetencyReference[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [comps, l, rep, insights, taxonomy, doms] = await Promise.all([
        competencyService.getCompetencies(),
        learnerService.getProfile(),
        competencyService.getAnalysisReport(),
        aiInsightService.getCompetencyInsights(),
        governmentDatasetService.getCompetencyTaxonomy(),
        governmentDatasetService.getCompetencyDomains(),
      ]);
      setCompetencies(comps);
      setLearner(l);
      setAnalysis(rep);
      setCompInsights(insights);
      setRefTaxonomy(taxonomy);
      setDomains(doms);
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
        <PageHeader title="Competency Profile" subtitle="Loading official competency matrix..." />
        <LoadingState message="Retrieving assessed competencies and role targets..." count={3} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Competency Profile" subtitle="Civil service competency evaluation" />
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
        breadcrumbs={[{ label: "Competency Profile" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/skill-gaps">
              <Button variant="outline" size="sm">
                <Sparkles className="mr-1.5 h-4 w-4 text-secondary" aria-hidden="true" /> Learning Pathway
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant="outline" size="sm">
                Progress Trends →
              </Button>
            </Link>
            <Link to="/assessments">
              <Button size="sm">
                <ClipboardCheck className="mr-1.5 h-4 w-4" aria-hidden="true" /> Diagnostic Assessment
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
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
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
              <p className="mt-2 max-w-3xl text-sm text-foreground/90 leading-relaxed">
                {analysis.readinessSummary}
              </p>
            </div>

            <div className="flex items-center gap-5 rounded-md bg-surface-muted p-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Strengths</p>
                <p className="text-xl font-bold text-success">{analysis.strengths.length}</p>
              </div>
              <div className="h-7 w-px bg-border" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Critical Gaps</p>
                <p className="text-xl font-bold text-accent">{analysis.criticalGaps.length}</p>
              </div>
              <div className="h-7 w-px bg-border" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Est. Hours</p>
                <p className="text-xl font-bold text-primary">
                  {analysis.estimatedHoursToBenchmark}h
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card
        title="Assessed Competencies"
        subtitle="Current score compared with your official cadre role target matrix"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm" aria-label="Assessed Competency Matrix">
            <caption className="sr-only">Officer Competency Scores compared with Role Target Matrix</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="py-2.5 font-semibold">Competency</th>
                <th scope="col" className="py-2.5 font-semibold">Category</th>
                <th scope="col" className="py-2.5 font-semibold">Progress</th>
                <th scope="col" className="py-2.5 font-semibold">Score</th>
                <th scope="col" className="py-2.5 font-semibold">Target</th>
                <th scope="col" className="py-2.5 font-semibold">Benchmark Status</th>
              </tr>
            </thead>
            <tbody>
              {competencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No competencies assessed yet. Complete a diagnostic assessment to generate your profile.
                  </td>
                </tr>
              ) : (
                competencies.map((c) => {
                  const meetsTarget = c.score >= c.target;
                  const deficit = c.target - c.score;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3 font-semibold text-foreground">{c.name}</td>
                      <td className="py-3 text-muted-foreground">{c.category}</td>
                      <td className="w-56 py-3">
                        <ProgressBar value={c.score} tone={meetsTarget ? "success" : "secondary"} />
                      </td>
                      <td className="py-3 tabular-nums font-bold text-foreground">{c.score}%</td>
                      <td className="py-3 tabular-nums text-muted-foreground">{c.target}%</td>
                      <td className="py-3">
                        {meetsTarget ? (
                          <Badge tone="success">Meets target</Badge>
                        ) : deficit > 15 ? (
                          <Badge tone="danger">Significant gap (-{deficit}%)</Badge>
                        ) : (
                          <Badge tone="warning">Below target (-{deficit}%)</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card title="Strengths" subtitle="Competencies at or above role requirement">
          {strengths.length === 0 ? (
            <p className="py-6 text-center text-xs sm:text-sm text-muted-foreground">
              No competencies at or above target benchmark yet. Undertake recommended modules to build strengths.
            </p>
          ) : (
            <ul className="space-y-3">
              {strengths.map((c) => {
                const insight = compInsights[c.name];
                return (
                  <li key={c.id} className="rounded-md border border-border p-3 space-y-1.5 bg-surface-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
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
          )}
        </Card>

        <Card title="Development Areas" subtitle="Competencies below designated role benchmark">
          {gaps.length === 0 ? (
            <div className="py-6 text-center text-xs sm:text-sm text-success">
              ✓ All assessed competencies meet or exceed official role targets! No active deficits.
            </div>
          ) : (
            <ul className="space-y-3">
              {gaps.map((c) => {
                const matchedGap =
                  analysis?.criticalGaps.find((g) => g.competency === c.name) ??
                  analysis?.moderateGaps.find((g) => g.competency === c.name);
                const insight = compInsights[c.name];

                return (
                  <li key={c.id} className="rounded-md border border-border p-3 space-y-2 bg-surface-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      <Badge tone={c.target - c.score > 15 ? "danger" : "warning"}>
                        {c.target - c.score} points deficit
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
                        <span className="inline-flex items-center text-xs font-semibold text-secondary hover:underline">
                          Recommended modules <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                        </span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Phase 10: Official MoSPI / NSSTA Reference Competency Taxonomy */}
      <Card
        className="mt-6"
        title="National Statistical Competency Reference Taxonomy (MoSPI / NSSTA)"
        subtitle="Official SIH26101 / MoSPI competency framework providing reference terminology across public sector domains."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Competency Domains">
            <button
              type="button"
              onClick={() => setSelectedDomain("All")}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedDomain === "All"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({refTaxonomy.length})
            </button>
            {domains.map((dom) => {
              const count = refTaxonomy.filter((c) => c.domain === dom).length;
              return (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setSelectedDomain(dom)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedDomain === dom
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dom} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-right">
            <Badge tone="accent">Official SIH26101 Reference</Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {refTaxonomy
            .filter((c) => selectedDomain === "All" || c.domain === selectedDomain)
            .map((c) => {
              const isAssessed = competencies.some(
                (comp) => comp.name.toLowerCase() === c.competency.toLowerCase(),
              );

              return (
                <div
                  key={c.competency_id}
                  className="flex flex-col justify-between rounded-md border border-border p-3 bg-card hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {c.competency_id}
                      </span>
                      <span className="text-[11px] font-medium text-secondary">
                        {c.domain}
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-foreground">
                      {c.competency}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
                    <span className="text-muted-foreground truncate max-w-[170px]" title={c.source}>
                      {c.source}
                    </span>
                    {isAssessed ? (
                      <span className="inline-flex items-center font-semibold text-success text-[11px]">
                        ✓ Assessed in Profile
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        Reference Domain
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Provenance Notice:</span> Sourced from the official SIH26101 MoSPI reference dataset package. Integrated as an institutional reference layer to standardize civil service capability taxonomy without modifying learner-specific evaluation scores.
        </p>
      </Card>
    </AppLayout>
  );
}
