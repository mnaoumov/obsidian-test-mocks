/**
 * @file
 *
 * Mocks of the child-management and element-creation helpers Obsidian adds to `Node.prototype`.
 */

import type { SvgElementInfo } from '../internal/types.ts';

import { createEl as createElGlobal } from './functions/createEl.ts';
import { createSvg as createSvgGlobal } from './functions/createSvg.ts';

/**
 * Appends a text node to this node.
 *
 * @param value - The text to append.
 */
export function appendText(this: Node, value: string): void {
  // eslint-disable-next-line unicorn/prefer-dom-node-append -- The receiver is a `Node`, which has no `append()` — only the `ParentNode` mixin does. Obsidian declares these members and `DomElementInfo.parent` on `Node`, so the mock has to match.
  this.appendChild(document.createTextNode(value));
}

/**
 * Creates a `<div>` and appends it to this node, as {@link createEl} does.
 *
 * @param o - A class name, or the element's options; the parent is always this node.
 * @param callback - Called with the new element before it is returned.
 * @returns The new `<div>`.
 */
export function createDiv(
  this: Node,
  o?: DomElementInfo | string,
  callback?: (el: HTMLDivElement) => void
): HTMLDivElement {
  return createEl.call(this, 'div', o, (el: HTMLElement) => {
    if (!(el instanceof HTMLDivElement)) {
      throw new TypeError(`Expected a div element, but got ${el.tagName.toLowerCase()}`);
    }
    callback?.(el);
  }) as HTMLDivElement;
}

// Node.prototype element creation helpers.
/**
 * Creates an element and appends it to this node, or prepends it when `o.prepend` is set.
 *
 * @typeParam K - The tag name.
 * @param tag - The tag name of the element to create.
 * @param o - A class name, or the element's options; any `parent` given there is replaced by this node.
 * @param callback - Called with the new element before it is returned.
 * @returns The new element.
 */
export function createEl<K extends keyof HTMLElementTagNameMap>(
  this: Node,
  tag: K,
  o?: DomElementInfo | string,
  callback?: (el: HTMLElementTagNameMap[K]) => void
): HTMLElementTagNameMap[K] {
  return createElGlobal(tag, { ...(typeof o === 'string' ? { cls: o } : (o ?? {})), parent: this }, callback);
}

/**
 * Creates a `<span>` and appends it to this node, as {@link createEl} does.
 *
 * @param o - A class name, or the element's options; the parent is always this node.
 * @param callback - Called with the new element before it is returned.
 * @returns The new `<span>`.
 */
export function createSpan(
  this: Node,
  o?: DomElementInfo | string,
  callback?: (el: HTMLSpanElement) => void
): HTMLSpanElement {
  return createEl.call(this, 'span', o, callback);
}

/**
 * Creates an SVG element in the SVG namespace and appends it to this node, or prepends it when `o.prepend` is set.
 *
 * @typeParam K - The SVG tag name.
 * @param tag - The tag name of the SVG element to create.
 * @param o - A class name, or the element's options; any `parent` given there is replaced by this node.
 * @param callback - Called with the new element before it is returned.
 * @returns The new SVG element.
 */
export function createSvg<K extends keyof SVGElementTagNameMap>(
  this: Node,
  tag: K,
  o?: string | SvgElementInfo,
  callback?: (el: SVGElementTagNameMap[K]) => void
): SVGElementTagNameMap[K] {
  return createSvgGlobal(tag, { ...(typeof o === 'string' ? { cls: o } : (o ?? {})), parent: this }, callback);
}

/**
 * Removes this node from its parent; does nothing when it has none.
 */
export function detach(this: Node): void {
  this.parentNode?.removeChild(this);
}

/**
 * Removes all of this node's children.
 */
export function empty(this: Node): void {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }
}

/**
 * Gets the position of a node among this node's children.
 *
 * @param other - The child node to locate.
 * @returns The index of `other` among this node's child nodes, or `-1` when it is not a child of this node.
 */
export function indexOf(this: Node, other: Node): number {
  return [...this.childNodes].indexOf(other as ChildNode);
}

/**
 * Inserts a node right after a reference child, or appends it to this node when there is no reference child.
 *
 * @typeParam T - The inserted node's type.
 * @param node - The node to insert.
 * @param child - The child to insert after, or `null` to append to this node.
 * @returns The inserted node.
 */
export function insertAfter<T extends Node>(this: Node, node: T, child: Node | null): T {
  if (!child) {
    // eslint-disable-next-line unicorn/prefer-dom-node-append -- The receiver is a `Node`, which has no `append()` — only the `ParentNode` mixin does. Obsidian declares these members and `DomElementInfo.parent` on `Node`, so the mock has to match.
    this.appendChild(node);
    return node;
  }
  child.parentNode?.insertBefore(node, child.nextSibling);
  return node;
}

/**
 * Cross-window `instanceof` check for DOM nodes. The mock has a single window, so it is a plain `instanceof`.
 *
 * @typeParam T - The instance type to narrow to.
 * @param type - The constructor to check against.
 * @returns `true` when this node is an instance of `type`.
 */
export function instanceOf<T>(this: Node, type: new () => T): this is T {
  return this instanceof type;
}

/**
 * Replaces this node's children with the given nodes, in order.
 *
 * @param children - The new child nodes.
 */
export function setChildrenInPlace(this: Node, children: Node[]): void {
  empty.call(this);
  for (const child of children) {
    // eslint-disable-next-line unicorn/prefer-dom-node-append -- The receiver is a `Node`, which has no `append()` — only the `ParentNode` mixin does. Obsidian declares these members and `DomElementInfo.parent` on `Node`, so the mock has to match.
    this.appendChild(child);
  }
}
