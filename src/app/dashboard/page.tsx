"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnalysisGate } from "@/components/AnalysisGate";
import { useAnalysis } from "@/components/AnalysisProvider";
import { BarChart, CategoryBars, DonutChart, RadarChart, ScoreRing } from "@/components/charts";
import { Badge, Card, ProgressBar, SectionTitle, Stat, statusTone } from "@/components/ui";
import { SKILL_CATEGORIES } from "@/data/skills";

export default function DashboardPage() {
  const { analysis } = useAnalysis();

  const categoryData = useMemo(() => {
    if (!analysis) return [];
    const map = new Map<string, { matched: number; missing: number }>();
    for (const item of [...analysis.match.matched, ...analysis.match.partial, ...analysis.match.missing, ...analysis.match.preferredMissing]) {
      const entry = map.get(item.category) ?? { matched: 0, missing: 0 };
      if (item.status === "matched") entry.matched += 1;
      else entry.missing += 1;
      map.set(item.category, entry);
    }
    return [...map.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.matched + b.missing - (a.matched + a.missing));
  }, [analysis]);

  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          {/* ------------------------------------------------------- header */}
          <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">Analysis dashboard</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {data.candidate.name ?? "Candidate"} → {data.targetRole?.name ?? "Custom role"}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {data.resume.words} words analyzed · {data.skills.length} skills detected ·{" "}
                {data.candidate.experienceYears ? `~${data.candidate.experienceYears} yrs experience` : "fresher profile"} ·{" "}
                {new Date(data.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/report" className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                View report
              </Link>
              <Link href="/analyze" className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110">
                New analysis
              </Link>
            </div>
          </div>

          {data.resume.warnings.map((warning) => (
            <p key={warning} className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200">
              ⚠️ {warning}
            </p>
          ))}

          {/* ---------------------------------------------------- score + stats */}
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <Card hover className="flex flex-col items-center justify-center gap-4">
              <ScoreRing
                value={data.match.matchScore}
                label="Match Score"
                sublabel={`Projected ${data.match.projectedScore}% after closing gaps`}
              />
              <p className="max-w-xs text-center text-xs text-[var(--muted)]">{data.disclaimer}</p>
              <div className="flex w-full flex-col gap-2">
                {data.match.components.map((component) => (
                  <div key={component.key}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted)]">
                        {component.label} <span className="opacity-60">({component.weight}%)</span>
                      </span>
                      <span className="font-semibold text-white">
                        {component.points.toFixed(1)} pts · {(component.achieved * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={component.achieved * 100} tone={component.achieved > 0.66 ? "good" : component.achieved > 0.33 ? "warn" : "bad"} />
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--muted)]">{component.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Matched" value={data.stats.matchedCount} hint={`of ${data.stats.totalRequired} required`} tone="good" icon="✅" />
                <Stat label="Missing" value={data.stats.missingCount} hint="required skills absent" tone="bad" icon="🎯" />
                <Stat label="High priority" value={data.stats.highPriorityCount} hint="learn these first" tone="warn" icon="🔥" />
                <Stat label="Projects" value={data.stats.projectCount} hint={`${data.roadmap.totalWeeks} week plan`} tone="cyan" icon="🛠️" />
              </div>

              <Card>
                <SectionTitle title="Before / after projection" subtitle="Clearly labelled as a projection, not a guarantee." />
                <div className="grid items-center gap-6 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Before</p>
                    <p className="mt-1 text-4xl font-semibold text-white">{data.match.matchScore}%</p>
                    <p className="text-xs text-[var(--muted)]">current resume</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-transparent p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-emerald-300/80">After (projected)</p>
                    <p className="mt-1 text-4xl font-semibold text-emerald-300">{data.match.projectedScore}%</p>
                    <p className="text-xs text-[var(--muted)]">after closing HIGH + MEDIUM gaps</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-[var(--muted)]">
                  Projection assumes the high and medium priority gaps are demonstrably learned and reflected in your
                  resume. It is a planning aid.
                </p>
              </Card>

              <Card>
                <SectionTitle title="Skill match distribution" />
                <DonutChart
                  centerLabel={`${data.stats.matchedCount}`}
                  data={[
                    { label: "Matched", value: data.stats.matchedCount, color: "#34d399" },
                    { label: "Partial", value: data.stats.partialCount, color: "#fbbf24" },
                    { label: "Missing", value: data.stats.missingCount, color: "#fb7185" },
                  ]}
                />
              </Card>
            </div>
          </div>

          {/* ------------------------------------------------------------ charts */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card hover>
              <SectionTitle title="Skill category coverage" subtitle="Matched vs missing in each taxonomy category." />
              <CategoryBars data={categoryData} />
            </Card>
            <Card hover>
              <SectionTitle title="Category demand radar" subtitle="Your skill count per category, scaled to the strongest area." />
              <div className="flex justify-center">
                <RadarChart
                  axes={SKILL_CATEGORIES.map((category) => {
                    const owned = data.skillCategories.find((c) => c.category === category)?.total ?? 0;
                    return { label: category, value: owned, max: Math.max(3, data.skillCategories[0]?.total ?? 3) };
                  })}
                />
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card hover>
              <SectionTitle title="Top priority gaps" subtitle="Ranked by role importance × market demand." />
              <div className="space-y-3">
                {data.prioritySkills.slice(0, 6).map((skill) => (
                  <div key={skill.name} className="rounded-xl bg-white/[0.03] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{skill.name}</span>
                        <Badge tone={skill.priority === "HIGH" ? "bad" : skill.priority === "MEDIUM" ? "warn" : "neutral"}>
                          {skill.priority}
                        </Badge>
                        <Badge tone="info">{skill.type}</Badge>
                      </div>
                      <span className="text-xs text-[var(--muted)]">~{skill.hours} h</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">{skill.reason}</p>
                  </div>
                ))}
              </div>
              <Link href="/skills" className="mt-4 inline-block text-xs text-indigo-300 hover:text-indigo-200">
                See full skill gap analysis →
              </Link>
            </Card>

            <Card hover>
              <SectionTitle title="Resume ↔ job similarity" subtitle="TF-IDF cosine similarity with shared vocabulary." />
              <div className="flex items-center gap-5">
                <ScoreRing value={data.similarity.score * 100} size={130} stroke={10} label="Similarity" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="mb-1 text-xs text-[var(--muted)]">Overlapping terms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.similarity.overlapTerms.slice(0, 10).map((term) => (
                        <Badge key={term} tone="good">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-[var(--muted)]">Important JD terms missing from your resume</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.similarity.missingTerms.slice(0, 10).map((term) => (
                        <Badge key={term} tone="bad">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ------------------------------------------------- ml + quality row */}
          <div className="grid gap-5 lg:grid-cols-3">
            <Card hover>
              <SectionTitle title="ML prediction" subtitle={`${data.ml.algorithm} · TF-IDF features`} />
              <p className="text-xs text-[var(--muted)]">
                Predicted job category from your resume text:{" "}
                <span className="font-semibold text-white">{data.ml.topPrediction ?? "—"}</span>
              </p>
              <div className="mt-3">
                <BarChart data={data.ml.predictions.slice(0, 5).map((p) => ({ label: p.label, value: +(p.probability * 100).toFixed(1) }))} />
              </div>
            </Card>

            <Card hover>
              <SectionTitle title={`Resume quality · ${data.quality.score}/100`} subtitle={data.quality.grade} />
              <div className="space-y-2.5">
                {data.quality.breakdown.map((row) => (
                  <div key={row.key}>
                    <div className="flex justify-between text-[11px] text-[var(--muted)]">
                      <span>{row.label}</span>
                      <span className="text-white">
                        {row.score}/{row.max}
                      </span>
                    </div>
                    <ProgressBar value={(row.score / row.max) * 100} tone={row.score / row.max > 0.7 ? "good" : row.score / row.max > 0.4 ? "warn" : "bad"} />
                  </div>
                ))}
              </div>
            </Card>

            <Card hover>
              <SectionTitle title="Improvement suggestions" />
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {data.quality.suggestions.slice(0, 6).map((suggestion) => (
                  <li key={suggestion} className="flex gap-2">
                    <span className="text-indigo-300">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* --------------------------------------------------- extracted skills */}
          <Card>
            <SectionTitle
              title="Detected skills in your resume"
              subtitle={`${data.skills.length} canonical skills after normalization (aliases resolved).`}
              action={
                <Link href="/skills" className="text-xs text-indigo-300 hover:text-indigo-200">
                  Gap analysis →
                </Link>
              }
            />
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  title={`${skill.category} · matched as ${skill.matchedAliases.join(", ")} · confidence ${skill.confidence}`}
                  className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${
                    data.match.matched.some((m) => m.name === skill.name)
                      ? "bg-emerald-500/12 text-emerald-300 ring-emerald-400/25"
                      : "bg-white/5 text-slate-300 ring-white/10"
                  }`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Matched requirement detail" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="pb-2">Skill</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Importance</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.match.requiredMatched.map((item) => (
                    <tr key={item.name}>
                      <td className="py-2 font-medium text-white">{item.name}</td>
                      <td className="py-2 text-[var(--muted)]">{item.type}</td>
                      <td className="py-2 text-[var(--muted)]">{item.importance}/5</td>
                      <td className="py-2">
                        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="py-2 max-w-md truncate text-xs text-[var(--muted)]">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AnalysisGate>
  );
}
