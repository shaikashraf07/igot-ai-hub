import type { Competency } from "@/types/igot";
import { Badge, ProgressBar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface CompetencyCardProps {
  competency: Competency;
  isPriorityGap?: boolean;
  className?: string;
}

export function CompetencyCard({
  competency,
  isPriorityGap = false,
  className,
}: CompetencyCardProps) {
  const meetsTarget = competency.score >= competency.target;
  const gap = competency.target - competency.score;

  return (
    <div
      className={cn(
        "rounded-md border border-border p-4 bg-card transition-all",
        isPriorityGap && "border-accent/40 shadow-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">{competency.name}</span>
          {isPriorityGap ? <Badge tone="accent">Priority gap</Badge> : null}
          <Badge tone="neutral">{competency.category}</Badge>
        </div>
        <div className="text-right">
          <span className="text-base font-bold tabular-nums text-primary">{competency.score}%</span>
          <span className="ml-1 text-xs text-muted-foreground">/ {competency.target}% target</span>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={competency.score}
          tone={isPriorityGap ? "accent" : meetsTarget ? "success" : "secondary"}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {meetsTarget ? (
            <span className="font-medium text-success">Meets benchmark</span>
          ) : (
            <span>Gap: {gap} points to role target</span>
          )}
        </span>
        <Badge tone={meetsTarget ? "success" : gap > 15 ? "danger" : "warning"}>
          {meetsTarget ? "Target met" : gap > 15 ? "High deficit" : "Minor gap"}
        </Badge>
      </div>
    </div>
  );
}
