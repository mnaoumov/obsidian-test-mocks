import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { SearchComponent } from './SearchComponent.ts';

describe('SearchComponent', () => {
  it('should create an instance via create__', () => {
    const search = SearchComponent.create__(createDiv());
    expect(search).toBeInstanceOf(SearchComponent);
  });

  it('should have input type search', () => {
    const search = SearchComponent.create__(createDiv());
    expect(search.inputEl.type).toBe('search');
  });

  it('should have a clearButtonEl', () => {
    const search = SearchComponent.create__(createDiv());
    expect(search.clearButtonEl).toBeInstanceOf(HTMLElement);
  });

  describe('onChanged', () => {
    it('should not throw', () => {
      const search = SearchComponent.create__(createDiv());
      expect(() => {
        search.onChanged();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const search = SearchComponent.create__(createDiv());
      const original: SearchComponentOriginal = search.asOriginalType__();
      expect(original).toBe(search);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const search = SearchComponent.create__(createDiv());
      const mock = SearchComponent.fromOriginalType3__(search.asOriginalType__());
      expect(mock).toBe(search);
    });
  });
});
