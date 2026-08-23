import { buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/match — job match score only (with the full component breakdown) */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    const ctx = buildContext(body);
    return Response.json({
      success: true,
      targetRole: ctx.role ? { id: ctx.role.id, name: ctx.role.name } : null,
      matchScore: ctx.match.matchScore,
      projectedScore: ctx.match.projectedScore,
      weights: ctx.match.weights,
      components: ctx.match.components,
      coverage: ctx.match.coverage,
      similarity: ctx.similarity,
      disclaimer:
        "Estimated compatibility score based on resume text and job requirements. Not a hiring decision or guarantee.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
