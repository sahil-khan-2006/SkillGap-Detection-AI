"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AnalysisResult } from "@/engine/analyze";

const STORAGE_KEY = "skillgap-ai:analysis";
const RESUME_KEY = "skillgap-ai:resume";

interface AnalysisContextValue {
  analysis: AnalysisResult | null;
  /** last resume text kept in the browser session only (never sent to the DB payload) */
  resumeText: string;
  loading: boolean;
  error: string | null;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  runAnalysis: (payload: Record<string, unknown>) => Promise<AnalysisResult | null>;
  runDemo: (profileId: string) => Promise<AnalysisResult | null>;
  clear: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysisState] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AnalysisResult) : null;
    } catch {
      return null;
    }
  });
  const [resumeText, setResumeText] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.sessionStorage.getItem(RESUME_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnalysis = useCallback((next: AnalysisResult | null) => {
    setAnalysisState(next);
    try {
      if (next) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const post = useCallback(async (url: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    if (typeof body.resumeText === "string" && body.resumeText.length > 50) {
      setResumeText(body.resumeText);
      try {
        window.sessionStorage.setItem(RESUME_KEY, body.resumeText);
      } catch {
        /* storage may be unavailable */
      }
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (!response.ok || !json?.analysis) {
        throw new Error(json?.error ?? "The analysis service returned an unexpected response.");
      }
      setAnalysis(json.analysis as AnalysisResult);
      return json.analysis as AnalysisResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error while contacting the analysis service.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [setAnalysis]);

  const runAnalysis = useCallback(
    (payload: Record<string, unknown>) => post("/api/analyze", payload),
    [post],
  );

  const runDemo = useCallback(
    (profileId: string) => post("/api/demo", { profileId }),
    [post],
  );

  const value = useMemo<AnalysisContextValue>(
    () => ({
      analysis,
      resumeText,
      loading,
      error,
      setAnalysis,
      runAnalysis,
      runDemo,
      clear: () => setAnalysis(null),
    }),
    [analysis, resumeText, loading, error, setAnalysis, runAnalysis, runDemo],
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
}

export function useHydrated() {
  return typeof window !== "undefined";
}
