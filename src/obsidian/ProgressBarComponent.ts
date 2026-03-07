import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export class ProgressBarComponent extends ValueComponent<number> {
  public progressBar: HTMLElement;

  public override get inputEl(): HTMLElement {
    return this.progressBar;
  }

  private _value = 0;

  public constructor(_containerEl: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Calling mock-only @deprecated ValueComponent constructor.
    super();
    this.progressBar = createDiv();
    const mock = strictMock(this);
    ProgressBarComponent.__constructor(mock, _containerEl);
    return mock;
  }

  public static override __constructor<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override getValue(): number {
    return this._value;
  }

  public override setValue(value: number): this {
    this._value = value;
    this.progressBar.style.width = `${String(value)}%`;
    this.progressBar.dataset['value'] = String(value);
    return this;
  }
}
