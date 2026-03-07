import type {
  KeymapEventHandler,
  KeymapEventListener,
  KeymapInfo,
  Modifier
} from 'obsidian';

interface MockKeyScope {
  func(): void;
  key: null | string;
  modifiers: null | string;
  scope: Scope;
}

export class Scope {
  public cb: (() => boolean) | undefined = undefined;
  public keys: MockKeyScope[] = [];
  public parent: Scope | undefined = undefined;
  public tabFocusContainerEl: HTMLElement | null = null;

  public static __create(parent?: Scope): Scope {
    return new Scope(parent);
  }

  public static __constructor(_instance: Scope, _parent?: Scope): void {
    // Spy hook.
  }

  protected constructor(parent?: Scope) {
    this.parent = parent;
    Scope.__constructor(this, parent);
  }

  public constructor__(_parent?: Scope): this {
    return this;
  }

  public handleKey(_event: KeyboardEvent, _keypress: KeymapInfo): unknown {
    return false;
  }

  public register(modifiers: Modifier[] | null, key: null | string, _func: KeymapEventListener): KeymapEventHandler {
    const handler = { key: key, modifiers: modifiers?.join(',') ?? null, scope: this };
    this.keys.push(handler as unknown as MockKeyScope);
    return handler;
  }

  public setTabFocusContainer(container: HTMLElement): void {
    this.tabFocusContainerEl = container;
  }

  public unregister(handler: KeymapEventHandler): void {
    const index = this.keys.indexOf(handler as unknown as MockKeyScope);
    if (index !== -1) {
      this.keys.splice(index, 1);
    }
  }
}
