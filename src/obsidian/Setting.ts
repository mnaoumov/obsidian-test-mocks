import type {
  ButtonComponent as ButtonComponentOriginal,
  ColorComponent as ColorComponentOriginal,
  DropdownComponent as DropdownComponentOriginal,
  ExtraButtonComponent as ExtraButtonComponentOriginal,
  MomentFormatComponent as MomentFormatComponentOriginal,
  ProgressBarComponent as ProgressBarComponentOriginal,
  SearchComponent as SearchComponentOriginal,
  Setting as SettingOriginal,
  SliderComponent as SliderComponentOriginal,
  TextAreaComponent as TextAreaComponentOriginal,
  TextComponent as TextComponentOriginal,
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import type { BaseComponent } from './BaseComponent.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ButtonComponent as MockButtonComponent } from './ButtonComponent.ts';
import { ColorComponent as MockColorComponent } from './ColorComponent.ts';
import { DropdownComponent as MockDropdownComponent } from './DropdownComponent.ts';
import { ExtraButtonComponent as MockExtraButtonComponent } from './ExtraButtonComponent.ts';
import { MomentFormatComponent as MockMomentFormatComponent } from './MomentFormatComponent.ts';
import { ProgressBarComponent as MockProgressBarComponent } from './ProgressBarComponent.ts';
import { SearchComponent as MockSearchComponent } from './SearchComponent.ts';
import { SliderComponent as MockSliderComponent } from './SliderComponent.ts';
import { TextAreaComponent as MockTextAreaComponent } from './TextAreaComponent.ts';
import { TextComponent as MockTextComponent } from './TextComponent.ts';
import { ToggleComponent as MockToggleComponent } from './ToggleComponent.ts';

export class Setting {
  public components: BaseComponent[] = [];
  public controlEl: HTMLElement;
  public descEl: HTMLElement;
  public infoEl: HTMLElement;
  public nameEl: HTMLElement;
  public settingEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    this.controlEl = createDiv();
    this.descEl = createDiv();
    this.infoEl = createDiv();
    this.nameEl = createDiv();
    this.settingEl = createDiv();
    this.settingEl.appendChild(this.infoEl);
    this.infoEl.appendChild(this.nameEl);
    this.infoEl.appendChild(this.descEl);
    this.settingEl.appendChild(this.controlEl);
    containerEl.appendChild(this.settingEl);
    this.constructor__(containerEl);
  }

  public static create__(containerEl: HTMLElement): Setting {
    return strictMock(new Setting(containerEl));
  }

  public addButton(cb: (component: ButtonComponentOriginal) => unknown): this {
    const comp = MockButtonComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ButtonComponentOriginal>(comp));
    return this;
  }

  public addColorPicker(cb: (component: ColorComponentOriginal) => unknown): this {
    const comp = MockColorComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ColorComponentOriginal>(comp));
    return this;
  }

  public addComponent(cb: (el: HTMLElement) => BaseComponent): this {
    const component = cb(this.controlEl);
    this.components.push(component);
    return this;
  }

  public addDropdown(cb: (component: DropdownComponentOriginal) => unknown): this {
    const comp = MockDropdownComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<DropdownComponentOriginal>(comp));
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = MockExtraButtonComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ExtraButtonComponentOriginal>(comp));
    return this;
  }

  public addMomentFormat(cb: (component: MomentFormatComponentOriginal) => unknown): this {
    const comp = MockMomentFormatComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<MomentFormatComponentOriginal>(comp));
    return this;
  }

  public addProgressBar(cb: (component: ProgressBarComponentOriginal) => unknown): this {
    const comp = MockProgressBarComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ProgressBarComponentOriginal>(comp));
    return this;
  }

  public addSearch(cb: (component: SearchComponentOriginal) => unknown): this {
    const comp = MockSearchComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<SearchComponentOriginal>(comp));
    return this;
  }

  public addSlider(cb: (component: SliderComponentOriginal) => unknown): this {
    const comp = MockSliderComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<SliderComponentOriginal>(comp));
    return this;
  }

  public addText(cb: (component: TextComponentOriginal) => unknown): this {
    const comp = MockTextComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<TextComponentOriginal>(comp));
    return this;
  }

  public addTextArea(cb: (component: TextAreaComponentOriginal) => unknown): this {
    const comp = MockTextAreaComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<TextAreaComponentOriginal>(comp));
    return this;
  }

  public addToggle(cb: (component: ToggleComponentOriginal) => unknown): this {
    const comp = MockToggleComponent.create__(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ToggleComponentOriginal>(comp));
    return this;
  }

  public asOriginalType__(): SettingOriginal {
    return castTo<SettingOriginal>(this);
  }

  public clear(): this {
    this.components = [];
    return this;
  }

  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  public setClass(cls: string): this {
    this.settingEl.classList.add(cls);
    return this;
  }

  public setDesc(desc: DocumentFragment | string): this {
    if (typeof desc === 'string') {
      this.descEl.textContent = desc;
    } else {
      this.descEl.appendChild(desc);
    }
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.settingEl.classList.toggle('is-disabled', disabled);
    return this;
  }

  public setHeading(): this {
    this.settingEl.classList.add('setting-item-heading');
    return this;
  }

  public setName(name: DocumentFragment | string): this {
    if (typeof name === 'string') {
      this.nameEl.textContent = name;
    } else {
      this.nameEl.appendChild(name);
    }
    return this;
  }

  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.settingEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public then(cb: (setting: this) => unknown): this {
    cb(this);
    return this;
  }
}
