import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Award, CheckCircle2, RefreshCw, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import { assessmentService } from "@/services";
import type { ReassessmentItem } from "@/types/igot";
import { toast } from "sonner";

export const Route = createFileRoute("/assessments/reassessment")({
  head: () => ({
    meta: [
      { title: "Competency Reassessment Comparison | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Measure competency improvement before and after targeted modular courses on the iGOT platform.",
      },
    ],
  }),
  component: ReassessmentPage,
});

function ReassessmentPage() {
  const [data, setData] = useState<ReassessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assessmentService.getReassessmentComparison();
      setData(res);
    } catch {
      setError("Unable to load reassessment comparison data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyToProfile = async () => {
    setIsApplying(true);
    try {
      await assessmentService.applyReassessmentScores();
      toast.success("Competency Profile updated with post-course reassessment scores! Check your Dashboard.");
    } catch {
      toast.error("Failed to update competency profile.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Competency Reassessment Impact"
          subtitle="Evaluation of skill progression following completion of recommended iGOT learning modules."
        />
        <LoadingState message="Loading competency reassessment comparisons..." count={3} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader
          title="Competency Reassessment Impact"
          subtitle="Evaluation of skill progression following completion of recommended iGOT learning modules."
        />
        <ErrorState message={error} onRetry={loadData} />
      </AppLayout>
    );
  }

  const totalGain = data.reduce((acc, item) => acc + (item.after - item.before), 0);
  const avgGain = data.length > 0 ? (totalGain / data.length).toFixed(1) : 0;
  const improvedCount = data.filter((item) => item.after > item.before).length;
  const metTargetCount = data.filter((item) => item.after >= item.target).length;

  return (
    <AppLayout>
      <PageHeader
        title="Competency Reassessment Impact"
        subtitle="Evaluation of skill progression following completion of recommended iGOT learning modules."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleApplyToProfile}
              disabled={isApplying}
              variant="outline"
              className="border-success/30 text-success hover:bg-success/10"
            >
              <Award className="mr-1.5 h-4 w-4" />
              {isApplying ? "Updating..." : "Apply Reassessment to Profile"}
            </Button>
            <Link to="/progress">
              <Button variant="secondary">
                <TrendingUp className="mr-1.5 h-4 w-4" /> View Long-Term Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Stat Highlights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Average Score Delta</p>
            <span className="h-2 w-2 rounded-full bg-success" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">+{avgGain}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Positive upward capability trajectory</p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Competencies Improved</p>
            <span className="h-2 w-2 rounded-full bg-secondary" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {improvedCount} / {data.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">All evaluated areas registered gains</p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Targets Achieved</p>
            <span className="h-2 w-2 rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-primary">
            {metTargetCount} / {data.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">At or above designated cadre benchmark</p>
        </div>

        <div className="gov-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Next Action Stage</p>
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-primary">Certified</p>
          <p className="mt-1 text-xs text-muted-foreground">Ready for quarterly review sync</p>
        </div>
      </div>

      {/* Before / After Detailed Comparison Cards */}
      <div className="mt-6 space-y-4">
        <Card
          title="Before / After Competency Comparison"
          subtitle="Direct comparison of diagnostic baseline vs post-learning reassessment"
        >
          <div className="space-y-6">
            {data.map((item) => {
              const delta = item.after - item.before;
              const targetMet = item.after >= item.target;
              const remainingGap = Math.max(0, item.target - item.after);

              return (
                <div
                  key={item.competency}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-surface-muted/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.competency}</h3>
                      <p className="text-xs text-muted-foreground">
                        Cadre Benchmark Target: {item.target}%
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2.5 py-1 text-sm font-semibold text-success">
                        <TrendingUp className="h-4 w-4" /> +{delta} points
                      </span>
                      {targetMet ? (
                        <Badge tone="success">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Target Met
                        </Badge>
                      ) : (
                        <Badge tone="warning">{remainingGap} pts to target</Badge>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Progress comparison */}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md bg-surface-muted p-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Baseline (Pre-learning)</span>
                        <span className="font-semibold tabular-nums text-foreground">{item.before}%</span>
                      </div>
                      <ProgressBar value={item.before} tone="secondary" />
                    </div>

                    <div className="rounded-md bg-primary/5 p-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-primary">Reassessed (Current)</span>
                        <span className="font-bold tabular-nums text-primary">{item.after}%</span>
                      </div>
                      <ProgressBar value={item.after} tone="success" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recommended Next Step */}
      <div className="mt-6">
        <Card
          title="Continuing Development Roadmap"
          subtitle="Consolidate recent gains and address remaining capability targets"
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Leadership & Decision Making Consolidation
                </h4>
                <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
                  Decision Making recorded the highest single leap (+18 points). Complete the practical
                  case study assessment in the next 14 days to lock in these verified capabilities.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to="/courses">
                <Button variant="outline" size="sm">
                  Explore More Courses
                </Button>
              </Link>
              <Link to="/progress">
                <Button size="sm">
                  Continue to Analytics <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
