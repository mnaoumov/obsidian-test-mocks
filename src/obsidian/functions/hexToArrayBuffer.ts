/**
 * @file
 *
 * Mock of Obsidian's `hexToArrayBuffer`.
 */

/**
 * Decodes a hexadecimal string into binary data. The mock uses Node's `Buffer`.
 *
 * @param hex - The hexadecimal string, two digits per byte.
 * @returns A new `ArrayBuffer` holding exactly the decoded bytes.
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
