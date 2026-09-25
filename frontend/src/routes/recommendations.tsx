import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/FeedbackStates";
import { Button, PageHeader } from "@/components/ui/primitives";
import { aiInsightService, courseService } from "@/services";
import type { Course, RecommendationAIExplanation } from "@/types/igot";
import { toast } from "sonner";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommended Learning | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Personalised course recommendations mapped to your competency gaps and role requirements.",
      },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [explanations, setExplanations] = useState<Record<string, RecommendationAIExplanation>>({});
  const [activeFilter, setActiveFilter] = useState<"all" | "priority" | "core" | "quick">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async (filter = activeFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, facts] = await Promise.all([
        courseService.getRecommendations(filter),
        aiInsightService.buildContextFacts(),
      ]);
      setRecommendations(res);

      const explMap: Record<string, RecommendationAIExplanation> = {};
      await Promise.all(
        res.map(async (course) => {
          const exp = await aiInsightService.getRecommendationExplanation(course, facts);
          explMap[course.id] = exp;
        }),
      );
      setExplanations(explMap);
    } catch {
      setError("Unable to generate course recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations(activeFilter);

    const handleUpdate = () => loadRecommendations(activeFilter);
    window.addEventListener("igot_store_updated", handleUpdate);
    return () => window.removeEventListener("igot_store_updated", handleUpdate);
  }, [activeFilter]);

  const handleFilterChange = (filter: "all" | "priority" | "core" | "quick") => {
    setActiveFilter(filter);
  };

  const handleEnrol = async (courseId: string) => {
    const res = await courseService.enrollCourse(courseId);
    if (res.course) {
      toast.success(`Successfully enrolled in "${res.course.title}"! Added to My Learning.`);
      loadRecommendations(activeFilter);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Recommended for You"
        subtitle="AI-curated learning resources mapped directly to your priority competency gaps and role requirements."
        breadcrumbs={[{ label: "Recommended Learning" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/courses">
              <Button size="sm" variant="outline">
                Full Catalogue →
              </Button>
            </Link>
            <Link to="/skill-gaps">
              <Button size="sm" variant="outline">
                View Skill Gaps
              </Button>
            </Link>
          </div>
        }
      />

      {/* Cadre & Intelligence Policy Summary */}
      <div className="gov-card mb-6 border-l-4 border-l-secondary p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Personalized Capacity Building Engine
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              Recommendations are dynamically ranked using multi-factor intelligence:{" "}
              <strong>Competency Deficit Severity</strong> (50%),{" "}
              <strong>CSS Under Secretary Cadre Relevance</strong> (25%), and{" "}
              <strong>National Training Institute Authority</strong> (CBC / LBSNAA / ISTM).
            </p>
          </div>
          <div className="mt-2 shrink-0 sm:mt-0">
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
              Mission Karmayogi Aligned
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => handleFilterChange("all")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-primary text-white"
              : "bg-surface-muted text-muted-foreground hover:bg-border/60 hover:text-foreground"
          }`}
        >
          All Recommendations
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange("priority")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === "priority"
              ? "bg-primary text-white"
              : "bg-surface-muted text-muted-foreground hover:bg-border/60 hover:text-foreground"
          }`}
        >
          Priority Gap Closers
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange("core")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === "core"
              ? "bg-primary text-white"
              : "bg-surface-muted text-muted-foreground hover:bg-border/60 hover:text-foreground"
          }`}
        >
          Cadre Core Essentials
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange("quick")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === "quick"
              ? "bg-primary text-white"
              : "bg-surface-muted text-muted-foreground hover:bg-border/60 hover:text-foreground"
          }`}
        >
          Quick Wins (&le; 4 hrs)
        </button>
      </div>

      {isLoading ? (
        <LoadingState
          message="Curating personalized modules matching your competency gaps..."
          count={2}
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadRecommendations(activeFilter)} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="No recommendations currently pending in this filter"
          description="All competencies matching this criteria meet your role benchmark! You can select 'All Recommendations' or explore the full course catalogue."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="recommendation"
              onEnrol={handleEnrol}
              aiExplanation={explanations[course.id]}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
