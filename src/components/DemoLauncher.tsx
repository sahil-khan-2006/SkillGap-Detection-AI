"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "./AnalysisProvider";
import { Card } from "./ui";

interface Metrics {
  algorithm: string;
  trainingRecords: number;
  features: number;
  classes: number;
  metrics: { accuracy: number; precision: number; recall: number; f1: number; holdoutSamples: number };
}

export function MlMetricsStrip() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ml/metrics")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.model) setMetrics(json.model as Metrics);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!metrics) {
    return (
      <div className="glass rounded-2xl p-5 text-sm text-[var(--muted)]">
        Training the local job-category classifier… (TF-IDF + logistic regression, computed on first load)
      </div>
    );
  }

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-300/80">Live model evaluation</p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Job-category classifier · {metrics.algorithm.replace("-", " ")}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            {metrics.trainingRecords} sample resumes · {metrics.features} TF-IDF features · {metrics.classes} job
            categories · hold-out {metrics.metrics.holdoutSamples}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Accuracy", value: pct(metrics.metrics.accuracy) },
          { label: "Precision", value: pct(metrics.metrics.precision) },
          { label: "Recall", value: pct(metrics.metrics.recall) },
          { label: "F1 score", value: pct(metrics.metrics.f1) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-[var(--muted)]">{item.label}</p>
            <p className="text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

const DEMOS = [
  { id: "demo-java", label: "Java Developer", name: "Aarav Sharma", headline: "Core Java + JSP/Servlet, 1 internship", accent: "from-amber-500/25" },
  { id: "demo-python", label: "Python Developer", name: "Neha Verma", headline: "Flask/FastAPI, automation, 2 yrs", accent: "from-emerald-500/25" },
  { id: "demo-data-analyst", label: "Data Analyst", name: "Rahul Menon", headline: "SQL, Excel, Power BI, 1.5 yrs", accent: "from-sky-500/25" },
  { id: "demo-frontend", label: "Frontend Developer", name: "Ishita Roy", headline: "React, TypeScript, accessibility", accent: "from-fuchsia-500/25" },
];

export function DemoLauncher() {
  const router = useRouter();
  const { runDemo, loading, error } = useAnalysis();
  const [pending, setPending] = useState<string | null>(null);

  const start = async (id: string) => {
    setPending(id);
    const result = await runDemo(id);
    setPending(null);
    if (result) router.push("/dashboard");
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            onClick={() => start(demo.id)}
            disabled={loading}
            className={`glass card-hover rounded-2xl bg-gradient-to-br ${demo.accent} to-transparent p-5 text-left disabled:opacity-60`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200/80">{demo.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{demo.name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{demo.headline}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-300">
              {pending === demo.id && loading ? "Analyzing…" : "Run demo →"}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
