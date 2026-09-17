/**
 * @file
 *
 * Mock of Obsidian's global `createFragment` helper.
 */

/**
 * Creates an empty document fragment.
 *
 * @param callback - Called with the new fragment, typically to fill it, before it is returned.
 * @returns The new fragment.
 */
export function createFragment(callback?: (el: DocumentFragment) => void): DocumentFragment {
  const frag = document.createDocumentFragment();
  callback?.(frag);
  return frag;
}
