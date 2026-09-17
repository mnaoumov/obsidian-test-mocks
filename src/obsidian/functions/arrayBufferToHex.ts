/**
 * @file
 *
 * Mock of Obsidian's `arrayBufferToHex`.
 */

/**
 * Encodes binary data as a lowercase hexadecimal string. The mock uses Node's `Buffer`.
 *
 * @param data - The binary data.
 * @returns The hexadecimal encoding of the data, two digits per byte.
 */
export function arrayBufferToHex(data: ArrayBuffer): string {
  return Buffer.from(data).toString('hex');
}
