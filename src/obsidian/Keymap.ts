import type {
  Keymap as KeymapOriginal,
  Modifier as ModifierOriginal,
  PaneType as PaneTypeOriginal,
  UserEvent as UserEventOriginal
} from 'obsidian';

import type { Scope } from './Scope.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class Keymap {
  private readonly _scopeStack: Scope[] = [];

  protected constructor() {
    const self = strictMock(this);
    self.constructor__();
    return self;
  }

  public static create__(): Keymap {
    return new Keymap();
  }

  public static isModEvent(_evt?: null | UserEventOriginal): boolean | PaneTypeOriginal {
    return false;
  }

  public static isModifier(_evt: KeyboardEvent | MouseEvent | TouchEvent, _modifier: ModifierOriginal): boolean {
    return false;
  }

  public asOriginalType__(): KeymapOriginal {
    return castTo<KeymapOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public popScope(scope: Scope): void {
    const index = this._scopeStack.indexOf(scope);
    if (index !== -1) {
      this._scopeStack.splice(index, 1);
    }
  }

  public pushScope(scope: Scope): void {
    this._scopeStack.push(scope);
  }
}
