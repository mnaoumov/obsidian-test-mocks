import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { SettingGroup } from '../../obsidian/SettingGroup.ts';

const PROPERTY_NAME = 'listEl';

export function bridgeSettingGroup(): void {
  defineMissingProperty(SettingGroup.prototype, PROPERTY_NAME, {
    get(this: SettingGroup): HTMLDivElement {
      return this.listEl__;
    }
  });
}

export function unbridgeSettingGroup(): void {
  deleteMissingProperty(SettingGroup.prototype, PROPERTY_NAME);
}
