import type {
  KeymapEventHandler as KeymapEventHandlerOriginal,
  KeymapEventListener as KeymapEventListenerOriginal,
  Modifier as ModifierOriginal,
  Scope as ScopeOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

interface MockKeyScope {
  func(): void;
  key: null | string;
  modifiers: null | string;
  scope: Scope;
}

export class Scope {
  private readonly _keys: MockKeyScope[] = [];

  protected constructor(_parent?: Scope) {
    const self = strictMock(this);
    self.constructor__(_parent);
    return self;
  }

  public static create__(parent?: Scope): Scope {
    return new Scope(parent);
  }

  public asOriginalType__(): ScopeOriginal {
    return castTo<ScopeOriginal>(this);
  }

  public constructor__(_parent?: Scope): void {
    noop();
  }

  public register(modifiers: ModifierOriginal[] | null, key: null | string, _func: KeymapEventListenerOriginal): KeymapEventHandlerOriginal {
    const handler = { key, modifiers: modifiers?.join(',') ?? null, scope: this } as unknown as KeymapEventHandlerOriginal;
    this._keys.push(handler as unknown as MockKeyScope);
    return handler;
  }

  public unregister(handler: KeymapEventHandlerOriginal): void {
    const index = this._keys.indexOf(handler as unknown as MockKeyScope);
    if (index !== -1) {
      this._keys.splice(index, 1);
    }
  }
}
