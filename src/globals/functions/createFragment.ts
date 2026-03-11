export function createFragment(callback?: (el: DocumentFragment) => void): DocumentFragment {
  const frag = document.createDocumentFragment();
  callback?.(frag);
  return frag;
}
