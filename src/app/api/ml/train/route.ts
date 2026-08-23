import { modelSummary } from "@/ml/classifier";
import { retrainModel } from "@/ml/modelStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/ml/train — retrain the job-category classifier from the dataset.
 * Equivalent to running `python ml/train.py`.
 */
export async function POST() {
  try {
    const started = Date.now();
    const artifact = await retrainModel();
    return Response.json({
      success: true,
      trainingMs: Date.now() - started,
      model: modelSummary(artifact),
    });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
