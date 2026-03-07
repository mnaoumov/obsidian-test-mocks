import { noop } from '../internal/Noop.ts';
import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  public inputEl: HTMLInputElement = createEl('input');
  private _value = '';

  public getValue(): string {
    return this._value;
  }

  public onChange(_callback: (value: string) => unknown): this {
    return this;
  }

  public onChanged(): void {
    noop();
  }

  public setPlaceholder(_placeholder: string): this {
    return this;
  }

  public setValue(value: string): this {
    this._value = value;
    return this;
  }
}
