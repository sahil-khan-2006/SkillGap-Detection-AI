import { predictJobCategory } from "@/ml/classifier";
import { getModel } from "@/ml/modelStore";
import { recommendCareers } from "@/engine/recommender";
import { buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/career-recommendations
 * Blends the ML classifier probability with structured skill coverage per role.
 */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    const ctx = buildContext(body);
    const artifact = await getModel();
    const predictions = ctx.resumeText ? predictJobCategory(artifact, ctx.resumeText, 14) : [];
    const careers = recommendCareers(ctx.skills, ctx.resumeText, predictions, ctx.role?.id ?? null, 6);

    return Response.json({
      success: true,
      ml: {
        algorithm: artifact.algorithm,
        topPrediction: predictions[0]?.label ?? null,
        predictions,
      },
      careers,
      methodology:
        "Score = 0.68 × required-skill coverage + 0.32 × normalized ML (TF-IDF + logistic regression / Naive Bayes) probability.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
