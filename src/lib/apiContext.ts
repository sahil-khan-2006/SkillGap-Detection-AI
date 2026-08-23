/**
 * Shared request context builder for the SkillGap AI REST API.
 * Accepts either raw resume text or an explicit skill list, plus a target role
 * and/or a pasted job description, and produces every intermediate
 * representation the endpoints need.
 */

import { findRole, type JobRole } from "@/data/jobRoles";
import { computeMatch, matchSkills, DEFAULT_WEIGHTS, type MatchResult } from "@/engine/matcher";
import { extractProfile, type ResumeProfile } from "@/engine/resumeParser";
import { computeSimilarity, type SimilarityResult } from "@/engine/similarity";
import { extractSkills, type ExtractedSkill } from "@/engine/skillExtractor";
import { parseJobDescription, type ParsedJobDescription } from "@/engine/jdParser";

export interface AnalyzeRequestBody {
  resumeText?: string;
  skills?: string[];
  targetRole?: string;
  targetRoleId?: string;
  jobDescription?: string;
  weights?: Partial<typeof DEFAULT_WEIGHTS>;
  hoursPerWeek?: number;
  candidateName?: string;
  candidateEmail?: string;
}

export interface AnalysisContext {
  resumeText: string;
  skills: ExtractedSkill[];
  profile: ResumeProfile;
  role: JobRole | null;
  jd: ParsedJobDescription;
  similarity: SimilarityResult;
  match: MatchResult;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "bad_request") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") throw new ApiError("Request body must be a JSON object.");
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Invalid JSON body.", 400, "invalid_json");
  }
}

function roleJdText(role: JobRole | null): string {
  if (!role) return "";
  return [role.summary, ...role.responsibilities, role.required.map((r) => r.skill).join(", ")].join(" ");
}

export function buildContext(body: AnalyzeRequestBody): AnalysisContext {
  const resumeText = (body.resumeText ?? "").trim();
  const skillsInput = Array.isArray(body.skills) ? body.skills.filter(Boolean) : [];

  if (!resumeText && !skillsInput.length) {
    throw new ApiError("Provide either `resumeText` or a non-empty `skills` array.", 400, "missing_resume");
  }

  const role = findRole(body.targetRoleId ?? body.targetRole) ?? null;
  const skills: ExtractedSkill[] = resumeText
    ? extractSkills(resumeText)
    : skillsInput.map((name) => ({
        id: name.toLowerCase(),
        name,
        category: "Concepts",
        demand: 3,
        hours: 25,
        count: 1,
        matchedAliases: [name],
        evidence: [],
        confidence: 0.8,
      }));

  const profile: ResumeProfile = resumeText ? extractProfile(resumeText) : {
    name: body.candidateName ?? null,
    email: body.candidateEmail ?? null,
    phone: null,
    links: [],
    experienceYears: 0,
    education: [],
    certifications: [],
    projectTitles: [],
    sections: [],
  };

  const jd = parseJobDescription(body.jobDescription, role?.id ?? null);

  const jdText = (body.jobDescription ?? "").trim().length > 40 ? body.jobDescription!.trim() : roleJdText(role ?? jd.detectedRole);
  const similarity = resumeText ? computeSimilarity(resumeText, jdText) : { score: 0, overlapTerms: [], missingTerms: [] };

  const match = computeMatch({
    resumeSkills: skills,
    required: jd.requiredSkills,
    preferred: jd.preferredSkills,
    profile,
    role: role ?? jd.detectedRole,
    similarity: similarity.score,
    weights: body.weights,
  });

  return { resumeText, skills, profile, role: role ?? jd.detectedRole, jd, similarity, match };
}

export function gapsOf(ctx: AnalysisContext) {
  const groups = matchSkills(ctx.skills, ctx.jd.requiredSkills, ctx.jd.preferredSkills);
  return {
    matched: groups.matched,
    partial: groups.partial,
    missing: groups.missing,
    preferredMissing: groups.preferredMissing,
    requiredEvaluated: groups.requiredMatched,
  };
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  console.error("[skillgap-ai] unhandled:", error);
  return Response.json({ error: message, code: "server_error" }, { status: 500 });
}
