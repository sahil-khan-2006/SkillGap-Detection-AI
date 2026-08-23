import { modelSummary } from "@/ml/classifier";
import { getModel } from "@/ml/modelStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ml/metrics — real evaluation metrics computed on the hold-out split */
export async function GET() {
  try {
    const artifact = await getModel();
    return Response.json({ success: true, model: modelSummary(artifact) });
  } catch (error) {
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
