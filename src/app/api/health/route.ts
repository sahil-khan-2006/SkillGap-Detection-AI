import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isModelReady } from "@/ml/modelStore";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "up" | "down" = "down";
  let tables = 0;
  try {
    const result = await db.execute<{ count: number }>(
      sql`select count(*)::int as count from information_schema.tables where table_schema = 'public'`,
    );
    tables = Number(result.rows?.[0]?.count ?? 0);
    database = "up";
  } catch {
    database = "down";
  }

  return Response.json({
    status: database === "up" ? "ok" : "degraded",
    service: "skillgap-ai",
    version: "1.0.0",
    database,
    tables,
    mlModelLoaded: isModelReady(),
    timestamp: new Date().toISOString(),
  });
}
