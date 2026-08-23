"use client";

import Link from "next/link";
import { AnalysisGate } from "@/components/AnalysisGate";
import { Badge, Card, SectionTitle, Stat } from "@/components/ui";

const DIFFICULTY_TONE = {
  Beginner: "good",
  Intermediate: "warn",
  Advanced: "bad",
} as const;

export default function ProjectsPage() {
  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="Step 4 · Build"
            title="Recommended projects"
            subtitle="Ranked by how many of your skill gaps each project closes, plus relevance to your target role and experience level."
            action={
              <Link href="/roadmap" className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                View roadmap
              </Link>
            }
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Recommended" value={data.projects.length} tone="info" icon="🛠️" />
            <Stat label="Gaps to close" value={data.stats.missingCount + data.match.preferredMissing.length} tone="bad" icon="🎯" />
            <Stat label="Total build time" value={`${data.projects.reduce((sum, p) => sum + p.estimatedHours, 0)} h`} tone="cyan" icon="⏱️" />
            <Stat label="Capstone" value="1" tone="good" icon="🏆" hint={data.roadmap.finalProject} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {data.projects.map((project) => (
              <Card key={project.id} hover>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-white">{project.title}</h3>
                  <div className="flex gap-1.5">
                    <Badge tone={DIFFICULTY_TONE[project.difficulty]}>{project.difficulty}</Badge>
                    <Badge tone="neutral">~{project.estimatedHours} h</Badge>
                  </div>
                </div>

                <p className="mt-2 text-sm text-[var(--muted)]">{project.description}</p>

                <div className="mt-4">
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-[var(--muted)]">Technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} tone="info">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-[var(--muted)]">Skills you&apos;ll learn</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skillsLearned.map((skill) => {
                      const isGap = data.match.missing.some((m) => m.name.toLowerCase() === skill.toLowerCase());
                      return (
                        <Badge key={skill} tone={isGap ? "bad" : "neutral"}>
                          {skill}
                          {isGap ? " • gap" : ""}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-indigo-500/8 p-3">
                  <p className="text-xs text-indigo-200">
                    <span className="font-semibold">Why it helps: </span>
                    {project.why}
                  </p>
                </div>
                <p className="mt-3 text-[11px] text-[var(--muted)]">{project.reason}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AnalysisGate>
  );
}
