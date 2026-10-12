import { DUMP_SIZE, DUMP_OFFSETS, MODULE_COUNT } from './constants'
import { readU16LE, readS16LE, readU32LE, readF32LE } from './nibble'

/** Collects dump chunks by offset into the full buffer. */
export class DumpAssembler {
  readonly buf = new Uint8Array(DUMP_SIZE)
  private filled = new Uint8Array(DUMP_SIZE)
  private count = 0

  add(offset: number, bytes: ArrayLike<number>): void {
    for (let i = 0; i < bytes.length && offset + i < DUMP_SIZE; i++) {
      const at = offset + i
      this.buf[at] = bytes[i]!
      if (!this.filled[at]) {
        this.filled[at] = 1
        this.count++
      }
    }
  }

  get complete(): boolean {
    return this.count === DUMP_SIZE
  }

  reset(): void {
    this.filled.fill(0)
    this.buf.fill(0)
    this.count = 0
  }
}

export interface DumpModule {
  index: number
  on: boolean
  /** u32 at block +8: byte 3 = category, byte 2 = sub-category (0x10 = User IR), byte 0 = model */
  effectId: number
  /** 15 floats in the model's parameter order; slots the model doesn't use hold stale values */
  params: number[]
}

export interface ParsedDump {
  preset: number
  name: string
  author: string
  tempo: number
  /** patch volume 0..100 */
  volume: number
  /** -50 (L) .. +50 (R) */
  pan: number
  style: number
  /** module numbers in signal-chain order */
  order: number[]
  /** indexed by module number */
  modules: DumpModule[]
}

const PARAM_COUNT = (DUMP_OFFSETS.moduleStride - 12) / 4

/** NUL-terminated (or full-width) ASCII field */
function readString(buf: Uint8Array, offset: number, maxLen: number): string {
  let s = ''
  for (let i = 0; i < maxLen; i++) {
    const c = buf[offset + i]!
    if (c === 0) break
    s += String.fromCharCode(c)
  }
  return s
}

export function parseDump(buf: Uint8Array): ParsedDump {
  const order = Array.from(buf.slice(DUMP_OFFSETS.order, DUMP_OFFSETS.order + MODULE_COUNT))

  const modules: DumpModule[] = []
  for (let i = 0; i < MODULE_COUNT; i++) {
    const base = DUMP_OFFSETS.modules + i * DUMP_OFFSETS.moduleStride
    const params: number[] = []
    for (let p = 0; p < PARAM_COUNT; p++) params.push(readF32LE(buf, base + 12 + p * 4))
    modules.push({ index: buf[base + 4]!, on: buf[base + 5] === 1, effectId: readU32LE(buf, base + 8), params })
  }
  modules.sort((a, b) => a.index - b.index)

  return {
    preset: readU16LE(buf, DUMP_OFFSETS.preset),
    name: readString(buf, DUMP_OFFSETS.name, DUMP_OFFSETS.nameMaxLen),
    author: readString(buf, DUMP_OFFSETS.author, DUMP_OFFSETS.nameMaxLen),
    tempo: readU16LE(buf, DUMP_OFFSETS.tempo),
    volume: readU16LE(buf, DUMP_OFFSETS.volume),
    pan: readS16LE(buf, DUMP_OFFSETS.pan),
    style: readU16LE(buf, DUMP_OFFSETS.style),
    order,
    modules,
  }
}
