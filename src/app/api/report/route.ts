import { loadAnalysis } from "@/engine/analyze";
import { errorResponse } from "@/lib/apiContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/report?id=<analysisId> — structured report payload (used for PDF + print) */
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Query parameter `id` is required.", code: "bad_request" }, { status: 400 });
    const analysis = await loadAnalysis(id);
    if (!analysis) return Response.json({ error: "Analysis not found.", code: "not_found" }, { status: 404 });

    return Response.json({
      success: true,
      report: {
        title: "SkillGap AI Career Analysis Report",
        generatedAt: new Date().toISOString(),
        candidate: analysis.candidate,
        targetRole: analysis.targetRole,
        matchScore: analysis.match.matchScore,
        projectedScore: analysis.match.projectedScore,
        components: analysis.match.components,
        matchedSkills: analysis.match.matched.map((m) => m.name),
        missingSkills: analysis.match.missing.map((m) => ({ name: m.name, priority: m.priority, hours: m.hours })),
        preferredMissing: analysis.match.preferredMissing.map((m) => m.name),
        prioritySkills: analysis.prioritySkills.slice(0, 10),
        existingSkills: analysis.skills.map((s) => s.name),
        careers: analysis.careers,
        roadmap: analysis.roadmap.weeks,
        projects: analysis.projects,
        quality: analysis.quality,
        similarity: analysis.similarity,
        mlPrediction: analysis.ml.topPrediction,
        suggestions: analysis.quality.suggestions,
        disclaimer: analysis.disclaimer,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
