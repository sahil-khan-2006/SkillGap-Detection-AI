import { SKILLS, SKILL_CATEGORIES, ALIAS_MAP } from "@/data/skills";

export const dynamic = "force-dynamic";

/** GET /api/skills — the configurable skill taxonomy (used by the UI + tests) */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const items = category ? SKILLS.filter((s) => s.category.toLowerCase() === category.toLowerCase()) : SKILLS;

  return Response.json({
    count: items.length,
    categories: SKILL_CATEGORIES,
    aliasCount: ALIAS_MAP.length,
    skills: items.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      demand: s.demand,
      hours: s.hours,
      aliases: s.aliases,
      topics: s.topics,
      practice: s.practice,
    })),
  });
}
