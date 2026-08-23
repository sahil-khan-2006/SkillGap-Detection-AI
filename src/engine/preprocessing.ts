/**
 * SkillGap AI — Text preprocessing utilities (shared by the NLP engine and ML).
 */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between
  both but by can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from further
  had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his how how's i
  i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once
  only or other ought our ours ourselves out over own same shan't she she'd she'll she's should shouldn't so some such
  than that that's the their theirs them themselves then there there's these they they'd they'll they're they've this
  those through to too under until up very was wasn't we we'd we'll we're we've were weren't what what's when when's
  where where's which while who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours
  yourself yourselves etc eg ie via per within across including include includes required requirements responsible
  responsibilities role candidate candidates company team years year experience work working skills skill good strong
  ability able plus preferred nice having knowledge understanding familiar familiarity hands-on`
    .split(/\s+/)
    .filter(Boolean)
);

/** Lowercase, strip punctuation, collapse whitespace. */
export function cleanText(text: string): string {
  return text
    .replace(/\r/g, " ")
    .replace(/[•●▪·]/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert text to normalized tokens usable for TF-IDF. */
export function tokenize(text: string): string[] {
  return cleanText(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\-\s]/g, " ")
    .split(/[\s,;:()[\]{}"']+/)
    .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter((t) => t.length > 1 && t.length < 30 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

/** Light suffix trimmer (Porter-lite) — improves recall for small datasets. */
export function stem(token: string): string {
  let w = token;
  const rules: Array<[RegExp, string]> = [
    [/(ing|edly|edly)$/, ""],
    [/ies$/, "y"],
    [/(sses|ss)$/, "ss"],
    [/s$/, ""],
  ];
  for (const [pattern, replacement] of rules) {
    if (pattern.test(w) && w.length > 5) {
      w = w.replace(pattern, replacement);
      break;
    }
  }
  return w;
}

export function stemTokens(tokens: string[]): string[] {
  return tokens.map(stem);
}

/** Word n-grams (used to catch phrases such as "spring_boot", "rest_api"). */
export function ngrams(tokens: string[], n = 2): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join("_"));
  return out;
}

export function sentences(text: string): string[] {
  return cleanText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

/** Small deterministic keyword highlighter used by the resume preview. */
export function snippet(text: string, term: string, radius = 70): string | null {
  const idx = cleanText(text).toLowerCase().indexOf(term.toLowerCase());
  if (idx < 0) return null;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + term.length + radius);
  return `${start > 0 ? "…" : ""}${cleanText(text).slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
