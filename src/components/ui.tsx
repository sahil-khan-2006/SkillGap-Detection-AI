"use client";

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`glass rounded-2xl p-5 sm:p-6 ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300/80">{eyebrow}</p>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  good: "bg-emerald-500/12 text-emerald-300 ring-emerald-400/25",
  warn: "bg-amber-500/12 text-amber-300 ring-amber-400/25",
  bad: "bg-rose-500/12 text-rose-300 ring-rose-400/25",
  info: "bg-indigo-500/12 text-indigo-300 ring-indigo-400/25",
  neutral: "bg-white/5 text-slate-300 ring-white/10",
  cyan: "bg-cyan-500/12 text-cyan-300 ring-cyan-400/25",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "good" | "warn" | "bad" | "info" | "neutral" | "cyan";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "info",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "good" | "warn" | "bad" | "info" | "cyan";
  icon?: ReactNode;
}) {
  const accents: Record<string, string> = {
    good: "from-emerald-500/20",
    warn: "from-amber-500/20",
    bad: "from-rose-500/20",
    info: "from-indigo-500/20",
    cyan: "from-cyan-500/20",
  };
  return (
    <div className={`glass card-hover relative overflow-hidden rounded-2xl bg-gradient-to-br ${accents[tone]} to-transparent p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{label}</p>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon = "📊",
}: {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-14 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass rounded-2xl border-rose-400/25 bg-rose-500/10 p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-rose-200">We couldn&apos;t complete that</h3>
          <p className="mt-1 text-sm text-rose-100/80">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton relative overflow-hidden rounded-xl bg-white/5 ${className}`} />;
}

export function ProgressBar({ value, tone = "info" }: { value: number; tone?: "good" | "warn" | "bad" | "info" }) {
  const colors: Record<string, string> = {
    good: "bg-emerald-400",
    warn: "bg-amber-400",
    bad: "bg-rose-400",
    info: "bg-indigo-400",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full ${colors[tone]} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export const priorityTone = (priority: string) =>
  priority === "HIGH" ? "bad" : priority === "MEDIUM" ? "warn" : "neutral";

export const statusTone = (status: string) =>
  status === "matched" ? "good" : status === "partial" ? "warn" : "bad";
