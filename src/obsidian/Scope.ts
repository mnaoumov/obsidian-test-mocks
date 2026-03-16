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
  private readonly keys: MockKeyScope[] = [];

  protected constructor(_parent?: Scope) {
    const self = strictMock(this);
    self.constructor__(_parent);
    return self;
  }

  public static create__(parent?: Scope): Scope {
    return new Scope(parent);
  }

  public static fromOriginalType__(value: ScopeOriginal): Scope {
    return castTo<Scope>(value);
  }

  public asOriginalType__(): ScopeOriginal {
    return castTo<ScopeOriginal>(this);
  }

  public constructor__(_parent?: Scope): void {
    noop();
  }

  public register(modifiers: ModifierOriginal[] | null, key: null | string, _func: KeymapEventListenerOriginal): KeymapEventHandlerOriginal {
    const handler = castTo<KeymapEventHandlerOriginal>({ key, modifiers: modifiers?.join(',') ?? null, scope: this });
    this.keys.push(castTo<MockKeyScope>(handler));
    return handler;
  }

  public unregister(handler: KeymapEventHandlerOriginal): void {
    const index = this.keys.indexOf(castTo<MockKeyScope>(handler));
    if (index !== -1) {
      this.keys.splice(index, 1);
    }
  }
}
