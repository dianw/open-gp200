import {
  HEADER, BODY_START, DIR_PEDAL_TO_APP, CMD_EVENT, CMD_PARAM, CMD_DUMP_CHUNK,
} from './constants'
import { decodeNibbles, readF32LE } from './nibble'

export type Gp200Event =
  | { type: 'preset'; preset: number }
  | { type: 'module'; module: number; on: boolean }
  | { type: 'param'; module: number; param: number; value: number }
  | { type: 'dumpChunk'; offset: number; bytes: number[] }
  | { type: 'unknown'; raw: number[] }

/** Parse one incoming SysEx message (including leading F0 / trailing F7). */
export function parseMessage(data: ArrayLike<number>): Gp200Event {
  const raw = Array.from(data)
  const unknown: Gp200Event = { type: 'unknown', raw }
  if (raw.length < BODY_START + 1 || raw[raw.length - 1] !== 0xf7) return unknown
  for (let i = 0; i < HEADER.length; i++) if (raw[i] !== HEADER[i]) return unknown
  if (raw[HEADER.length] !== DIR_PEDAL_TO_APP) return unknown

  const cmd = raw[HEADER.length + 1]
  const bodyLen = raw.length - 1 - BODY_START
  const b = (i: number) => raw[BODY_START + i]!
  // byte formed by body nibbles i, i+1
  const byteAt = (i: number) => ((b(i) & 0x0f) << 4) | (b(i + 1) & 0x0f)

  if (cmd === CMD_EVENT && bodyLen >= 19) {
    if (b(4) === 0x08 && b(5) === 0x01) {
      return { type: 'preset', preset: byteAt(15) | (byteAt(17) << 8) }
    }
    if (b(3) === 0x01 && b(4) === 0x05 && b(5) === 0x00) {
      return { type: 'module', module: byteAt(11), on: byteAt(13) === 1 }
    }
    return unknown
  }

  if (cmd === CMD_PARAM && bodyLen >= 35 && b(4) === 0x05) {
    const f = decodeNibbles(raw, BODY_START + 27, 4)
    return { type: 'param', module: byteAt(11), param: byteAt(13), value: readF32LE(f, 0) }
  }

  if (cmd === CMD_DUMP_CHUNK && bodyLen > 3 && raw[HEADER.length + 2] === 0x09) {
    const offset = raw[HEADER.length + 3]! | (raw[HEADER.length + 4]! << 7)
    // payload nibbles run from after the offset to just before F7
    const bytes = decodeNibbles(raw.slice(HEADER.length + 5, raw.length - 1), 0)
    return { type: 'dumpChunk', offset, bytes }
  }

  return unknown
}
