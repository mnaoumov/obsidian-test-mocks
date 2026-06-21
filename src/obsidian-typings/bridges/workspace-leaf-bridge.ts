import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { noop } from '../../internal/noop.ts';
import { WorkspaceLeaf } from '../../obsidian/WorkspaceLeaf.ts';

const PROPERTY_NAME = 'onOpenTabHeaderMenu';

export function bridgeWorkspaceLeaf(): void {
  defineMissingProperty(WorkspaceLeaf.prototype, PROPERTY_NAME, {
    value(_evt: MouseEvent, _parentEl: HTMLElement): void {
      noop();
    },
    writable: true
  });
}

export function unbridgeWorkspaceLeaf(): void {
  deleteMissingProperty(WorkspaceLeaf.prototype, PROPERTY_NAME);
}
