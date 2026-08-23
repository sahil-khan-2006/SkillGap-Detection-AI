"use client";

import { useMemo, useState } from "react";
import { AnalysisGate } from "@/components/AnalysisGate";
import { useAnalysis } from "@/components/AnalysisProvider";
import { BarChart } from "@/components/charts";
import { Badge, Card, ProgressBar, SectionTitle, Stat, priorityTone, statusTone } from "@/components/ui";
import type { SkillGapItem } from "@/engine/matcher";
import { SKILL_CATEGORIES } from "@/data/skills";

const TRACK_STATES = ["learning", "practicing", "completed"] as const;

function SkillRow({
  item,
  progress,
  onTrack,
}: {
  item: SkillGapItem;
  progress?: string;
  onTrack: (name: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setOpen((v) => !v)} className="text-sm font-medium text-white hover:text-indigo-200">
            {open ? "▾" : "▸"} {item.name}
          </button>
          <Badge tone={statusTone(item.status)}>{item.status}</Badge>
          {item.status !== "matched" && <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>}
          <Badge tone="neutral">{item.category}</Badge>
        </div>
        <span className="text-[11px] text-[var(--muted)]">importance {item.importance}/5 · demand {item.demand}/5 · ~{item.hours}h</span>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar
            value={item.status === "matched" ? 100 : item.status === "partial" ? 45 : 0}
            tone={item.status === "matched" ? "good" : item.status === "partial" ? "warn" : "bad"}
          />
        </div>
        {item.status !== "matched" && (
          <div className="flex gap-1">
            {TRACK_STATES.map((state) => (
              <button
                key={state}
                onClick={() => onTrack(item.name, state)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
                  progress === state
                    ? "bg-indigo-500/25 text-indigo-200 ring-1 ring-inset ring-indigo-400/40"
                    : "bg-white/5 text-[var(--muted)] hover:text-white"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="animate-fade-in mt-3 space-y-2 text-xs text-[var(--muted)]">
          <p>{item.reason}</p>
          {item.relatedEvidence.map((evidence) => (
            <p key={evidence} className="rounded-lg bg-black/20 p-2 italic">
              “{evidence}”
            </p>
          ))}
          <p className="text-[11px]">Priority score: {item.priorityScore}</p>
        </div>
      )}
    </div>
  );
}

export default function SkillsPage() {
  const { analysis } = useAnalysis();
  const [category, setCategory] = useState<string>("all");
  const [progressMap, setProgressMap] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!analysis) return { matched: [], missing: [], partial: [], preferred: [] };
    const byCategory = (item: SkillGapItem) => category === "all" || item.category === category;
    return {
      matched: analysis.match.matched.filter(byCategory),
      missing: analysis.match.missing.filter(byCategory),
      partial: analysis.match.partial.filter(byCategory),
      preferred: analysis.match.preferredMissing.filter(byCategory),
    };
  }, [analysis, category]);

  const track = async (skillName: string, status: string) => {
    setProgressMap((prev) => ({ ...prev, [skillName]: status }));
    if (!analysis?.id) return;
    try {
      await fetch(`/api/analyses/${analysis.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, status }),
      });
    } catch {
      /* progress is also kept locally */
    }
  };

  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Step 2 · Analysis"
            title="Skill gap analysis"
            subtitle={`Comparing your resume against ${data.targetRole?.name ?? "the parsed job description"} · ${
              data.jd.requiredSkills.length
            } required and ${data.jd.preferredSkills.length} preferred skills detected.`}
            action={
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategory("all")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                    category === "all" ? "bg-white/10 text-white" : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  All
                </button>
                {SKILL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      category === cat ? "bg-white/10 text-white" : "text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Matched" value={data.stats.matchedCount} tone="good" icon="✅" hint="required skills you already have" />
            <Stat label="Partial" value={data.stats.partialCount} tone="warn" icon="🟡" hint="related experience detected" />
            <Stat label="Missing" value={data.stats.missingCount} tone="bad" icon="🎯" hint="required but not found" />
            <Stat label="High priority" value={data.stats.highPriorityCount} tone="info" icon="🔥" hint="learn these first" />
          </div>

          <Card>
            <SectionTitle title="Priority ranking" subtitle="Required skills with high role importance and market demand rank first; preferred skills are LOW." />
            <BarChart
              data={data.prioritySkills.slice(0, 10).map((skill) => ({
                label: `${skill.name} (${skill.priority})`,
                value: skill.priorityScore,
                color:
                  skill.priority === "HIGH"
                    ? "linear-gradient(90deg,#fb7185,#f43f5e)"
                    : skill.priority === "MEDIUM"
                      ? "linear-gradient(90deg,#fbbf24,#f59e0b)"
                      : "linear-gradient(90deg,#818cf8,#6366f1)",
              }))}
              suffix=" pts"
            />
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card hover>
              <SectionTitle title={`Matched (${filtered.matched.length})`} subtitle="Present in both resume and job requirements." />
              <div className="space-y-2">
                {filtered.matched.map((item) => (
                  <SkillRow key={item.name} item={item} progress={progressMap[item.name]} onTrack={track} />
                ))}
                {!filtered.matched.length && <p className="text-sm text-[var(--muted)]">No matched skills in this category.</p>}
              </div>
            </Card>

            <Card hover>
              <SectionTitle title={`Missing (${filtered.missing.length})`} subtitle="Required by the job, absent from your resume." />
              <div className="space-y-2">
                {filtered.missing.map((item) => (
                  <SkillRow key={item.name} item={item} progress={progressMap[item.name]} onTrack={track} />
                ))}
                {!filtered.missing.length && <p className="text-sm text-[var(--muted)]">Nothing missing here — nice work.</p>}
              </div>
            </Card>

            <Card hover>
              <SectionTitle title={`Partial & preferred (${filtered.partial.length + filtered.preferred.length})`} subtitle="Transferable evidence, or nice-to-have skills." />
              <div className="space-y-2">
                {[...filtered.partial, ...filtered.preferred].map((item) => (
                  <SkillRow key={`${item.name}-${item.type}`} item={item} progress={progressMap[item.name]} onTrack={track} />
                ))}
                {!filtered.partial.length && !filtered.preferred.length && (
                  <p className="text-sm text-[var(--muted)]">Nothing in this bucket.</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <SectionTitle title="Job requirements used for this comparison" />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Required ({data.jd.requiredSkills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.jd.requiredSkills.map((skill) => (
                    <Badge key={skill.skill} tone="info">
                      {skill.skill} · {skill.importance}/5
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted)]">Preferred ({data.jd.preferredSkills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.jd.preferredSkills.map((skill) => (
                    <Badge key={skill.skill} tone="cyan">
                      {skill.skill} · {skill.importance}/5
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-[var(--muted)]">
              Source: {data.jd.source === "dataset" ? "curated role dataset" : data.jd.source === "pasted" ? "your pasted job description" : "role dataset + pasted job description"}
              {data.jd.detectedRoleConfidence ? ` · role detection confidence ${(data.jd.detectedRoleConfidence * 100).toFixed(0)}%` : ""}
            </p>
          </Card>
        </div>
      )}
    </AnalysisGate>
  );
}
