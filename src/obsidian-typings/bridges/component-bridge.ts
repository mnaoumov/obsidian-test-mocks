import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { Component } from '../../obsidian/Component.ts';

const LOADED_PROPERTY_NAME = '_loaded';
const CHILDREN_PROPERTY_NAME = '_children';

export function bridgeComponent(): void {
  defineMissingProperty(Component.prototype, LOADED_PROPERTY_NAME, {
    get(this: Component): boolean {
      return this.loaded__;
    },
    set(this: Component, value: boolean) {
      this.loaded__ = value;
    }
  });

  defineMissingProperty(Component.prototype, CHILDREN_PROPERTY_NAME, {
    get(this: Component): Component[] {
      return this.children__;
    },
    set(this: Component, value: Component[]) {
      this.children__ = value;
    }
  });
}

export function unbridgeComponent(): void {
  deleteMissingProperty(Component.prototype, LOADED_PROPERTY_NAME);
  deleteMissingProperty(Component.prototype, CHILDREN_PROPERTY_NAME);
}
