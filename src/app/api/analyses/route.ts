import { recentAnalyses } from "@/engine/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/analyses — recent analysis history */
export async function GET(request: Request) {
  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 8);
    const rows = await recentAnalyses(Math.min(50, Math.max(1, limit || 8)));
    return Response.json({ count: rows.length, analyses: rows });
  } catch (error) {
    return Response.json(
      { count: 0, analyses: [], warning: (error as Error).message },
      { status: 200 },
    );
  }
}
