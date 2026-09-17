import type { ParsedLinktext } from '../../internal/types.ts';

export function parseLinktext(linktext: string): ParsedLinktext {
  const hashIndex = linktext.indexOf('#');
  return hashIndex === -1 ? { path: linktext, subpath: '' } : { path: linktext.slice(0, hashIndex), subpath: linktext.slice(hashIndex) };
}
