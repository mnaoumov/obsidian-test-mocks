import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { Setting } from '../../obsidian/Setting.ts';

const PROPERTY_NAME = 'setVisibility';

export function bridgeSetting(): void {
  defineMissingProperty(Setting.prototype, PROPERTY_NAME, {
    value(this: Setting, visible: boolean): Setting {
      this.settingEl.toggle(visible);
      return this;
    },
    writable: true
  });
}

export function unbridgeSetting(): void {
  deleteMissingProperty(Setting.prototype, PROPERTY_NAME);
}
