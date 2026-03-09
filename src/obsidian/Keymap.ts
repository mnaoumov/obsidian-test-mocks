import type {
  Keymap as KeymapOriginal,
  Modifier,
  PaneType,
  UserEvent
} from 'obsidian';

import type { Scope } from './Scope.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class Keymap {
  private readonly _scopeStack: Scope[] = [];

  protected constructor() {
  }

  public static create__(): Keymap {
    return strictMock(new Keymap());
  }

  public static isModEvent(_evt?: null | UserEvent): boolean | PaneType {
    return false;
  }

  public static isModifier(_evt: KeyboardEvent | MouseEvent | TouchEvent, _modifier: Modifier): boolean {
    return false;
  }

  public asOriginalType__(): KeymapOriginal {
    return castTo<KeymapOriginal>(this);
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
