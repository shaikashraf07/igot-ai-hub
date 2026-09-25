import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, PlayCircle, Star, Database, AlertCircle, Bookmark } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { courseService, governmentDatasetService } from "@/services";
import type { Course } from "@/types/igot";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$courseId")({
  loader: async ({ params }) => {
    const course = await courseService.getCourse(params.courseId);
    if (!course) throw notFound();
    return course;
  },
  staleTime: 0,
  head: () => ({
    meta: [
      { title: "Course Details | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Course description, learning outcomes, mapped competencies and your progress on iGOT AI Hub.",
      },
    ],
  }),
  component: CourseDetails,
});

function CourseDetails() {
  const initialCourse = Route.useLoaderData();
  const [course, setCourse] = useState<Course>(initialCourse);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const progress = course.progress ?? 0;
  const isEnrolled = course.isEnrolled || progress > 0;

  const handleEnrolOrContinue = async () => {
    if (!isEnrolled) {
      setIsEnrolling(true);
      try {
        const result = await courseService.enrollCourse(course.id);
        if (result.course) {
          setCourse(result.course);
          toast.success(`Successfully enrolled in "${course.title}"! Added to My Learning.`);
        }
      } catch {
        toast.error("Enrollment failed. Please try again.");
      } finally {
        setIsEnrolling(false);
      }
      return;
    }

    if (progress >= 100) {
      toast.info("Course completed. Reviewing module materials.");
      return;
    }

    setIsEnrolling(true);
    try {
      const newProgress = Math.min(100, progress + 25);
      const res = await courseService.updateProgress(course.id, newProgress);
      if (res.course) {
        setCourse(res.course);
      } else {
        setCourse((prev) => ({ ...prev, progress: newProgress, isEnrolled: true }));
      }
      if (newProgress === 100) {
        toast.success(
          `Course completed! 100% progress recorded for "${course.title}". ${course.competency} competency updated!`,
        );
      } else {
        toast.info(`Progress updated to ${newProgress}%. Keep building capability!`);
      }
    } catch {
      toast.error("Failed to update course progress. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={course.title}
        subtitle={`${course.provider} · ${course.duration} · ${course.level}`}
        breadcrumbs={[
          { label: "iGOT Courses", to: "/courses" },
          { label: course.title },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="About this course">
            <p className="text-sm leading-relaxed text-muted-foreground">{course.description}</p>
          </Card>

          <Card title="Learning outcomes">
            <ul className="space-y-2.5">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Card>

            <Card title="Competencies covered">
              <div className="flex flex-wrap gap-2">
                <Badge tone="secondary">{course.competency}</Badge>
                <Badge tone="neutral">Public Service Ethos</Badge>
                <Badge tone="neutral">Administrative Governance</Badge>
              </div>
              {course.reason ? (
                <p className="mt-4 rounded-md bg-surface-muted p-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Why this was recommended: </span>
                  {course.reason}
                </p>
              ) : null}
            </Card>

            {/* Phase 10: Curated Mapping Disclaimer & Government Reference Context */}
            {(() => {
              const curatedMapping = governmentDatasetService.findMappingForCourse(course.title);
              const govContext = governmentDatasetService.findContextForCompetency(course.competency);

              return (
                <div className="space-y-4">
                  {curatedMapping ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              Curated Reference Mapping (Prototype Inference)
                            </span>
                            <Badge tone="neutral">derived/curated</Badge>
                          </div>
                          <p className="mt-1 text-muted-foreground leading-relaxed">
                            {curatedMapping.warning}
                          </p>
                          <div className="mt-2 text-foreground font-medium">
                            Mapped competencies: <span className="font-semibold text-secondary">{curatedMapping.mapped_competencies}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {govContext.matchedDatasets.length > 0 || govContext.matchedTrainings.length > 0 ? (
                    <Card
                      title="Government Dataset & Capacity Building Context"
                      subtitle="Official MoSPI eSankhyiki dataset families and NSSTA training offerings mapped to this competency."
                    >
                      <div className="space-y-3 text-xs">
                        {govContext.matchedDatasets.length > 0 ? (
                          <div>
                            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-secondary">
                              <Database className="h-3.5 w-3.5" /> MoSPI eSankhyiki Dataset Alignment
                            </span>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {govContext.matchedDatasets.slice(0, 4).map((d) => (
                                <span
                                  key={d.product_code}
                                  className="inline-flex items-center rounded border border-border bg-surface-muted px-2 py-0.5 text-[11px] text-foreground"
                                  title={`${d.dataset_family} — ${d.official_catalogue}`}
                                >
                                  <strong>{d.product_code}:</strong>&nbsp;{d.dataset_family}
                                </span>
                              ))}
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Reference Catalogue: MoSPI National Data Portal (eSankhyiki)
                            </p>
                          </div>
                        ) : null}

                        {govContext.matchedTrainings.length > 0 ? (
                          <div className="border-t border-border pt-2.5">
                            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-primary">
                              <Bookmark className="h-3.5 w-3.5" /> NSSTA In-Service Training Reference
                            </span>
                            <ul className="mt-1.5 space-y-1">
                              {govContext.matchedTrainings.slice(0, 2).map((t) => (
                                <li key={t.training_id} className="text-[11px] text-muted-foreground">
                                  • <strong className="text-foreground">{t.topic}:</strong> {t.programme_context} ({t.source_type})
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  ) : null}
                </div>
              );
            })()}
        </div>

        <div className="space-y-6">
          <Card title="Your progress">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold tabular-nums text-foreground">
                {!isEnrolled ? "Not Enrolled" : `${progress}% Complete`}
              </span>
            </div>
            <ProgressBar value={progress} tone={progress === 100 ? "success" : "secondary"} />

            <Button onClick={handleEnrolOrContinue} disabled={isEnrolling} className="mt-4 w-full">
              <PlayCircle className="mr-1.5 h-4 w-4" />
              {isEnrolling
                ? "Enrolling..."
                : !isEnrolled
                  ? "Enrol and start"
                  : progress === 100
                    ? "Review course"
                    : "Continue learning (+25%)"}
            </Button>

            <Link to="/assessments">
              <Button variant="outline" className="mt-2 w-full">
                Take competency assessment
              </Button>
            </Link>
          </Card>

          <Card title="Course details">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="font-medium text-foreground">{course.provider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium text-foreground">{course.duration}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Level</dt>
                <dd className="font-medium text-foreground">{course.level}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="flex items-center gap-1 font-medium text-foreground">
                  <Star className="h-4 w-4 text-accent" aria-hidden /> {course.rating}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Enrolled</dt>
                <dd className="font-medium text-foreground">
                  {course.enrolled.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
