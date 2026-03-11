export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buf = Buffer.from(hex, 'hex');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}
