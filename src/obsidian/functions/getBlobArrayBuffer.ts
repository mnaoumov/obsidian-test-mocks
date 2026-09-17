/**
 * @file
 *
 * Mock of Obsidian's `getBlobArrayBuffer`.
 */

/**
 * Reads the contents of a `Blob` as binary data.
 *
 * @param blob - The blob to read.
 * @returns A promise resolving to the blob's bytes.
 */
export async function getBlobArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}
