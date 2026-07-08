import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../../internal/noop.ts';
import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { SuggestModal } from '../../obsidian/SuggestModal.ts';
import {
  bridgeSuggestModal,
  unbridgeSuggestModal
} from './suggest-modal-bridge.ts';

class ConcreteSuggestModal extends SuggestModal<string> {
  public getSuggestions(_query: string): string[] {
    return [];
  }

  public onChooseSuggestion(_item: string, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }

  public renderSuggestion(_value: string, _el: HTMLElement): void {
    noop();
  }
}

describe('suggest-modal-bridge', () => {
  afterEach(() => {
    unbridgeSuggestModal();
  });

  function createModal(): ConcreteSuggestModal {
    return new ConcreteSuggestModal(App.createConfigured__());
  }

  it('should bridge instructionsEl getter to instructionsEl__', () => {
    bridgeSuggestModal();
    const modal = createModal();
    expect(ensureGenericObject(modal)['instructionsEl']).toBe(modal.instructionsEl__);
  });

  it('should not overwrite if property already exists', () => {
    bridgeSuggestModal();
    bridgeSuggestModal();
    const modal = createModal();
    expect(ensureGenericObject(modal)['instructionsEl']).toBe(modal.instructionsEl__);
  });

  it('should remove bridge on unbridge', () => {
    bridgeSuggestModal();
    unbridgeSuggestModal();
    expect('instructionsEl' in SuggestModal.prototype).toBe(false);
  });
});
