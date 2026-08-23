import { loadAnalysis, saveSkillProgress } from "@/engine/analyze";
import { errorResponse, readJson } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/analyses/:id — fetch a stored analysis */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const analysis = await loadAnalysis(id);
    if (!analysis) return Response.json({ error: "Analysis not found.", code: "not_found" }, { status: 404 });
    return Response.json({ success: true, analysis });
  } catch (error) {
    return errorResponse(error);
  }
}

/** PATCH /api/analyses/:id — track skill progress (learning | practicing | completed) */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await readJson<{ skillName: string; status: string }>(request);
    const allowed = ["learning", "practicing", "completed"];
    if (!body.skillName || !allowed.includes(body.status)) {
      return Response.json(
        { error: "`skillName` and a valid `status` (learning | practicing | completed) are required.", code: "bad_request" },
        { status: 400 },
      );
    }
    await saveSkillProgress(id, body.skillName, body.status);
    return Response.json({ success: true, analysisId: id, skillName: body.skillName, status: body.status });
  } catch (error) {
    return errorResponse(error);
  }
}
