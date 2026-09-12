import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CourseCard } from "@/components/CourseCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/FeedbackStates";
import { Button, Card, PageHeader, StatCard } from "@/components/ui/primitives";
import { competencyService, courseService } from "@/services";
import type { Course, LearningSummary } from "@/types/igot";

export const Route = createFileRoute("/my-learning")({
  head: () => ({
    meta: [
      { title: "My Learning | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Continue enrolled courses, review completed learning and track your iGOT AI Hub study plan.",
      },
    ],
  }),
  component: MyLearning,
});

function MyLearning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [enrolled, sum] = await Promise.all([
        courseService.getEnrolledCourses(),
        competencyService.getSummary(),
      ]);
      setCourses(enrolled);
      setSummary(sum);
    } catch {
      setError("Unable to load enrolled learning modules.");
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

  const inProgress = courses.filter((c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100);
  const completed = courses.filter((c) => (c.progress ?? 0) >= 100);
  const notStarted = courses.filter((c) => (c.progress ?? 0) === 0);

  const renderSection = (title: string, list: Course[], emptyMsg: string) => (
    <Card title={title} subtitle={`${list.length} courses`} className="mb-6">
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyMsg}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} variant="enrolled" />
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <AppLayout>
      <PageHeader
        title="My Learning"
        subtitle="Active enrolled modules, self-paced progress, and certified course records."
        actions={
          <Link to="/courses">
            <Button variant="outline">
              <BookOpen className="mr-1.5 h-4 w-4" /> Explore Catalogue
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading your enrolled courses and certifications..." count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Enrolled" value={summary?.enrolledCourses ?? courses.length} />
            <StatCard label="In Progress" value={inProgress.length} tone="secondary" />
            <StatCard label="Completed" value={completed.length} tone="success" />
          </div>

          {courses.length === 0 ? (
            <EmptyState
              title="No courses currently enrolled"
              description="Browse the course catalogue or view your competency recommendations to enroll in modules."
              action={
                <Link to="/courses">
                  <Button>
                    Browse Catalogue <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              {renderSection(
                "In Progress",
                inProgress,
                "No courses currently in progress. Start one of your enrolled courses below!",
              )}
              {renderSection(
                "Not Started",
                notStarted,
                "No pending courses waiting to be started.",
              )}
              {renderSection(
                "Completed",
                completed,
                "No courses completed yet. Keep learning to earn certified milestones!",
              )}
            </>
          )}
        </>
      )}
    </AppLayout>
  );
}
