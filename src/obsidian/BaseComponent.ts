import { strictMock } from '../internal/StrictMock.ts';

export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    const mock = strictMock(this);
    BaseComponent.__constructor(mock);
    return mock;
  }

  public static __constructor(_instance: BaseComponent, ..._args: unknown[]): void {
    // Spy hook.
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }

  public then(cb: (component: this) => unknown): this {
    cb(this);
    return this;
  }
}
