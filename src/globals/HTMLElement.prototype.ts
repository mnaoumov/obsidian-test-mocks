import {
  delegatedOff,
  delegatedOn
} from '../internal/delegated-event-registry.ts';
import { noop } from '../internal/noop.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

export function find(this: HTMLElement, selector: string): HTMLElement {
  return ensureNonNullable(this.querySelector(selector));
}

export function findAll(this: HTMLElement, selector: string): HTMLElement[] {
  return [...this.querySelectorAll<HTMLElement>(selector)];
}

export function findAllSelf(this: HTMLElement, selector: string): HTMLElement[] {
  const out: HTMLElement[] = [];
  if (this.matches(selector)) {
    out.push(this);
  }
  out.push(...this.querySelectorAll<HTMLElement>(selector));
  return out;
}

export function hide(this: HTMLElement): void {
  this.style.display = 'none';
}

export function isShown(this: HTMLElement): boolean {
  return !!this.offsetParent;
}

export function off(
  this: HTMLElement,
  type: string,
  _selector: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOff(this, type, listener, options);
}

export function on(
  this: HTMLElement,
  type: string,
  _selector: string,
  listener: (this: HTMLElement, event: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOn(this, type, listener, options);
}

export function onClickEvent(
  this: HTMLElement,
  listener: (this: HTMLElement, event: MouseEvent) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  this.addEventListener('click', (event: Event) => {
    listener.call(this, event as MouseEvent);
  }, options);
}

export function onNodeInserted(
  _this: HTMLElement,
  listener: () => unknown,
  _once?: boolean
): () => void {
  // Jsdom doesn't implement real insertion observers; invoke immediately for safety.
  listener();
  return noop;
}

export function onWindowMigrated(
  _this: HTMLElement,
  _listener: (win: Window) => unknown
): () => void {
  return noop;
}

export function setCssProps(this: HTMLElement, props: Record<string, string>): void {
  for (const [k, v] of Object.entries(props)) {
    this.style.setProperty(k, v);
  }
}

export function setCssStyles(this: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(this.style, styles);
}

export function show(this: HTMLElement): void {
  this.style.display = '';
}

export function toggle(this: HTMLElement, showValue: boolean): void {
  this.style.display = showValue ? '' : 'none';
}

export function toggleVisibility(this: HTMLElement, visible: boolean): void {
  this.style.visibility = visible ? 'visible' : 'hidden';
}

export function trigger(this: HTMLElement, eventType: string): void {
  this.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
}
