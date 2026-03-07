export abstract class BaseComponent {
  public disabled = false;

  protected constructor() {
    BaseComponent.__constructor(this);
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
