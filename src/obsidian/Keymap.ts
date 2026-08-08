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

export class Keymap {
  private readonly scopeStack: Scope[] = [];

  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static create__(): Keymap {
    return new Keymap();
  }

  public static fromOriginalType__(value: KeymapOriginal): Keymap {
    return strictProxy(value, Keymap);
  }

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

  public static isModifier(event: ModifierEvent, modifier: ModifierOriginal): boolean {
    return MODIFIER_FLAG_RESOLVERS[modifier](event);
  }

  public asOriginalType__(): KeymapOriginal {
    return strictProxy<KeymapOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public popScope(scope: Scope): void {
    const index = this.scopeStack.indexOf(scope);
    if (index !== -1) {
      this.scopeStack.splice(index, 1);
    }
  }

  public pushScope(scope: Scope): void {
    this.scopeStack.push(scope);
  }
}
