import { ensureNonNullable } from '../../internal/type-guards.ts';

const CONSECUTIVE_MATCH_SCORE = 2;
const WORD_BOUNDARY_SCORE = 3;
const INITIAL_LAST_MATCH_INDEX = -2;

// eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts signature.
export function prepareFuzzySearch(query: string): (text: string) => { matches: [number, number][]; score: number } | null {
  const lowerQuery = query.toLowerCase();

  // eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts signature.
  return (text: string): { matches: [number, number][]; score: number } | null => {
    const lowerText = text.toLowerCase();
    const matches: [number, number][] = [];
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = INITIAL_LAST_MATCH_INDEX;

    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        const isConsecutive = i === lastMatchIndex + 1;

        if (isConsecutive && matches.length > 0) {
          const lastMatch = ensureNonNullable(matches[matches.length - 1]);
          lastMatch[1] = i + 1;
          score += CONSECUTIVE_MATCH_SCORE;
        } else {
          matches.push([i, i + 1]);
          score += 1;
        }

        if (i === 0 || text[i - 1] === ' ' || text[i - 1] === '/' || text[i - 1] === '-' || text[i - 1] === '_') {
          score += WORD_BOUNDARY_SCORE;
        }

        lastMatchIndex = i;
        queryIndex++;
      }
    }

    if (queryIndex < lowerQuery.length) {
      return null;
    }

    score = -score;

    return { matches, score };
  };
}
