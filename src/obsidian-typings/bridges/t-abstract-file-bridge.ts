import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { TAbstractFile } from '../../obsidian/TAbstractFile.ts';

const PROPERTY_NAME = 'deleted';

export function bridgeTAbstractFile(): void {
  defineMissingProperty(TAbstractFile.prototype, PROPERTY_NAME, {
    get(this: TAbstractFile): boolean {
      return this.deleted__;
    },
    // eslint-disable-next-line unicorn/consistent-boolean-name -- `value` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
    set(this: TAbstractFile, value: boolean) {
      this.deleted__ = value;
    }
  });
}

export function unbridgeTAbstractFile(): void {
  deleteMissingProperty(TAbstractFile.prototype, PROPERTY_NAME);
}
