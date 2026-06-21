import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../../internal/noop.ts';
import { ensureGenericObject } from '../../internal/type-guards.ts';
import { AbstractInputSuggest } from '../../obsidian/AbstractInputSuggest.ts';
import { App } from '../../obsidian/App.ts';
import {
  bridgeAbstractInputSuggest,
  unbridgeAbstractInputSuggest
} from './abstract-input-suggest-bridge.ts';

class ConcreteInputSuggest extends AbstractInputSuggest<string> {
  public override getSuggestions(_query: string): string[] {
    return [];
  }

  public override renderSuggestion(_value: string, _el: HTMLElement): void {
    noop();
  }

  public override selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }
}

describe('abstract-input-suggest-bridge', () => {
  afterEach(() => {
    unbridgeAbstractInputSuggest();
  });

  function createSuggest(el: HTMLDivElement | HTMLInputElement): ConcreteInputSuggest {
    return new ConcreteInputSuggest(App.createConfigured__(), el);
  }

  it('should bridge textInputEl getter to textInputEl__', () => {
    bridgeAbstractInputSuggest();
    const input = createEl('input');
    const suggest = createSuggest(input);
    expect(ensureGenericObject(suggest)['textInputEl']).toBe(suggest.textInputEl__);
    expect(ensureGenericObject(suggest)['textInputEl']).toBe(input);
  });

  it('should not overwrite if property already exists', () => {
    bridgeAbstractInputSuggest();
    bridgeAbstractInputSuggest();
    const input = createEl('input');
    const suggest = createSuggest(input);
    expect(ensureGenericObject(suggest)['textInputEl']).toBe(suggest.textInputEl__);
  });

  it('should remove bridge on unbridge', () => {
    bridgeAbstractInputSuggest();
    unbridgeAbstractInputSuggest();
    expect('textInputEl' in AbstractInputSuggest.prototype).toBe(false);
  });
});
