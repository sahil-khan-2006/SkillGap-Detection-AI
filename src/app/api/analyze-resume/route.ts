import { analyzeResume } from "@/engine/analyze";
import { ApiError, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze-resume
 * Body: { resumeText, targetRoleId?, jobDescription?, candidateName?, candidateEmail?, weights?, hoursPerWeek? }
 * Returns the complete analysis: match score, gaps, roadmap, projects, careers.
 */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    if (!body.resumeText || body.resumeText.trim().length < 50) {
      throw new ApiError("`resumeText` must contain at least 50 characters.", 400, "empty_resume");
    }
    const result = await analyzeResume({
      resumeText: body.resumeText,
      targetRoleId: body.targetRoleId ?? body.targetRole ?? null,
      jobDescription: body.jobDescription ?? null,
      candidateName: body.candidateName ?? null,
      candidateEmail: body.candidateEmail ?? null,
      weights: body.weights,
      hoursPerWeek: body.hoursPerWeek,
      source: "paste",
    });
    return Response.json({ success: true, analysis: result });
  } catch (error) {
    return errorResponse(error);
  }
}
