import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/FeedbackStates";
import { Card, PageHeader } from "@/components/ui/primitives";
import { competencyService, courseService } from "@/services";
import type { Competency, Course } from "@/types/igot";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "iGOT Course Catalogue | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Search and filter courses by competency and level to close your skill gaps on iGOT AI Hub.",
      },
    ],
  }),
  component: Catalogue,
});

function Catalogue() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [query, setQuery] = useState("");
  const [competency, setCompetency] = useState("All");
  const [level, setLevel] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [c, comps] = await Promise.all([
        courseService.searchCourses(),
        competencyService.getCompetencies(),
      ]);
      setCourses(c);
      setCompetencies(comps);
    } catch {
      setError("Failed to load course catalogue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();

    const handleStoreUpdate = () => loadCourses();
    window.addEventListener("igot_store_updated", handleStoreUpdate);
    return () => window.removeEventListener("igot_store_updated", handleStoreUpdate);
  }, []);

  const handleQuickEnrol = async (courseId: string) => {
    const res = await courseService.enrollCourse(courseId);
    if (res.course) {
      toast.success(`Enrolled in "${res.course.title}"!`);
      loadCourses();
    }
  };

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const matchesComp = competency === "All" || c.competency === competency;
        const matchesLevel = level === "All" || c.level === level;
        const q = query.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.competency.toLowerCase().includes(q);
        return matchesComp && matchesLevel && matchesQuery;
      }),
    [courses, query, competency, level],
  );

  return (
    <AppLayout>
      <PageHeader
        title="iGOT Course Catalogue"
        subtitle="Browse verified capacity building courses mapped to civil service competencies."
      />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course title, provider, or competency..."
              aria-label="Search courses"
              className="focus-ring w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={competency}
            onChange={(e) => setCompetency(e.target.value)}
            aria-label="Filter by competency"
            className="focus-ring rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          >
            <option>All</option>
            {competencies.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by level"
            className="focus-ring rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          >
            <option>All</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} courses match your criteria</span>
          {(query || competency !== "All" || level !== "All") && (
            <button
              onClick={() => {
                setQuery("");
                setCompetency("All");
                setLevel("All");
              }}
              className="text-secondary hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <LoadingState message="Loading courses and competency catalogue..." count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCourses} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search terms or clearing the competency filter to view available courses."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="catalogue"
              onEnrol={handleQuickEnrol}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
