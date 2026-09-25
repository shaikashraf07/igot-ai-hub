import type { ReactNode } from "react";
import { AlertCircle, FileSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 sm:p-12 text-center",
        className,
      )}
      role="region"
      aria-label={title}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-secondary shadow-xs">
        {icon ?? <FileSearch className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base sm:text-lg font-bold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  count?: number;
  className?: string;
}

export function LoadingState({
  message = "Loading data...",
  count = 3,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)} role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin text-secondary" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="gov-card animate-pulse p-5 space-y-3">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="pt-2">
              <div className="h-8 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load information",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/25 bg-destructive/5 p-6 text-center shadow-xs",
        className,
      )}
      role="alert"
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-base font-bold text-destructive tracking-tight">{title}</h3>
      <p className="mt-1 max-w-md mx-auto text-sm text-muted-foreground leading-relaxed">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Try again
        </Button>
      ) : null}
    </div>
  );
}
