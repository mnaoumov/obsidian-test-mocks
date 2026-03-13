import type { SearchResult as SearchResultOriginal } from 'obsidian';

export function prepareSimpleSearch(query: string): (text: string) => null | SearchResultOriginal {
  const lowerQuery = query.toLowerCase();

  return (text: string): null | SearchResultOriginal => {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return null;
    }

    return {
      matches: [[index, index + query.length]],
      score: -index
    };
  };
}
