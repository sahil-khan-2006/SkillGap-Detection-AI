import { analyzeResume } from "@/engine/analyze";
import { parseResume, ResumeParseError } from "@/engine/resumeParser";
import { ApiError, errorResponse, readJson, type AnalyzeRequestBody } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze — unified entry point (alias of /api/analyze-resume).
 * Accepts JSON ({ resumeText, ... }) or multipart/form-data with a `resume` file.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("resume");
      if (!file || typeof file === "string") throw new ApiError("No resume file received.", 400, "no_file");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await parseResume({ name: file.name, size: buffer.byteLength, type: file.type, buffer });
      const result = await analyzeResume({
        resumeText: parsed.text,
        fileName: parsed.fileName,
        fileSize: parsed.fileSize,
        parseMethod: parsed.method,
        warnings: parsed.warnings,
        targetRoleId: String(form.get("targetRoleId") ?? "") || null,
        jobDescription: form.get("jobDescription") ? String(form.get("jobDescription")) : null,
        candidateName: form.get("candidateName") ? String(form.get("candidateName")) : null,
        candidateEmail: form.get("candidateEmail") ? String(form.get("candidateEmail")) : null,
        hoursPerWeek: form.get("hoursPerWeek") ? Number(form.get("hoursPerWeek")) : 10,
        source: "upload",
      });
      return Response.json({ success: true, analysis: result });
    }

    const body = await readJson<AnalyzeRequestBody & { skills?: string[] }>(request);

    let resumeText = (body.resumeText ?? "").trim();
    if (!resumeText && Array.isArray(body.skills) && body.skills.length) {
      // Skill-list mode: build a synthetic resume document so the whole
      // pipeline (TF-IDF similarity, ML prediction, profile signals) still runs.
      resumeText = `CANDIDATE SKILLS PROFILE\nSKILLS\n${body.skills.join(", ")}\n`;
    }
    if (resumeText.length < 20) throw new ApiError("Provide `resumeText` or a non-empty `skills` array.", 400, "empty_resume");

    const result = await analyzeResume({
      resumeText,
      targetRoleId: body.targetRoleId ?? body.targetRole ?? null,
      jobDescription: body.jobDescription ?? null,
      candidateName: body.candidateName ?? null,
      candidateEmail: body.candidateEmail ?? null,
      weights: body.weights,
      hoursPerWeek: body.hoursPerWeek,
      source: resumeText.startsWith("CANDIDATE SKILLS PROFILE") ? "paste" : "paste",
    });
    return Response.json({ success: true, analysis: result });
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return errorResponse(error);
  }
}
