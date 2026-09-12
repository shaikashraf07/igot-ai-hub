import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui/primitives";
import { ErrorState, LoadingState } from "@/components/FeedbackStates";
import { aiInsightService, assessmentService } from "@/services";
import type { AssessmentAIFeedback, AssessmentQuestion, AssessmentResult } from "@/types/igot";
import { toast } from "sonner";

export const Route = createFileRoute("/assessments/")({
  head: () => ({
    meta: [
      { title: "Competency Assessment | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Take official competency evaluation assessments to measure your administrative and behavioral capabilities.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AssessmentAIFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = await assessmentService.getQuestions();
      setQuestions(qs);
    } catch {
      setError("Unable to load diagnostic assessment questions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          title="Diagnostic Competency Assessment"
          subtitle="Official administrative situational judgment and capability evaluation."
        />
        <LoadingState message="Preparing diagnostic assessment questions..." count={1} />
      </AppLayout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <AppLayout>
        <PageHeader
          title="Diagnostic Competency Assessment"
          subtitle="Official administrative situational judgment and capability evaluation."
        />
        <ErrorState
          message={error ?? "No assessment questions found."}
          onRetry={loadQuestions}
        />
      </AppLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (index: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Do you want to submit anyway?`,
      );
      if (!confirmSubmit) return;
    }
    setIsSubmitting(true);
    try {
      const res = await assessmentService.submitAssessment(answers);
      setResult(res);
      const feedback = await aiInsightService.getAssessmentFeedback(res);
      setAiFeedback(feedback);
      toast.success("Assessment submitted successfully!");
    } catch {
      toast.error("Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setAiFeedback(null);
  };

  // Result View
  if (result) {
    const passed = result.scorePercentage >= 70;
    return (
      <AppLayout>
        <PageHeader
          title="Assessment Result"
          subtitle="Competency diagnostic complete. Detailed score breakdown and next development steps."
        />

        {/* Score Overview Banner */}
        <div className="gov-card p-6 md:p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-4">
              <div
                className={`grid h-16 w-16 place-items-center rounded-full ${
                  passed ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                }`}
              >
                <Award className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {result.scorePercentage}% Final Score
                  </h2>
                  <Badge tone={passed ? "success" : "warning"}>
                    {passed ? "Benchmark Met" : "Competency Gap Identified"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.correctAnswers} of {result.totalQuestions} questions answered correctly
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Retake Test
              </Button>
              <Link to="/assessments/reassessment">
                <Button variant="secondary">
                  <TrendingUp className="mr-1.5 h-4 w-4" /> View Reassessment Impact
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Explainable Assessment Feedback Banner */}
        {aiFeedback ? (
          <div className="mt-6 gov-card border-l-4 border-l-secondary bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  AI Diagnostic Evaluation Summary
                </span>
                <Badge tone={passed ? "success" : "warning"} className="px-1.5 py-0 text-[10px]">
                  {passed ? "Benchmark Verified" : "Action Required"}
                </Badge>
              </div>

              <p className="text-sm font-medium leading-relaxed text-foreground">
                {aiFeedback.executiveSummary}
              </p>

              <div className="grid gap-3 border-t border-border/60 pt-2 text-xs sm:grid-cols-2">
                <div className="rounded bg-surface-muted p-2.5">
                  <strong className="mb-1 block text-success">Identified Strengths:</strong>
                  <span className="text-foreground/90">{aiFeedback.strengthsNarrative}</span>
                </div>
                <div className="rounded bg-surface-muted p-2.5">
                  <strong className="mb-1 block text-warning">Target Development Areas:</strong>
                  <span className="text-foreground/90">{aiFeedback.developmentAreasNarrative}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">
                <div>
                  <strong className="text-foreground">Cadre Benchmark Impact: </strong>
                  {aiFeedback.cadreBenchmarkImplications}
                </div>
                <div>
                  <strong className="text-primary">Recommended Step: </strong>
                  {aiFeedback.recommendedNextAction}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Competencies Assessed Breakdown */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card
            title="Competencies Assessed"
            subtitle="Performance mapped to civil service competency frameworks"
          >
            <div className="space-y-4">
              {result.competenciesAssessed.map((c) => (
                <div key={c.competency} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{c.competency}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.correct}/{c.total} ({c.score}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={c.score}
                    tone={c.score >= 80 ? "success" : c.score >= 50 ? "warning" : "danger"}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Next Action */}
          <Card
            title="Recommended Next Action"
            subtitle="Curated by the competency engine to close identified deficits"
          >
            <div className="rounded-md bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Development Priority</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{result.recommendedAction}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link to="/competency-profile">
                <Button variant="secondary" className="w-full">
                  View Updated Competency Profile <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/skill-gaps">
                <Button variant="outline" className="w-full">
                  Analyze Updated Skill Gaps
                </Button>
              </Link>
              <Link to="/recommendations">
                <Button className="w-full">
                  Explore AI-Curated Recommendations
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Areas for Improvement / Question Review */}
        {result.incorrectQuestions.length > 0 ? (
          <div className="mt-6">
            <Card
              title="Review Areas for Improvement"
              subtitle="Explanations and correct administrative choices for flagged questions"
            >
              <div className="space-y-4">
                {result.incorrectQuestions.map((iq, idx) => (
                  <div key={iq.id} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Question {idx + 1} · {iq.competency}
                      </span>
                      <Badge tone="danger">Needs Attention</Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{iq.question}</p>

                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded bg-destructive/5 p-2.5 text-destructive">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <span className="font-semibold">Your choice: </span>
                          <span>{iq.selectedAnswer}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded bg-success/10 p-2.5 text-success">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <span className="font-semibold">Correct standard: </span>
                          <span>{iq.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-center text-sm text-success">
            Excellent! You answered all assessment questions correctly according to official standards.
          </div>
        )}
      </AppLayout>
    );
  }

  // Active Quiz View
  return (
    <AppLayout>
      <PageHeader
        title="Official Competency Diagnostic"
        subtitle="Civil Service Capability Benchmark · Ministry of Personnel, Public Grievances & Pensions"
      />

      <div className="mx-auto max-w-3xl">
        {/* Progress header card */}
        <div className="gov-card mb-6 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <span>{progressPercent}% COMPLETE</span>
          </div>
          <ProgressBar value={progressPercent} tone="secondary" className="mt-2" />
        </div>

        {/* Question Card */}
        <div className="gov-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-2">
            <Badge tone="secondary">{currentQuestion?.competency}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" /> Scenario-based
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold leading-relaxed text-foreground md:text-xl">
            {currentQuestion?.question}
          </h2>

          {/* Options */}
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = currentQuestion ? answers[currentQuestion.id] === idx : false;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 font-medium text-primary shadow-sm ring-1 ring-primary"
                      : "border-border bg-card text-foreground hover:bg-surface-muted"
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button size="sm" onClick={handleNext}>
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSubmitting ? "Scoring..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
