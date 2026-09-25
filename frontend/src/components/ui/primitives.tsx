import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2.5">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <li>
          <Link
            to="/"
            className="hover:text-primary transition-colors focus-ring rounded px-1 py-0.5"
          >
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-primary transition-colors focus-ring rounded px-1 py-0.5"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-none" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <PageBreadcrumb items={breadcrumbs} />
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold leading-tight text-primary tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("gov-card p-5 transition-shadow", className)}>
      {title ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AIInsightCard({
  title,
  tag = "AI Competency Intelligence",
  cadreTag = "Cadre Aligned",
  children,
  action,
  className,
}: {
  title?: string;
  tag?: string;
  cadreTag?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gov-card border-l-4 border-l-secondary bg-card p-5 relative overflow-hidden",
        className,
      )}
      role="region"
      aria-label={title ?? tag}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
              {tag}
            </span>
            {cadreTag ? (
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                {cadreTag}
              </span>
            ) : null}
          </div>
          {title ? (
            <h3 className="text-base font-bold text-foreground leading-snug">{title}</h3>
          ) : null}
          <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </div>
  );
}

type Tone = "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary border border-primary/20",
  secondary: "bg-secondary/10 text-secondary border border-secondary/20",
  accent: "bg-accent/15 text-accent border border-accent/30 font-semibold",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/30 font-medium",
  danger: "bg-destructive/10 text-destructive border border-destructive/20",
  neutral: "bg-muted text-muted-foreground border border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:translate-y-px",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs active:translate-y-px",
    outline: "border border-input bg-card text-foreground hover:bg-surface-muted hover:text-primary active:translate-y-px",
    ghost: "text-secondary hover:bg-surface-muted",
  } as const;
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-xs sm:text-sm" : "px-4 py-2 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ProgressBar({
  value,
  tone = "secondary",
  className,
}: {
  value: number;
  tone?: "secondary" | "success" | "warning" | "danger" | "accent";
  className?: string;
}) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const bg = {
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    accent: "bg-accent",
  }[tone];
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clampedValue}% progress`}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", bg)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="gov-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            {
              primary: "bg-primary",
              secondary: "bg-secondary",
              accent: "bg-accent",
              success: "bg-success",
              warning: "bg-warning",
              danger: "bg-destructive",
              neutral: "bg-muted-foreground",
            }[tone],
          )}
        />
      </div>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const stops = segments.map((s) => {
    const start = (offset / total) * 100;
    offset += s.value;
    const end = (offset / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(",")})` }}
        role="img"
        aria-label={`${centerLabel}: ${centerValue}`}
      >
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card">
          <span className="text-2xl font-semibold text-primary">{centerValue}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-foreground">{s.label}</span>
            <span className="text-muted-foreground">— {s.value} courses</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
