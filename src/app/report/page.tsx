"use client";

import { useState } from "react";
import { AnalysisGate } from "@/components/AnalysisGate";
import { Badge, Card, SectionTitle, Stat } from "@/components/ui";
import type { AnalysisResult } from "@/engine/analyze";

export default function ReportPage() {
  const [pdfState, setPdfState] = useState<"idle" | "building" | "done">("idle");

  const downloadPdf = async (data: AnalysisResult) => {
    setPdfState("building");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
      };
      const heading = (text: string, size = 16) => {
        ensureSpace(size + 18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.setTextColor(30, 41, 59);
        doc.text(text, margin, y);
        y += size + 8;
      };
      const body = (text: string, size = 10) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(71, 85, 105);
        const lines = doc.splitTextToSize(text, width) as string[];
        for (const line of lines) {
          ensureSpace(size + 4);
          doc.text(line, margin, y);
          y += size + 4;
        }
      };
      const bullet = (text: string) => body(`• ${text}`, 10);

      heading("SkillGap AI Career Analysis Report", 20);
      body("Discover the gap. Learn the skill. Build the career.", 10);
      y += 6;

      heading("Candidate", 13);
      body(
        [
          `Name: ${data.candidate.name ?? "—"}`,
          `Email: ${data.candidate.email ?? "—"}`,
          `Experience: ${data.candidate.experienceYears ? `~${data.candidate.experienceYears} years` : "Fresher / not stated"}`,
          `Education: ${data.candidate.education.join(" · ") || "—"}`,
          `Target role: ${data.targetRole?.name ?? data.ml.topPrediction ?? "—"}`,
          `Generated: ${new Date(data.createdAt).toLocaleString()}`,
        ].join("\n"),
      );

      heading("Overall Match Score", 13);
      body(`${data.match.matchScore}% (projected ${data.match.projectedScore}% after closing HIGH + MEDIUM priority gaps)`, 12);
      data.match.components.forEach((component) => {
        bullet(`${component.label} (${component.weight}%): ${component.points.toFixed(1)} pts — ${(component.achieved * 100).toFixed(0)}% achieved. ${component.detail}`);
      });

      heading("Matched Skills", 13);
      body(data.match.matched.map((m) => m.name).join(", ") || "—");

      heading("Missing Skills", 13);
      data.match.missing.forEach((item) => bullet(`${item.name} — ${item.priority} priority · ~${item.hours} h · ${item.reason}`));

      heading("Preferred (nice-to-have) Skills", 13);
      body(data.match.preferredMissing.map((m) => m.name).join(", ") || "—");

      heading("Priority Skills", 13);
      data.prioritySkills.slice(0, 10).forEach((item, index) =>
        bullet(`${index + 1}. ${item.name} — ${item.priority} (score ${item.priorityScore})`),
      );

      heading("Career Recommendations", 13);
      data.careers.forEach((career) =>
        bullet(`${career.role} — ${career.score}% (skill coverage ${career.skillCoverage}%, ML ${career.mlProbability}%)`),
      );

      heading("Learning Roadmap", 13);
      data.roadmap.weeks.forEach((week) =>
        bullet(`${week.weekLabel}: ${week.skill} (~${week.estimatedHours} h) — ${week.topics.join("; ")} | Practice: ${week.practiceTask}`),
      );

      heading("Recommended Projects", 13);
      data.projects.forEach((project) =>
        bullet(`${project.title} (${project.difficulty}, ~${project.estimatedHours} h) — ${project.technologies.join(", ")} :: ${project.why}`),
      );

      heading("Resume Quality & Suggestions", 13);
      body(`Resume quality score: ${data.quality.score}/100 (${data.quality.grade})`, 11);
      data.quality.suggestions.forEach((suggestion) => bullet(suggestion));

      heading("Final Suggestions", 13);
      bullet(
        `Focus on the top ${Math.min(3, data.prioritySkills.length)} priority skills first: ${data.prioritySkills
          .slice(0, 3)
          .map((s) => s.name)
          .join(", ") || "—"}.`,
      );
      bullet(`Ship "${data.projects[0]?.title ?? "a capstone project"}" and add it to your resume with measurable outcomes.`);
      bullet("Re-run this analysis after each milestone to track improvement.");

      heading("Disclaimer", 12);
      body(data.disclaimer, 9);

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`SkillGap AI · page ${page} of ${pageCount}`, margin, doc.internal.pageSize.getHeight() - 24);
      }

      const safeName = (data.candidate.name ?? "candidate").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      doc.save(`skillgap-ai-report-${safeName}.pdf`);
      setPdfState("done");
    } catch (error) {
      console.error(error);
      setPdfState("idle");
      window.print();
    }
  };

  const downloadJson = (data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skillgap-ai-analysis.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnalysisGate>
      {(data) => (
        <div className="space-y-8">
          <div className="no-print flex flex-wrap items-end justify-between gap-4">
            <SectionTitle
              eyebrow="Step 6 · Export"
              title="Analysis report"
              subtitle="Download a PDF report, print it, or export the raw JSON analysis."
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadPdf(data)}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
              >
                {pdfState === "building" ? "Generating…" : "⬇ Download PDF report"}
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Print
              </button>
              <button
                onClick={() => downloadJson(data)}
                className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div id="report" className="space-y-6">
            <Card className="print-plain">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-indigo-300/80">SkillGap AI Career Analysis Report</p>
                  <h1 className="mt-2 text-2xl font-semibold text-white print-plain">{data.candidate.name ?? "Candidate"}</h1>
                  <p className="text-sm text-[var(--muted)]">
                    Target role: {data.targetRole?.name ?? data.ml.topPrediction ?? "—"} ·{" "}
                    {data.candidate.email ?? "no email detected"} · {new Date(data.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Overall match score</p>
                  <p className="text-5xl font-semibold text-white print-plain">{data.match.matchScore}%</p>
                  <p className="text-xs text-emerald-300">Projected {data.match.projectedScore}%</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Matched" value={data.stats.matchedCount} tone="good" icon="✅" />
              <Stat label="Missing" value={data.stats.missingCount} tone="bad" icon="🎯" />
              <Stat label="High priority" value={data.stats.highPriorityCount} tone="warn" icon="🔥" />
              <Stat label="Resume quality" value={`${data.quality.score}/100`} tone="cyan" icon="📝" hint={data.quality.grade} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="print-plain">
                <SectionTitle title="Matched skills" />
                <div className="flex flex-wrap gap-1.5">
                  {data.match.matched.map((item) => (
                    <Badge key={item.name} tone="good">
                      {item.name}
                    </Badge>
                  ))}
                  {!data.match.matched.length && <p className="text-sm text-[var(--muted)]">No matched skills.</p>}
                </div>
              </Card>

              <Card className="print-plain">
                <SectionTitle title="Missing skills" />
                <div className="flex flex-wrap gap-1.5">
                  {data.match.missing.map((item) => (
                    <Badge key={item.name} tone="bad">
                      {item.name} · {item.priority}
                    </Badge>
                  ))}
                  {!data.match.missing.length && <p className="text-sm text-[var(--muted)]">No missing required skills. 🎉</p>}
                </div>
              </Card>
            </div>

            <Card className="print-plain">
              <SectionTitle title="Priority skills" />
              <ol className="space-y-2 text-sm">
                {data.prioritySkills.slice(0, 10).map((item, index) => (
                  <li key={item.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] p-2.5">
                    <span className="text-white">
                      {index + 1}. {item.name}
                    </span>
                    <span className="flex gap-2">
                      <Badge tone={item.priority === "HIGH" ? "bad" : item.priority === "MEDIUM" ? "warn" : "neutral"}>{item.priority}</Badge>
                      <Badge tone="neutral">~{item.hours} h</Badge>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="print-plain">
              <SectionTitle title="Career recommendations" />
              <ul className="space-y-2 text-sm">
                {data.careers.map((career) => (
                  <li key={career.roleId} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2.5">
                    <span className="text-white">{career.role}</span>
                    <span className="text-[var(--muted)]">{career.score}%</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="print-plain">
              <SectionTitle title="Learning roadmap" />
              <ul className="space-y-2 text-sm">
                {data.roadmap.weeks.map((week) => (
                  <li key={`${week.week}-${week.skill}`} className="rounded-lg bg-white/[0.03] p-2.5">
                    <span className="font-medium text-white">
                      {week.weekLabel} — {week.skill}
                    </span>
                    <p className="text-xs text-[var(--muted)]">{week.topics.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="print-plain">
              <SectionTitle title="Recommended projects" />
              <ul className="space-y-2 text-sm">
                {data.projects.map((project) => (
                  <li key={project.id} className="rounded-lg bg-white/[0.03] p-2.5">
                    <span className="font-medium text-white">{project.title}</span>
                    <p className="text-xs text-[var(--muted)]">
                      {project.difficulty} · {project.technologies.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="print-plain">
              <SectionTitle title="Final suggestions" />
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                {data.quality.suggestions.map((suggestion) => (
                  <li key={suggestion}>• {suggestion}</li>
                ))}
                <li>• Re-run this analysis after each learning milestone to measure progress.</li>
              </ul>
            </Card>

            <Card className="print-plain">
              <p className="text-xs text-[var(--muted)]">{data.disclaimer}</p>
            </Card>
          </div>
        </div>
      )}
    </AnalysisGate>
  );
}

/** Type-only helper so the PDF builder signature stays in sync. */
declare function useAnalysisShape(): { analysis: unknown };
