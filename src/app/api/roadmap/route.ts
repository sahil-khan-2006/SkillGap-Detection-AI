import { buildRoadmap } from "@/engine/roadmap";
import { buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/roadmap — personalized week-by-week learning roadmap */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    const ctx = buildContext(body);
    const gaps = [...ctx.match.missing, ...ctx.match.partial.filter((p) => p.type === "required"), ...ctx.match.preferredMissing];
    const roadmap = buildRoadmap(gaps, {
      hoursPerWeek: body.hoursPerWeek ?? 10,
      roleId: ctx.role?.id ?? null,
    });
    return Response.json({
      success: true,
      targetRole: ctx.role?.name ?? null,
      roadmap,
      disclaimer: "Learning plan estimates only. Timelines assume the configured hours per week and are not a guarantee of outcomes.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
