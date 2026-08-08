import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { CapacitorAdapter } from '../../obsidian/CapacitorAdapter.ts';

const PROPERTY_NAME = 'insensitive';

export function bridgeCapacitorAdapter(): void {
  defineMissingProperty(CapacitorAdapter.prototype, PROPERTY_NAME, {
    get(this: CapacitorAdapter): boolean {
      return this.insensitive__;
    },
    // eslint-disable-next-line unicorn/consistent-boolean-name -- `value` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
    set(this: CapacitorAdapter, value: boolean) {
      this.insensitive__ = value;
    }
  });
}

export function unbridgeCapacitorAdapter(): void {
  deleteMissingProperty(CapacitorAdapter.prototype, PROPERTY_NAME);
}
