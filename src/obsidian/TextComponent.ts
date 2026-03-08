import type { TextComponent as RealTextComponent } from 'obsidian';

import type { ValueComponent } from './ValueComponent.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
  /** @deprecated Mock-only. Tracks all created instances for test assertions. Not part of the Obsidian API. */
  public static instances: TextComponent[] = [];
  /** @deprecated Mock-only. Tracks registered event listeners for use with {@link simulateEvent}. Not part of the Obsidian API. */
  public eventListeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    /* eslint-disable @typescript-eslint/no-deprecated -- Mock internals. */
    const eventListeners = this.eventListeners;
    const origAddEventListener = this.inputEl.addEventListener.bind(this.inputEl);
    this.inputEl.addEventListener = function addEventListenerWrapper(this: HTMLInputElement, ...args: Parameters<HTMLInputElement['addEventListener']>): void {
      const [event, handler] = args;
      if (typeof handler === 'function') {
        eventListeners[event] ??= [];
        eventListeners[event].push(handler as (...a: unknown[]) => void);
      }
      origAddEventListener(...args);
    } as HTMLInputElement['addEventListener'];
    TextComponent.instances.push(this);
    /* eslint-enable @typescript-eslint/no-deprecated -- Mock internals. */
    const mock = strictMock(this);
    TextComponent.constructor__(mock, _containerEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override onChange(cb: (value: string) => unknown): this {
    return super.onChange(cb);
  }

  /** @deprecated Mock-only. Simulates a DOM event on inputEl by invoking registered listeners. Not part of the Obsidian API. */
  public simulateEvent(event: string, ...args: unknown[]): void {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Mock-only method uses mock-only field.
    for (const handler of this.eventListeners[event] ?? []) {
      handler(...args);
    }
  }

  public override asReal__(): RealTextComponent {
    return strictCastTo<RealTextComponent>(this);
  }
}
