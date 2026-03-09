function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "")
    .trim();
}

function ngrams(text: string, n = 2): string[] {
  if (text.length <= n) return [text];
  const out: string[] = [];
  for (let i = 0; i <= text.length - n; i += 1) {
    out.push(text.slice(i, i + n));
  }
  return out;
}

export function jaccardSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;

  const setA = new Set(ngrams(na));
  const setB = new Set(ngrams(nb));

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function maxSimilarity(target: string, candidates: string[]): number {
  if (!candidates.length) return 0;
  let max = 0;
  for (const c of candidates) {
    const score = jaccardSimilarity(target, c);
    if (score > max) max = score;
  }
  return max;
}
