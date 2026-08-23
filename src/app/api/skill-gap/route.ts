import { buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/skill-gap — matched / partial / missing + priority ranking */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    const ctx = buildContext(body);
    const { matched, partial, missing, preferredMissing } = ctx.match;

    const priorityRanking = [...missing, ...preferredMissing]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return Response.json({
      success: true,
      targetRole: ctx.role?.name ?? null,
      summary: {
        matched: matched.length,
        partial: partial.length,
        missing: missing.length,
        preferredMissing: preferredMissing.length,
        highPriority: priorityRanking.filter((p) => p.priority === "HIGH").length,
      },
      matched,
      partial,
      missing,
      preferredMissing,
      priorityRanking,
      similarity: ctx.similarity,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
