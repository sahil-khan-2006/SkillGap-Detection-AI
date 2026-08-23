/**
 * SkillGap AI — NLP skill extraction + normalization engine.
 *
 * Pipeline: raw text → alias dictionary match → canonical normalization →
 * evidence capture. Alias matching is longest-alias-first so "spring boot"
 * wins over "spring", and ambiguous short aliases ("C", "R", "Go", "AI", "ML")
 * use context-aware, case-sensitive patterns to avoid false positives.
 */

import { ALIAS_MAP, SKILL_BY_NAME, SKILLS, type SkillCategory, type SkillDefinition } from "@/data/skills";
import { cleanText, escapeRegex, snippet } from "./preprocessing";

export interface ExtractedSkill {
  id: string;
  name: string;
  category: SkillCategory;
  demand: number;
  hours: number;
  /** how many times the skill (in any surface form) appeared */
  count: number;
  /** surface forms that matched */
  matchedAliases: string[];
  /** short text snippets as evidence */
  evidence: string[];
  /** 0..1 confidence based on alias specificity and frequency */
  confidence: number;
}

/** Aliases that are too generic to match case-insensitively without context. */
const AMBIGUOUS = new Set(["c", "r", "go", "ai", "ml", "js", "ts", "ps", "bi", "os", "cd", "sh", "vue"]);

/** Extra strict patterns for ambiguous aliases (case sensitive). */
const STRICT_PATTERNS: Record<string, RegExp> = {
  c: /\bC\b(?=\s*(?:,|;|\/|\)|\||\n|programming|language|and\b|or\b|\+\+|#))|(?<=[,;(\/|\n]\s?)\bC\b(?=\s*(?:,|;|\/|\)|\||\n))|\bC\s*\+{2}\b/g,
  r: /\bR\b(?=\s*(?:,|;|\/|\)|\||\n|programming|language|studio|shiny))|(?<=[,;(\/|\n]\s?)\bR\b(?=\s*(?:,|;|\/|\)|\||\n))/g,
  go: /\bGo(?:lang)?\b(?=\s*(?:,|;|\/|\)|\||\n|lang|language|routine|routines|microservice|services|service))|(?<=[,;(\/|\n]\s?)\bGo\b(?=\s*(?:,|;|\/|\)|\||\n))|\bGolang\b/g,
  ai: /\bAI\b(?!\s*(?:powered|-driven)\s+(?:tool|tools))/g,
  ml: /\bML\b/g,
  js: /\bJS\b/g,
  ts: /\bTS\b/g,
  vue: /\bVue(?:\.js|js)?\b/g,
  sh: /\bSH\b/g,
};

/** Build one matcher per alias (longest first). */
interface AliasMatcher {
  alias: string;
  canonical: string;
  regex: RegExp;
  ambiguous: boolean;
}

const MATCHERS: AliasMatcher[] = ALIAS_MAP.map(({ alias, canonical }) => {
  const strict = STRICT_PATTERNS[alias];
  if (strict) return { alias, canonical, regex: strict, ambiguous: true };
  const escaped = escapeRegex(alias).replace(/\s+/g, "[\\s\\-_]+");
  // Left/right boundaries: allow non-word neighbours for symbols (.net, c++, node.js)
  const left = /^[a-z0-9]/i.test(alias) ? "\\b" : "";
  const right = /[a-z0-9]$/i.test(alias) ? "\\b" : "";
  const flags = AMBIGUOUS.has(alias) ? "g" : "gi";
  return {
    alias,
    canonical,
    regex: new RegExp(`${left}${escaped}${right}`, flags),
    ambiguous: AMBIGUOUS.has(alias),
  };
});

/** Sections of a resume/JD that carry more weight when scoring confidence. */
const KEY_SECTIONS = /(skills|technical skills|tech stack|technologies|tools|requirements|qualifications|must have|experience with)/i;

export function extractSkills(rawText: string): ExtractedSkill[] {
  const text = rawText ?? "";
  if (!text.trim()) return [];

  const normalizedText = cleanText(text);
  const buckets = new Map<string, ExtractedSkill & { matches: Array<{ alias: string; index: number }> }>();

  for (const matcher of MATCHERS) {
    const regex = new RegExp(matcher.regex.source, matcher.regex.flags);
    let match: RegExpExecArray | null;
    let guard = 0;
    while ((match = regex.exec(normalizedText)) !== null && guard++ < 400) {
      if (match[0].length === 0) {
        regex.lastIndex++;
        continue;
      }
      const canonical = matcher.canonical;
      const def = SKILL_BY_NAME.get(canonical.toLowerCase());
      if (!def) continue;
      const key = def.id;
      if (!buckets.has(key)) {
        buckets.set(key, {
          id: def.id,
          name: def.name,
          category: def.category,
          demand: def.demand,
          hours: def.hours,
          count: 0,
          matchedAliases: [],
          evidence: [],
          confidence: 0,
          matches: [],
        });
      }
      const bucket = buckets.get(key)!;
      bucket.count += 1;
      bucket.matches.push({ alias: match[0], index: match.index });
      if (!bucket.matchedAliases.includes(match[0])) bucket.matchedAliases.push(match[0]);
    }
  }

  const results = [...buckets.values()].map((bucket) => {
    const def = SKILL_BY_NAME.get(bucket.name.toLowerCase())!;
    const bestAliasLength = Math.max(...bucket.matchedAliases.map((a) => a.length));
    const frequencyBoost = Math.min(bucket.count, 5) / 5;
    const specificity = Math.min(bestAliasLength / Math.max(def.name.length, 4), 1);
    let confidence = 0.45 + 0.3 * specificity + 0.25 * frequencyBoost;

    // Boost if the skill appears inside a dedicated skills/requirements section
    const inKeySection = bucket.matches.some((m) => {
      const window = normalizedText.slice(Math.max(0, m.index - 120), m.index);
      return KEY_SECTIONS.test(window);
    });
    if (inKeySection) confidence += 0.05;

    // Evidence snippets (max 2, deduped)
    const seen = new Set<string>();
    for (const m of bucket.matches.slice(0, 4)) {
      const s = snippet(normalizedText, m.alias, 60);
      if (s && !seen.has(s)) {
        seen.add(s);
        bucket.evidence.push(s);
      }
      if (bucket.evidence.length === 2) break;
    }

    return {
      id: bucket.id,
      name: bucket.name,
      category: bucket.category,
      demand: bucket.demand,
      hours: bucket.hours,
      count: bucket.count,
      matchedAliases: bucket.matchedAliases,
      evidence: bucket.evidence,
      confidence: Math.max(0.3, Math.min(0.99, Number(confidence.toFixed(2)))),
    } satisfies ExtractedSkill;
  });

  return results.sort((a, b) => b.confidence - a.confidence || b.count - a.count);
}

/** Convenience: canonical names only. */
export function extractSkillNames(text: string): string[] {
  return extractSkills(text).map((s) => s.name);
}

export function skillDefinition(name: string): SkillDefinition | undefined {
  return SKILL_BY_NAME.get(name.toLowerCase());
}

export const ALL_SKILLS = SKILLS;

export function skillsByCategory(skills: ExtractedSkill[]): Array<{ category: SkillCategory; total: number; items: ExtractedSkill[] }> {
  const map = new Map<SkillCategory, ExtractedSkill[]>();
  for (const skill of skills) {
    const list = map.get(skill.category) ?? [];
    list.push(skill);
    map.set(skill.category, list);
  }
  return [...map.entries()]
    .map(([category, items]) => ({ category, total: items.length, items }))
    .sort((a, b) => b.total - a.total);
}
