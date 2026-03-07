import type {
  ButtonComponent,
  ColorComponent,
  DropdownComponent,
  ExtraButtonComponent,
  MomentFormatComponent,
  ProgressBarComponent,
  SearchComponent,
  SliderComponent,
  TextAreaComponent,
  TextComponent,
  ToggleComponent,
  TooltipOptions
} from 'obsidian';

import type { BaseComponent } from './BaseComponent.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
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
    Setting.__constructor(this, containerEl);
    return strictMock(this);
  }

  public static __constructor(_instance: Setting, _containerEl: HTMLElement): void {
    // Spy hook.
  }

  public addButton(cb: (component: ButtonComponent) => unknown): this {
    const comp = new MockButtonComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ButtonComponent>(comp));
    return this;
  }

  public addColorPicker(cb: (component: ColorComponent) => unknown): this {
    const comp = new MockColorComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ColorComponent>(comp));
    return this;
  }

  public addComponent(cb: (el: HTMLElement) => BaseComponent): this {
    const component = cb(this.controlEl);
    this.components.push(component);
    return this;
  }

  public addDropdown(cb: (component: DropdownComponent) => unknown): this {
    const comp = new MockDropdownComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<DropdownComponent>(comp));
    return this;
  }

  public addExtraButton(cb: (component: ExtraButtonComponent) => unknown): this {
    const comp = new MockExtraButtonComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ExtraButtonComponent>(comp));
    return this;
  }

  public addMomentFormat(cb: (component: MomentFormatComponent) => unknown): this {
    const comp = new MockMomentFormatComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<MomentFormatComponent>(comp));
    return this;
  }

  public addProgressBar(cb: (component: ProgressBarComponent) => unknown): this {
    const comp = new MockProgressBarComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ProgressBarComponent>(comp));
    return this;
  }

  public addSearch(cb: (component: SearchComponent) => unknown): this {
    const comp = new MockSearchComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<SearchComponent>(comp));
    return this;
  }

  public addSlider(cb: (component: SliderComponent) => unknown): this {
    const comp = new MockSliderComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<SliderComponent>(comp));
    return this;
  }

  public addText(cb: (component: TextComponent) => unknown): this {
    const comp = new MockTextComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<TextComponent>(comp));
    return this;
  }

  public addTextArea(cb: (component: TextAreaComponent) => unknown): this {
    const comp = new MockTextAreaComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<TextAreaComponent>(comp));
    return this;
  }

  public addToggle(cb: (component: ToggleComponent) => unknown): this {
    const comp = new MockToggleComponent(this.controlEl);
    this.components.push(castTo<BaseComponent>(comp));
    cb(castTo<ToggleComponent>(comp));
    return this;
  }

  public clear(): this {
    this.components = [];
    return this;
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

  public setTooltip(tooltip: string, _options?: TooltipOptions): this {
    this.settingEl.setAttribute('aria-label', tooltip);
    return this;
  }

  public then(cb: (setting: this) => unknown): this {
    cb(this);
    return this;
  }
}
