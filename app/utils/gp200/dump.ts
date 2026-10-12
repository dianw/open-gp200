import { DUMP_SIZE, DUMP_OFFSETS, MODULE_COUNT } from './constants'
import { readU16LE, readF32LE } from './nibble'

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
  /** effect model id */
  type: number
  /** byte +11; with `type` it identifies the effect model */
  category: number
  params: number[]
}

export interface ParsedDump {
  preset: number
  name: string
  /** module numbers in signal-chain order */
  order: number[]
  /** indexed by module number */
  modules: DumpModule[]
}

const PARAM_COUNT = (DUMP_OFFSETS.moduleStride - 12) / 4

export function parseDump(buf: Uint8Array): ParsedDump {
  const preset = readU16LE(buf, DUMP_OFFSETS.preset)

  let name = ''
  for (let i = 0; i < DUMP_OFFSETS.nameMaxLen; i++) {
    const c = buf[DUMP_OFFSETS.name + i]!
    if (c === 0) break
    name += String.fromCharCode(c)
  }

  const order = Array.from(buf.slice(DUMP_OFFSETS.order, DUMP_OFFSETS.order + MODULE_COUNT))

  const modules: DumpModule[] = []
  for (let i = 0; i < MODULE_COUNT; i++) {
    const base = DUMP_OFFSETS.modules + i * DUMP_OFFSETS.moduleStride
    const params: number[] = []
    for (let p = 0; p < PARAM_COUNT; p++) params.push(readF32LE(buf, base + 12 + p * 4))
    modules.push({ index: buf[base + 4]!, on: buf[base + 5] === 1, type: buf[base + 8]!, category: buf[base + 11]!, params })
  }
  modules.sort((a, b) => a.index - b.index)

  return { preset, name, order, modules }
}
