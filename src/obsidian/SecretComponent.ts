import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  public inputEl: HTMLInputElement = createEl('input');
  private _onChange: ((value: string) => unknown) | null = null;
  private _value = '';

  public getValue(): string {
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
    this.inputEl.placeholder = placeholder;
    return this;
  }

  public setValue(value: string): this {
    this._value = value;
    this._onChange?.(value);
    return this;
  }
}
