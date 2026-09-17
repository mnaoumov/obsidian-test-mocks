/**
 * @file
 *
 * Mocks of the class, attribute, text and lookup helpers Obsidian adds to `Element.prototype`.
 */

import { assert } from '../internal/type-guards.ts';
import { empty } from './Node.prototype.ts';

/**
 * Adds one or more CSS classes to the element.
 *
 * @param classes - The class names to add.
 */
export function addClass(this: Element, ...classes: string[]): void {
  this.classList.add(...classes);
}

/**
 * Adds a list of CSS classes to the element.
 *
 * @param classes - The class names to add.
 */
export function addClasses(this: Element, classes: string[]): void {
  this.classList.add(...classes);
}

/**
 * Finds the first descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The first matching element, or `null` when nothing matches.
 */
export function find(this: Element, selector: string): Element | null {
  return this.querySelector(selector);
}

/**
 * Finds every descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The matching elements, in document order.
 */
export function findAll(this: Element, selector: string): HTMLElement[] {
  return [...this.querySelectorAll<HTMLElement>(selector)];
}

/**
 * Finds every element matching a selector, including the element itself.
 *
 * @param selector - The CSS selector to match.
 * @returns The element itself first when it matches, followed by the matching descendants. The mock throws when
 * the element matches but is not an `HTMLElement`.
 */
export function findAllSelf(this: Element, selector: string): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (this.matches(selector)) {
    assert(this instanceof HTMLElement, 'This is not an HTMLElement');
    out.push(this);
  }
  out.push(...this.querySelectorAll<HTMLElement>(selector));
  return out;
}

/**
 * Reads an attribute, like `getAttribute`.
 *
 * @param qualifiedName - The attribute name.
 * @returns The attribute's value, or `null` when it is absent.
 */
export function getAttr(this: Element, qualifiedName: string): null | string {
  return this.getAttribute(qualifiedName);
}

/**
 * Reads a CSS property from the element's computed style.
 *
 * @param property - The CSS property name, such as `--font-text-size`.
 * @param pseudoElement - The pseudo-element to read from, such as `::before`.
 * @returns The computed value, or an empty string when the property is not set.
 */
export function getCssPropertyValue(this: Element, property: string, pseudoElement?: string): string {
  return window.getComputedStyle(this, pseudoElement).getPropertyValue(property);
}

/**
 * Reads the element's text.
 *
 * @returns The element's `textContent`.
 */
export function getText(this: Element): string {
  return this.textContent;
}

/**
 * Checks whether the element has a CSS class.
 *
 * @param cls - The class name to check.
 * @returns `true` when the element has the class.
 */
export function hasClass(this: Element, cls: string): boolean {
  return this.classList.contains(cls);
}

/**
 * Checks whether the element has focus. The mock compares against the global `document.activeElement`, so an
 * element in a pop-out document never counts as active.
 *
 * @returns `true` when the element is the active element.
 */
export function isActiveElement(this: Element): boolean {
  return document.activeElement === this;
}

/**
 * Walks up the ancestors to find the nearest one matching a selector. The element itself is not checked.
 *
 * @param selector - The CSS selector to match.
 * @param lastParent - An ancestor to stop at; it and anything above it are not checked.
 * @returns The nearest matching ancestor, or `null` when none matches.
 */
export function matchParent(this: Element, selector: string, lastParent?: Element): Element | null {
  let current = this.parentElement;
  while (current && current !== lastParent) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Removes one or more CSS classes from the element.
 *
 * @param classes - The class names to remove.
 */
export function removeClass(this: Element, ...classes: string[]): void {
  this.classList.remove(...classes);
}

/**
 * Removes a list of CSS classes from the element.
 *
 * @param classes - The class names to remove.
 */
export function removeClasses(this: Element, classes: string[]): void {
  this.classList.remove(...classes);
}

/**
 * Sets an attribute, or removes it when the value is `null`.
 *
 * @param qualifiedName - The attribute name.
 * @param value - The value to set, converted to a string; `null` removes the attribute.
 */
export function setAttr(this: Element, qualifiedName: string, value: boolean | null | number | string): void {
  if (value === null) {
    this.removeAttribute(qualifiedName);
    return;
  }
  this.setAttribute(qualifiedName, String(value));
}

/**
 * Sets several attributes at once, as {@link setAttr} does for each entry.
 *
 * @param object - Attribute names mapped to their values; a `null` value removes that attribute.
 */
export function setAttrs(this: Element, object: Record<string, boolean | null | number | string>): void {
  for (const [k, v] of Object.entries(object)) {
    setAttr.call(this, k, v);
  }
}

/**
 * Replaces the element's children with text or a fragment.
 *
 * @param value - The new text, or a fragment whose nodes are moved into the element.
 */
export function setText(this: Element, value: DocumentFragment | string): void {
  empty.call(this);
  if (typeof value === 'string') {
    this.textContent = value;
    return;
  }
  this.append(value);
}

/**
 * Adds or removes CSS classes depending on a flag.
 *
 * @param classes - A class name or a list of class names.
 * @param value - `true` to add the classes, `false` to remove them.
 */
export function toggleClass(this: Element, classes: string | string[], value: boolean): void {
  const list = Array.isArray(classes) ? classes : [classes];
  for (const cls of list) {
    this.classList.toggle(cls, value);
  }
}
