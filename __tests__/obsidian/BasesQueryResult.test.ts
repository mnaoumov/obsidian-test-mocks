import type {
  BasesPropertyId,
  DataAdapter
} from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import type { QueryController } from '../../src/obsidian/QueryController.ts';

import { App } from '../../src/obsidian/App.ts';
import { BasesEntry } from '../../src/obsidian/BasesEntry.ts';
import { BasesEntryGroup } from '../../src/obsidian/BasesEntryGroup.ts';
import { BasesQueryResult } from '../../src/obsidian/BasesQueryResult.ts';
import { BasesViewConfig } from '../../src/obsidian/BasesViewConfig.ts';
import { FileSystemAdapter } from '../../src/obsidian/FileSystemAdapter.ts';
import { TFile } from '../../src/obsidian/TFile.ts';

describe('BasesQueryResult', () => {
  function createResult(): BasesQueryResult {
    const adapter = FileSystemAdapter.create__('/mock') as unknown as DataAdapter;
    const app = App.create__(adapter, '');
    const config = BasesViewConfig.create__('', '', '');
    return BasesQueryResult.create__(app, config, [], []);
  }

  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const result = createResult();
    expect(result).toBeInstanceOf(BasesQueryResult);
  });

  it('should store data via setData__', () => {
    const entry = BasesEntry.create__(undefined, mockFile);
    const result = createResult();

    result.setData__([entry]);
    expect(result.data).toEqual([entry]);
  });

  it('should return groupedData via getter', () => {
    const group = BasesEntryGroup.create__([], undefined);
    const result = createResult();

    result.setGroupedData__([group]);
    expect(result.groupedData).toEqual([group]);
  });

  it('should return properties via getter', () => {
    const props = ['prop.a' as BasesPropertyId, 'prop.b' as BasesPropertyId];
    const result = createResult();

    result.setProperties__(props);
    expect(result.properties).toEqual(props);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const result = createResult();
      const original = result.asOriginalType__();
      expect(original).toBe(result);
    });
  });

  it('should throw on getSummaryValue', () => {
    const result = createResult();
    expect(() => {
      result.getSummaryValue(
        {} as QueryController,
        [],
        'prop.a' as BasesPropertyId,
        'sum'
      );
    }).toThrow('getSummaryValue is not implemented in mock');
  });
});
