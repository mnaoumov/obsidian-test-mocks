/**
 * @file
 *
 * Mock of Obsidian's `Scope`, which binds keyboard shortcuts to callbacks.
 */

import type {
  KeymapEventHandler as KeymapEventHandlerOriginal,
  KeymapEventListener as KeymapEventListenerOriginal,
  Modifier as ModifierOriginal,
  Scope as ScopeOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Scope`, which receives keyboard events and binds callbacks to hotkeys. Only one scope is active
 * at a time, and a scope inherits the hotkeys of its parent.
 *
 * The mock records registered handlers in memory but never dispatches keyboard events to them, and ignores the
 * parent scope.
 */
export class Scope {
  private readonly handlers: KeymapEventHandlerOriginal[] = [];

  /**
   * Creates a scope. Use {@link Scope.create__} from outside the class.
   *
   * @param parent - The scope whose hotkeys this one inherits.
   */
  protected constructor(parent?: Scope) {
    const self = strictProxy(this);
    self.constructor__(parent);
    return self;
  }

  /**
   * Mock-only factory: creates a scope, spyable via `vi.spyOn(Scope, 'create__')`.
   *
   * @param parent - The scope whose hotkeys this one inherits.
   * @returns The new scope.
   */
  public static create__(parent?: Scope): Scope {
    return new Scope(parent);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Scope` as this mock.
   *
   * @param value - The value typed as the original `Scope`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: ScopeOriginal): Scope {
    return strictProxy(value, Scope);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Scope` type.
   *
   * @returns The same object, typed as the original `Scope`.
   */
  public asOriginalType__(): ScopeOriginal {
    return strictProxy<ScopeOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Scope.prototype, 'constructor__')`.
   *
   * @param _parent - The parent scope the scope was created with, if any.
   */
  public constructor__(_parent?: Scope): void {
    noop();
  }

  /**
   * Adds a keymap event handler to this scope. The mock records the handler but never invokes the callback.
   *
   * @param modifiers - `Mod`, `Ctrl`, `Meta`, `Shift` or `Alt` (`Mod` is `Meta` on macOS and `Ctrl` elsewhere), or
   * `null` to match the key regardless of modifiers.
   * @param key - The `KeyboardEvent.key` value to match, or `null` to match any key.
   * @param _function - The callback Obsidian calls when the hotkey is triggered.
   * @returns The registered handler, whose `modifiers` are joined with commas; pass it to
   * {@link Scope.unregister} to remove it.
   */
  public register(modifiers: ModifierOriginal[] | null, key: null | string, _function: KeymapEventListenerOriginal): KeymapEventHandlerOriginal {
    const handler: KeymapEventHandlerOriginal = {
      key,
      modifiers: modifiers?.join(',') ?? null,
      scope: this
    };
    this.handlers.push(handler);
    return handler;
  }

  /**
   * Removes a keymap event handler returned by {@link Scope.register}. Unknown handlers are ignored.
   *
   * @param handler - The handler to remove.
   */
  public unregister(handler: KeymapEventHandlerOriginal): void {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) {
      this.handlers.splice(index, 1);
    }
  }
}
