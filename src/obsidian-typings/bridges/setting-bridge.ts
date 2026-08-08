import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { Setting } from '../../obsidian/Setting.ts';

const PROPERTY_NAME = 'setVisibility';

export function bridgeSetting(): void {
  defineMissingProperty(Setting.prototype, PROPERTY_NAME, {
    // eslint-disable-next-line unicorn/consistent-boolean-name -- `visible` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
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
