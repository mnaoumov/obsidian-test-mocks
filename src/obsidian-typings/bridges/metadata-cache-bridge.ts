import type { CachedMetadata as CachedMetadataOriginal } from 'obsidian';

import type { FileCacheEntry } from '../../internal/types.ts';

import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { parseMarkdownContent } from '../../internal/markdown-parser.ts';
import { noopAsync } from '../../internal/noop.ts';
import { MetadataCache } from '../../obsidian/MetadataCache.ts';

const COMPUTE_METADATA_ASYNC_NAME = 'computeMetadataAsync';
const FILE_CACHE_NAME = 'fileCache';
const METADATA_CACHE_NAME = 'metadataCache';

export function bridgeMetadataCache(): void {
  defineMissingProperty(MetadataCache.prototype, FILE_CACHE_NAME, {
    get(this: MetadataCache): Record<string, FileCacheEntry> {
      return this.fileCache__;
    }
  });

  defineMissingProperty(MetadataCache.prototype, METADATA_CACHE_NAME, {
    get(this: MetadataCache): Record<string, CachedMetadataOriginal> {
      return this.metadataByHash__;
    }
  });

  defineMissingProperty(MetadataCache.prototype, COMPUTE_METADATA_ASYNC_NAME, {
    async value(this: MetadataCache, arrayBuffer: ArrayBuffer): Promise<CachedMetadataOriginal> {
      await noopAsync();
      const content = new TextDecoder().decode(arrayBuffer);
      return parseMarkdownContent(content);
    },
    writable: true
  });
}

export function unbridgeMetadataCache(): void {
  deleteMissingProperty(MetadataCache.prototype, FILE_CACHE_NAME);
  deleteMissingProperty(MetadataCache.prototype, METADATA_CACHE_NAME);
  deleteMissingProperty(MetadataCache.prototype, COMPUTE_METADATA_ASYNC_NAME);
}
