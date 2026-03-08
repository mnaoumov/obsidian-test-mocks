import { strictMock } from '../internal/StrictMock.ts';
import { ValueComponent } from './ValueComponent.ts';

export abstract class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
  public override inputEl: T;

  private _onChange?: (value: string) => unknown;
  private _value = '';

  public constructor(inputEl: T) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Calling mock-only @deprecated ValueComponent constructor.
    super();
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Assigning mock-only @deprecated inputEl.
    this.inputEl = inputEl;
    const mock = strictMock(this);
    AbstractTextComponent.constructor__(mock, inputEl);
    return mock;
  }

  public static override constructor__<T>(_instance: ValueComponent<T>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override getValue(): string {
    return this._value;
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public onChanged(): void {
    this._onChange?.(this._value);
  }

  public setPlaceholder(placeholder: string): this {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Accessing mock-only @deprecated inputEl.
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public override setValue(value: string): this {
    this._value = value;
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Accessing mock-only @deprecated inputEl.
    this.inputEl.value = value;
    this._onChange?.(value);
    return this;
  }
}
