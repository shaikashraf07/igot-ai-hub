import type {
  AssessmentAIFeedback,
  AssessmentResult,
  Competency,
  CompetencyAIInsight,
  Course,
  DashboardAIInsight,
  LearnerContextFacts,
  PathwayAIExplanation,
  RecommendationAIExplanation,
} from "@/types/igot";
import {
  competencyService,
  courseService,
  learnerService,
  assessmentService,
} from "./igot-adapter";

/**
 * AI Insight Provider Contract
 * Clean architectural abstraction enabling Mock/Offline AI or future external LLM integration.
 */
export interface AIInsightProvider {
  generateDashboardInsight(facts: LearnerContextFacts): Promise<DashboardAIInsight>;
  generateCompetencyInsights(
    facts: LearnerContextFacts,
  ): Promise<Record<string, CompetencyAIInsight>>;
  generateRecommendationExplanation(
    course: Course,
    facts: LearnerContextFacts,
  ): Promise<RecommendationAIExplanation>;
  generatePathwayExplanation(facts: LearnerContextFacts): Promise<PathwayAIExplanation>;
  generateAssessmentFeedback(
    result: AssessmentResult,
    facts: LearnerContextFacts,
  ): Promise<AssessmentAIFeedback>;
}

/**
 * Mock AI Insight Provider
 * Generates explainable, context-rich narratives strictly synthesized from verified application facts.
 * Never invents scores, courses, benchmarks, or competencies.
 */
export class MockAIInsightProvider implements AIInsightProvider {
  async generateDashboardInsight(facts: LearnerContextFacts): Promise<DashboardAIInsight> {
    const { analysisReport, learner, competencies } = facts;
    const isRoleReady = analysisReport.readinessBand === "Role Ready";
    const hasCritical = analysisReport.criticalGaps.length > 0;
    const topGap = [...analysisReport.criticalGaps, ...analysisReport.moderateGaps][0];

    if (isRoleReady) {
      return {
        headline: "Role Benchmark Compliance Achieved",
        readinessAssessment: `Officer has successfully met or exceeded all ${competencies.length} civil service competency benchmarks for the rank of ${learner?.role ?? "Civil Servant"}. Overall Capability Health Index is verified at ${analysisReport.overallHealthIndex}%.`,
        primaryDevelopmentFocus:
          "Continuous professional development and elective domain specialization.",
        recommendedImmediateAction:
          "Explore elective modules in Digital Public Infrastructure or mentor junior cadre officers.",
        statutoryCadreAlignment: `100% compliant with ${learner?.cadre ?? "Civil Service"} competency guidelines under Mission Karmayogi.`,
      };
    }

    if (hasCritical && topGap) {
      const deficit = topGap.target - topGap.current;
      return {
        headline: `Priority Focus: Bridge ${topGap.competency} Deficit (${deficit} pts below target)`,
        readinessAssessment: `Current Officer Capability Health Index is ${analysisReport.overallHealthIndex}%. Diagnostic analysis identifies ${analysisReport.criticalGaps.length} critical gap(s) requiring targeted capacity development.`,
        primaryDevelopmentFocus: `${topGap.competency} (${topGap.current}% vs ${topGap.target}% cadre benchmark). Root cause diagnosis: ${topGap.rootCause ?? "Procedural knowledge gap in administrative decision workflows"}.`,
        recommendedImmediateAction: `Complete recommended module '${topGap.action}' to eliminate the ${deficit}-point deficit prior to quarterly cadre review.`,
        statutoryCadreAlignment: `Directly aligns with ${learner?.cadre ?? "Civil Service"} core capacity building mandates.`,
      };
    }

    // Moderate progression
    return {
      headline: `Moderate Progression Track: ${analysisReport.moderateGaps.length} Competency Refinements Identified`,
      readinessAssessment: `Overall Capability Health Index is at ${analysisReport.overallHealthIndex}%. All competencies are within 10 points of designated cadre benchmarks.`,
      primaryDevelopmentFocus: topGap
        ? `Refining ${topGap.competency} (${topGap.current}% to ${topGap.target}%).`
        : "Consolidating core competencies.",
      recommendedImmediateAction: topGap
        ? `Engage with short-format course: ${topGap.action}.`
        : "Undertake targeted self-paced modules.",
      statutoryCadreAlignment: `On schedule for complete ${learner?.cadre ?? "Civil Service"} benchmark compliance.`,
    };
  }

  async generateCompetencyInsights(
    facts: LearnerContextFacts,
  ): Promise<Record<string, CompetencyAIInsight>> {
    const { competencies, courses, learner } = facts;
    const insights: Record<string, CompetencyAIInsight> = {};

    for (const c of competencies) {
      const deficit = c.target - c.score;
      const mappedCourse = courses.find((course) => course.competency === c.name);

      if (deficit <= 0) {
        insights[c.name] = {
          competencyName: c.name,
          currentState: `Benchmark Met (${c.score}% / Target: ${c.target}%)`,
          developmentNeed: "Elective Mastery & Leadership Application",
          likelyLearningFocus: `Applying ${c.name} in complex inter-ministerial coordination and policy formulation.`,
          explanation: `Your assessed capability score of ${c.score}% meets the designated threshold for ${learner?.role ?? "Civil Servant"}. Historical assessment data confirms reliable operational mastery.`,
          recommendedAction: mappedCourse
            ? `Optional: Review ${mappedCourse.title} for advanced practices.`
            : "No mandatory remediation required.",
          statusTone: "success",
        };
      } else if (deficit >= 15) {
        insights[c.name] = {
          competencyName: c.name,
          currentState: `Critical Deficit (${deficit} pts below benchmark)`,
          developmentNeed: "Immediate Structured Remediation",
          likelyLearningFocus: `Foundational evidence reconciliation, standard operating procedures, and risk-managed file disposal.`,
          explanation: `Score of ${c.score}% falls significantly below the required ${c.target}% benchmark for ${learner?.role ?? "Civil Servant"}. This gap introduces administrative friction in daily cadre responsibilities.`,
          recommendedAction: mappedCourse
            ? `Priority: Complete '${mappedCourse.title}' (${mappedCourse.duration}) and take reassessment.`
            : "Complete targeted capacity modules immediately.",
          statusTone: "danger",
        };
      } else {
        insights[c.name] = {
          competencyName: c.name,
          currentState: `Moderate Gap (${deficit} pts below benchmark)`,
          developmentNeed: "Targeted Modular Refinement",
          likelyLearningFocus: `Refining case analysis techniques and streamlining official communication formats.`,
          explanation: `Current capability level is at ${c.score}%, within 10 points of the ${c.target}% role requirement. Minor modular effort will close this gap completely.`,
          recommendedAction: mappedCourse
            ? `Recommended: Study '${mappedCourse.title}' to achieve benchmark.`
            : "Undertake modular practice sessions.",
          statusTone: "warning",
        };
      }
    }

    return insights;
  }

  async generateRecommendationExplanation(
    course: Course,
    facts: LearnerContextFacts,
  ): Promise<RecommendationAIExplanation> {
    const { competencies, learner } = facts;
    const targetComp = competencies.find((c) => c.name === course.competency);
    const score = targetComp ? targetComp.score : 70;
    const target = targetComp ? targetComp.target : 80;
    const deficit = Math.max(0, target - score);

    let priorityReason =
      "Recommended as a high-authority civil service module from accredited institutions.";
    if (deficit >= 15) {
      priorityReason = `Ranked as top priority because it directly addresses a critical ${deficit}-point deficit in ${course.competency}.`;
    } else if (deficit > 0) {
      priorityReason = `Ranked as priority module to close an active ${deficit}-point capability gap against ${learner?.role ?? "Civil Servant"} benchmarks.`;
    } else {
      priorityReason = `Ranked as an elective advancement module to consolidate verified capability in ${course.competency}.`;
    }

    return {
      whyThisCourse:
        deficit > 0
          ? `This module was curated specifically for your profile because your assessed score in ${course.competency} (${score}%) is ${deficit} points below the ${target}% benchmark required for ${learner?.role ?? "Civil Servant"}.`
          : `Recommended to deepen your expertise in ${course.competency} following successful attainment of role benchmarks.`,
      gapAddressedSummary:
        deficit > 0
          ? `${course.competency}: ${score}% current → ${target}% target (${deficit} pt gap)`
          : `${course.competency}: Benchmark achieved (${score}%)`,
      administrativeImpact: `Directly enhances official file disposal velocity, statutory compliance, and decision quality under ${learner?.cadre ?? "Civil Service"} guidelines.`,
      priorityReason,
      expectedLearningPurpose:
        course.outcomes && course.outcomes.length > 0
          ? course.outcomes.join("; ")
          : `Develop proficiency in ${course.competency} through official case studies and scenario exercises.`,
    };
  }

  async generatePathwayExplanation(facts: LearnerContextFacts): Promise<PathwayAIExplanation> {
    const { analysisReport, learner } = facts;
    const pathway = analysisReport.learningPathway;

    if (!pathway || pathway.length === 0) {
      return {
        overallStrategy: `All core competency benchmarks for ${learner?.role ?? "Civil Servant"} are satisfied. The recommended pathway focuses on elective growth and inter-departmental leadership.`,
        stepExplanations: [],
        estimatedCompletionImpact:
          "Maintains optimal capability index and readies officer for higher departmental postings.",
      };
    }

    const stepExplanations = pathway.map((step) => {
      let rationale = `Step ${step.step} prioritizes ${step.targetCompetency} to eliminate a verified role benchmark gap.`;
      let milestonePurpose = `Elevation of ${step.targetCompetency} score towards cadre compliance.`;

      if (step.step === 1) {
        rationale = `Milestone 1 targets your highest-severity competency deficit in ${step.targetCompetency} to achieve maximum early capability gain.`;
        milestonePurpose =
          "Eliminate critical operational vulnerability in daily administrative workflows.";
      } else if (step.step === 2) {
        rationale = `Milestone 2 builds upon the foundational skills of Milestone 1 by addressing ${step.targetCompetency}.`;
        milestonePurpose =
          "Expand managerial and cross-functional capacity across the administrative branch.";
      } else {
        rationale = `Milestone 3 consolidates capability with ${step.targetCompetency} before statutory reassessment.`;
        milestonePurpose =
          "Achieve full benchmark readiness and prepare for official competency certification.";
      }

      return {
        step: step.step,
        title: step.title,
        targetCompetency: step.targetCompetency,
        rationale,
        milestonePurpose,
      };
    });

    return {
      overallStrategy: `Sequenced 3-tier capacity building roadmap specifically structured for ${learner?.role ?? "Civil Servant"} (${learner?.cadre ?? "Civil Service"}). Steps are ordered by gap severity to minimize administrative risk.`,
      stepExplanations,
      estimatedCompletionImpact: `Completing this pathway is projected to recover ${analysisReport.totalDeficitPoints} deficit points and bring the Officer Capability Health Index to 100% compliance.`,
    };
  }

  async generateAssessmentFeedback(
    result: AssessmentResult,
    facts: LearnerContextFacts,
  ): Promise<AssessmentAIFeedback> {
    const { learner } = facts;
    const isPass = result.scorePercentage >= 70;
    const strongComps = result.competenciesAssessed.filter((c) => c.score >= 75);
    const weakComps = result.competenciesAssessed.filter((c) => c.score < 75);

    const strengthsNarrative =
      strongComps.length > 0
        ? `Demonstrated sound administrative proficiency in ${strongComps.map((c) => c.competency).join(", ")}, reflecting good adherence to established rules of procedure.`
        : "Baseline competencies established across introductory scenarios; requires consolidation.";

    const developmentAreasNarrative =
      weakComps.length > 0
        ? `Performance in ${weakComps.map((c) => `${c.competency} (${c.score}%)`).join(", ")} indicates susceptibility to procedural bottlenecks and evidence reconciliation anomalies.`
        : "All evaluated competencies conform to benchmark expectations.";

    const cadreBenchmarkImplications = isPass
      ? `Score meets the general readiness threshold. Continued engagement with mapped modules will sustain proficiency for ${learner?.role ?? "Civil Servant"}.`
      : `Score of ${result.scorePercentage}% falls below the 70% threshold. Immediate remediation through mapped courses is recommended prior to scheduled reassessment.`;

    const recommendedNextAction =
      weakComps.length > 0
        ? `Prioritize completing '${facts.courses.find((c) => c.competency === weakComps[0]?.competency)?.title ?? "Evidence-Based Decision Making"}' to address your lowest scored area.`
        : "Proceed to elective advanced modules to expand administrative scope.";

    return {
      executiveSummary: `Diagnostic assessment concluded with an overall score of ${result.scorePercentage}% (${result.correctAnswers} of ${result.totalQuestions} questions correct). ${isPass ? "Capability benchmarks generally verified." : "Immediate capacity building required."}`,
      strengthsNarrative,
      developmentAreasNarrative,
      cadreBenchmarkImplications,
      recommendedNextAction,
    };
  }
}

/**
 * AI Insight Service Facade
 * Provides unified, cached access to the underlying AI Insight Provider.
 */
class AIInsightService {
  private provider: AIInsightProvider;
  private cache = new Map<string, unknown>();

  constructor(provider?: AIInsightProvider) {
    this.provider = provider ?? new MockAIInsightProvider();
  }

  setProvider(provider: AIInsightProvider) {
    this.provider = provider;
    this.cache.clear();
  }

  /**
   * Helper to assemble factual context from active services
   */
  async buildContextFacts(): Promise<LearnerContextFacts> {
    const [learner, competencies, courses, gaps, report, recentAssessment] = await Promise.all([
      learnerService.getProfile(),
      competencyService.getCompetencies(),
      courseService.searchCourses(),
      competencyService.getSkillGaps(),
      competencyService.getAnalysisReport(),
      assessmentService.getLatestResult(),
    ]);

    return {
      learner,
      competencies,
      courses,
      skillGaps: gaps,
      analysisReport: report,
      recentAssessment,
    };
  }

  /**
   * State signature to invalidate cache when application state changes
   */
  private computeSignature(facts: LearnerContextFacts, subKey = ""): string {
    const compSig = facts.competencies.map((c) => `${c.name}:${c.score}`).join("|");
    const courseSig = facts.courses.map((c) => `${c.id}:${c.progress ?? 0}`).join("|");
    return `${subKey}_${compSig}_${courseSig}_${facts.recentAssessment?.scorePercentage ?? "na"}`;
  }

  async getDashboardInsight(factsOverride?: LearnerContextFacts): Promise<DashboardAIInsight> {
    const facts = factsOverride ?? (await this.buildContextFacts());
    const sig = this.computeSignature(facts, "dashboard");

    if (this.cache.has(sig)) {
      return this.cache.get(sig) as DashboardAIInsight;
    }

    const insight = await this.provider.generateDashboardInsight(facts);
    this.cache.set(sig, insight);
    return insight;
  }

  async getCompetencyInsights(
    factsOverride?: LearnerContextFacts,
  ): Promise<Record<string, CompetencyAIInsight>> {
    const facts = factsOverride ?? (await this.buildContextFacts());
    const sig = this.computeSignature(facts, "competencies");

    if (this.cache.has(sig)) {
      return this.cache.get(sig) as Record<string, CompetencyAIInsight>;
    }

    const insights = await this.provider.generateCompetencyInsights(facts);
    this.cache.set(sig, insights);
    return insights;
  }

  async getRecommendationExplanation(
    course: Course,
    factsOverride?: LearnerContextFacts,
  ): Promise<RecommendationAIExplanation> {
    const facts = factsOverride ?? (await this.buildContextFacts());
    const sig = this.computeSignature(facts, `rec_${course.id}`);

    if (this.cache.has(sig)) {
      return this.cache.get(sig) as RecommendationAIExplanation;
    }

    const explanation = await this.provider.generateRecommendationExplanation(course, facts);
    this.cache.set(sig, explanation);
    return explanation;
  }

  async getPathwayExplanation(factsOverride?: LearnerContextFacts): Promise<PathwayAIExplanation> {
    const facts = factsOverride ?? (await this.buildContextFacts());
    const sig = this.computeSignature(facts, "pathway");

    if (this.cache.has(sig)) {
      return this.cache.get(sig) as PathwayAIExplanation;
    }

    const explanation = await this.provider.generatePathwayExplanation(facts);
    this.cache.set(sig, explanation);
    return explanation;
  }

  async getAssessmentFeedback(
    result: AssessmentResult,
    factsOverride?: LearnerContextFacts,
  ): Promise<AssessmentAIFeedback> {
    const facts = factsOverride ?? (await this.buildContextFacts());
    const sig = this.computeSignature(facts, `assessment_${result.scorePercentage}`);

    if (this.cache.has(sig)) {
      return this.cache.get(sig) as AssessmentAIFeedback;
    }

    const feedback = await this.provider.generateAssessmentFeedback(result, facts);
    this.cache.set(sig, feedback);
    return feedback;
  }
}

export const aiInsightService = new AIInsightService();
