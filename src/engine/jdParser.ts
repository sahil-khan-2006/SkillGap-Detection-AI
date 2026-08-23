/**
 * SkillGap AI — Job description analysis.
 * Splits a pasted JD into REQUIRED and PREFERRED skills using lexical cues,
 * then enriches each with an importance weight (1..5).
 */

import { findRole, JOB_ROLES, type JobRole, type RoleSkill } from "@/data/jobRoles";
import { sentences } from "./preprocessing";
import { extractSkills } from "./skillExtractor";

export interface ParsedJobDescription {
  source: "dataset" | "pasted" | "dataset+pasted";
  requiredSkills: RoleSkill[];
  preferredSkills: RoleSkill[];
  allSkills: string[];
  rawSkillMentions: string[];
  requirementSentences: string[];
  preferredSentences: string[];
  detectedRole: JobRole | null;
  detectedRoleConfidence: number;
}

const PREFERRED_CUES = /(preferred|nice to have|good to have|a plus|bonus|advantage|optional|desirable|would be|is a plus|ideally)/i;
const REQUIRED_CUES = /(required|must have|must-have|mandatory|responsibilit|qualification|you will need|we are looking for|requirements|skills|experience with|proficien)/i;
const SECTION_SPLIT = /(preferred|nice to have|good to have|bonus|plus):?/i;

function importanceForMention(skill: string, sentence: string, orderIndex: number, total: number): number {
  const strong = /(expert|advanced|strong|deep|proficient|extensive|5\+|4\+)/i.test(sentence);
  const weak = /(basic|familiarity|working knowledge|exposure|awareness)/i.test(sentence);
  const early = orderIndex < Math.max(2, total * 0.3) ? 1 : 0; // mentioned early => core
  let score = 3 + early + (strong ? 1 : 0) - (weak ? 2 : 0);
  if (/required|must have|mandatory/i.test(sentence)) score += 1;
  void skill;
  return Math.max(1, Math.min(5, score));
}

export function parseJobDescription(
  jdText: string | undefined | null,
  roleIdOrName?: string | null,
  options: { mergeDatasetSkills?: boolean } = {},
): ParsedJobDescription {
  const role = findRole(roleIdOrName) ?? null;
  const mergeDatasetSkills = options.mergeDatasetSkills ?? true;
  const pasted = (jdText ?? "").trim();

  const requiredMap = new Map<string, RoleSkill>();
  const preferredMap = new Map<string, RoleSkill>();

  const bump = (map: Map<string, RoleSkill>, skill: string, importance: number) => {
    const existing = map.get(skill);
    if (existing) existing.importance = Math.max(existing.importance, importance);
    else map.set(skill, { skill, importance });
  };

  // 1) Always start from the curated role dataset (configurable, editable).
  if (role && mergeDatasetSkills) {
    for (const rs of role.required) bump(requiredMap, rs.skill, rs.importance);
    for (const rs of role.preferred) bump(preferredMap, rs.skill, rs.importance);
  }

  // 2) Parse the pasted JD.
  let requirementSentences: string[] = [];
  let preferredSentences: string[] = [];
  let rawMentions: string[] = [];

  if (pasted.length > 0) {
    const parts = pasted.split(SECTION_SPLIT);
    const head = parts[0];
    const tail = parts.slice(1).join(" ");
    const headSentences = sentences(head);
    const tailSentences = tail ? sentences(tail) : [];

    headSentences.forEach((sentence, index) => {
      const isRequiredCue = REQUIRED_CUES.test(sentence);
      const isPreferredCue = PREFERRED_CUES.test(sentence);
      const found = extractSkills(sentence);
      if (!found.length) return;
      for (const skill of found) {
        rawMentions.push(skill.name);
        const importance = importanceForMention(skill.name, sentence, index, headSentences.length);
        if (isPreferredCue && !isRequiredCue) bump(preferredMap, skill.name, Math.max(2, importance - 1));
        else bump(requiredMap, skill.name, importance);
      }
    });

    tailSentences.forEach((sentence, index) => {
      const found = extractSkills(sentence);
      if (!found.length) return;
      for (const skill of found) {
        rawMentions.push(skill.name);
        bump(preferredMap, skill.name, importanceForMention(skill.name, sentence, index, tailSentences.length));
      }
    });

    requirementSentences = headSentences.filter((s) => extractSkills(s).length > 0).slice(0, 12);
    preferredSentences = tailSentences.filter((s) => extractSkills(s).length > 0).slice(0, 12);
  }

  // If a skill is in the dataset `preferred` list, it stays preferred.
  for (const [skill] of preferredMap) requiredMap.delete(skill);

  const requiredSkills = [...requiredMap.values()].sort((a, b) => b.importance - a.importance);
  const preferredSkills = [...preferredMap.values()].sort((a, b) => b.importance - a.importance);

  let detectedRole = role;
  let detectedRoleConfidence = role ? 0.9 : 0;
  if (!role && pasted) {
    const candidates = new Map<string, number>();
    for (const mention of rawMentions) {
      for (const candidate of findRolesForSkill(mention)) {
        candidates.set(candidate, (candidates.get(candidate) ?? 0) + 1);
      }
    }
    const best = [...candidates.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best) {
      detectedRole = findRole(best[0]) ?? null;
      detectedRoleConfidence = Math.min(0.85, 0.35 + best[1] * 0.12);
    }
  }

  return {
    source: role && pasted ? "dataset+pasted" : role ? "dataset" : "pasted",
    requiredSkills,
    preferredSkills,
    allSkills: [...requiredSkills, ...preferredSkills].map((s) => s.skill),
    rawSkillMentions: [...new Set(rawMentions)],
    requirementSentences,
    preferredSentences,
    detectedRole,
    detectedRoleConfidence,
  };
}

function findRolesForSkill(skill: string): string[] {
  const out: string[] = [];
  for (const role of JOB_ROLES) {
    const all = [...role.required, ...role.preferred];
    const hit = all.find((rs) => rs.skill.toLowerCase() === skill.toLowerCase());
    if (hit && hit.importance >= 4) out.push(role.id);
  }
  return out;
}
