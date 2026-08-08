import type {
  ButtonComponent as ButtonComponentOriginal,
  ColorComponent as ColorComponentOriginal,
  DisplayValueComponent as DisplayValueComponentOriginal,
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

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ButtonComponent } from './ButtonComponent.ts';
import { ColorComponent } from './ColorComponent.ts';
import { DisplayValueComponent } from './DisplayValueComponent.ts';
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
  public errorEl: HTMLElement | null = null;
  public infoEl: HTMLElement;
  public nameEl: HTMLElement;
  public settingEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    this.settingEl = containerEl.createDiv();
    this.controlEl = this.settingEl.createDiv();
    this.infoEl = this.settingEl.createDiv();
    this.nameEl = this.infoEl.createDiv();
    this.descEl = this.infoEl.createDiv();
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  public static create__(containerEl: HTMLElement): Setting {
    return new Setting(containerEl);
  }

  public static fromOriginalType__(value: SettingOriginal): Setting {
    return strictProxy(value, Setting);
  }

  public addButton(callback: (component: ButtonComponentOriginal) => unknown): this {
    const comp = ButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType2__());
    return this;
  }

  public addColorPicker(callback: (component: ColorComponentOriginal) => unknown): this {
    const comp = ColorComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  public addComponent(callback: (el: HTMLElement) => BaseComponent): this {
    const component = callback(this.controlEl);
    this.components.push(component);
    return this;
  }

  public addDisplayValue(callback: (component: DisplayValueComponentOriginal) => unknown): this {
    const comp = DisplayValueComponent.create__(this.controlEl);
    callback(comp.asOriginalType__());
    return this;
  }

  public addDropdown(callback: (component: DropdownComponentOriginal) => unknown): this {
    const comp = DropdownComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  public addExtraButton(callback: (component: ExtraButtonComponentOriginal) => unknown): this {
    const comp = ExtraButtonComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType2__());
    return this;
  }

  public addMomentFormat(callback: (component: MomentFormatComponentOriginal) => unknown): this {
    const comp = MomentFormatComponent.create2__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType5__());
    return this;
  }

  public addProgressBar(callback: (component: ProgressBarComponentOriginal) => unknown): this {
    const comp = ProgressBarComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  public addSearch(callback: (component: SearchComponentOriginal) => unknown): this {
    const comp = SearchComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  public addSlider(callback: (component: SliderComponentOriginal) => unknown): this {
    const comp = SliderComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  public addText(callback: (component: TextComponentOriginal) => unknown): this {
    const comp = TextComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  public addTextArea(callback: (component: TextAreaComponentOriginal) => unknown): this {
    const comp = TextAreaComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType4__());
    return this;
  }

  public addToggle(callback: (component: ToggleComponentOriginal) => unknown): this {
    const comp = ToggleComponent.create__(this.controlEl);
    this.components.push(comp);
    callback(comp.asOriginalType3__());
    return this;
  }

  public asOriginalType__(): SettingOriginal {
    return strictProxy<SettingOriginal>(this);
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
      this.descEl.append(desc);
    }
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.settingEl.classList.toggle('is-disabled', disabled);
    return this;
  }

  public setErrorMessage(message: null | string): this {
    if (message) {
      this.errorEl ??= this.controlEl.createDiv();
      this.errorEl.textContent = message;
      this.settingEl.addClass('is-invalid');
    } else {
      this.errorEl?.detach();
      this.errorEl = null;
      this.settingEl.removeClass('is-invalid');
    }
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
      this.nameEl.append(name);
    }
    return this;
  }

  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.settingEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public then(callback: (setting: this) => unknown): this {
    callback(this);
    return this;
  }
}
