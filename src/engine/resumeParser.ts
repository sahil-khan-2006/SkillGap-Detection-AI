/**
 * SkillGap AI — Resume parsing service.
 * Supports PDF (text layer via pdf.js), DOCX (mammoth) and TXT.
 * Image-only / scanned PDFs are detected and reported instead of crashing.
 */

import { cleanText } from "./preprocessing";

export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "txt"] as const;
export const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export interface ParsedResume {
  text: string;
  method: "pdf-text-layer" | "docx" | "txt" | "unsupported";
  fileName: string;
  fileSize: number;
  chars: number;
  words: number;
  pages?: number;
  warnings: string[];
}

export class ResumeParseError extends Error {
  readonly status = 400;
  readonly code: string;
  constructor(message: string, code = "resume_parse_error") {
    super(message);
    this.code = code;
  }
}

export function validateFile(fileName: string, size: number, mimeType?: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    throw new ResumeParseError(
      `Unsupported file type ".${ext || "unknown"}". Please upload a PDF, DOCX or TXT file.`,
      "unsupported_type",
    );
  }
  if (size <= 0) throw new ResumeParseError("The uploaded file is empty.", "empty_file");
  if (size > MAX_FILE_BYTES) {
    throw new ResumeParseError(
      `File is too large (${(size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
      "file_too_large",
    );
  }
  if (mimeType && !ALLOWED_MIME.includes(mimeType) && mimeType !== "application/octet-stream") {
    throw new ResumeParseError(`Unsupported MIME type "${mimeType}".`, "unsupported_type");
  }
  return ext as (typeof ALLOWED_EXTENSIONS)[number];
}

async function parsePdf(buffer: Buffer): Promise<{ text: string; pages: number; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    const cleaned = cleanText(Array.isArray(text) ? text.join("\n") : String(text ?? ""));
    if (cleaned.replace(/\s/g, "").length < 40) {
      warnings.push(
        "No selectable text layer was found in this PDF. It looks like a scanned/image-based resume — re-export it as a text PDF or paste your resume text manually.",
      );
    }
    return { text: cleaned, pages: totalPages, warnings };
  } catch (error) {
    throw new ResumeParseError(
      `Could not read this PDF (${(error as Error).message}). The file may be corrupted or encrypted.`,
      "corrupt_pdf",
    );
  }
}

async function parseDocx(buffer: Buffer): Promise<{ text: string; warnings: string[] }> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = cleanText(result.value ?? "");
    const warnings: string[] = [];
    if (text.length < 40) warnings.push("Very little text was extracted from this DOCX file.");
    return { text, warnings };
  } catch (error) {
    throw new ResumeParseError(
      `Could not read this DOCX file (${(error as Error).message}). It may be corrupted.`,
      "corrupt_docx",
    );
  }
}

export async function parseResume(file: { name: string; size: number; type?: string; buffer: Buffer }): Promise<ParsedResume> {
  const ext = validateFile(file.name, file.size, file.type);
  const warnings: string[] = [];

  let text = "";
  let method: ParsedResume["method"] = "txt";
  let pages: number | undefined;

  if (ext === "pdf") {
    const pdf = await parsePdf(file.buffer);
    text = pdf.text;
    pages = pdf.pages;
    method = "pdf-text-layer";
    warnings.push(...pdf.warnings);
  } else if (ext === "docx") {
    const docx = await parseDocx(file.buffer);
    text = docx.text;
    method = "docx";
    warnings.push(...docx.warnings);
  } else if (ext === "doc") {
    throw new ResumeParseError(
      "Legacy .doc files are not supported. Please re-save the file as .docx or PDF and try again.",
      "unsupported_type",
    );
  } else {
    text = cleanText(file.buffer.toString("utf8"));
    method = "txt";
  }

  if (text.trim().length === 0) {
    throw new ResumeParseError(
      "No readable text could be extracted from this file. If it is a scanned PDF, paste your resume text instead.",
      "empty_text",
    );
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 30) warnings.push("This resume looks very short — results may be less accurate.");

  return {
    text,
    method,
    fileName: file.name,
    fileSize: file.size,
    chars: text.length,
    words,
    pages,
    warnings,
  };
}

/* ------------------------------------------------------- profile signal extraction */

export interface ResumeProfile {
  name: string | null;
  email: string | null;
  phone: string | null;
  links: string[];
  experienceYears: number;
  education: string[];
  certifications: string[];
  projectTitles: string[];
  sections: string[];
}

const SECTION_HEADINGS = /\b(summary|objective|technical skills|skills|work experience|experience|employment|projects|education|certifications|achievements|publications|extracurricular)\b/gi;

export function extractProfile(text: string): ResumeProfile {
  const clean = cleanText(text);

  const email = clean.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)?.[0] ?? null;
  const phone = clean.match(/(\+\d{1,3}[\s-]?)?\d{5}[\s-]?\d{5}/)?.[0] ?? null;
  const links = [...clean.matchAll(/https?:\/\/[^\s)]+/g)].map((m) => m[0]);
  const githubLinks = [...clean.matchAll(/(github\.com\/[\w.-]+|linkedin\.com\/in\/[\w.-]+)/gi)].map((m) => `https://${m[0]}`);

  // ---- experience years: explicit statements first, then date ranges
  let experienceYears = 0;
  const explicit = clean.match(/([0-9]+(?:\.[0-9])?)\+?\s*(?:years?|yrs?)\b[^.]{0,40}?(?:experience|exp\b)/i)
    ?? clean.match(/experience[^.]{0,30}?([0-9]+(?:\.[0-9])?)\+?\s*(?:years?|yrs?)/i);
  if (explicit) experienceYears = Number(explicit[1]);

  if (!experienceYears) {
    const yearRanges = [...clean.matchAll(/(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current|now)/gi)];
    if (yearRanges.length) {
      const currentYear = new Date().getFullYear();
      let months = 0;
      for (const range of yearRanges) {
        const start = Number(range[1]);
        const endRaw = range[2].toLowerCase();
        const end = /present|current|now/.test(endRaw) ? currentYear : Number(endRaw);
        if (end < start || start < 1970) continue;
        months += Math.max(0, Math.min(end - start, 20)) * 12;
      }
      experienceYears = Math.min(25, Number((months / 12).toFixed(1)));
    }
  }

  // ---- education
  const educationPatterns = clean.match(
    /(B\.?Tech[\w\s().,-]{0,40}|B\.?E\.?[\w\s().,-]{0,30}|B\.?Sc[\w\s().,-]{0,40}|B\.?C\.?A[\w\s().,-]{0,30}|B\.?Des[\w\s().,-]{0,30}|M\.?Tech[\w\s().,-]{0,40}|M\.?Sc[\w\s().,-]{0,40}|M\.?C\.?A[\w\s().,-]{0,30}|MBA[\w\s().,-]{0,30}|PhD[\w\s().,-]{0,30}|Bachelor[\w\s().,-]{0,30}|Master[\w\s().,-]{0,30})/gi,
  );
  const education = [...new Set((educationPatterns ?? []).map((e) => e.trim().replace(/[,\s]+$/, "")))].slice(0, 4);

  // ---- certifications
  const certSection = clean.split(/certifications?|courses?/i)[1]?.slice(0, 400) ?? "";
  const certifications = [...new Set([...certSection.matchAll(/(?:^|\n|-|\d\.)\s*([A-Z][^.\n-]{8,80})/g)].map((m) => m[1].trim()))].slice(0, 6);
  const certKeywordLines = [...clean.matchAll(/([A-Z][\w .&-]{5,60}(?:certified|certificate|certification)[^\n]{0,40})/gi)].map((m) => m[1].trim());

  // ---- projects
  const projectSection = clean.split(/projects?/i)[1]?.slice(0, 900) ?? "";
  const projectTitles = [...new Set(
    [...projectSection.matchAll(/(?:^|\n|-|\d\.)\s*([A-Z][^.\n]{6,70})(?::|-|\n|$)/g)].map((m) => m[1].trim()),
  )].slice(0, 8);

  const sections = [...new Set([...clean.matchAll(SECTION_HEADINGS)].map((m) => m[1].toLowerCase()))];

  const nameCandidate = clean.split(/\n/)[0]?.trim();
  const name = nameCandidate && nameCandidate.length < 45 && !/@/.test(nameCandidate) ? nameCandidate : null;

  return {
    name,
    email,
    phone,
    links: [...new Set([...links, ...githubLinks])].slice(0, 6),
    experienceYears,
    education,
    certifications: [...new Set([...certifications, ...certKeywordLines])].slice(0, 6),
    projectTitles,
    sections,
  };
}
