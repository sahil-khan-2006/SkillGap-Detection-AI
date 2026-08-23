import { ApiError, buildContext, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/analyze-job — parse a job description into required/preferred skills */
export async function POST(request: Request) {
  try {
    const body = await readJson<AnalyzeRequestBody>(request);
    if (!body.jobDescription?.trim() && !body.targetRoleId && !body.targetRole) {
      throw new ApiError("Provide a `jobDescription` and/or `targetRoleId`.", 400, "missing_job_input");
    }
    const ctx = buildContext({ ...body, resumeText: body.resumeText ?? "n/a placeholder resume text for job only analysis." });

    return Response.json({
      success: true,
      source: ctx.jd.source,
      detectedRole: ctx.role ? { id: ctx.role.id, name: ctx.role.name, confidence: ctx.jd.detectedRoleConfidence } : null,
      requiredSkills: ctx.jd.requiredSkills,
      preferredSkills: ctx.jd.preferredSkills,
      requirementSentences: ctx.jd.requirementSentences,
      preferredSentences: ctx.jd.preferredSentences,
      rawSkillMentions: ctx.jd.rawSkillMentions,
      counts: { required: ctx.jd.requiredSkills.length, preferred: ctx.jd.preferredSkills.length },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
