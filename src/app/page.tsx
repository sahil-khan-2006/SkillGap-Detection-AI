import Link from "next/link";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { DemoLauncher, MlMetricsStrip } from "@/components/DemoLauncher";
import { JOB_ROLES } from "@/data/jobRoles";
import { SKILLS } from "@/data/skills";

const STEPS = [
  { n: "01", title: "Upload your resume", body: "PDF, DOCX or TXT. Parsed locally in memory — never stored permanently." },
  { n: "02", title: "Pick a target role", body: "Choose from 14 curated roles or paste a real job description for exact requirements." },
  { n: "03", title: "NLP skill extraction", body: "A 150+ alias dictionary normalizes JS → JavaScript, Postgres → PostgreSQL and avoids false positives." },
  { n: "04", title: "Match, gap, roadmap", body: "Weighted scoring, priority ranking, a week-by-week plan and 5 tailored projects." },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "Real ML classifier",
    body: "TF-IDF features feed a multinomial logistic regression / Naive Bayes model trained on a labeled resume dataset; the better model is auto-selected on a hold-out split.",
  },
  {
    icon: "🔍",
    title: "Skill normalization",
    body: "Configurable alias dictionary with context-aware matching so the letter “C” alone never becomes a programming language.",
  },
  {
    icon: "📐",
    title: "Explainable scoring",
    body: "Six weighted components — required skills 50%, experience 15%, projects 15%, preferred skills 10%, certifications 5%, education 5%. All configurable.",
  },
  {
    icon: "📈",
    title: "TF-IDF cosine similarity",
    body: "Resume and job description share one vector space; overlap and missing terms are surfaced as evidence.",
  },
  {
    icon: "🗺️",
    title: "Learning roadmap",
    body: "Weekly plan with topics, practice tasks, estimated hours and a suggested project for every skill gap.",
  },
  {
    icon: "🧪",
    title: "Project & career engine",
    body: "Projects are ranked by how many of your gaps they close; careers blend ML probability with structured skill coverage.",
  },
];

const FAQS = [
  {
    q: "Does the score guarantee I'll get the job?",
    a: "No. It is an estimated compatibility score computed from your resume text and the stated job requirements. Recruiters evaluate much more than keyword overlap.",
  },
  {
    q: "Is my resume uploaded anywhere?",
    a: "The file is parsed in memory on the server to extract text and is not written to disk or stored permanently. Only the derived analysis (skills, scores) is saved for your history.",
  },
  {
    q: "Do you use OpenAI or any paid API?",
    a: "No. Everything runs on local/open-source NLP and ML implemented in the project itself — no external AI API keys are required.",
  },
  {
    q: "Can I add my own job roles and skills?",
    a: "Yes. Roles live in src/data/jobRoles.ts and the taxonomy (with aliases, demand and learning hours) in src/data/skills.ts. The engine reads both at runtime.",
  },
  {
    q: "What if my PDF is a scan?",
    a: "Image-only PDFs have no text layer. The parser detects this and tells you clearly instead of silently returning an empty analysis — re-export as a text PDF or paste your resume text.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-20">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <Badge tone="info">Local ML · No paid APIs · No resume storage</Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Know Your Skill Gap.
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              AI-powered resume analysis that tells you what you know, what you&apos;re missing, and exactly what to
              learn next — with a match score, skill gap, learning roadmap and project plan for your target role.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/analyze"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:brightness-110"
              >
                Analyze My Resume →
              </Link>
              <Link
                href="#demo"
                className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Try Demo
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { k: `${JOB_ROLES.length}`, v: "target job roles" },
                { k: `${SKILLS.length}`, v: "skills in taxonomy" },
                { k: "6", v: "scoring components" },
              ].map((stat) => (
                <div key={stat.v}>
                  <dt className="text-2xl font-semibold text-white">{stat.k}</dt>
                  <dd className="text-xs text-[var(--muted)]">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-in">
            <Card className="relative overflow-hidden" hover>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-300/80">Sample analysis</p>
                <Badge tone="good">Java Developer</Badge>
              </div>
              <div className="mt-5 flex items-center gap-6">
                <div className="relative h-28 w-28">
                  <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="url(#heroGradient)"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray="327"
                      strokeDashoffset="98"
                    />
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-2xl font-semibold text-white">70%</div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-emerald-300">✓ Matched: Java, SQL, Git, MySQL</p>
                  <p className="text-rose-300">✗ Missing: Spring Boot, Docker, AWS</p>
                  <p className="text-amber-300">~ Partial: REST API, Hibernate</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  { label: "Required technical skills", value: 62, tone: "bg-indigo-400" },
                  { label: "Experience", value: 55, tone: "bg-cyan-400" },
                  { label: "Projects", value: 70, tone: "bg-emerald-400" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[11px] text-[var(--muted)]">
                      <span>{row.label}</span>
                      <span>{row.value}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/8">
                      <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- how it works */}
      <section id="how-it-works">
        <SectionTitle
          eyebrow="How it works"
          title="From resume upload to a weekly learning plan"
          subtitle="A transparent ML/NLP pipeline — every number on the dashboard is computed, not hardcoded."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <Card key={step.n} hover>
              <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300/80">{step.n}</p>
              <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ features */}
      <section id="features">
        <SectionTitle eyebrow="Features" title="Built like a real product, not a demo script" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} hover>
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- model */}
      <section id="model">
        <SectionTitle
          eyebrow="Machine learning"
          title="The classifier is trained and evaluated at runtime"
          subtitle="Every metric below is computed from the hold-out split of the bundled dataset — nothing is hardcoded."
        />
        <MlMetricsStrip />
      </section>

      {/* ---------------------------------------------------------------- demo */}
      <section id="demo">
        <SectionTitle
          eyebrow="Demo mode"
          title="Try it instantly — no upload required"
          subtitle="Each demo profile runs the complete pipeline: parsing, extraction, matching, roadmap, projects and career ranking."
        />
        <DemoLauncher />
      </section>

      {/* ----------------------------------------------------------------- faq */}
      <section id="faq">
        <SectionTitle eyebrow="FAQ" title="Frequently asked questions" />
        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((faq) => (
            <Card key={faq.q}>
              <h3 className="text-sm font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="bg-gradient-to-br from-indigo-600/25 via-violet-600/15 to-cyan-500/10 text-center" hover>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Discover the gap. Learn the skill. Build the career.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted)]">
            Upload your resume, pick a target role and get your personalized analysis in under a second.
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Analyze My Resume
          </Link>
        </Card>
      </section>
    </div>
  );
}
