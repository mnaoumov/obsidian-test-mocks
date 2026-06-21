import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { AbstractInputSuggest } from '../../obsidian/AbstractInputSuggest.ts';

const PROPERTY_NAME = 'textInputEl';

export function bridgeAbstractInputSuggest(): void {
  defineMissingProperty(AbstractInputSuggest.prototype, PROPERTY_NAME, {
    get(this: AbstractInputSuggest<unknown>): HTMLDivElement | HTMLInputElement {
      return this.textInputEl__;
    }
  });
}

export function unbridgeAbstractInputSuggest(): void {
  deleteMissingProperty(AbstractInputSuggest.prototype, PROPERTY_NAME);
}
