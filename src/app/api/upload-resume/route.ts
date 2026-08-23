import { parseResume, ResumeParseError, extractProfile, MAX_FILE_BYTES, ALLOWED_EXTENSIONS } from "@/engine/resumeParser";
import { extractSkills } from "@/engine/skillExtractor";
import { errorResponse } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/upload-resume
 * multipart/form-data: resume=<file>  (PDF / DOCX / TXT, max 8 MB)
 * The file is never written to disk — it is parsed in memory and discarded.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { error: "Send the resume as multipart/form-data with a `resume` field.", code: "invalid_content_type" },
        { status: 400 },
      );
    }

    const form = await request.formData();
    const file = form.get("resume");
    if (!file || typeof file === "string") {
      return Response.json({ error: "No file received. Field name must be `resume`.", code: "no_file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResume({
      name: file.name || "resume.txt",
      size: buffer.byteLength,
      type: file.type,
      buffer,
    });

    const profile = extractProfile(parsed.text);
    const skills = extractSkills(parsed.text);

    return Response.json({
      success: true,
      file: {
        name: parsed.fileName,
        size: parsed.fileSize,
        method: parsed.method,
        chars: parsed.chars,
        words: parsed.words,
        pages: parsed.pages ?? null,
        warnings: parsed.warnings,
      },
      limits: { maxBytes: MAX_FILE_BYTES, allowedExtensions: ALLOWED_EXTENSIONS },
      profile,
      skillsFound: skills.length,
      skills: skills.slice(0, 60).map((s) => ({ name: s.name, category: s.category, confidence: s.confidence })),
      // Preview only — the full text is analysed, never stored permanently.
      textPreview: parsed.text.slice(0, 1200),
      resumeText: parsed.text,
      message: "Resume parsed successfully.",
    });
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return errorResponse(error);
  }
}
