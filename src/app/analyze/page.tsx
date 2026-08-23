"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/components/AnalysisProvider";
import { Badge, Card, ErrorState, SectionTitle, Skeleton } from "@/components/ui";
import { JOB_ROLES } from "@/data/jobRoles";
import { DEMO_PROFILES } from "@/data/demoProfiles";

interface ParsedUpload {
  file: { name: string; size: number; method: string; chars: number; words: number; warnings: string[] };
  profile: { name: string | null; email: string | null; experienceYears: number; projectTitles: string[]; education: string[] };
  skills: Array<{ name: string; category: string; confidence: number }>;
  resumeText: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const { runAnalysis, runDemo, loading, error } = useAnalysis();

  const [resumeText, setResumeText] = useState("");
  const [parsed, setParsed] = useState<ParsedUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [targetRole, setTargetRole] = useState<string>("java-developer");
  const [jobDescription, setJobDescription] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState({ requiredSkills: 50, experience: 15, projects: 15, preferredSkills: 10, certifications: 5, education: 5 });
  const [demoPending, setDemoPending] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    const allowed = ["pdf", "docx", "txt"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.includes(ext)) {
      setUploadError(`Unsupported file ".${ext}". Upload a PDF, DOCX or TXT file.`);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError(`"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 8 MB.`);
      return;
    }

    setUploading(true);
    setStage("Extracting text from your resume…");
    try {
      const form = new FormData();
      form.append("resume", file);
      const response = await fetch("/api/upload-resume", { method: "POST", body: form });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error ?? "Upload failed.");
      setParsed(json as ParsedUpload);
      setResumeText(json.resumeText ?? "");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setStage(null);
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!resumeText.trim()) {
      setUploadError("Upload a resume or paste your resume text first.");
      return;
    }
    setUploadError(null);
    const stages = [
      "Extracting skills with the NLP alias dictionary…",
      "Normalizing skill names (JS → JavaScript, Postgres → PostgreSQL)…",
      "Parsing job requirements…",
      "Running the ML job-category classifier…",
      "Computing TF-IDF cosine similarity…",
      "Building your roadmap and project plan…",
    ];
    let i = 0;
    setStage(stages[0]);
    const timer = setInterval(() => {
      i = (i + 1) % stages.length;
      setStage(stages[i]);
    }, 420);

    const result = await runAnalysis({
      resumeText,
      targetRoleId: targetRole,
      jobDescription: jobDescription.trim() || undefined,
      hoursPerWeek,
      weights,
    });
    clearInterval(timer);
    setStage(null);
    if (result) router.push("/dashboard");
  }, [resumeText, targetRole, jobDescription, hoursPerWeek, weights, runAnalysis, router]);

  const startDemo = async (id: string) => {
    setDemoPending(id);
    const result = await runDemo(id);
    setDemoPending(null);
    if (result) router.push("/dashboard");
  };

  const weightTotal = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Step 1 · Input"
        title="Analyze your resume"
        subtitle="Upload a PDF/DOCX/TXT resume, pick a target role and optionally paste a real job description. Everything is processed locally."
        action={
          <button
            onClick={() => {
              setResumeText("");
              setParsed(null);
              setJobDescription("");
              if (fileInput.current) fileInput.current.value = "";
            }}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[var(--muted)] transition hover:text-white"
          >
            Reset
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ------------------------------------------------------------- left */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-white">1 · Upload your resume</h3>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFile(file);
              }}
              onClick={() => fileInput.current?.click()}
              className={`mt-3 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragOver ? "border-indigo-400 bg-indigo-500/10" : "border-white/12 bg-white/[0.02] hover:border-indigo-400/60"
              }`}
            >
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <div className="text-3xl">{uploading ? "⏳" : "📄"}</div>
              <p className="mt-2 text-sm font-medium text-white">
                {uploading ? "Parsing your file…" : "Drop your resume here, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">PDF · DOCX · TXT · max 8 MB</p>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {(uploadError || error) && (
              <div className="mt-4">
                <ErrorState message={uploadError ?? error ?? ""} onRetry={() => setUploadError(null)} />
              </div>
            )}

            {parsed && (
              <div className="animate-fade-in mt-4 rounded-2xl bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{parsed.file.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="good">{parsed.file.method}</Badge>
                    <Badge tone="info">{parsed.file.words} words</Badge>
                    <Badge tone="neutral">{(parsed.file.size / 1024).toFixed(0)} KB</Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {parsed.profile.name ?? "Candidate"}
                  {parsed.profile.experienceYears ? ` · ~${parsed.profile.experienceYears} yrs experience` : ""}
                  {parsed.profile.projectTitles.length ? ` · ${parsed.profile.projectTitles.length} projects` : ""}
                  {parsed.profile.education.length ? ` · ${parsed.profile.education[0]}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {parsed.skills.slice(0, 18).map((skill) => (
                    <Badge key={skill.name} tone="cyan">
                      {skill.name}
                    </Badge>
                  ))}
                  {parsed.skills.length > 18 && <Badge>+{parsed.skills.length - 18} more</Badge>}
                </div>
                {parsed.file.warnings.map((warning) => (
                  <p key={warning} className="mt-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-200">
                    ⚠️ {warning}
                  </p>
                ))}
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-[var(--muted)] hover:text-white">
                Or paste your resume text manually
              </summary>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setParsed(null);
                }}
                rows={8}
                placeholder="Paste your resume text here (minimum 50 characters)…"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">{resumeText.length} characters</p>
            </details>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">2 · Paste a job description (optional)</h3>
              <button
                onClick={() =>
                  setJobDescription(
                    JOB_ROLES.find((r) => r.id === targetRole)?.defaultDescription ?? "",
                  )
                }
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-[var(--muted)] transition hover:text-white"
              >
                Load sample JD
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="e.g. We are looking for a Java Developer with experience in Java, Spring Boot, REST APIs, MySQL, Git, Docker and AWS. Knowledge of microservices is preferred."
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60"
            />
            <p className="mt-2 text-xs text-[var(--muted)]">
              {jobDescription.trim()
                ? "Requirements will be extracted from your pasted JD and merged with the role dataset."
                : "Leave empty to use the curated requirement set for the selected role."}
            </p>
          </Card>
        </div>

        {/* ------------------------------------------------------------ right */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-white">3 · Target job role</h3>
            <div className="mt-3 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {JOB_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setTargetRole(role.id)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    targetRole === role.id
                      ? "border-indigo-400/70 bg-indigo-500/15 text-white"
                      : "border-white/8 bg-white/[0.02] text-[var(--muted)] hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="block font-medium">{role.name}</span>
                  <span className="block text-[11px] opacity-70">{role.family}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-white">Learning pace</h3>
            <label className="mt-3 block text-xs text-[var(--muted)]">
              Hours per week you can study: <span className="text-white">{hoursPerWeek} h</span>
            </label>
            <input
              type="range"
              min={4}
              max={30}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-500"
            />

            <button
              onClick={() => setShowWeights((v) => !v)}
              className="mt-4 text-xs text-indigo-300 hover:text-indigo-200"
            >
              {showWeights ? "▾" : "▸"} Advanced: configure scoring weights
            </button>
            {showWeights && (
              <div className="animate-fade-in mt-3 space-y-3">
                {(
                  [
                    ["requiredSkills", "Required technical skills"],
                    ["experience", "Experience"],
                    ["projects", "Projects"],
                    ["preferredSkills", "Preferred skills"],
                    ["certifications", "Certifications"],
                    ["education", "Education"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[11px] text-[var(--muted)]">
                      <span>{label}</span>
                      <span className="text-white">{weights[key]}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      value={weights[key]}
                      onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))}
                      className="mt-1 w-full accent-indigo-500"
                    />
                  </div>
                ))}
                <p className={`text-[11px] ${weightTotal === 100 ? "text-emerald-300" : "text-amber-300"}`}>
                  Total weight: {weightTotal}% {weightTotal === 100 ? "(balanced)" : "(score is normalized per component)"}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <button
              onClick={analyze}
              disabled={loading || uploading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing…" : "Analyze Resume →"}
            </button>
            {stage && <p className="mt-3 animate-fade-in text-center text-xs text-indigo-300">{stage}</p>}
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
              The match score is an estimated compatibility indicator for learning guidance — not a hiring prediction.
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-white">No resume handy?</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">Run a full analysis on a sample profile.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_PROFILES.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => startDemo(demo.id)}
                  disabled={loading || demoPending !== null}
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-left text-xs transition hover:border-indigo-400/60 disabled:opacity-60"
                >
                  <span className="block font-medium text-white">{demo.label}</span>
                  <span className="block text-[11px] text-[var(--muted)]">
                    {demoPending === demo.id && loading ? "Analyzing…" : demo.name}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
