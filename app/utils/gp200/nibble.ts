/** Every real byte is sent as two 7-bit-safe bytes, high nibble first. */
export function encodeNibbles(bytes: ArrayLike<number>): number[] {
  const out: number[] = []
  for (let i = 0; i < bytes.length; i++) out.push((bytes[i]! >> 4) & 0x0f, bytes[i]! & 0x0f)
  return out
}

/** Decode `count` bytes (or as many as available) from nibble pairs starting at `start`. */
export function decodeNibbles(data: ArrayLike<number>, start: number, count?: number): number[] {
  const available = Math.floor((data.length - start) / 2)
  const n = count === undefined ? available : Math.min(count, available)
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(((data[start + 2 * i]! & 0x0f) << 4) | (data[start + 2 * i + 1]! & 0x0f))
  return out
}

export function readU16LE(buf: ArrayLike<number>, offset: number): number {
  return buf[offset]! | (buf[offset + 1]! << 8)
}

export function readF32LE(buf: ArrayLike<number>, offset: number): number {
  const view = new DataView(new ArrayBuffer(4))
  for (let i = 0; i < 4; i++) view.setUint8(i, buf[offset + i]!)
  return view.getFloat32(0, true)
}
