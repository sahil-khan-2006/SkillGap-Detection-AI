"use client";

import Link from "next/link";
import { AnalysisGate } from "@/components/AnalysisGate";
import { useAnalysis } from "@/components/AnalysisProvider";
import { BarChart } from "@/components/charts";
import { Badge, Card, ProgressBar, SectionTitle, Stat } from "@/components/ui";
import { JOB_ROLES } from "@/data/jobRoles";

export default function CareerPage() {
  const { runAnalysis, resumeText } = useAnalysis();

  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Step 5 · Explore"
            title="Career recommendations"
            subtitle="Each role is scored with 68% structured skill coverage + 32% normalized ML classifier probability."
            action={
              <Link href="/dashboard" className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                Back to dashboard
              </Link>
            }
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Top match" value={`${data.careers[0]?.score ?? 0}%`} tone="good" icon="🥇" hint={data.careers[0]?.role} />
            <Stat label="Roles evaluated" value={JOB_ROLES.length} tone="info" icon="🧭" />
            <Stat label="ML prediction" value={data.ml.topPrediction ?? "—"} tone="cyan" icon="🤖" hint={data.ml.algorithm} />
            <Stat label="Avg coverage" value={`${Math.round(data.careers.reduce((s, c) => s + c.skillCoverage, 0) / (data.careers.length || 1))}%`} tone="warn" icon="📊" />
          </div>

          <Card hover>
            <SectionTitle title="Top career matches" subtitle="Click a role to re-run the full analysis against it." />
            <div className="space-y-4">
              {data.careers.map((career, index) => (
                <div key={career.roleId} className="rounded-xl bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/20 text-sm font-semibold text-indigo-200">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{career.role}</h3>
                        <p className="text-[11px] text-[var(--muted)]">{career.family}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="info">skill coverage {career.skillCoverage}%</Badge>
                      <Badge tone="cyan">ML {career.mlProbability}%</Badge>
                      <Badge tone={career.score >= 70 ? "good" : career.score >= 50 ? "warn" : "bad"}>{career.score}%</Badge>
                      <button
                        onClick={() =>
                          runAnalysis(
                            resumeText
                              ? { resumeText, targetRoleId: career.roleId }
                              : { skills: data.skills.map((s) => s.name), targetRoleId: career.roleId },
                          )
                        }
                        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-[var(--muted)] transition hover:text-white"
                      >
                        Analyze as target
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={career.score} tone={career.score >= 70 ? "good" : career.score >= 50 ? "warn" : "bad"} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">{career.summary}</p>
                  <div className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-slate-300">You already match</p>
                      <div className="flex flex-wrap gap-1">
                        {career.matchedSkills.slice(0, 8).map((skill) => (
                          <Badge key={skill} tone="good">
                            {skill}
                          </Badge>
                        ))}
                        {!career.matchedSkills.length && <span className="text-[var(--muted)]">—</span>}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-slate-300">Top gaps for this role</p>
                      <div className="flex flex-wrap gap-1">
                        {career.topGaps.slice(0, 8).map((skill) => (
                          <Badge key={skill} tone="bad">
                            {skill}
                          </Badge>
                        ))}
                        {!career.topGaps.length && <span className="text-[var(--muted)]">none</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card hover>
            <SectionTitle title="ML classifier probabilities" subtitle={`Raw model output (${data.ml.algorithm}) over all 14 job categories.`} />
            <BarChart data={data.ml.predictions.map((p) => ({ label: p.label, value: +(p.probability * 100).toFixed(1) }))} />
          </Card>
        </div>
      )}
    </AnalysisGate>
  );
}
