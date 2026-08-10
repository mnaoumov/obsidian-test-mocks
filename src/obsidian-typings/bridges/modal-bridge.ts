import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { Modal } from '../../obsidian/Modal.ts';

const BG_EL_NAME = 'bgEl';
const HEADER_EL_NAME = 'headerEl';

/**
 * Exposes the `obsidian-typings` members of `Modal` that the mock models under a different name, so
 * production code reading them can be unit-tested. Without this the strict proxy throws on the read
 * rather than returning `undefined`, which is what made `modal.bgEl` untestable.
 *
 * `bgEl` is the dimmed backdrop Obsidian builds as the first `containerEl` child and registers modal
 * dismissal on, so it is the element any "the user clicked outside the dialog" behavior is about.
 * `headerEl` is the `modal-header` wrapper holding `titleEl`.
 */
export function bridgeModal(): void {
  defineMissingProperty(Modal.prototype, BG_EL_NAME, {
    get(this: Modal): HTMLElement {
      return this.bgEl__;
    }
  });

  defineMissingProperty(Modal.prototype, HEADER_EL_NAME, {
    get(this: Modal): HTMLDivElement {
      return this.headerEl__;
    }
  });
}

export function unbridgeModal(): void {
  deleteMissingProperty(Modal.prototype, BG_EL_NAME);
  deleteMissingProperty(Modal.prototype, HEADER_EL_NAME);
}
