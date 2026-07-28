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

const MODIFIER_FLAG_RESOLVERS: Record<ModifierOriginal, (evt: ModifierEvent) => boolean> = {
  Alt: (evt) => evt.altKey,
  Ctrl: (evt) => evt.ctrlKey,
  Meta: (evt) => evt.metaKey,
  Mod: (evt) => Platform.isMacOS ? evt.metaKey : evt.ctrlKey,
  Shift: (evt) => evt.shiftKey
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

  public static isModEvent(evt?: null | UserEventOriginal): boolean | PaneTypeOriginal {
    if (!evt) {
      return false;
    }

    if (evt instanceof MouseEvent && evt.button === MIDDLE_MOUSE_BUTTON) {
      return 'tab';
    }

    if (!Keymap.isModifier(evt, 'Mod')) {
      return false;
    }

    if (!Keymap.isModifier(evt, 'Alt')) {
      return 'tab';
    }

    return Keymap.isModifier(evt, 'Shift') ? 'window' : 'split';
  }

  public static isModifier(evt: ModifierEvent, modifier: ModifierOriginal): boolean {
    return MODIFIER_FLAG_RESOLVERS[modifier](evt);
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
