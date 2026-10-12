import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { encodeNibbles, decodeNibbles } from '../app/utils/gp200/nibble'
import { parseMessage } from '../app/utils/gp200/parser'
import { DumpAssembler, parseDump } from '../app/utils/gp200/dump'
import { HEADER, presetLabel } from '../app/utils/gp200/constants'
import { selectPreset, toggleModule, queryPreset, readActiveDump } from '../app/utils/gp200/messages'

const fixture = (n: string) => new URL(`./fixtures/${n}`, import.meta.url)
const bin = new Uint8Array(readFileSync(fixture('preset_108_active.bin')))
// fixture chunks come from mido: no F0 / F7
const chunks: number[][] = JSON.parse(readFileSync(fixture('preset_108_active.json'), 'utf8'))
const withFraming = (c: number[]) => [0xf0, ...c, 0xf7]
const msg = (dir: number, cmd: number, body: number[]) => [...HEADER, dir, cmd, ...body, 0xf7]

describe('nibbles', () => {
  it('round trips', () => {
    const bytes = [0x00, 0x6b, 0xff, 0x12]
    expect(encodeNibbles([0x6b])).toEqual([6, 0xb])
    expect(decodeNibbles(encodeNibbles(bytes), 0)).toEqual(bytes)
  })
})

describe('parser', () => {
  it('preset changed', () => {
    const body = [0, 0, 0, 0, 8, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 6, 0xb, 0, 0]
    expect(parseMessage(msg(0x12, 0x08, body))).toEqual({ type: 'preset', preset: 0x6b })
  })
  it('module changed', () => {
    const body = [0, 0, 0, 1, 5, 0, 0, 0, 4, 0, 0, 0, 6, 0, 1, 0, 0, 0, 0]
    expect(parseMessage(msg(0x12, 0x08, body))).toEqual({ type: 'module', module: 6, on: true })
    body[14] = 0
    expect(parseMessage(msg(0x12, 0x08, body))).toEqual({ type: 'module', module: 6, on: false })
  })
  it('knob moved', () => {
    const body = [0, 0, 0, 0, 5, 0, 0, 0, 0xc, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 4, 2]
    // body is 36 long here; real one is 35 with value in the last 8
    const real = [...body.slice(0, 27), 0, 0, 0, 0, 7, 0, 4, 2]
    const e = parseMessage(msg(0x12, 0x10, real))
    expect(e).toMatchObject({ type: 'param', module: 2, param: 0 })
    expect((e as { value: number }).value).toBe(60)
  })
  it('ignores foreign / short messages', () => {
    expect(parseMessage([0xf0, 1, 2, 0xf7]).type).toBe('unknown')
    expect(parseMessage(msg(0x12, 0x08, [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).type).toBe('unknown')
  })
})

describe('dump', () => {
  it('assembles chunks and parses the preset', () => {
    const asm = new DumpAssembler()
    for (const c of chunks) {
      const e = parseMessage(withFraming(c))
      expect(e.type).toBe('dumpChunk')
      if (e.type === 'dumpChunk') asm.add(e.offset, e.bytes)
    }
    expect(asm.complete).toBe(true)
    expect(Array.from(asm.buf)).toEqual(Array.from(bin))
  })
  it('parseDump matches the real preset', () => {
    const d = parseDump(bin)
    expect(d.preset).toBe(108)
    expect(d.name).toBe('Ohayou Clean')
    expect(d.modules.map(m => (m.on ? 1 : 0))).toEqual([0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1])
    expect(d.modules[2]!.type).toBe(0x29)
    expect(d.modules[2]!.params.slice(0, 6)).toEqual([50, 80, 50, 0, 1, 0])
    expect(d.order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

describe('messages', () => {
  it('builds control messages', () => {
    expect(selectPreset(108)).toEqual([[0xb0, 0, 0], [0xc0, 108]])
    expect(selectPreset(160)).toEqual([[0xb0, 0, 1], [0xc0, 32]])
    expect(toggleModule(1, true)).toEqual([0xb0, 57, 127])
    expect(toggleModule(10, true)).toBeNull()
    expect(presetLabel(108)).toBe('28-A')
  })
  it('builds requests', () => {
    expect(queryPreset().length).toBe(8 + 2 + 19 + 1)
    const r = readActiveDump(0x6c)
    expect(r.slice(8, 10)).toEqual([0x11, 0x10])
    expect(r.slice(10 + 15, 10 + 17)).toEqual([6, 0xc])
  })
})
