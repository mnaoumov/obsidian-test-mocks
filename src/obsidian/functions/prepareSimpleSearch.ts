import type { SearchResult as SearchResultOriginal } from 'obsidian';

export function prepareSimpleSearch(query: string): (text: string) => null | SearchResultOriginal {
  const lowerQuery = query.toLowerCase();

  return (text: string): null | SearchResultOriginal => {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    return index === -1
      ? null
      : {
        matches: [[index, index + query.length]],
        score: -index
      };
  };
}
