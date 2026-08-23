/**
 * SkillGap AI — TF-IDF vectorizer (from scratch, no external ML dependency).
 * Sublinear term frequency, smoothed inverse document frequency, L2 norm.
 */

import { stemTokens, tokenize, ngrams } from "@/engine/preprocessing";

export type SparseVector = Array<[number, number]>;

export interface VectorizerOptions {
  minDf?: number;
  maxFeatures?: number;
  useBigrams?: boolean;
  useStems?: boolean;
}

export interface VectorizerModel {
  vocab: Record<string, number>;
  idf: number[];
  options: Required<VectorizerOptions>;
  docCount: number;
}

const DEFAULTS: Required<VectorizerOptions> = { minDf: 1, maxFeatures: 6000, useBigrams: true, useStems: true };

function featurize(text: string, options: Required<VectorizerOptions>): string[] {
  const raw = tokenize(text);
  const tokens = options.useStems ? stemTokens(raw) : raw;
  const unigrams = tokens;
  if (!options.useBigrams) return unigrams;
  return [...unigrams, ...ngrams(tokens, 2), ...ngrams(tokens, 3)];
}

export function fitVectorizer(documents: string[], options: VectorizerOptions = {}): VectorizerModel {
  const opts = { ...DEFAULTS, ...options };
  const df = new Map<string, number>();

  for (const doc of documents) {
    const terms = new Set(featurize(doc, opts));
    for (const term of terms) df.set(term, (df.get(term) ?? 0) + 1);
  }

  const docCount = documents.length || 1;
  let entries = [...df.entries()].filter(([, freq]) => freq >= opts.minDf);
  // Keep the most frequent terms (highest df) up to maxFeatures
  entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  entries = entries.slice(0, opts.maxFeatures);

  const vocab: Record<string, number> = {};
  const idf: number[] = [];
  entries.forEach(([term, freq], index) => {
    vocab[term] = index;
    idf.push(Math.log((1 + docCount) / (1 + freq)) + 1); // smoothed idf
  });

  return { vocab, idf, options: opts, docCount };
}

export function transform(model: VectorizerModel, text: string): SparseVector {
  const terms = featurize(text, model.options);
  const tf = new Map<number, number>();
  for (const term of terms) {
    const index = model.vocab[term];
    if (index === undefined) continue;
    tf.set(index, (tf.get(index) ?? 0) + 1);
  }
  const vector: SparseVector = [];
  let norm = 0;
  for (const [index, count] of tf) {
    const value = (1 + Math.log(count)) * model.idf[index];
    vector.push([index, value]);
    norm += value * value;
  }
  norm = Math.sqrt(norm) || 1;
  return vector
    .map(([index, value]) => [index, value / norm] as [number, number])
    .sort((a, b) => a[0] - b[0]);
}

export function fitTransform(documents: string[], options?: VectorizerOptions) {
  const model = fitVectorizer(documents, options);
  return { model, vectors: documents.map((doc) => transform(model, doc)) };
}

export function cosine(a: SparseVector, b: SparseVector): number {
  let i = 0;
  let j = 0;
  let dot = 0;
  while (i < a.length && j < b.length) {
    if (a[i][0] === b[j][0]) {
      dot += a[i][1] * b[j][1];
      i++;
      j++;
    } else if (a[i][0] < b[j][0]) i++;
    else j++;
  }
  return dot; // both vectors are L2 normalized => dot == cosine
}

/** Cosine similarity over raw text with a shared fitted model. */
export function textSimilarity(a: string, b: string, options?: VectorizerOptions): number {
  const model = fitVectorizer([a, b], { ...options, minDf: 1 });
  const [va, vb] = [transform(model, a), transform(model, b)];
  return cosine(va, vb);
}

/** Dense helper (for small matrices). */
export function toDense(vector: SparseVector, size: number): number[] {
  const dense = new Array<number>(size).fill(0);
  for (const [index, value] of vector) dense[index] = value;
  return dense;
}
