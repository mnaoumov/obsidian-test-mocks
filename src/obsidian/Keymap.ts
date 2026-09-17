/**
 * @file
 *
 * Mock of Obsidian's `Keymap`, which manages the stack of keyboard scopes and reads modifier keys off events.
 */

import type {
  Keymap as KeymapOriginal,
  Modifier as ModifierOriginal,
  PaneType as PaneTypeOriginal,
  UserEvent as UserEventOriginal
} from 'obsidian';

import type { Scope } from './Scope.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Platform } from './vars/Platform.ts';

type ModifierEvent = KeyboardEvent | MouseEvent | TouchEvent;

const MIDDLE_MOUSE_BUTTON = 1;

const MODIFIER_FLAG_RESOLVERS: Record<ModifierOriginal, (event: ModifierEvent) => boolean> = {
  Alt: (event) => event.altKey,
  Ctrl: (event) => event.ctrlKey,
  Meta: (event) => event.metaKey,
  // eslint-disable-next-line unicorn/name-replacements -- `Mod` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  Mod: (event) => Platform.isMacOS ? event.metaKey : event.ctrlKey,
  Shift: (event) => event.shiftKey
};

/**
 * Mock of Obsidian's `Keymap`.
 *
 * The scope stack is kept in memory but never dispatches key events; the static modifier helpers read the real
 * flags off the event, resolving `Mod` through the mocked `Platform.isMacOS`.
 */
export class Keymap {
  private readonly scopeStack: Scope[] = [];

  /**
   * Creates a keymap with an empty scope stack. Use {@link Keymap.create__} from tests.
   */
  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only factory: creates a keymap, spyable via `vi.spyOn(Keymap, 'create__')`.
   *
   * @returns The new keymap.
   */
  public static create__(): Keymap {
    return new Keymap();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Keymap` as this mock.
   *
   * @param value - The value typed as the original `Keymap`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: KeymapOriginal): Keymap {
    return strictProxy(value, Keymap);
  }

  /**
   * Translates an event into the type of pane a link should open in.
   *
   * @param event - The user event to inspect, if any.
   * @returns `'tab'` for a middle click or for Cmd/Ctrl, `'split'` for Cmd/Ctrl+Alt, `'window'` for
   * Cmd/Ctrl+Alt+Shift, and `false` when there is no event or Cmd/Ctrl is not held.
   */
  // eslint-disable-next-line unicorn/name-replacements -- `isModEvent` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public static isModEvent(event?: null | UserEventOriginal): boolean | PaneTypeOriginal {
    if (!event) {
      return false;
    }

    if (event instanceof MouseEvent && event.button === MIDDLE_MOUSE_BUTTON) {
      return 'tab';
    }

    if (!Keymap.isModifier(event, 'Mod')) {
      return false;
    }

    if (!Keymap.isModifier(event, 'Alt')) {
      return 'tab';
    }

    return Keymap.isModifier(event, 'Shift') ? 'window' : 'split';
  }

  /**
   * Checks whether a modifier key was held during an event.
   *
   * @param event - The keyboard, mouse or touch event to inspect.
   * @param modifier - The modifier to check; `Mod` means Cmd on macOS and Ctrl elsewhere.
   * @returns Whether the modifier was held.
   */
  public static isModifier(event: ModifierEvent, modifier: ModifierOriginal): boolean {
    return MODIFIER_FLAG_RESOLVERS[modifier](event);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Keymap` type.
   *
   * @returns The same object, typed as the original `Keymap`.
   */
  public asOriginalType__(): KeymapOriginal {
    return strictProxy<KeymapOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Keymap.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Removes a scope from the scope stack; when it was the active scope, the next one down becomes active.
   * Removing a scope that is not on the stack does nothing.
   *
   * @param scope - The scope to remove.
   */
  public popScope(scope: Scope): void {
    const index = this.scopeStack.indexOf(scope);
    if (index !== -1) {
      this.scopeStack.splice(index, 1);
    }
  }

  /**
   * Pushes a scope onto the scope stack, making it the active scope for key events.
   *
   * @param scope - The scope to activate.
   */
  public pushScope(scope: Scope): void {
    this.scopeStack.push(scope);
  }
}
