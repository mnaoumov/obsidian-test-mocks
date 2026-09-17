/**
 * @file
 *
 * Mock of Obsidian's `base64ToArrayBuffer`.
 */

/**
 * Decodes a Base64 string into binary data. The mock uses Node's `Buffer`.
 *
 * @param base64 - The Base64 string.
 * @returns A new `ArrayBuffer` holding exactly the decoded bytes.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const buffer = Buffer.from(base64, 'base64');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
