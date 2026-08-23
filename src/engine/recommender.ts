/**
 * SkillGap AI — Recommendation engine.
 *  · Project recommendations scored against the learner's missing skills + role
 *  · Career recommendations blending skill coverage with the ML classifier
 */

import { JOB_ROLES, type JobRole } from "@/data/jobRoles";
import { PROJECTS, type ProjectRecommendation } from "@/data/projects";
import type { Prediction } from "@/ml/classifier";
import { matchSkills } from "./matcher";
import type { ExtractedSkill } from "./skillExtractor";

export interface ScoredProject extends ProjectRecommendation {
  score: number;
  matchedGaps: string[];
  coverageOfGaps: number;
  reason: string;
}

export function recommendProjects(
  missingSkills: string[],
  role: JobRole | null,
  experienceYears: number,
  limit = 5,
): ScoredProject[] {
  const gaps = new Set(missingSkills.map((s) => s.toLowerCase()));
  if (!gaps.size) {
    return PROJECTS.filter((p) => (role ? p.roles.includes(role.id) : true))
      .slice(0, limit)
      .map((p) => ({
        ...p,
        score: 1,
        matchedGaps: [],
        coverageOfGaps: 0,
        reason: "You already cover the core stack — deepen your portfolio with an advanced build in this area.",
      }));
  }

  const preferredDifficulty: ProjectRecommendation["difficulty"] =
    experienceYears >= 4 ? "Advanced" : experienceYears >= 1.5 ? "Intermediate" : "Beginner";

  const scored = PROJECTS.map((project) => {
    const matchedGaps = project.skillsLearned.filter((s) => gaps.has(s.toLowerCase()));
    const coverageOfGaps = matchedGaps.length / gaps.size;
    const roleBoost = role && project.roles.includes(role.id) ? 1 : 0;
    const difficultyBoost = project.difficulty === preferredDifficulty ? 0.35 : 0;
    const highValueBoost = project.skillsLearned.filter((s) =>
      [...gaps].some((g) => g === s.toLowerCase()),
    ).length;
    const score = matchedGaps.length * 1.2 + coverageOfGaps * 3 + roleBoost * 1.5 + difficultyBoost + highValueBoost * 0.1;
    const reason = matchedGaps.length
      ? `Closes ${matchedGaps.length} gap(s): ${matchedGaps.slice(0, 4).join(", ")}${roleBoost ? ` · core project for ${role?.name}` : ""}.`
      : `Strong portfolio depth for ${role?.name ?? "your target role"} — builds credibility beyond the checklist.`;
    return { ...project, score: Number(score.toFixed(3)), matchedGaps, coverageOfGaps: Number(coverageOfGaps.toFixed(3)), reason };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export interface CareerMatch {
  roleId: string;
  role: string;
  family: string;
  score: number;
  skillCoverage: number;
  mlProbability: number;
  matchedSkills: string[];
  topGaps: string[];
  summary: string;
}

export function recommendCareers(
  resumeSkills: ExtractedSkill[],
  resumeText: string,
  predictions: Prediction[],
  excludeRoleId?: string | null,
  limit = 6,
): CareerMatch[] {
  const mlByRole = new Map(predictions.map((p) => [p.label.toLowerCase(), p.probability]));
  const maxProb = Math.max(...predictions.map((p) => p.probability), 1e-6);

  const results = JOB_ROLES.map((role) => {
    const groups = matchSkills(resumeSkills, role.required, role.preferred);
    const requiredTotal = groups.requiredMatched.length || 1;
    const earned = groups.requiredMatched.reduce(
      (sum, i) => sum + (i.status === "matched" ? 1 : i.status === "partial" ? 0.45 : 0),
      0,
    );
    const skillCoverage = earned / requiredTotal;
    const mlProbability = mlByRole.get(role.name.toLowerCase()) ?? 0;
    const mlNormalized = mlProbability / maxProb;
    const score = Math.round((skillCoverage * 0.68 + mlNormalized * 0.32) * 100);
    const matchedSkills = groups.matched.map((m) => m.name);
    const topGaps = groups.missing
      .slice()
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 4)
      .map((m) => m.name);

    return {
      roleId: role.id,
      role: role.name,
      family: role.family,
      score: Math.max(1, Math.min(99, score)),
      skillCoverage: Number((skillCoverage * 100).toFixed(1)),
      mlProbability: Number((mlProbability * 100).toFixed(1)),
      matchedSkills,
      topGaps,
      summary: role.summary,
    } satisfies CareerMatch;
  }).filter((r) => r.roleId !== excludeRoleId);

  void resumeText;
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
