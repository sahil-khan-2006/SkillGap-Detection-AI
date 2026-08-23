"use client";

import Link from "next/link";
import { AnalysisGate } from "@/components/AnalysisGate";
import { Badge, Card, SectionTitle, Stat, priorityTone } from "@/components/ui";

export default function RoadmapPage() {
  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Step 3 · Plan"
            title="Personalized learning roadmap"
            subtitle={`${data.roadmap.totalWeeks} weeks · ~${data.roadmap.totalHours} focused hours at ${data.roadmap.hoursPerWeek} h/week · for ${
              data.targetRole?.name ?? "your target role"
            }`}
            action={
              <Link href="/projects" className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                See projects →
              </Link>
            }
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Total weeks" value={data.roadmap.totalWeeks} tone="info" icon="🗓️" />
            <Stat label="Est. hours" value={data.roadmap.totalHours} tone="cyan" icon="⏱️" />
            <Stat label="Gaps covered" value={new Set(data.roadmap.weeks.map((w) => w.skill)).size - 1} tone="warn" icon="🎯" />
            <Stat label="Final project" value="1" tone="good" icon="🚀" hint={data.roadmap.finalProject} />
          </div>

          {data.roadmap.phases.map((phase) => (
            <Card key={phase.phase} hover>
              <SectionTitle
                eyebrow={`Weeks ${phase.weeks[0]}–${phase.weeks[1]}`}
                title={phase.phase}
                subtitle={phase.goal}
              />
              <ol className="relative space-y-4 border-l border-white/10 pl-6">
                {phase.steps.map((step) => (
                  <li key={`${step.week}-${step.skill}`} className="relative">
                    <span className="absolute -left-[31px] top-1 grid h-5 w-5 place-items-center rounded-full bg-indigo-500/25 text-[10px] font-semibold text-indigo-200 ring-1 ring-inset ring-indigo-400/40">
                      {step.week}
                    </span>
                    <div className="rounded-xl bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{step.skill}</h4>
                          <Badge tone={priorityTone(step.priority)}>{step.priority}</Badge>
                          <Badge tone="neutral">{step.category}</Badge>
                          <Badge tone="info">~{step.estimatedHours} h</Badge>
                        </div>
                        <span className="text-[11px] text-[var(--muted)]">{step.weekLabel}</span>
                      </div>
                      <div className="mt-3 grid gap-3 text-xs text-[var(--muted)] sm:grid-cols-2">
                        <div>
                          <p className="mb-1 font-medium text-slate-300">Topics</p>
                          <ul className="space-y-1">
                            {step.topics.map((topic) => (
                              <li key={topic}>• {topic}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium text-slate-300">Practice: </span>
                            {step.practiceTask}
                          </p>
                          {step.suggestedProject !== "—" && (
                            <p>
                              <span className="font-medium text-slate-300">Project: </span>
                              {step.suggestedProject}
                            </p>
                          )}
                          <p>
                            <span className="font-medium text-slate-300">Resources: </span>
                            {step.resourceHint}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          ))}

          <Card>
            <p className="text-xs text-[var(--muted)]">{data.roadmap.note}</p>
          </Card>
        </div>
      )}
    </AnalysisGate>
  );
}
