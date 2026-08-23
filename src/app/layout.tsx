import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import { AnalysisProvider } from "@/components/AnalysisProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillGap AI — Intelligent Career & Skill Gap Analyzer",
  description:
    "AI-powered resume analysis: extract skills, compare them with your target job, get a match score, skill gap, learning roadmap and project recommendations. Runs fully offline with local ML/NLP.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnalysisProvider>
          <Nav />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
          <footer className="no-print border-t border-white/8 py-8 text-center text-xs text-[var(--muted)]">
            <p className="mx-auto max-w-3xl px-4">
              SkillGap AI · Scores are estimated compatibility indicators produced by local ML/NLP models for learning
              guidance. They are not hiring decisions, guarantees, or endorsements.
            </p>
          </footer>
        </AnalysisProvider>
      </body>
    </html>
  );
}
