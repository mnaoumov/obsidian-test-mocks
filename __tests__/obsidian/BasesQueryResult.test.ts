import type {
  BasesPropertyId,
  QueryController,
  TFile
} from 'obsidian';

import { describe, expect, it } from 'vitest';

import {
  BasesEntry,
  BasesEntryGroup,
  BasesQueryResult
} from 'obsidian';

describe('BasesQueryResult', () => {
  const mockFile = { path: 'test.md' } as TFile;

  it('should create an instance via create__', () => {
    const result = BasesQueryResult.create__([], [], []);
    expect(result).toBeInstanceOf(BasesQueryResult);
  });

  it('should store data', () => {
    const entry = BasesEntry.create__(mockFile);
    const result = BasesQueryResult.create__([entry], [], []);
    expect(result.data).toEqual([entry]);
  });

  it('should return groupedData via getter', () => {
    const group = BasesEntryGroup.create__([]);
    const result = BasesQueryResult.create__([], [group], []);
    expect(result.groupedData).toEqual([group]);
  });

  it('should return properties via getter', () => {
    const props = ['prop.a' as BasesPropertyId, 'prop.b' as BasesPropertyId];
    const result = BasesQueryResult.create__([], [], props);
    expect(result.properties).toEqual(props);
  });

  it('should throw on getSummaryValue', () => {
    const result = BasesQueryResult.create__([], [], []);
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
