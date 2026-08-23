/**
 * SkillGap AI — Job Category Prediction model.
 *
 * Two real classifiers are trained on the TF-IDF features and compared on a
 * stratified hold-out set:
 *   1. Multinomial Naive Bayes (closed form, Laplace smoothing)
 *   2. Softmax / multinomial Logistic Regression (mini-batch SGD + L2)
 * The better model is kept (model selection) and persisted as JSON, the
 * TypeScript equivalent of `joblib.dump(...)`.
 */

import { RESUME_DATASET, DATASET_META } from "@/data/trainingData";
import { fitVectorizer, transform, type SparseVector, type VectorizerModel } from "./tfidf";

export interface ClassifierMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface TrainedModelArtifact {
  version: string;
  algorithm: "naive-bayes" | "logistic-regression";
  labels: string[];
  vectorizer: VectorizerModel;
  /** logistic regression: weights[labelIndex][featureIndex] */
  weights?: number[][];
  bias?: number[];
  /** naive bayes: log P(feature|class) */
  logLikelihood?: number[][];
  priors?: number[];
  metrics: ClassifierMetrics & { perClass: Array<{ label: string; precision: number; recall: number; f1: number; support: number }> };
  comparison: Array<{ algorithm: string; accuracy: number; f1: number }>;
  trainedAt: string;
  dataset: typeof DATASET_META & { records: number; classes: number };
}

interface Sample {
  text: string;
  label: string;
}

function buildSamples(): Sample[] {
  return RESUME_DATASET.map((record) => ({ text: record.resume_text, label: record.job_role }));
}

/* ------------------------------------------------------------- evaluation utils */

function stratifiedSplit(samples: Sample[], testRatio = 0.25): { train: Sample[]; test: Sample[] } {
  const byClass = new Map<string, Sample[]>();
  for (const s of samples) {
    const list = byClass.get(s.label) ?? [];
    list.push(s);
    byClass.set(s.label, list);
  }
  const train: Sample[] = [];
  const test: Sample[] = [];
  for (const list of byClass.values()) {
    const nTest = Math.max(2, Math.round(list.length * testRatio));
    test.push(...list.slice(0, nTest));
    train.push(...list.slice(nTest));
  }
  return { train, test };
}

function confusion(predicted: string[], actual: string[], labels: string[]) {
  const index = new Map(labels.map((l, i) => [l, i]));
  const matrix: number[][] = labels.map(() => labels.map(() => 0));
  for (let i = 0; i < actual.length; i++) {
    const a = index.get(actual[i]);
    const p = index.get(predicted[i]);
    if (a !== undefined && p !== undefined) matrix[a][p] += 1;
  }
  return matrix;
}

function computeMetrics(predicted: string[], actual: string[], labels: string[]) {
  const matrix = confusion(predicted, actual, labels);
  const perClass = labels.map((label, i) => {
    const tp = matrix[i][i];
    const fp = labels.reduce((sum, _, j) => sum + (j === i ? 0 : matrix[j][i]), 0);
    const fn = labels.reduce((sum, _, j) => sum + (j === i ? 0 : matrix[i][j]), 0);
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return { label, precision, recall, f1, support: tp + fn };
  });
  const n = actual.length || 1;
  const accuracy = predicted.reduce((sum, p, i) => sum + (p === actual[i] ? 1 : 0), 0) / n;
  const avg = (key: "precision" | "recall" | "f1") => perClass.reduce((sum, c) => sum + c[key], 0) / (perClass.length || 1);
  return {
    accuracy,
    precision: avg("precision"),
    recall: avg("recall"),
    f1: avg("f1"),
    support: n,
    perClass,
  } satisfies ClassifierMetrics & {
    perClass: Array<{ label: string; precision: number; recall: number; f1: number; support: number }>;
  };
}

/* -------------------------------------------------------------- naive bayes */

function trainNaiveBayes(vectors: SparseVector[], labels: number[], classCount: number, featureCount: number) {
  const logLikelihood: number[][] = Array.from({ length: classCount }, () => new Array<number>(featureCount).fill(0));
  const classTermSums = new Array<number>(classCount).fill(0);
  const priors = new Array<number>(classCount).fill(0);

  vectors.forEach((vector, i) => {
    const c = labels[i];
    priors[c] += 1;
    for (const [index, value] of vector) {
      logLikelihood[c][index] += value;
      classTermSums[c] += value;
    }
  });

  for (let c = 0; c < classCount; c++) {
    const denom = classTermSums[c] + featureCount; // Laplace smoothing (alpha = 1)
    for (let f = 0; f < featureCount; f++) {
      logLikelihood[c][f] = Math.log((logLikelihood[c][f] + 1) / denom);
    }
    priors[c] = Math.log((priors[c] + 1) / (vectors.length + classCount));
  }
  return { logLikelihood, priors };
}

function predictNaiveBayes(artifact: Pick<TrainedModelArtifact, "logLikelihood" | "priors">, vector: SparseVector): number[] {
  const scores = artifact.priors!.map((p) => p);
  for (const [index, value] of vector) {
    for (let c = 0; c < scores.length; c++) scores[c] += artifact.logLikelihood![c][index] * value;
  }
  return softmax(scores);
}

/* ------------------------------------------------------- logistic regression */

function trainLogisticRegression(
  vectors: SparseVector[],
  labels: number[],
  classCount: number,
  featureCount: number,
  { epochs = 60, lr = 0.6, l2 = 1e-5 } = {},
) {
  const weights: number[][] = Array.from({ length: classCount }, () => new Array<number>(featureCount).fill(0));
  const bias = new Array<number>(classCount).fill(0);
  const order = vectors.map((_, i) => i);

  for (let epoch = 0; epoch < epochs; epoch++) {
    // simple deterministic shuffle
    for (let i = order.length - 1; i > 0; i--) {
      const j = (i * 7 + epoch * 13) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const learningRate = lr / (1 + epoch * 0.05);
    for (const i of order) {
      const vector = vectors[i];
      const scores = new Array<number>(classCount).fill(0);
      for (let c = 0; c < classCount; c++) {
        let sum = bias[c];
        for (const [index, value] of vector) sum += weights[c][index] * value;
        scores[c] = sum;
      }
      const probs = softmax(scores);
      const target = labels[i];
      for (let c = 0; c < classCount; c++) {
        const grad = probs[c] - (c === target ? 1 : 0);
        if (Math.abs(grad) < 1e-6) continue;
        bias[c] -= learningRate * grad;
        for (const [index, value] of vector) weights[c][index] -= learningRate * grad * value;
      }
    }
    // L2 decay (lazy, applied per epoch for speed)
    if (l2 > 0) {
      for (let c = 0; c < classCount; c++) {
        for (let f = 0; f < featureCount; f++) weights[c][f] *= 1 - learningRate * l2;
      }
    }
  }
  return { weights, bias };
}

function predictLogisticRegression(
  artifact: Pick<TrainedModelArtifact, "weights" | "bias">,
  vector: SparseVector,
): number[] {
  const scores = artifact.weights!.map((row, c) => {
    let sum = artifact.bias![c];
    for (const [index, value] of vector) sum += row[index] * value;
    return sum;
  });
  return softmax(scores);
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

/* ---------------------------------------------------------------- trainer */

export function trainJobClassifier(): TrainedModelArtifact {
  const samples = buildSamples();
  const labels = [...new Set(samples.map((s) => s.label))].sort();
  const labelIndex = new Map(labels.map((l, i) => [l, i]));

  const { train, test } = stratifiedSplit(samples, 0.25);

  const vectorizer = fitVectorizer(
    train.map((s) => s.text),
    { minDf: 2, maxFeatures: 4000, useBigrams: true, useStems: true },
  );
  const featureCount = vectorizer.idf.length;

  const X = (set: Sample[]) => set.map((s) => transform(vectorizer, s.text));
  const y = (set: Sample[]) => set.map((s) => labelIndex.get(s.label)!);

  const Xtrain = X(train);
  const ytrain = y(train);
  const Xtest = X(test);
  const ytest = y(test);

  const nb = trainNaiveBayes(Xtrain, ytrain, labels.length, featureCount);
  const lr = trainLogisticRegression(Xtrain, ytrain, labels.length, featureCount);

  const nbPred = Xtest.map((vector) => {
    const probs = predictNaiveBayes(nb, vector);
    return labels[probs.indexOf(Math.max(...probs))];
  });
  const lrPred = Xtest.map((vector) => {
    const probs = predictLogisticRegression(lr, vector);
    return labels[probs.indexOf(Math.max(...probs))];
  });

  const actual = ytest.map((i) => labels[i]);
  const nbMetrics = computeMetrics(nbPred, actual, labels);
  const lrMetrics = computeMetrics(lrPred, actual, labels);

  const comparison = [
    { algorithm: "naive-bayes", accuracy: nbMetrics.accuracy, f1: nbMetrics.f1 },
    { algorithm: "logistic-regression", accuracy: lrMetrics.accuracy, f1: lrMetrics.f1 },
  ];

  const useLr = lrMetrics.f1 >= nbMetrics.f1;
  const chosen = useLr ? lrMetrics : nbMetrics;

  return {
    version: `skillgap-clf-v1-${Date.now()}`,
    algorithm: useLr ? "logistic-regression" : "naive-bayes",
    labels,
    vectorizer,
    weights: lr.weights,
    bias: lr.bias,
    logLikelihood: nb.logLikelihood,
    priors: nb.priors,
    metrics: chosen,
    comparison,
    trainedAt: new Date().toISOString(),
    dataset: { ...DATASET_META, records: samples.length, classes: labels.length },
  };
}

/* ---------------------------------------------------------------- inference */

export interface Prediction {
  label: string;
  probability: number;
}

export function predictJobCategory(artifact: TrainedModelArtifact, text: string, topK = 5): Prediction[] {
  const vector = transform(artifact.vectorizer, text);
  const probs =
    artifact.algorithm === "logistic-regression"
      ? predictLogisticRegression(artifact, vector)
      : predictNaiveBayes(artifact, vector);
  return probs
    .map((probability, index) => ({ label: artifact.labels[index], probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, topK);
}

export function modelSummary(artifact: TrainedModelArtifact) {
  return {
    version: artifact.version,
    algorithm: artifact.algorithm,
    trainedAt: artifact.trainedAt,
    classes: artifact.labels.length,
    features: artifact.vectorizer.idf.length,
    trainingRecords: artifact.dataset.records,
    syntheticDataset: artifact.dataset.synthetic,
    metrics: {
      accuracy: artifact.metrics.accuracy,
      precision: artifact.metrics.precision,
      recall: artifact.metrics.recall,
      f1: artifact.metrics.f1,
      holdoutSamples: artifact.metrics.support,
    },
    comparison: artifact.comparison,
    perClass: artifact.metrics.perClass,
  };
}
