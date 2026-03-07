export function prepareFuzzySearch(query: string): (text: string) => { matches: [number, number][]; score: number } | null {
  const lowerQuery = query.toLowerCase();

  return (text: string): { matches: [number, number][]; score: number } | null => {
    const lowerText = text.toLowerCase();
    const matches: [number, number][] = [];
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = -2;

    for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIndex]) {
        const isConsecutive = i === lastMatchIndex + 1;

        if (isConsecutive && matches.length > 0) {
          matches[matches.length - 1]![1] = i + 1;
          score += 2;
        } else {
          matches.push([i, i + 1]);
          score += 1;
        }

        if (i === 0 || text[i - 1] === ' ' || text[i - 1] === '/' || text[i - 1] === '-' || text[i - 1] === '_') {
          score += 3;
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
