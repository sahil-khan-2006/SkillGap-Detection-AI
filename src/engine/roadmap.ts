/**
 * SkillGap AI — Personalized learning roadmap generator.
 * Turns ranked skill gaps into a week-by-week plan with topics, practice tasks
 * and a suggested project. Durations are derived from the skill learning hours
 * in the skill knowledge base (≈10 focused hours per week).
 */

import { SKILL_TOPICS, SKILL_PRACTICE } from "@/data/skills";
import { PROJECTS } from "@/data/projects";
import { skillDefinition } from "./skillExtractor";
import type { SkillGapItem } from "./matcher";

export const DEFAULT_HOURS_PER_WEEK = 10;

export interface RoadmapStep {
  week: number;
  weekLabel: string;
  skill: string;
  category: string;
  priority: SkillGapItem["priority"];
  type: "required" | "preferred";
  estimatedHours: number;
  topics: string[];
  practiceTask: string;
  suggestedProject: string;
  resourceHint: string;
}

export interface RoadmapPhase {
  phase: string;
  goal: string;
  weeks: [number, number];
  steps: RoadmapStep[];
}

export interface LearningRoadmap {
  weeks: RoadmapStep[];
  phases: RoadmapPhase[];
  totalWeeks: number;
  totalHours: number;
  hoursPerWeek: number;
  finalProject: string;
  note: string;
}

function weeksFor(hours: number, hoursPerWeek: number) {
  const raw = Math.ceil(hours / hoursPerWeek);
  return Math.max(1, Math.min(3, raw));
}

function projectForSkill(skill: string, roleId?: string | null): string {
  const candidates = PROJECTS.filter((p) => p.skillsLearned.some((s) => s.toLowerCase() === skill.toLowerCase()));
  if (!candidates.length) return "Capstone: integrate this skill into your existing flagship project.";
  const roleMatch = candidates.find((p) => roleId && p.roles.includes(roleId));
  return (roleMatch ?? candidates[0]).title;
}

function resourceHint(skill: string, category: string): string {
  const byCategory: Record<string, string> = {
    "Programming Languages": "Official language documentation + 30 coding exercises",
    Frameworks: "Official framework guide + build one feature end-to-end",
    Databases: "Hands-on with a sample dataset + query drills",
    Tools: "Official docs + apply the tool inside an existing project",
    Cloud: "Free-tier hands-on labs + architecture diagrams",
    "Data & ML": "Notebook-based practice on a public dataset",
    Concepts: "Textbook/blog deep dive + draw the architecture yourself",
    Mobile: "Official codelabs + build a screen per day",
    Design: "Case studies + a critique of an existing product",
    Practices: "Team workflow simulation + retrospective notes",
  };
  return byCategory[category] ?? `Self-paced study plan for ${skill}`;
}

export function buildRoadmap(
  gaps: SkillGapItem[],
  options: { hoursPerWeek?: number; roleId?: string | null; maxSkills?: number } = {},
): LearningRoadmap {
  const hoursPerWeek = options.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;
  const maxSkills = options.maxSkills ?? 8;

  const ordered = [...gaps].sort((a, b) => {
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    if (a.type !== b.type) return a.type === "required" ? -1 : 1;
    if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
    return b.priorityScore - a.priorityScore;
  });

  const selected = ordered.slice(0, maxSkills);
  const weeks: RoadmapStep[] = [];
  let cursor = 1;

  for (const gap of selected) {
    const def = skillDefinition(gap.name);
    const hours = def?.hours ?? gap.hours;
    const span = weeksFor(hours, hoursPerWeek);
    const topics = (def?.topics ?? SKILL_TOPICS[gap.name] ?? []).slice(0, span * 2);
    const practiceTask = def?.practice ?? SKILL_PRACTICE[gap.name] ?? `Ship one small deliverable using ${gap.name}.`;
    const chunkedTopics = topics.length ? topics : [`${gap.name} fundamentals`, `${gap.name} applied practice`];

    for (let w = 0; w < span; w++) {
      const from = w * 2;
      weeks.push({
        week: cursor,
        weekLabel: `Week ${cursor}`,
        skill: gap.name,
        category: gap.category,
        priority: gap.priority,
        type: gap.type,
        estimatedHours: Math.round(hours / span),
        topics: chunkedTopics.slice(from, from + 2).length ? chunkedTopics.slice(from, from + 2) : chunkedTopics,
        practiceTask: w === span - 1 ? practiceTask : `${gap.name}: guided exercises and notes`,
        suggestedProject: w === span - 1 ? projectForSkill(gap.name, options.roleId) : "—",
        resourceHint: resourceHint(gap.name, gap.category),
      });
      cursor += 1;
    }
  }

  // Final capstone week
  const capstone = PROJECTS.find((p) => options.roleId && p.roles.includes(options.roleId)) ?? PROJECTS[0];
  if (weeks.length) {
    weeks.push({
      week: cursor,
      weekLabel: `Week ${cursor}`,
      skill: "Capstone Project",
      category: "Practices",
      priority: "HIGH",
      type: "required",
      estimatedHours: hoursPerWeek * 2,
      topics: [
        "Combine every skill learned in this roadmap",
        "Write a README with architecture and setup steps",
        "Deploy it and add the demo link to your resume",
      ],
      practiceTask: `Ship "${capstone.title}" end to end and publish it on GitHub.`,
      suggestedProject: capstone.title,
      resourceHint: "Your own project repository + deployment free tier",
    });
  }

  const cut1 = Math.max(1, Math.ceil(weeks.length / 3));
  const cut2 = Math.max(cut1, Math.ceil((weeks.length * 2) / 3));
  const allPhases: RoadmapPhase[] = [
    { phase: "Foundation", goal: "Close the highest-priority must-have gaps", weeks: [1, cut1], steps: weeks.slice(0, cut1) },
    { phase: "Depth", goal: "Strengthen supporting and medium-priority skills", weeks: [cut1 + 1, cut2], steps: weeks.slice(cut1, cut2) },
    { phase: "Polish & Ship", goal: "Differentiators, capstone and portfolio polish", weeks: [cut2 + 1, weeks.length], steps: weeks.slice(cut2) },
  ];
  const phases = allPhases.filter((p) => p.steps.length > 0);

  return {
    weeks,
    phases,
    totalWeeks: weeks.length,
    totalHours: weeks.reduce((sum, w) => sum + w.estimatedHours, 0),
    hoursPerWeek,
    finalProject: capstone?.title ?? "Capstone project",
    note:
      "Estimated timelines based on the configured hours-per-week. This is a learning plan, not a promise of placement or certification.",
  };
}
