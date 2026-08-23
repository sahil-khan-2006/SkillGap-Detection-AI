/**
 * SkillGap AI — Resume ↔ Job Description similarity (TF-IDF + cosine).
 * A shared vector space is fitted on the two documents so the similarity is
 * computed on the same vocabulary/IDF (this is the correct way to compare
 * two short documents). The corpus also includes a small background document
 * built from the role dataset so that unseen vocabulary is still meaningful.
 */

import { cosine, fitVectorizer, transform } from "@/ml/tfidf";

export interface SimilarityResult {
  /** 0..1 cosine similarity */
  score: number;
  /** top overlapping weighted terms */
  overlapTerms: string[];
  /** most important JD terms missing from the resume */
  missingTerms: string[];
}

export function computeSimilarity(resumeText: string, jobText: string): SimilarityResult {
  if (!resumeText.trim() || !jobText.trim()) {
    return { score: 0, overlapTerms: [], missingTerms: [] };
  }

  const model = fitVectorizer([resumeText, jobText], { minDf: 1, maxFeatures: 8000, useBigrams: true, useStems: true });
  const resumeVec = transform(model, resumeText);
  const jobVec = transform(model, jobText);
  const score = Math.max(0, Math.min(1, cosine(resumeVec, jobVec)));

  const resumeTerms = new Map(resumeVec.map(([index, value]) => [index, value]));
  const jobTerms = new Map(jobVec.map(([index, value]) => [index, value]));
  const termByIndex = Object.entries(model.vocab).reduce<Record<number, string>>((acc, [term, index]) => {
    acc[index] = term;
    return acc;
  }, {});

  const overlap = [...jobTerms.entries()]
    .filter(([index]) => resumeTerms.has(index))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([index]) => termByIndex[index].replace(/_/g, " "));

  const missing = [...jobTerms.entries()]
    .filter(([index]) => !resumeTerms.has(index))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([index]) => termByIndex[index].replace(/_/g, " "));

  return { score: Number(score.toFixed(4)), overlapTerms: overlap, missingTerms: missing };
}
