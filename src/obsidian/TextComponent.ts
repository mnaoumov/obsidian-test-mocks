import type { TextComponent as TextComponentOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
  /** Mock-only. Tracks all created instances for test assertions. Not part of the Obsidian API. */
  public static instances__: TextComponent[] = [];
  /** Mock-only. Tracks registered event listeners for use with {@link simulateEvent__}. Not part of the Obsidian API. */
  public eventListeners__: Record<string, ((...args: unknown[]) => void)[]> = {};

  public constructor(_containerEl: HTMLElement) {
    super(createEl('input'));
    const eventListeners = this.eventListeners__;
    const origAddEventListener = this.inputEl.addEventListener.bind(this.inputEl);
    this.inputEl.addEventListener = function addEventListenerWrapper(this: HTMLInputElement, ...args: Parameters<HTMLInputElement['addEventListener']>): void {
      const [event, handler] = args;
      if (typeof handler === 'function') {
        eventListeners[event] ??= [];
        eventListeners[event].push(handler as (...a: unknown[]) => void);
      }
      origAddEventListener(...args);
    } as HTMLInputElement['addEventListener'];
    TextComponent.instances__.push(this);
    return strictMock(this);
  }

  public override asOriginalType__(): TextComponentOriginal {
    return castTo<TextComponentOriginal>(this);
  }

  public override onChange(cb: (value: string) => unknown): this {
    return super.onChange(cb);
  }

  /** Mock-only. Simulates a DOM event on inputEl by invoking registered listeners. Not part of the Obsidian API. */
  public simulateEvent__(event: string, ...args: unknown[]): void {
    for (const handler of this.eventListeners__[event] ?? []) {
      handler(...args);
    }
  }
}
