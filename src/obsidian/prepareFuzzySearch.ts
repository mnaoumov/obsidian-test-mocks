export function prepareFuzzySearch(_query: string): (text: string) => { score: number; matches: [number, number][] } | null {
  return () => ({ score: 0, matches: [] });
}
