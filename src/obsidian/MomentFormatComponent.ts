import { TextComponent } from './TextComponent.ts';

export class MomentFormatComponent extends TextComponent {
  public sampleEl: HTMLElement = createDiv();

  public constructor(containerEl: HTMLElement) {
    super(containerEl);
  }

  public setDefaultFormat(_defaultFormat: string): this {
    return this;
  }

  public setSampleEl(sampleEl: HTMLElement): this {
    this.sampleEl = sampleEl;
    return this;
  }

  public override setValue(value: string): this {
    return super.setValue(value);
  }
}
