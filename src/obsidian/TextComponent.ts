import type { TextComponent as TextComponentOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
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
    const self = strictMock(this);
    self.constructor4__(_containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): TextComponent {
    return new TextComponent(containerEl);
  }

  public static fromOriginalType3__(value: TextComponentOriginal): TextComponent {
    return castTo<TextComponent>(value);
  }

  public override asOriginalType__(): TextComponentOriginal {
    return castTo<TextComponentOriginal>(this);
  }

  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  public override onChange(cb: (value: string) => unknown): this {
    return super.onChange(cb);
  }

  public simulateEvent__(event: string, ...args: unknown[]): void {
    for (const handler of this.eventListeners__[event] ?? []) {
      handler(...args);
    }
  }
}
