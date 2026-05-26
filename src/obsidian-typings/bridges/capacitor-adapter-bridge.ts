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
    set(this: CapacitorAdapter, value: boolean) {
      this.insensitive__ = value;
    }
  });
}

export function unbridgeCapacitorAdapter(): void {
  deleteMissingProperty(CapacitorAdapter.prototype, PROPERTY_NAME);
}
