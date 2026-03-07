export function arrayBufferToHex(data: ArrayBuffer): string {
  return Buffer.from(data).toString('hex');
}
