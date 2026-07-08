import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { SuggestModal } from '../../obsidian/SuggestModal.ts';

const PROPERTY_NAME = 'instructionsEl';

export function bridgeSuggestModal(): void {
  defineMissingProperty(SuggestModal.prototype, PROPERTY_NAME, {
    get(this: SuggestModal<unknown>): HTMLDivElement {
      return this.instructionsEl__;
    }
  });
}

export function unbridgeSuggestModal(): void {
  deleteMissingProperty(SuggestModal.prototype, PROPERTY_NAME);
}
