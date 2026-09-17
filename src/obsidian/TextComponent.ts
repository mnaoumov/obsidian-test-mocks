/**
 * @file
 *
 * Mock of Obsidian's `TextComponent`, a single-line text input.
 */

import type { TextComponent as TextComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

/**
 * Mock of Obsidian's `TextComponent`: a text component backed by an `<input>`.
 *
 * Function listeners added to the input with `addEventListener` are also recorded in
 * {@link TextComponent.eventListeners__}, so a test can fire them with {@link TextComponent.simulateEvent__}.
 */
export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
  /**
   * Mock-only: the function listeners added to the input, keyed by event type, in registration order.
   */
  public eventListeners__: Record<string, ((...$arguments: unknown[]) => void)[]> = {};

  /**
   * Creates a text input, appends it to the container and wraps its `addEventListener` to record listeners.
   *
   * @param containerEl - The element to create the input in.
   */
  public constructor(containerEl: HTMLElement) {
    super(containerEl.createEl('input'));
    const eventListeners = this.eventListeners__;
    const origAddEventListener = this.inputEl.addEventListener.bind(this.inputEl);
    this.inputEl.addEventListener = function addEventListenerWrapper(this: HTMLInputElement, ...$arguments: Parameters<HTMLInputElement['addEventListener']>): void {
      const [event, handler] = $arguments;
      if (typeof handler === 'function') {
        eventListeners[event] ??= [];
        eventListeners[event].push(handler as (...a: unknown[]) => void);
      }
      origAddEventListener(...$arguments);
    } as HTMLInputElement['addEventListener'];
    const self = strictProxy(this);
    self.constructor4__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a text input, spyable via `vi.spyOn(TextComponent, 'create__')`.
   *
   * @param containerEl - The element to create the input in.
   * @returns The new text component.
   */
  public static create__(containerEl: HTMLElement): TextComponent {
    return new TextComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TextComponent` as this mock.
   *
   * @param value - The value typed as the original `TextComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: TextComponentOriginal): TextComponent {
    return strictProxy(value, TextComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TextComponent` type.
   *
   * @returns The same object, typed as the original `TextComponent`.
   */
  public asOriginalType4__(): TextComponentOriginal {
    return strictProxy<TextComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TextComponent.prototype, 'constructor4__')`.
   *
   * @param _containerEl - The container the input was created in.
   */
  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Registers the callback invoked when the value changes, replacing any previous one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public override onChange(callback: (value: string) => unknown): this {
    return super.onChange(callback);
  }

  /**
   * Mock-only: fires an event by calling every listener recorded for it, synchronously and in registration order.
   * No DOM event is dispatched.
   *
   * @param event - The event type, such as `'keydown'`.
   * @param $arguments - The arguments passed to each listener.
   */
  public simulateEvent__(event: string, ...$arguments: unknown[]): void {
    for (const handler of this.eventListeners__[event] ?? []) {
      handler(...$arguments);
    }
  }
}
