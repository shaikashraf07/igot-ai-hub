import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import type { Course, RecommendationAIExplanation } from "@/types/igot";
import { Badge, Button, Card, ProgressBar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  variant?: "catalogue" | "recommendation" | "compact" | "enrolled";
  onEnrol?: (courseId: string) => void;
  aiExplanation?: RecommendationAIExplanation | undefined;
  className?: string;
}

export function CourseCard({
  course,
  variant = "catalogue",
  onEnrol,
  aiExplanation,
  className,
}: CourseCardProps) {
  const progress = course.progress ?? 0;

  if (variant === "compact") {
    return (
      <div className={cn("rounded-md border border-border p-4 bg-card", className)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {course.provider} · {course.duration} · {course.level}
            </p>
            {course.recommendation ? (
              <div className="flex items-center gap-2 mt-2">
                <Badge tone="accent" className="text-xs font-semibold">
                  {course.recommendation.matchScore}% Match
                </Badge>
                <Badge
                  tone={
                    course.recommendation.tag === "Priority Gap Closer" ? "danger" : "secondary"
                  }
                  className="text-xs"
                >
                  {course.recommendation.tag}
                </Badge>
              </div>
            ) : null}
          </div>
          <Badge tone="secondary">{course.competency}</Badge>
        </div>
        {course.reason ? (
          <p className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Why this: </span>
            {course.reason}
          </p>
        ) : null}
        <div className="mt-3">
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>
            <Button size="sm" variant="outline">
              View course <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "enrolled") {
    return (
      <li className={cn("rounded-md border border-border p-4 bg-card list-none", className)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{course.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {course.provider} · {course.duration}
            </p>
          </div>
          <Badge tone="secondary">{course.competency}</Badge>
        </div>
        <div className="mt-3">
          <ProgressBar value={progress} tone={progress === 100 ? "success" : "secondary"} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{progress}% complete</span>
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>
            <Button size="sm" variant="outline">
              {progress === 100 ? "Review" : "Open"}
            </Button>
          </Link>
        </div>
      </li>
    );
  }

  if (variant === "recommendation") {
    return (
      <Card className={cn("flex flex-col justify-between", className)}>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {course.recommendation ? (
                <>
                  <Badge tone="accent" className="font-semibold">
                    {course.recommendation.matchScore}% Match
                  </Badge>
                  <Badge
                    tone={
                      course.recommendation.tag === "Priority Gap Closer" ? "danger" : "secondary"
                    }
                  >
                    {course.recommendation.tag}
                  </Badge>
                </>
              ) : null}
            </div>
            <Badge tone="secondary">{course.competency}</Badge>
          </div>

          <h2 className="text-base font-semibold text-foreground">{course.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.provider} · {course.duration} · {course.level}
          </p>
          <p className="mt-3 text-sm text-foreground/90">{course.description}</p>

          {/* AI Explainability Block */}
          {aiExplanation ? (
            <div className="mt-3 space-y-1.5 rounded-md border border-secondary/25 bg-secondary/5 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold uppercase tracking-wider text-secondary">
                  Why This Course?
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{aiExplanation.priorityReason}</span>
              </div>
              <p className="leading-relaxed text-foreground/90">{aiExplanation.whyThisCourse}</p>
              <div className="grid gap-1 border-t border-border/60 pt-1.5 text-muted-foreground sm:grid-cols-2">
                <div>
                  <strong className="text-foreground">Gap Addressed: </strong>
                  {aiExplanation.gapAddressedSummary}
                </div>
                <div>
                  <strong className="text-foreground">Cadre Impact: </strong>
                  {aiExplanation.administrativeImpact}
                </div>
              </div>
            </div>
          ) : course.recommendation ? (
            <div className="mt-3 space-y-2 rounded-md bg-surface-muted p-3 text-sm">
              <p className="text-foreground/90">
                <span className="font-semibold text-primary">Recommendation Rationale: </span>
                {course.recommendation.whyRecommended}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <span>
                  <strong className="text-foreground">Deficit:</strong>{" "}
                  {course.recommendation.pointsDeficit} pts
                </span>
                <span>
                  <strong className="text-foreground">Projected Impact:</strong> +
                  {course.recommendation.projectedGain} pts
                </span>
                <span className="line-clamp-1">
                  <strong className="text-foreground">Relevance:</strong>{" "}
                  {course.recommendation.careerImpact}
                </span>
              </div>
            </div>
          ) : course.reason ? (
            <p className="mt-3 rounded-md bg-surface-muted p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Why this was recommended: </span>
              {course.reason}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 pt-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent" aria-hidden /> {course.rating} ·{" "}
            {course.enrolled.toLocaleString("en-IN")} enrolled
          </span>
          <div className="flex items-center gap-2">
            {onEnrol && !course.isEnrolled ? (
              <Button size="sm" variant="secondary" onClick={() => onEnrol(course.id)}>
                Enrol
              </Button>
            ) : null}
            <Link to="/courses/$courseId" params={{ courseId: course.id }}>
              <Button size="sm">{course.isEnrolled ? "Continue" : "Start learning"}</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Default: Catalogue variant
  const isRecommended = Boolean(course.recommendation);

  return (
    <Card
      className={cn(
        "flex flex-col justify-between transition-all",
        isRecommended && "border-accent/40 bg-accent/[0.02] shadow-xs",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="secondary">{course.competency}</Badge>
            {isRecommended ? (
              <Badge tone="accent" className="font-semibold">
                ★ AI Recommended ({course.recommendation?.matchScore}% Match)
              </Badge>
            ) : null}
            {course.isEnrolled ? (
              <Badge tone="success">Enrolled</Badge>
            ) : null}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span className="font-medium text-foreground">{course.rating}</span>
          </span>
        </div>
        <h2 className="mt-3 text-base font-bold text-foreground leading-snug">{course.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {course.provider} · {course.duration} · {course.level}
        </p>
        <p className="mt-2.5 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{course.description}</p>

        {progress > 0 ? (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Course Progress</span>
              <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
            </div>
            <ProgressBar value={progress} tone={progress === 100 ? "success" : "secondary"} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">
          {course.enrolled.toLocaleString("en-IN")} enrolled
        </span>
        <div className="flex items-center gap-2">
          {onEnrol && !course.isEnrolled ? (
            <Button size="sm" variant="secondary" onClick={() => onEnrol(course.id)}>
              Enrol
            </Button>
          ) : null}
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>
            <Button size="sm" variant={course.isEnrolled ? "primary" : "outline"}>
              {course.isEnrolled ? "Continue" : "View details"}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
