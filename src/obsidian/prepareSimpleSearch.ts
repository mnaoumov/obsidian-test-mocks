export function prepareSimpleSearch(query: string): (text: string) => { matches: [number, number][]; score: number } | null {
  const lowerQuery = query.toLowerCase();

  return (text: string): { matches: [number, number][]; score: number } | null => {
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
