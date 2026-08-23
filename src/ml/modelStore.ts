/**
 * SkillGap AI — Model registry.
 * The classifier is trained once, cached in memory and persisted to Postgres
 * (ml_models.artifact) so restarts reuse the trained model. This replaces the
 * Python `joblib.load` / `joblib.dump` step.
 */

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mlModels } from "@/db/schema";
import { modelSummary, trainJobClassifier, type TrainedModelArtifact } from "./classifier";

let cached: TrainedModelArtifact | null = null;
let inflight: Promise<TrainedModelArtifact> | null = null;

async function loadFromDb(): Promise<TrainedModelArtifact | null> {
  try {
    const rows = await db.select().from(mlModels).orderBy(desc(mlModels.id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return row.artifact as unknown as TrainedModelArtifact;
  } catch {
    return null; // table might not exist yet before `drizzle-kit push`
  }
}

async function saveToDb(artifact: TrainedModelArtifact): Promise<void> {
  try {
    await db.update(mlModels).set({ active: false });
    await db.insert(mlModels).values({
      version: artifact.version,
      algorithm: artifact.algorithm,
      active: true,
      metrics: modelSummary(artifact) as unknown as Record<string, unknown>,
      artifact: artifact as unknown as Record<string, unknown>,
    });
  } catch (error) {
    console.warn("[skillgap-ai] could not persist model artifact:", (error as Error).message);
  }
}

export async function getModel(): Promise<TrainedModelArtifact> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    const stored = await loadFromDb();
    if (stored) {
      cached = stored;
      return stored;
    }
    const artifact = trainJobClassifier();
    cached = artifact;
    void saveToDb(artifact);
    return artifact;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

/** Force retrain (used by POST /api/ml/train and the training script). */
export async function retrainModel(): Promise<TrainedModelArtifact> {
  const artifact = trainJobClassifier();
  cached = artifact;
  await saveToDb(artifact);
  return artifact;
}

export function isModelReady(): boolean {
  return cached !== null;
}
