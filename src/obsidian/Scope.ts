import type {
  KeymapEventHandler as KeymapEventHandlerOriginal,
  KeymapEventListener as KeymapEventListenerOriginal,
  Modifier as ModifierOriginal,
  Scope as ScopeOriginal
} from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class Scope {
  private readonly handlers: KeymapEventHandlerOriginal[] = [];

  protected constructor(_parent?: Scope) {
    const self = createMockOfUnsafe(this);
    self.constructor__(_parent);
    return self;
  }

  public static create__(parent?: Scope): Scope {
    return new Scope(parent);
  }

  public static fromOriginalType__(value: ScopeOriginal): Scope {
    return createMockOfUnsafe<Scope>(value);
  }

  public asOriginalType__(): ScopeOriginal {
    return createMockOfUnsafe<ScopeOriginal>(this);
  }

  public constructor__(_parent?: Scope): void {
    noop();
  }

  public register(modifiers: ModifierOriginal[] | null, key: null | string, _func: KeymapEventListenerOriginal): KeymapEventHandlerOriginal {
    const handler: KeymapEventHandlerOriginal = {
      key,
      modifiers: modifiers?.join(',') ?? null,
      scope: this
    };
    this.handlers.push(handler);
    return handler;
  }

  public unregister(handler: KeymapEventHandlerOriginal): void {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) {
      this.handlers.splice(index, 1);
    }
  }
}
