/**
 * SkillGap AI — Resume quality score + improvement suggestions.
 * Scores resume structure (not the person): breadth, evidence, projects,
 * measurable impact, certifications, education and presentation.
 */

import type { ResumeProfile } from "./resumeParser";
import type { ExtractedSkill } from "./skillExtractor";

export interface QualityBreakdown {
  key: string;
  label: string;
  score: number;
  max: number;
  detail: string;
}

export interface ResumeQuality {
  score: number;
  grade: string;
  breakdown: QualityBreakdown[];
  suggestions: string[];
}

const METRIC_PATTERN = /(\d+(?:\.\d+)?\s?(?:%|percent|x|times|k\b|ms\b|seconds?|hours?|users?|requests?|rps|qps)|\b\d{2,}\b)/i;
const ACTION_VERBS = /(built|developed|designed|implemented|led|optimized|automated|reduced|improved|created|migrated|deployed|increased)/i;

export function analyzeResumeQuality(
  text: string,
  skills: ExtractedSkill[],
  profile: ResumeProfile,
): ResumeQuality {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  const bulletLines = lines.filter((l) => /^[\s]*[-•*·]\s?/.test(l));
  const metricLines = lines.filter((l) => METRIC_PATTERN.test(l));
  const actionLines = lines.filter((l) => ACTION_VERBS.test(l));

  const skillBreadth = Math.min(25, skills.length * 1.8);
  const projectDepth = Math.min(20, profile.projectTitles.length * 5 + (bulletLines.length > 6 ? 5 : 0));
  const impact = Math.min(15, metricLines.length * 3 + (actionLines.length ? 4 : 0));
  const experience = Math.min(15, profile.experienceYears >= 3 ? 15 : profile.experienceYears > 0 ? 10 : 5);
  const certification = Math.min(10, profile.certifications.length * 3.5);
  const education = profile.education.length ? 8 : 2;
  const presentation = Math.min(7, (profile.links.length ? 3 : 0) + (profile.email ? 2 : 0) + (lines.length >= 15 ? 2 : 1));

  const breakdown: QualityBreakdown[] = [
    { key: "skills", label: "Skill breadth", score: Number(skillBreadth.toFixed(1)), max: 25, detail: `${skills.length} distinct skills detected across ${new Set(skills.map((s) => s.category)).size} categories.` },
    { key: "projects", label: "Project evidence", score: Number(projectDepth.toFixed(1)), max: 20, detail: `${profile.projectTitles.length} project title(s) and ${bulletLines.length} bullet point(s).` },
    { key: "impact", label: "Measurable impact", score: Number(impact.toFixed(1)), max: 15, detail: `${metricLines.length} line(s) contain numbers or percentages.` },
    { key: "experience", label: "Experience signal", score: Number(experience.toFixed(1)), max: 15, detail: profile.experienceYears ? `~${profile.experienceYears} year(s) detected.` : "No explicit experience timeline detected." },
    { key: "certifications", label: "Certifications", score: Number(certification.toFixed(1)), max: 10, detail: profile.certifications.length ? `${profile.certifications.length} certification(s) found.` : "No certifications section found." },
    { key: "education", label: "Education", score: education, max: 8, detail: profile.education.length ? profile.education[0] : "No education details detected." },
    { key: "presentation", label: "Presentation & links", score: presentation, max: 7, detail: `${profile.links.length} profile/link(s), ${profile.email ? "email present" : "no email found"}.` },
  ];

  const score = Math.round(breakdown.reduce((sum, b) => sum + b.score, 0));
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 55 ? "Good" : score >= 40 ? "Needs work" : "Weak";

  const suggestions: string[] = [];
  if (metricLines.length < 3) suggestions.push("Add measurable achievements to your projects (e.g. 'reduced API response time by 40%', 'served 10k requests/day').");
  if (profile.projectTitles.length < 2) suggestions.push("Add a dedicated Projects section with at least 2–3 named projects, each with the tech stack and your contribution.");
  if (!profile.links.some((l) => l.includes("github"))) suggestions.push("Add your GitHub profile link and pin the repositories that match your target role.");
  if (!profile.links.some((l) => l.includes("linkedin"))) suggestions.push("Include your LinkedIn profile URL in the header.");
  if (skills.length < 8) suggestions.push("Expand your skills section — list languages, frameworks, databases, tools and cloud platforms explicitly (ATS parsers look for exact names).");
  if (!profile.certifications.length) suggestions.push("A relevant certification helps, but only add ones you have actually completed.");
  if (!profile.experienceYears) suggestions.push("State your total experience explicitly (e.g. '2 years of experience') so parsers and recruiters see it immediately.");
  if (new Set(skills.map((s) => s.category)).size < 3) suggestions.push("Show breadth across categories: languages, frameworks, databases, tools and cloud.");
  if (actionLines.length < 3) suggestions.push("Start bullets with strong action verbs: Built, Designed, Optimized, Automated, Reduced.");
  if (!suggestions.length) suggestions.push("Your resume is well structured — keep tailoring the top skills section to each job description.");

  return { score, grade, breakdown, suggestions: suggestions.slice(0, 8) };
}
