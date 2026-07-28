import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { TFolder } from '../../obsidian/TFolder.ts';

const GET_PARENT_PREFIX_NAME = 'getParentPrefix';

export function bridgeTFolder(): void {
  defineMissingProperty(TFolder.prototype, GET_PARENT_PREFIX_NAME, {
    value(this: TFolder): string {
      return this.getParentPrefix__();
    },
    writable: true
  });
}

export function unbridgeTFolder(): void {
  deleteMissingProperty(TFolder.prototype, GET_PARENT_PREFIX_NAME);
}
