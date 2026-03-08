import type {
  Keymap as RealKeymap,
  Modifier,
  PaneType,
  UserEvent
} from 'obsidian';

import type { Scope } from './Scope.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';

export class Keymap {
  private _scopeStack: Scope[] = [];

  public static create__(): Keymap {
    return new Keymap();
  }

  public static constructor__(_instance: Keymap): void {
    // Spy hook.
  }

  public asReal__(): RealKeymap {
    return strictCastTo<RealKeymap>(this);
  }

  public static isModEvent(_evt?: null | UserEvent): boolean | PaneType {
    return false;
  }

  protected constructor() {
    const mock = strictMock(this);
    Keymap.constructor__(mock);
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
