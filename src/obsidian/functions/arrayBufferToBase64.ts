/**
 * @file
 *
 * Mock of Obsidian's `arrayBufferToBase64`.
 */

/**
 * Encodes binary data as a Base64 string. The mock uses Node's `Buffer`.
 *
 * @param buffer - The binary data.
 * @returns The Base64 encoding of the data.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}
