"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAnalysis } from "./AnalysisProvider";
import { DemoLauncher } from "./DemoLauncher";
import { Card, EmptyState, Skeleton } from "./ui";

/** Wraps result pages: shows a friendly empty state until an analysis exists. */
export function AnalysisGate({ children }: { children: (analysis: NonNullable<ReturnType<typeof useAnalysis>["analysis"]>) => ReactNode }) {
  const { analysis } = useAnalysis();
  const hydrated = typeof window !== "undefined";

  if (!analysis) {
    if (!hydrated) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <EmptyState
          icon="🧭"
          title="No analysis yet"
          message="Upload your resume and pick a target role to unlock the dashboard — or explore a demo profile to see the full pipeline in action."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/analyze"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Analyze my resume
              </Link>
            </div>
          }
        />
        <Card>
          <p className="mb-4 text-sm font-semibold text-white">Or start with a demo profile</p>
          <DemoLauncher />
        </Card>
      </div>
    );
  }

  return <>{children(analysis)}</>;
}
