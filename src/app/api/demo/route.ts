import { DEMO_PROFILES } from "@/data/demoProfiles";
import { analyzeResume } from "@/engine/analyze";
import { errorResponse, readJson } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/demo — available demo profiles */
export async function GET() {
  return Response.json({
    count: DEMO_PROFILES.length,
    profiles: DEMO_PROFILES.map((p) => ({
      id: p.id,
      label: p.label,
      name: p.name,
      headline: p.headline,
      targetRole: p.targetRole,
      accent: p.accent,
      excerpt: p.resumeText.slice(0, 220),
    })),
  });
}

/** POST /api/demo — run a full analysis on a demo profile */
export async function POST(request: Request) {
  try {
    const body = await readJson<{ profileId?: string; targetRoleId?: string }>(request);
    const profile = DEMO_PROFILES.find((p) => p.id === body.profileId) ?? DEMO_PROFILES[0];
    const analysis = await analyzeResume({
      resumeText: profile.resumeText,
      targetRoleId: body.targetRoleId ?? profile.targetRole,
      candidateName: profile.name,
      candidateEmail: null,
      fileName: `${profile.id}.txt`,
      parseMethod: "demo",
      source: "demo",
    });
    return Response.json({ success: true, profileId: profile.id, analysis });
  } catch (error) {
    return errorResponse(error);
  }
}
