"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAnalysis } from "./AnalysisProvider";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyze", label: "Resume Analysis" },
  { href: "/skills", label: "Skill Gap" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/projects", label: "Projects" },
  { href: "/career", label: "Career" },
  { href: "/report", label: "Reports" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
        SG
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-white">SkillGap AI</span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Career Analyzer</span>
        </span>
      )}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ open: false, pathname: "" });
  const { analysis } = useAnalysis();
  const open = menu.open && menu.pathname === pathname;

  return (
    <header className="no-print sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,10,22,0.72)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-white/10 font-medium text-white"
                    : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {analysis && (
            <span className="hidden rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-inset ring-emerald-400/25 sm:inline">
              {analysis.targetRole?.name ?? "Analysis"} · {analysis.match.matchScore}%
            </span>
          )}
          <Link
            href="/analyze"
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            Analyze Resume
          </Link>
          <button
            onClick={() => setMenu((current) => ({ open: !(current.open && current.pathname === pathname), pathname }))}
            className="rounded-lg border border-white/10 p-2 text-[var(--muted)] transition hover:text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-white/8 bg-[rgba(7,10,22,0.95)] px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  pathname === link.href ? "bg-white/10 text-white" : "text-[var(--muted)] hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
