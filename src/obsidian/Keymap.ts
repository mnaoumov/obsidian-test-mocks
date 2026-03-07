import type {
  Modifier,
  PaneType,
  UserEvent
} from 'obsidian';

import type { Scope } from './Scope.ts';

import { strictMock } from '../internal/StrictMock.ts';

export class Keymap {
  private _scopeStack: Scope[] = [];

  public static __create(): Keymap {
    return new Keymap();
  }

  public static __constructor(_instance: Keymap): void {
    // Spy hook.
  }

  public static isModEvent(_evt?: null | UserEvent): boolean | PaneType {
    return false;
  }

  protected constructor() {
    const mock = strictMock(this);
    Keymap.__constructor(mock);
    return mock;
  }

  public static isModifier(_evt: KeyboardEvent | MouseEvent | TouchEvent, _modifier: Modifier): boolean {
    return false;
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
