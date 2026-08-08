export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buffer = Buffer.from(hex, 'hex');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
