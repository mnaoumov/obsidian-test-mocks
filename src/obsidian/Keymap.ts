import type {
  Keymap as KeymapOriginal,
  Modifier as ModifierOriginal,
  PaneType as PaneTypeOriginal,
  UserEvent as UserEventOriginal
} from 'obsidian';

import type { Scope } from './Scope.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';

export class Keymap {
  private readonly scopeStack: Scope[] = [];

  protected constructor() {
    const self = strictProxyForce(this);
    self.constructor__();
    return self;
  }

  public static create__(): Keymap {
    return new Keymap();
  }

  public static fromOriginalType__(value: KeymapOriginal): Keymap {
    return strictProxyForce(value, Keymap);
  }

  public static isModEvent(_evt?: null | UserEventOriginal): boolean | PaneTypeOriginal {
    return false;
  }

  public static isModifier(_evt: KeyboardEvent | MouseEvent | TouchEvent, _modifier: ModifierOriginal): boolean {
    return false;
  }

  public asOriginalType__(): KeymapOriginal {
    return strictProxyForce<KeymapOriginal>(this);
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
