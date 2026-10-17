import {
  HEADER, PAYLOAD_START, CMD_QUERY, CMD_DATA, REC, MODULES, MODULE_COUNT, PATCH_SETTING, CTRL_CC_BASE, CTRL_COUNT,
  DUMP_SIZE, DUMP_CHUNK_SIZE, DUMP_OFFSETS, presetLabel,
} from './constants'
import { parseFrame } from './parser'
import { readF32LE, readS16LE, readU16LE, readU32LE } from './nibble'
import { effectModel, modelName } from './models'

/** One row of a message breakdown. `at` is the wire index of the first byte. */
export interface Field {
  at: number
  /** bytes as sent on the wire (nibble pairs inside a SysEx payload) */
  wire: string
  /** the real bytes, for SysEx payload fields */
  decoded?: string
  name: string
  meaning: string
}

export interface Described {
  kind: 'sysex' | 'dump' | 'cc' | 'pc' | 'midi' | 'sysex?'
  summary: string
  fields: Field[]
}

/** State carried between messages: the last CC0 decides which half a Program Change selects. */
export interface DescribeContext {
  bank?: number
}

const h2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0')
const hexs = (b: ArrayLike<number>) => Array.from(b, h2).join(' ')
const h4 = (n: number) => `0x${n.toString(16).toUpperCase().padStart(4, '0')}`
const h8 = (n: number) => `0x${n.toString(16).toUpperCase().padStart(8, '0')}`
const blockName = (b: number) => MODULES[b]?.name ?? `block ${b}`
const slotName = (s: number) => (s === 0xffff ? 'active preset' : s < 256 ? `${s} (${presetLabel(s)})` : String(s))
const ascii = (b: number[]) => {
  const end = b.indexOf(0)
  return String.fromCharCode(...(end < 0 ? b : b.slice(0, end)))
}
const fmtFloat = (v: number) => (Number.isFinite(v) ? String(Math.round(v * 1000) / 1000) : String(v))

/** Names for record types we don't decode field by field. */
const RECORD_NAMES: Record<number, string> = {
  0x0000: 'address',
  0x0001: 'read request',
  0x0002: 'patch header',
  0x0005: 'param',
  0x0006: 'patch setting',
  0x0008: 'chain / routing',
  0x0009: 'author write',
  0x000a: 'style name',
  0x000b: 'note write',
  0x000c: 'EXP assignment',
  0x000e: 'EXP min/max',
  0x000f: 'CTRL assignment',
  0x0010: 'file tail',
  0x0014: 'effect block',
  0x0015: 'module on/off',
  0x0016: 'model change',
  0x1000: 'version check',
  0x1001: 'tempo notify',
  0x1002: 'state dump (unknown)',
  0x1004: 'global EQ',
  0x1006: 'state dump query',
  0x1007: 'general settings',
  0x1008: 'slot / setting',
  0x1009: 'User IR name',
  0x100e: 'footswitch template',
  0x100f: 'footswitch target',
  0x1010: 'tuner reference',
  0x1011: 'unknown (follows preset change)',
  0x1012: 'SnapTone name',
  0x2001: 'identity',
  0x2002: 'startup query (unknown)',
  0x2003: 'save',
  0x2007: 'patch move',
  0x2008: 'patch move commit',
}
const recordName = (t: number) => RECORD_NAMES[t] ?? 'unknown record'

/** Builds fields over a decoded payload, mapping each byte back to its nibble pair on the wire. */
class PayloadFields {
  readonly fields: Field[] = []
  constructor(private raw: number[], private payload: number[]) {}

  add(off: number, len: number, name: string, meaning: string) {
    const at = PAYLOAD_START + 2 * off
    this.fields.push({
      at,
      wire: hexs(this.raw.slice(at, at + 2 * len)),
      decoded: hexs(this.payload.slice(off, off + len)),
      name,
      meaning,
    })
  }
}

interface RecordResult {
  summary?: string
}

/** Fields of one record's data (starting at payload offset `o`). Returns a summary for the message. */
function recordData(pf: PayloadFields, type: number, d: number[], o: number, query: boolean): RecordResult {
  const u16 = (i: number) => readU16LE(d, i)
  const rest = (from: number, name = 'unknown') => {
    if (d.length > from) pf.add(o + from, d.length - from, name, 'meaning unknown')
  }

  switch (type) {
    case REC.address:
      if (d.length < 4) break
      pf.add(o, 2, 'source', u16(0) === 0 ? '0 = edit buffer' : u16(0) === 1 ? '1 = stored (flash)' : String(u16(0)))
      pf.add(o + 2, 2, 'slot', slotName(u16(2)))
      rest(4)
      return {}
    case 0x0001:
      if (d.length < 4) break
      pf.add(o, 2, 'slot', u16(0) === 0xffff ? '0xFFFF = active (edit buffer)' : slotName(u16(0)))
      pf.add(o + 2, 2, 'arg', String(u16(2)))
      rest(4)
      return { summary: u16(0) === 0xffff ? 'Read active dump' : `Read stored preset ${slotName(u16(0))}` }
    case REC.slot: {
      if (d.length < 4) break
      const id = u16(0)
      pf.add(o, 2, 'setting id', id === 0 ? '0 = current preset' : `${h4(id)} (global setting)`)
      pf.add(o + 2, 2, 'value', id === 0 ? slotName(u16(2)) : String(u16(2)))
      rest(4)
      if (id !== 0) return { summary: `Global setting ${h4(id)} = ${u16(2)}` }
      return { summary: query ? 'Query current preset' : `Preset ${presetLabel(u16(2))}` }
    }
    case REC.module:
      if (d.length < 2) break
      pf.add(o, 1, 'block', `${d[0]} = ${blockName(d[0]!)}`)
      pf.add(o + 1, 1, 'state', d[1] === 1 ? '1 = on' : `${d[1]} = off`)
      if (d.length >= 4) pf.add(o + 2, 2, 'tail', d[2] === 0x9c && d[3] === 0x02 ? 'host write marker (9C 02)' : 'unused')
      rest(4)
      return { summary: `Module ${blockName(d[0]!)} ${d[1] === 1 ? 'on' : 'off'}` }
    case REC.param: {
      if (d.length < 12) break
      const id = readU32LE(d, 4)
      const p = effectModel(id)?.params.find(x => x.i === d[1])
      const value = readF32LE(d, 8)
      const label = p?.options?.[Math.round(value)]
      pf.add(o, 1, 'block', `${d[0]} = ${blockName(d[0]!)}`)
      pf.add(o + 1, 1, 'param', `${d[1]}${p ? ` = ${p.name}` : ''}`)
      pf.add(o + 2, 2, 'display value', String(u16(2)))
      pf.add(o + 4, 4, 'effect id', `${h8(id)} = ${modelName(id)}`)
      pf.add(o + 8, 4, 'value (f32)', `${fmtFloat(value)}${label ? ` (${label})` : ''}`)
      rest(12)
      return { summary: `Param ${blockName(d[0]!)} ${p?.name ?? `#${d[1]}`} = ${label ?? fmtFloat(value)}` }
    }
    case REC.model: {
      if (d.length < 8) break
      const id = readU32LE(d, 4)
      pf.add(o, 1, 'block', `${d[0]} = ${blockName(d[0]!)}`)
      pf.add(o + 1, 1, 'unknown', String(d[1]))
      pf.add(o + 2, 2, 'tail', d[2] === 0x76 && d[3] === 0x02 ? 'host write marker (76 02)' : 'unknown')
      pf.add(o + 4, 4, 'effect id', id === 0 ? '0 = footswitch ack, not a model change' : `${h8(id)} = ${modelName(id)}`)
      rest(8)
      if (id === 0) return { summary: `Footswitch ack (${blockName(d[0]!)})` }
      return { summary: `Model ${blockName(d[0]!)} = ${modelName(id)}` }
    }
    case REC.patchSetting: {
      if (d.length < 4) break
      const target = u16(0)
      const tname = Object.entries(PATCH_SETTING).find(([, v]) => v === target)?.[0] ?? `target ${target}`
      pf.add(o, 2, 'target', `${target} = ${tname}`)
      pf.add(o + 2, 2, 'value', String(readS16LE(d, 2)))
      rest(4)
      return { summary: `Patch ${tname} = ${readS16LE(d, 2)}` }
    }
    case REC.tempo:
      if (d.length < 4) break
      pf.add(o, 2, 'kind', u16(0) === 2 ? '2 = tempo' : String(u16(0)))
      pf.add(o + 2, 2, 'value', u16(0) === 2 ? `${u16(2)} BPM` : String(u16(2)))
      rest(4)
      return { summary: u16(0) === 2 ? `Tempo ${u16(2)} BPM` : undefined }
    case REC.save:
      if (d.length < 20) break
      pf.add(o, 2, 'slot', slotName(u16(0)))
      pf.add(o + 2, 2, 'flag', String(u16(2)))
      pf.add(o + 4, 16, 'name', `"${ascii(d.slice(4, 20))}"`)
      rest(20)
      return { summary: `Saved ${slotName(u16(0))} "${ascii(d.slice(4, 20))}"` }
    case 0x0008:
      if (d.length < 16) break
      pf.add(o, 2, 'slot', String(u16(0)))
      pf.add(o + 2, 1, 'FX send', `after ${d[2]} blocks`)
      pf.add(o + 3, 1, 'FX return', `after ${d[3]} blocks`)
      pf.add(o + 4, MODULE_COUNT, 'chain order', d.slice(4, 4 + MODULE_COUNT).map(blockName).join(' > '))
      rest(4 + MODULE_COUNT, 'flag')
      return { summary: 'Chain order' }
    case 0x000f:
      if (d.length < 8) break
      pf.add(o, 1, 'CTRL', `${d[0]! + 1}`)
      pf.add(o + 1, 1, 'saved state', d[1] === 1 ? 'on' : 'off')
      pf.add(o + 2, 2, 'unused', '')
      pf.add(o + 4, 2, 'block mask', maskNames(u16(4)))
      rest(6, 'unused')
      return { summary: `CTRL ${d[0]! + 1} assignment` }
    case 0x2001:
      if (d.length >= 4) {
        pf.add(o, 4, 'version', `${u16(0)}.${u16(2)}`)
        return { summary: `Identity ${u16(0)}.${u16(2)}` }
      }
      return { summary: 'Identity query' }
  }
  if (d.length) pf.add(o, d.length, 'data', d.length >= 4 && type === 0x000a ? `"${ascii(d.slice(4))}"` : 'not decoded')
  return {}
}

function maskNames(mask: number): string {
  const names: string[] = []
  for (let b = 0; b < MODULE_COUNT; b++) if (mask & (1 << b)) names.push(blockName(b))
  if (mask & (1 << 11)) names.push('FX LOOP')
  return names.length ? names.join(', ') : 'none'
}

/** Header, CMD, length and offset rows shared by every frame. */
function frameFields(raw: number[], cmd: number, length: number, offset: number): Field[] {
  const H = HEADER.length
  const f = (at: number, len: number, name: string, meaning: string): Field =>
    ({ at, wire: hexs(raw.slice(at, at + len)), name, meaning })
  return [
    f(0, 1, 'SysEx start', 'F0'),
    f(1, H - 1, 'header', 'Valeton manufacturer id + "GP-2"'),
    f(H, 1, 'CMD', cmd === CMD_QUERY ? '0x11 = query' : cmd === CMD_DATA ? '0x12 = data / write / notify' : h2(cmd)),
    f(H + 1, 2, 'length', `${length} payload bytes (7-bit lo, hi)`),
    f(H + 3, 2, 'offset', `${offset} (chunk offset, 7-bit lo, hi)`),
  ]
}

/** `chunk(off, len)` returns other bytes of the same chunk by dump offset, or null when they're in another chunk. */
type ChunkReader = (off: number, len: number) => number[] | null
interface DumpField { off: number; len: number; name: string; fmt: (b: number[], chunk: ChunkReader) => string }

/** Known fields of the 1176-byte preset dump, by dump offset. */
const DUMP_FIELDS: DumpField[] = (() => {
  const u16 = (b: number[]) => String(readU16LE(b, 0))
  const rec = (b: number[]) => `${h4(readU16LE(b, 0))} ${recordName(readU16LE(b, 0))}`
  const out: DumpField[] = [
    { off: 0, len: 2, name: 'record type', fmt: rec },
    { off: 2, len: 2, name: 'record length', fmt: u16 },
    { off: 4, len: 2, name: 'source', fmt: b => (readU16LE(b, 0) === 0 ? '0 = edit buffer' : '1 = stored') },
    { off: DUMP_OFFSETS.preset, len: 2, name: 'slot', fmt: b => slotName(readU16LE(b, 0)) },
    { off: 8, len: 2, name: 'record type', fmt: rec },
    { off: 10, len: 2, name: 'record length', fmt: u16 },
    { off: DUMP_OFFSETS.tempo, len: 2, name: 'tempo', fmt: b => `${readU16LE(b, 0)} BPM` },
    { off: DUMP_OFFSETS.volume, len: 2, name: 'volume', fmt: u16 },
    { off: DUMP_OFFSETS.pan, len: 2, name: 'pan', fmt: b => String(readS16LE(b, 0)) },
    { off: DUMP_OFFSETS.style, len: 2, name: 'style', fmt: u16 },
    { off: DUMP_OFFSETS.name, len: DUMP_OFFSETS.nameMaxLen, name: 'name', fmt: b => `"${ascii(b)}"` },
    { off: DUMP_OFFSETS.author, len: DUMP_OFFSETS.nameMaxLen, name: 'author', fmt: b => `"${ascii(b)}"` },
    { off: DUMP_OFFSETS.order - 8, len: 2, name: 'record type', fmt: rec },
    { off: DUMP_OFFSETS.order - 6, len: 2, name: 'record length', fmt: u16 },
    { off: DUMP_OFFSETS.send, len: 1, name: 'FX send', fmt: b => `after ${b[0]} blocks` },
    { off: DUMP_OFFSETS.return, len: 1, name: 'FX return', fmt: b => `after ${b[0]} blocks` },
    { off: DUMP_OFFSETS.order, len: MODULE_COUNT, name: 'chain order', fmt: b => b.map(blockName).join(' > ') },
  ]
  for (let i = 0; i < MODULE_COUNT; i++) {
    const base = DUMP_OFFSETS.modules + i * DUMP_OFFSETS.moduleStride
    const n = `block #${i}`
    out.push(
      { off: base, len: 4, name: `${n} record`, fmt: b => `${rec(b)}, length ${readU16LE(b, 2)}` },
      { off: base + 4, len: 1, name: `${n} id`, fmt: b => `${b[0]} = ${blockName(b[0]!)}` },
      { off: base + 5, len: 1, name: `${n} on`, fmt: b => (b[0] === 1 ? 'on' : 'off') },
      { off: base + 6, len: 2, name: `${n} marker`, fmt: () => 'constant 0F 00' },
      { off: base + 8, len: 4, name: `${n} effect id`, fmt: b => `${h8(readU32LE(b, 0))} = ${modelName(readU32LE(b, 0))}` },
    )
    for (let p = 0; p < 15; p++) {
      out.push({
        off: base + 12 + p * 4,
        len: 4,
        name: `${n} param ${p}`,
        fmt: (b, chunk) => {
          // the block's effect id names the param, when it arrived in the same chunk
          const id = chunk(base + 8, 4)
          const m = id ? effectModel(readU32LE(id, 0)) : undefined
          const pn = m?.params.find(x => x.i === p)?.name
          return `${fmtFloat(readF32LE(b, 0))}${pn ? ` (${pn})` : m ? ' (unused by this model)' : ''}`
        },
      })
    }
  }
  for (let i = 0; i < 8; i++) {
    const base = DUMP_OFFSETS.ctrl + i * DUMP_OFFSETS.ctrlStride
    out.push(
      { off: base, len: 4, name: `CTRL ${i + 1} record`, fmt: b => `${rec(b)}, length ${readU16LE(b, 2)}` },
      { off: base + 5, len: 1, name: `CTRL ${i + 1} state`, fmt: b => (b[0] === 1 ? 'on' : 'off') },
      { off: base + 8, len: 2, name: `CTRL ${i + 1} blocks`, fmt: b => maskNames(readU16LE(b, 0)) },
    )
  }
  return out.sort((a, b) => a.off - b.off)
})()

function dumpFields(raw: number[], f: { offset: number; payload: number[] }): Field[] {
  const out: Field[] = []
  const add = (pos: number, len: number, name: string, meaning: string) => {
    const at = PAYLOAD_START + 2 * pos
    out.push({ at, wire: hexs(raw.slice(at, at + 2 * len)), decoded: hexs(f.payload.slice(pos, pos + len)), name, meaning })
  }
  const chunk: ChunkReader = (off, len) =>
    off >= f.offset && off + len <= f.offset + f.payload.length ? f.payload.slice(off - f.offset, off - f.offset + len) : null
  let run = -1
  const flush = (pos: number) => {
    for (let s = run; run >= 0 && s < pos; s += 16) {
      const len = Math.min(16, pos - s)
      add(s, len, `bytes 0x${(f.offset + s).toString(16).toUpperCase()}`, 'not decoded')
    }
    run = -1
  }
  let pos = 0
  while (pos < f.payload.length) {
    const dumpOff = f.offset + pos
    // a field is named only when it lies fully inside this chunk
    const field = DUMP_FIELDS.find(x => x.off === dumpOff && pos + x.len <= f.payload.length)
    if (field) {
      flush(pos)
      add(pos, field.len, field.name, field.fmt(f.payload.slice(pos, pos + field.len), chunk))
      pos += field.len
    } else {
      if (run < 0) run = pos
      pos++
    }
  }
  flush(pos)
  return out
}

function describeFrame(raw: number[]): Described {
  const f = parseFrame(raw)
  if (!f) return { kind: 'sysex?', summary: 'SysEx fragment or not a GP-200 frame', fields: [{ at: 0, wire: hexs(raw), name: 'raw', meaning: '' }] }

  const fields = frameFields(raw, f.cmd, f.length, f.offset)
  const end: Field = { at: raw.length - 1, wire: 'F7', name: 'SysEx end', meaning: 'F7' }

  if (f.length === DUMP_SIZE) {
    const n = Math.round(f.offset / DUMP_CHUNK_SIZE) + 1
    const total = Math.ceil(DUMP_SIZE / DUMP_CHUNK_SIZE)
    return {
      kind: 'dump',
      summary: `Dump chunk ${n}/${total} (bytes ${f.offset}..${f.offset + f.payload.length - 1})`,
      fields: [...fields, ...dumpFields(raw, f), end],
    }
  }

  const pf = new PayloadFields(raw, f.payload)
  const summaries: string[] = []
  let i = 0
  if (f.offset === 0) {
    while (i + 4 <= f.payload.length) {
      const type = readU16LE(f.payload, i)
      const len = readU16LE(f.payload, i + 2)
      if (i + 4 + len > f.payload.length) break
      pf.add(i, 2, 'record type', `${h4(type)} ${recordName(type)}`)
      pf.add(i + 2, 2, 'record length', `${len} bytes`)
      const r = recordData(pf, type, f.payload.slice(i + 4, i + 4 + len), i + 4, f.cmd === CMD_QUERY)
      if (r.summary) summaries.push(r.summary)
      else if (type !== REC.address) summaries.push(`${f.cmd === CMD_QUERY ? 'Query ' : ''}${h4(type)} ${recordName(type)}`)
      i += 4 + len
    }
  }
  if (i < f.payload.length) {
    const tail = f.payload.slice(i)
    pf.add(i, tail.length, f.offset === 0 ? 'trailer' : 'chunk data', f.offset === 0 ? 'bytes after the last record' : `continues a ${f.length}-byte transfer`)
  }
  if (!summaries.length) summaries.push(f.offset === 0 ? (f.cmd === CMD_QUERY ? 'Query' : 'Data') : `Chunk at ${f.offset} of ${f.length}`)
  return { kind: 'sysex', summary: summaries.join(' + '), fields: [...fields, ...pf.fields, end] }
}

function describeChannel(raw: number[], ctx: DescribeContext): Described {
  const status = raw[0]!
  const ch = (status & 0x0f) + 1
  const hi = status & 0xf0
  const f = (at: number, name: string, meaning: string): Field => ({ at, wire: hexs(raw.slice(at, at + 1)), name, meaning })

  if (hi === 0xb0 && raw.length >= 3) {
    const cc = raw[1]!
    const v = raw[2]!
    const mod = MODULES.find(m => m.cc === cc)
    const ctrl = cc >= CTRL_CC_BASE && cc < CTRL_CC_BASE + CTRL_COUNT ? cc - CTRL_CC_BASE + 1 : 0
    let what = `CC ${cc}`
    let val = String(v)
    if (cc === 0) {
      ctx.bank = v
      what = 'Bank select (CC0)'
      val = v === 0 ? '0 = presets 1-A..32-D' : `${v} = presets 33-A..64-D`
    } else if (mod) {
      what = `${mod.name} toggle`
      val = v >= 64 ? `${v} = on` : `${v} = off`
    } else if (ctrl) {
      what = `CTRL ${ctrl} press`
    }
    const summary = cc === 0 ? `Bank ${v}` : mod ? `${mod.name} ${v >= 64 ? 'on' : 'off'} (CC ${cc})` : ctrl ? `CTRL ${ctrl} press (CC ${cc})` : `CC ${cc} = ${v}`
    return {
      kind: 'cc',
      summary,
      fields: [f(0, 'status', `Control Change, channel ${ch}`), f(1, 'controller', `${cc} = ${what}`), f(2, 'value', val)],
    }
  }
  if (hi === 0xc0 && raw.length >= 2) {
    const pc = raw[1]!
    const preset = ctx.bank === undefined ? undefined : ctx.bank === 0 ? pc : 128 + pc
    const label = preset === undefined ? `${presetLabel(pc)} or ${presetLabel(128 + pc)} (bank unknown)` : presetLabel(preset)
    return {
      kind: 'pc',
      summary: `Program ${pc} → ${label}`,
      fields: [f(0, 'status', `Program Change, channel ${ch}`), f(1, 'program', `${pc} → ${label}`)],
    }
  }
  return { kind: 'midi', summary: `Status ${h2(status)}`, fields: [{ at: 0, wire: hexs(raw), name: 'raw', meaning: '' }] }
}

/** Explain one logged MIDI message byte by byte. Events holding several SysEx frames are split. */
export function describeMessage(bytes: ArrayLike<number>, ctx: DescribeContext = {}): Described {
  const raw = Array.from(bytes)
  if (!raw.length) return { kind: 'midi', summary: 'empty', fields: [] }
  if (raw[0] !== 0xf0) return describeChannel(raw, ctx)

  const frames: number[][] = []
  let start = 0
  for (let i = 0; i < raw.length; i++) if (raw[i] === 0xf7) {
    frames.push(raw.slice(start, i + 1))
    start = i + 1
  }
  if (start < raw.length) frames.push(raw.slice(start))
  if (frames.length === 1) return describeFrame(raw)

  const parts = frames.map(describeFrame)
  let base = 0
  const fields: Field[] = []
  parts.forEach((p, k) => {
    for (const fl of p.fields) fields.push({ ...fl, at: fl.at + base })
    base += frames[k]!.length
  })
  return { kind: parts.some(p => p.kind === 'dump') ? 'dump' : 'sysex', summary: parts.map(p => p.summary).join(' | '), fields }
}
