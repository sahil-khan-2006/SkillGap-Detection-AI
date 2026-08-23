import { PROJECTS } from "@/data/projects";
import { recommendProjects } from "@/engine/recommender";
import { buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/projects — project recommendations driven by the learner's skill gaps */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    const ctx = buildContext(body);
    const gaps = [...ctx.match.missing.map((m) => m.name), ...ctx.match.preferredMissing.map((m) => m.name)];
    const projects = recommendProjects(gaps, ctx.role, ctx.profile.experienceYears, Number(body.hoursPerWeek ? 8 : 5));
    return Response.json({
      success: true,
      targetRole: ctx.role?.name ?? null,
      basedOnGaps: gaps,
      count: projects.length,
      projects,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/** GET /api/projects — full catalog */
export async function GET() {
  return Response.json({ count: PROJECTS.length, projects: PROJECTS });
}
