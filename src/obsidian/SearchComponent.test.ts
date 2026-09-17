import type { SearchComponent as SearchComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
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

    it('should call the onChange callback with the input value', () => {
      const search = SearchComponent.create__(createDiv());
      const callback = vi.fn();
      search.onChange(callback);
      search.inputEl.value = 'query';
      search.inputEl.dispatchEvent(new Event('input'));
      expect(callback).toHaveBeenCalledWith('query');
    });
  });

  describe('clearButtonEl', () => {
    it('should empty the input and call the onChange callback on click', () => {
      const search = SearchComponent.create__(createDiv());
      const callback = vi.fn();
      search.setValue('query').onChange(callback);
      search.clearButtonEl.click();
      expect(search.getValue()).toBe('');
      expect(callback).toHaveBeenCalledWith('');
    });

    it('should do nothing on click while disabled', () => {
      const search = SearchComponent.create__(createDiv());
      const callback = vi.fn();
      search.setValue('query').onChange(callback);
      search.setDisabled(true);
      search.clearButtonEl.click();
      expect(search.getValue()).toBe('query');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const search = SearchComponent.create__(createDiv());
      const original: SearchComponentOriginal = search.asOriginalType4__();
      expect(original).toBe(search);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const search = SearchComponent.create__(createDiv());
      const mock = SearchComponent.fromOriginalType4__(search.asOriginalType4__());
      expect(mock).toBe(search);
    });
  });
});
