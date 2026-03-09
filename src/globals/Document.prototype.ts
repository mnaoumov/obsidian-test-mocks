import {
  delegatedOff,
  delegatedOn
} from '../internal/delegated-event-registry.ts';

export function off(
  this: Document,
  type: string,
  _selector: string,
  listener: unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOff(this, type, listener, options);
}

export function on(
  this: Document,
  type: string,
  _selector: string,
  listener: (this: Document, ev: Event, delegateTarget: HTMLElement) => unknown,
  options?: AddEventListenerOptions | boolean
): void {
  delegatedOn(this, type, listener, options);
}
