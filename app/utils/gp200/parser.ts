import { HEADER, PAYLOAD_START, CMD_DATA, DUMP_SIZE, REC, PATCH_SETTING } from './constants'
import { decodeNibbles, readF32LE, readU16LE, readU32LE } from './nibble'

export type Gp200Event =
  | { type: 'preset'; preset: number }
  | { type: 'module'; module: number; on: boolean }
  | { type: 'param'; module: number; param: number; value: number }
  | { type: 'model'; module: number; effectId: number }
  | { type: 'saved'; preset: number; name: string }
  | { type: 'tempo'; bpm: number }
  | { type: 'dumpChunk'; offset: number; bytes: number[] }
  | { type: 'unknown'; raw: number[] }

export interface Frame {
  cmd: number
  /** total decoded payload length; a multi-chunk transfer repeats it on every chunk */
  length: number
  offset: number
  payload: number[]
}

/** Split one SysEx message (including F0 / F7) into its frame fields, or null if it isn't ours. */
export function parseFrame(data: ArrayLike<number>): Frame | null {
  const raw = Array.from(data)
  if (raw.length < PAYLOAD_START + 1 || raw[raw.length - 1] !== 0xf7) return null
  for (let i = 0; i < HEADER.length; i++) if (raw[i] !== HEADER[i]) return null
  const at = (i: number) => raw[HEADER.length + i]!
  return {
    cmd: at(0),
    length: at(1) | (at(2) << 7),
    offset: at(3) | (at(4) << 7),
    payload: decodeNibbles(raw.slice(PAYLOAD_START, raw.length - 1), 0),
  }
}

export interface TlvRecord {
  type: number
  data: number[]
}

/** Walk the u16 type / u16 length records of a payload; stops at the first truncated record. */
export function parseRecords(payload: number[]): TlvRecord[] {
  const out: TlvRecord[] = []
  let i = 0
  while (i + 4 <= payload.length) {
    const type = readU16LE(payload, i)
    const len = readU16LE(payload, i + 2)
    if (i + 4 + len > payload.length) break
    out.push({ type, data: payload.slice(i + 4, i + 4 + len) })
    i += 4 + len
  }
  return out
}

function readName(bytes: number[]): string {
  const end = bytes.indexOf(0)
  return String.fromCharCode(...(end < 0 ? bytes : bytes.slice(0, end)))
}

/** Parse one incoming SysEx message (including leading F0 / trailing F7). */
export function parseMessage(data: ArrayLike<number>): Gp200Event {
  const unknown: Gp200Event = { type: 'unknown', raw: Array.from(data) }
  const f = parseFrame(data)
  if (!f || f.cmd !== CMD_DATA) return unknown

  if (f.length === DUMP_SIZE) return { type: 'dumpChunk', offset: f.offset, bytes: f.payload }
  if (f.offset !== 0 || f.payload.length < f.length) return unknown

  // events may start with an address record; the record after it says what happened
  const rec = parseRecords(f.payload).find(r => r.type !== REC.address)
  if (!rec) return unknown
  const d = rec.data

  switch (rec.type) {
    case REC.slot:
      // a non-zero setting id is the echo of a global-settings write
      if (d.length >= 4 && readU16LE(d, 0) === 0) return { type: 'preset', preset: readU16LE(d, 2) }
      break
    case REC.module:
      if (d.length >= 2) return { type: 'module', module: d[0]!, on: d[1] === 1 }
      break
    case REC.param:
      if (d.length >= 12) return { type: 'param', module: d[0]!, param: d[1]!, value: readF32LE(d, 8) }
      break
    case REC.model: {
      // CTRL 4-8 footswitch presses send this shape with a zero effect id: not a model change
      const effectId = d.length >= 8 ? readU32LE(d, 4) : 0
      if (effectId !== 0) return { type: 'model', module: d[0]!, effectId }
      break
    }
    case REC.tempo:
      // { 2, value } after every preset change; matches the dump's tempo field
      if (d.length >= 4 && readU16LE(d, 0) === 2) return { type: 'tempo', bpm: readU16LE(d, 2) }
      break
    case REC.patchSetting:
      // in case the pedal echoes or reports a tempo write
      if (d.length >= 4 && readU16LE(d, 0) === PATCH_SETTING.tempo) return { type: 'tempo', bpm: readU16LE(d, 2) }
      break
    case REC.save:
      if (d.length >= 20) return { type: 'saved', preset: readU16LE(d, 0), name: readName(d.slice(4, 20)) }
      break
  }
  return unknown
}
