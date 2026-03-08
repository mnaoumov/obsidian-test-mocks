import { castTo } from '../internal/Cast.ts';
import type {
  KeymapEventHandler,
  KeymapEventListener,
  Modifier,
  Scope as RealScope
} from 'obsidian';

import {
  strictMock
} from '../internal/StrictMock.ts';

interface MockKeyScope {
  func(): void;
  key: null | string;
  modifiers: null | string;
  scope: Scope;
}

export class Scope {
  private _keys: MockKeyScope[] = [];

  public static create__(parent?: Scope): Scope {
    return new Scope(parent);
  }

  public static constructor__(_instance: Scope, _parent?: Scope): void {
    // Spy hook.
  }

  public asReal__(): RealScope {
    return castTo<RealScope>(this);
  }

  protected constructor(parent?: Scope) {
    const mock = strictMock(this);
    Scope.constructor__(mock, parent);
    return mock;
  }

  public register(modifiers: Modifier[] | null, key: null | string, _func: KeymapEventListener): KeymapEventHandler {
    const handler = { key: key, modifiers: modifiers?.join(',') ?? null, scope: this } as unknown as KeymapEventHandler;
    this._keys.push(handler as unknown as MockKeyScope);
    return handler;
  }

  public unregister(handler: KeymapEventHandler): void {
    const index = this._keys.indexOf(handler as unknown as MockKeyScope);
    if (index !== -1) {
      this._keys.splice(index, 1);
    }
  }
}
