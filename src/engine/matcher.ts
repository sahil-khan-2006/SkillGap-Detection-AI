/**
 * SkillGap AI — Job matching engine.
 *
 * Score composition (weights are configurable — see DEFAULT_WEIGHTS):
 *   Required Technical Skills .... 50%
 *   Experience .................. 15%
 *   Projects .................... 15%
 *   Preferred Skills ............ 10%
 *   Certifications .............. 5%
 *   Education ................... 5%
 *
 * The "Required Technical Skills" component itself blends structured skill
 * coverage (75%) with TF-IDF cosine similarity between resume and JD (25%).
 * The result is an ESTIMATED compatibility score, never a hiring prediction.
 */

import type { JobRole, RoleSkill } from "@/data/jobRoles";
import type { ExtractedSkill } from "./skillExtractor";
import type { ResumeProfile } from "./resumeParser";
import { skillDefinition } from "./skillExtractor";

export type SkillStatus = "matched" | "partial" | "missing";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface SkillGapItem {
  name: string;
  category: string;
  status: SkillStatus;
  priority: Priority;
  /** 1..5 requirement importance for the target role */
  importance: number;
  /** 1..5 market demand */
  demand: number;
  /** 0..1 how confident the extractor is that the candidate has this skill */
  confidence: number;
  type: "required" | "preferred";
  reason: string;
  relatedEvidence: string[];
  hours: number;
  priorityScore: number;
}

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number;
  /** 0..1 achieved fraction */
  achieved: number;
  /** contribution in points */
  points: number;
  detail: string;
}

export interface MatchResult {
  matchScore: number;
  components: ScoreComponent[];
  weights: typeof DEFAULT_WEIGHTS;
  matched: SkillGapItem[];
  partial: SkillGapItem[];
  missing: SkillGapItem[];
  preferredMissing: SkillGapItem[];
  requiredMatched: SkillGapItem[];
  coverage: {
    requiredTotal: number;
    requiredCovered: number;
    preferredTotal: number;
    preferredCovered: number;
  };
  projectedScore: number;
}

export const DEFAULT_WEIGHTS = {
  requiredSkills: 50,
  experience: 15,
  projects: 15,
  preferredSkills: 10,
  certifications: 5,
  education: 5,
} as const;

/** Skills that partially cover a missing requirement (transferable evidence). */
const RELATED: Record<string, string[]> = {
  "Spring Boot": ["Java", "Hibernate", "REST API"],
  Hibernate: ["Java", "SQL", "Spring Boot"],
  "REST API": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot"],
  "System Design": ["Microservices", "Docker", "Kubernetes"],
  Kubernetes: ["Docker"],
  Docker: ["Kubernetes", "Linux", "CI/CD"],
  "CI/CD": ["Jenkins", "GitHub", "GitLab"],
  Terraform: ["AWS", "Azure", "Google Cloud", "Ansible"],
  Kubernetes_: [],
  React: ["JavaScript", "TypeScript"],
  "Next.js": ["React"],
  TypeScript: ["JavaScript"],
  Redux: ["React"],
  "Tailwind CSS": ["CSS"],
  "Spring Security": ["Spring Boot"],
  "Authentication & Authorization": ["Spring Boot", "Node.js", "JWT"],
  Pandas: ["Python", "NumPy"],
  "Scikit-learn": ["Python", "Machine Learning"],
  TensorFlow: ["Deep Learning", "Python"],
  PyTorch: ["Deep Learning", "Python"],
  "Deep Learning": ["Machine Learning", "Python"],
  MLOps: ["Docker", "Machine Learning", "CI/CD"],
  LLM: ["NLP", "Deep Learning"],
  NLP: ["Machine Learning", "Python"],
  "Data Visualization": ["Matplotlib", "Seaborn", "Excel"],
  Kafka: ["Microservices", "Message Queues"],
  "Message Queues": ["Kafka", "RabbitMQ"],
  Figma: ["UI Design", "Wireframing"],
  "Design Systems": ["Figma", "UI Design"],
  "Jetpack Compose": ["Kotlin", "Android"],
  Kotlin: ["Java", "Android"],
  FastAPI: ["Python", "Flask"],
  Django: ["Python"],
  Prometheus: ["Linux", "Docker"],
  AWS: ["Docker", "Cloud Fundamentals"],
  "Google Cloud": ["AWS", "Cloud Fundamentals"],
  Azure: ["AWS", "Cloud Fundamentals"],
  Maven: ["Java"],
  "Unit Testing": ["Java", "Python", "JavaScript"],
  "Data Structures": ["Java", "Python", "C++"],
  PostgreSQL: ["SQL", "MySQL"],
  MySQL: ["SQL"],
  Redis: ["Caching"],
};

function normalizeKey(name: string) {
  return name.toLowerCase().trim();
}

export function relatedFor(skill: string): string[] {
  return RELATED[skill] ?? [];
}

export function matchSkills(
  resumeSkills: ExtractedSkill[] | string[],
  required: RoleSkill[],
  preferred: RoleSkill[],
): { matched: SkillGapItem[]; partial: SkillGapItem[]; missing: SkillGapItem[]; preferredMissing: SkillGapItem[]; requiredMatched: SkillGapItem[] } {
  const extracted = Array.isArray(resumeSkills) && typeof resumeSkills[0] === "string"
    ? (resumeSkills as string[]).map((name) => ({
        id: name,
        name,
        category: skillDefinition(name)?.category ?? "Concepts",
        demand: skillDefinition(name)?.demand ?? 3,
        hours: skillDefinition(name)?.hours ?? 25,
        count: 1,
        matchedAliases: [name],
        evidence: [],
        confidence: 0.7,
      }))
    : (resumeSkills as ExtractedSkill[]);

  const resumeByName = new Map(extracted.map((s) => [normalizeKey(s.name), s]));

  const evaluate = (rs: RoleSkill, type: "required" | "preferred"): SkillGapItem => {
    const def = skillDefinition(rs.skill);
    const direct = resumeByName.get(normalizeKey(rs.skill));
    const relatedHits = relatedFor(rs.skill)
      .map((rel) => resumeByName.get(normalizeKey(rel)))
      .filter((x): x is ExtractedSkill => Boolean(x));

    let status: SkillStatus = "missing";
    let confidence = 0;
    let reason = "Not found anywhere in the resume text.";
    let evidence: string[] = [];

    if (direct && direct.confidence >= 0.5) {
      status = "matched";
      confidence = direct.confidence;
      reason = `Detected ${direct.count}× in the resume${direct.matchedAliases[0] !== direct.name ? ` (as "${direct.matchedAliases[0]}")` : ""}.`;
      evidence = direct.evidence;
    } else if (direct && direct.confidence < 0.5) {
      status = "partial";
      confidence = direct.confidence;
      reason = `Weak mention found ("${direct.matchedAliases.join("\", \"")}") — strengthen this in your skills section.`;
      evidence = direct.evidence;
    } else if (relatedHits.length) {
      status = "partial";
      confidence = Math.min(0.45, 0.2 + relatedHits.length * 0.1);
      reason = `Not named directly, but related experience found: ${relatedHits.map((r) => r.name).join(", ")}.`;
      evidence = relatedHits.flatMap((r) => r.evidence).slice(0, 2);
    }

    const demand = def?.demand ?? 3;
    const priorityScore = Number((rs.importance * 1.6 + demand * 1.0 + (type === "required" ? 2 : 0)).toFixed(2));
    const priority: Priority =
      type === "preferred" ? "LOW" : rs.importance >= 4 && demand >= 4 ? "HIGH" : rs.importance >= 3 ? "MEDIUM" : "LOW";

    return {
      name: rs.skill,
      category: def?.category ?? "Concepts",
      status,
      priority: status === "matched" ? priority : type === "preferred" ? "LOW" : priority,
      importance: rs.importance,
      demand,
      confidence: Number(confidence.toFixed(2)),
      type,
      reason,
      relatedEvidence: evidence,
      hours: def?.hours ?? 25,
      priorityScore,
    };
  };

  const requiredEvaluated = required.map((rs) => evaluate(rs, "required"));
  const preferredEvaluated = preferred.map((rs) => evaluate(rs, "preferred"));

  return {
    matched: requiredEvaluated.filter((i) => i.status === "matched"),
    partial: [...requiredEvaluated, ...preferredEvaluated].filter((i) => i.status === "partial"),
    missing: requiredEvaluated.filter((i) => i.status === "missing"),
    preferredMissing: preferredEvaluated.filter((i) => i.status === "missing" || i.status === "partial"),
    requiredMatched: requiredEvaluated,
  };
}

export interface MatcherInput {
  resumeSkills: ExtractedSkill[];
  required: RoleSkill[];
  preferred: RoleSkill[];
  profile: ResumeProfile;
  role: JobRole | null;
  similarity: number;
  weights?: Partial<typeof DEFAULT_WEIGHTS>;
}

export function computeMatch(input: MatcherInput): MatchResult {
  const weights = { ...DEFAULT_WEIGHTS, ...(input.weights ?? {}) };
  const groups = matchSkills(input.resumeSkills, input.required, input.preferred);
  const { profile, role, similarity } = input;

  // ---------------------------------------------------------- skill coverage
  const weightOf = (i: number) => i; // importance acts as the weight
  const requiredTotalWeight = groups.requiredMatched.reduce((sum, i) => sum + weightOf(i.importance), 0) || 1;
  const requiredEarned = groups.requiredMatched.reduce(
    (sum, i) => sum + (i.status === "matched" ? i.importance : i.status === "partial" ? i.importance * 0.45 : 0),
    0,
  );
  const requiredCoverage = requiredEarned / requiredTotalWeight;

  const preferredEvaluated = [...groups.preferredMissing];
  const preferredMatchedCount = preferredEvaluated.filter((i) => i.status === "matched").length;
  const preferredCoverage = preferredEvaluated.length ? preferredMatchedCount / preferredEvaluated.length : 0.5;
  const preferredMatched = preferredMatchedCount;

  const technicalAchieved = requiredCoverage * 0.75 + similarity * 0.25;

  // -------------------------------------------------------------- experience
  const targetYears = role?.minExperienceYears ?? 1;
  const rawYears = profile.experienceYears;
  const experienceAchieved = rawYears > 0
    ? Math.min(1, 0.35 + (rawYears / Math.max(targetYears, 1)) * 0.75)
    : 0.18; // freshers get partial credit through projects

  // ---------------------------------------------------------------- projects
  const projectCount = profile.projectTitles.length;
  const projectRelevance = projectCount
    ? Math.min(1, groups.matched.length / Math.max(3, Math.min(8, input.required.length * 0.4)))
    : 0;
  const projectAchieved = Math.min(1, Math.min(1, projectCount / 3) * 0.6 + projectRelevance * 0.4);

  // ---------------------------------------------------------- certifications
  const certs = profile.certifications;
  const certText = certs.join(" ").toLowerCase();
  const relevantCerts = [...groups.requiredMatched, ...preferredEvaluated]
    .filter((i) => i.status !== "matched")
    .filter((i) => certText.includes(i.name.toLowerCase().split(" ")[0])).length;
  const certAchieved = certs.length === 0 ? 0.15 : Math.min(1, 0.35 + certs.length * 0.2 + relevantCerts * 0.15);

  // --------------------------------------------------------------- education
  const hasEducation = profile.education.length > 0;
  const eduText = profile.education.join(" ").toLowerCase();
  const roleEducation = (role?.education ?? []).join(" ").toLowerCase();
  const eduRelevant = roleEducation
    ? /computer|information technology|software|engineering|statistics|mathematics|design|mca/i.test(eduText)
    : true;
  const educationAchieved = hasEducation ? (eduRelevant ? 1 : 0.6) : 0.1;

  const components: ScoreComponent[] = [
    {
      key: "requiredSkills",
      label: "Required Technical Skills",
      weight: weights.requiredSkills,
      achieved: Number(technicalAchieved.toFixed(4)),
      points: Number((technicalAchieved * weights.requiredSkills).toFixed(2)),
      detail: `${groups.matched.length} of ${groups.requiredMatched.length} required skills matched · skill coverage ${(requiredCoverage * 100).toFixed(0)}% · resume/JD similarity ${(similarity * 100).toFixed(0)}%`,
    },
    {
      key: "experience",
      label: "Experience",
      weight: weights.experience,
      achieved: Number(experienceAchieved.toFixed(4)),
      points: Number((experienceAchieved * weights.experience).toFixed(2)),
      detail:
        rawYears > 0
          ? `Detected ~${rawYears} year(s) of experience vs ${targetYears}+ expected for ${role?.name ?? "this role"}.`
          : "No explicit experience detected — internships and projects will carry the weight.",
    },
    {
      key: "projects",
      label: "Projects",
      weight: weights.projects,
      achieved: Number(projectAchieved.toFixed(4)),
      points: Number((projectAchieved * weights.projects).toFixed(2)),
      detail: `${projectCount} project(s) detected${projectCount ? `: ${profile.projectTitles.slice(0, 2).join("; ")}` : ""}`,
    },
    {
      key: "preferredSkills",
      label: "Preferred Skills",
      weight: weights.preferredSkills,
      achieved: Number(preferredCoverage.toFixed(4)),
      points: Number((preferredCoverage * weights.preferredSkills).toFixed(2)),
      detail: `${preferredMatched} of ${preferredEvaluated.length} preferred skills matched.`,
    },
    {
      key: "certifications",
      label: "Certifications",
      weight: weights.certifications,
      achieved: Number(certAchieved.toFixed(4)),
      points: Number((certAchieved * weights.certifications).toFixed(2)),
      detail: certs.length ? `${certs.length} certification(s) found.` : "No certifications section detected.",
    },
    {
      key: "education",
      label: "Education",
      weight: weights.education,
      achieved: Number(educationAchieved.toFixed(4)),
      points: Number((educationAchieved * weights.education).toFixed(2)),
      detail: hasEducation ? profile.education.slice(0, 2).join(" · ") : "No education details detected.",
    },
  ];

  const matchScore = Math.round(components.reduce((sum, c) => sum + c.points, 0));

  // ------------------------------------------------------- projected score
  // What the score would become if every HIGH + MEDIUM priority gap were closed.
  const closableWeight = groups.missing.reduce((sum, i) => (i.priority === "LOW" ? sum : sum + i.importance), 0);
  const projectedCoverage = Math.min(1, requiredCoverage + closableWeight / requiredTotalWeight);
  const projectedTechnical = projectedCoverage * 0.75 + Math.min(1, similarity * 1.15) * 0.25;
  const projectedScore = Math.round(
    (projectedTechnical * weights.requiredSkills + experienceAchieved * weights.experience + Math.min(1, projectAchieved + 0.2) * weights.projects + Math.min(1, preferredCoverage + 0.4) * weights.preferredSkills + certAchieved * weights.certifications + educationAchieved * weights.education),
  );

  return {
    matchScore: Math.max(0, Math.min(100, matchScore)),
    components,
    weights,
    matched: groups.matched,
    partial: groups.partial,
    missing: groups.missing.sort((a, b) => b.priorityScore - a.priorityScore),
    preferredMissing: groups.preferredMissing,
    requiredMatched: groups.requiredMatched,
    coverage: {
      requiredTotal: groups.requiredMatched.length,
      requiredCovered: groups.matched.length,
      preferredTotal: preferredEvaluated.length,
      preferredCovered: preferredMatched,
    },
    projectedScore: Math.max(0, Math.min(100, Math.max(projectedScore, matchScore))),
  };
}
