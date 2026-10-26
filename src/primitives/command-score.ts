/**
 * The command palette's matcher. Scores how well a search string fits an
 * item's text, from 1 (identical) down to 0 (no match), so items can be
 * filtered and ranked. Matching ignores case and diacritics.
 *
 * Ranking, best first:
 * 1. the whole text equals the search;
 * 2. the text starts with the search;
 * 3. a word in the text starts with the search (after a space, `-`, `_`,
 *    `/`, `.`, `:` or a lower-to-upper case change);
 * 4. the search appears anywhere in the text, earlier is better;
 * 5. every character of the search appears in order (fuzzy); fewer and
 *    shorter gaps, and matches at word starts, score higher.
 * A search of several words is scored as the product of its words when it
 * does not match as one string. Keywords are scored like the text; an item
 * takes the best of its text and its keywords.
 */

const BOUNDARY = /[\s\-_/.:]/;

export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function wordStartsAt(text: string, index: number, original: string): boolean {
  if (index === 0) return true;
  const previous = text[index - 1]!;
  if (BOUNDARY.test(previous)) return true;
  // camelCase: a capital after a lowercase letter in the original text.
  const before = original[index - 1];
  const here = original[index];
  return (
    before !== undefined &&
    here !== undefined &&
    before === before.toLowerCase() &&
    before !== before.toUpperCase() &&
    here === here.toUpperCase() &&
    here !== here.toLowerCase()
  );
}

function fuzzy(text: string, search: string, original: string): number {
  let score = 0;
  let index = -1;
  let previous = -1;
  for (const char of search) {
    index = text.indexOf(char, index + 1);
    if (index === -1) return 0;
    let gain = 1;
    if (previous !== -1 && index === previous + 1)
      gain = 1.5; // consecutive
    else if (wordStartsAt(text, index, original)) gain = 1.25;
    else if (previous !== -1) gain = 1 / (1 + Math.min(index - previous - 1, 10) * 0.25);
    score += gain;
    previous = index;
  }
  // Scale into the fuzzy band (0.1 to 0.5): perfect runs score 0.5.
  const best = 1.5 * search.length;
  return 0.1 + 0.4 * (score / best);
}

/** The score of one text against one search string; both already normalised. */
function scoreOne(text: string, search: string, original: string): number {
  if (!search) return 1;
  if (!text) return 0;
  if (text === search) return 1;
  const lengthPenalty = Math.min(0.08, (text.length - search.length) * 0.002);
  if (text.startsWith(search)) return 0.9 - lengthPenalty;
  let at = text.indexOf(search);
  while (at !== -1) {
    if (wordStartsAt(text, at, original)) return 0.8 - lengthPenalty;
    at = text.indexOf(search, at + 1);
  }
  const first = text.indexOf(search);
  if (first !== -1) return 0.7 - Math.min(0.1, first * 0.005) - lengthPenalty;
  return fuzzy(text, search, original);
}

/**
 * The score of `value` (and optional `keywords`) for `search`. 1 is a perfect
 * match, 0 means hide the item.
 */
export function commandScore(value: string, search: string, keywords?: readonly string[]): number {
  const needle = normalizeText(search.trim());
  if (!needle) return 1;
  const candidates = [value, ...(keywords ?? [])];
  let best = 0;
  for (const candidate of candidates) {
    const text = normalizeText(candidate);
    let score = scoreOne(text, needle, candidate);
    if (score < 0.7 && needle.includes(' ')) {
      // Several words: each must match somewhere; the product keeps it
      // below any single-string match of the same quality.
      const words = needle.split(/\s+/).filter(Boolean);
      const product = words.reduce((acc, word) => acc * scoreOne(text, word, candidate), 1);
      score = Math.max(score, product * 0.9);
    }
    if (score > best) best = score;
  }
  return best;
}
