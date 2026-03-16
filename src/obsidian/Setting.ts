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

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { ButtonComponent } from './ButtonComponent.ts';
import { ColorComponent } from './ColorComponent.ts';
import { DropdownComponent } from './DropdownComponent.ts';
import { ExtraButtonComponent } from './ExtraButtonComponent.ts';
import { MomentFormatComponent } from './MomentFormatComponent.ts';
import { ProgressBarComponent } from './ProgressBarComponent.ts';
import { SearchComponent } from './SearchComponent.ts';
import { SliderComponent } from './SliderComponent.ts';
import { TextAreaComponent } from './TextAreaComponent.ts';
import { TextComponent } from './TextComponent.ts';
import { ToggleComponent } from './ToggleComponent.ts';

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
    const self = strictMock(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): Setting {
    return new Setting(containerEl);
  }

  public static fromOriginalType__(value: SettingOriginal): Setting {
    return createMockOfUnsafe<Setting>(value);
  }

  public addButton(cb: (component: ButtonComponentOriginal) => unknown): this {
    const comp = ButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType2__());
    return this;
  }

  public addColorPicker(cb: (component: ColorComponentOriginal) => unknown): this {
    const comp = ColorComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType3__());
    return this;
  }

  public addComponent(cb: (el: HTMLElement) => BaseComponent): this {
    const component = cb(this.controlEl);
    this.components.push(component);
    return this;
  }

  public addDropdown(cb: (component: DropdownComponentOriginal) => unknown): this {
    const comp = DropdownComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType3__());
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType2__());
    return this;
  }

  public addMomentFormat(cb: (component: MomentFormatComponentOriginal) => unknown): this {
    const comp = MomentFormatComponent.create2__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType5__());
    return this;
  }

  public addProgressBar(cb: (component: ProgressBarComponentOriginal) => unknown): this {
    const comp = ProgressBarComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType3__());
    return this;
  }

  public addSearch(cb: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType4__());
    return this;
  }

  public addSlider(cb: (component: SliderComponentOriginal) => unknown): this {
    const comp = SliderComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType3__());
    return this;
  }

  public addText(cb: (component: TextComponentOriginal) => unknown): this {
    const comp = TextComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType4__());
    return this;
  }

  public addTextArea(cb: (component: TextAreaComponentOriginal) => unknown): this {
    const comp = TextAreaComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType4__());
    return this;
  }

  public addToggle(cb: (component: ToggleComponentOriginal) => unknown): this {
    const comp = ToggleComponent.create__(this.controlEl);
    this.components.push(comp);
    cb(comp.asOriginalType3__());
    return this;
  }

  public asOriginalType__(): SettingOriginal {
    return createMockOfUnsafe<SettingOriginal>(this);
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
