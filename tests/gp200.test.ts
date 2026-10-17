import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { encodeNibbles, decodeNibbles } from '../app/utils/gp200/nibble'
import { parseMessage } from '../app/utils/gp200/parser'
import { DumpAssembler, parseDump, chainLayout } from '../app/utils/gp200/dump'
import { HEADER, presetLabel } from '../app/utils/gp200/constants'
import { selectPreset, toggleModule, toggleModuleSysex, queryPreset, readActiveDump, handshake, setTempo, pressCtrl, setModel } from '../app/utils/gp200/messages'
import { tap, TAP_RESET_MS } from '../app/utils/gp200/tap'
import { modelName, modelsForBlock } from '../app/utils/gp200/models'
import { EFFECTS, EFFECTS_BY_CATALOG } from '../app/utils/gp200/effects'
import { describeMessage } from '../app/utils/gp200/describe'

const fixture = (n: string) => new URL(`./fixtures/${n}`, import.meta.url)
const bin = new Uint8Array(readFileSync(fixture('preset_108_active.bin')))
// fixture chunks come from mido: no F0 / F7
const chunks: number[][] = JSON.parse(readFileSync(fixture('preset_108_active.json'), 'utf8'))
const withFraming = (c: number[]) => [0xf0, ...c, 0xf7]
// body here = everything after the CMD byte up to F7 (length low byte first)
const msg = (cmd: number, lenLo: number, body: number[]) => [...HEADER, cmd, lenLo, ...body, 0xf7]
const hex = (s: string) => s.split(' ').map(x => parseInt(x, 16))

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
  it('module toggled, address + record shape', () => {
    expect(parseMessage(toggleModuleSysex(10, false))).toEqual({ type: 'module', module: 10, on: false })
  })
  it('model changed on the pedal', () => {
    // record 0x0016 { block 0, 0, 76 02, effect 0x03000009 Blues OD }
    const e = parseMessage(hex('F0 21 25 7E 47 50 2D 32 12 0C 00 00 00 01 06 00 00 00 08 00 00 00 00 00 00 07 06 00 02 00 09 00 00 00 00 00 03 F7'))
    expect(e).toEqual({ type: 'model', module: 0, effectId: 0x03000009 })
  })
  it('preset saved on the pedal', () => {
    // captured on the LT: rename + save of 28-A
    const raw = '00 00 00 00 03 02 00 01 04 00 00 06 0c 00 00 00 00 00 01 04 0f 06 08 06 01 07 09 06 0f 07 05 02 00 04 03 06 0c 06 05 06 01 06 0e 00 00 02 00 02 00 02 00'
    const e = parseMessage(hex(`F0 21 25 7E 47 50 2D 32 12 18 ${raw} F7`))
    expect(e).toEqual({ type: 'saved', preset: 108, name: 'Ohayou Clean' })
  })
  it('tempo after a preset change (record 0x1001)', () => {
    // { 2, 0xFA }: the same value as 28-A's dump tempo
    const e = parseMessage(hex('F0 21 25 7E 47 50 2D 32 12 08 00 00 00 00 01 01 00 00 04 00 00 00 02 00 00 0F 0A 00 00 F7'))
    expect(e).toEqual({ type: 'tempo', bpm: 250 })
  })
  it('ignores footswitch acks and settings echoes', () => {
    // model-change shape with a zero effect id
    expect(parseMessage(hex('F0 21 25 7E 47 50 2D 32 12 0C 00 00 00 01 06 00 00 00 08 00 00 00 03 00 01 00 00 00 00 00 00 00 00 00 00 00 00 F7')).type).toBe('unknown')
    // record 0x1008 with setting id 0x18 (FS mode)
    expect(parseMessage(hex('F0 21 25 7E 47 50 2D 32 12 08 00 00 00 00 08 01 00 00 04 00 00 01 08 00 00 00 01 00 00 F7')).type).toBe('unknown')
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
    expect(d.modules[2]!.effectId).toBe(0x03000029)
    expect(d.modules.map(m => modelName(m.effectId))).toEqual([
      'COMP', 'V-Wah', 'Plustortion', 'Dark Twin', 'Gate 1', 'Dark Twin', 'Guitar EQ 2',
      'C-Chorus', 'Slapback', 'Amp Spring', 'Volume',
    ])
    expect(d.modules[10]!.params[0]).toBe(100)
    expect(d).toMatchObject({ tempo: 0xfa, volume: 50, pan: 0 })
    expect(d.modules[2]!.params.slice(0, 6)).toEqual([50, 80, 50, 0, 1, 0])
    expect(d.order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect([d.send, d.return]).toEqual([4, 4])
    // 28-A has no CTRL assignments
    expect(d.ctrls.map(c => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(d.ctrls.every(c => !c.on && c.modules.length === 0 && !c.fxLoop)).toBe(true)
  })
  it('parses CTRL masks', () => {
    const b = bin.slice()
    // CTRL 2: saved on, DST + DLY + FX LOOP, junk in the high nibble
    b[0x438 + 12 + 5] = 1
    b[0x438 + 12 + 8] = 0x04
    b[0x438 + 12 + 9] = 0xf9
    expect(parseDump(b).ctrls[1]).toEqual({ index: 1, on: true, modules: [2, 8], fxLoop: true })
  })
})

describe('messages', () => {
  it('builds control messages', () => {
    expect(selectPreset(108)).toEqual([[0xb0, 0, 0], [0xc0, 108]])
    expect(selectPreset(160)).toEqual([[0xb0, 0, 1], [0xc0, 32]])
    expect(toggleModule(1, true)).toEqual([0xb0, 57, 127])
    expect(toggleModule(10, true)).toEqual(toggleModuleSysex(10, true))
    expect(presetLabel(108)).toBe('28-A')
    expect(pressCtrl(0)).toEqual([0xb0, 69, 127])
    expect(pressCtrl(3)).toEqual([0xb0, 72, 127])
  })
  it('builds requests', () => {
    expect(queryPreset()).toEqual(msg(0x11, 0x08, [0, 0, 0, 0, 8, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
    // the edit-buffer read confirmed on the device
    expect(readActiveDump(0x6c)).toEqual(msg(0x11, 0x10, [
      0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 6, 0xc,
      0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0xf, 0xf, 0xf, 0xf, 0, 0, 0, 0,
    ]))
    expect(handshake()).toEqual(msg(0x11, 0x04, [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0]))
  })
  it('builds the SysEx module toggle', () => {
    expect(toggleModuleSysex(6, true)).toEqual(hex(
      'F0 21 25 7E 47 50 2D 32 12 10 00 00 00 00 00 00 00 00 04 00 00 00 00 00 00 00 00 00 00 01 05 00 00 00 04 00 00 00 06 00 01 09 0C 00 02 F7',
    ))
  })
  it('builds the tempo write', () => {
    // 120 BPM, record 0x0006 { 1, 120 } after the edit-buffer address (PROTOCOL-FACTS 2.4)
    expect(setTempo(120)).toEqual(hex(
      'F0 21 25 7E 47 50 2D 32 12 10 00 00 00 00 00 00 00 00 04 00 00 00 00 00 00 00 00 00 00 00 06 00 00 00 04 00 00 00 01 00 00 07 08 00 00 F7',
    ))
    expect(setTempo(300)).toEqual(setTempo(250))
    expect(setTempo(10)).toEqual(setTempo(40))
    expect(parseMessage(setTempo(97))).toEqual({ type: 'tempo', bpm: 97 })
  })
})

describe('tap tempo', () => {
  const run = (times: number[]) => times.reduce<{ taps: number[]; bpm: number | null }>((r, t) => tap(r.taps, t), { taps: [], bpm: null })
  it('needs two taps', () => {
    expect(run([1000]).bpm).toBeNull()
    expect(run([1000, 1500]).bpm).toBe(120)
  })
  it('averages recent intervals and follows changes', () => {
    expect(run([0, 500, 1000, 1500]).bpm).toBe(120)
    // 4-interval window: older 500 ms taps drop out
    expect(run([0, 500, 1000, 1500, 2100, 2700, 3300, 3900]).bpm).toBe(100)
  })
  it('restarts after a pause and clamps', () => {
    expect(run([0, 500, 500 + TAP_RESET_MS + 1]).bpm).toBeNull()
    expect(run([0, 100]).bpm).toBe(250)
    expect(run([0, 1900]).bpm).toBe(40)
  })
})

describe('model change', () => {
  it('builds the captured PRE -> Blues OD write', () => {
    expect(setModel(0, 0x03000009)).toEqual(hex('F0 21 25 7E 47 50 2D 32 12 14 00 00 00 00 00 00 00 00 04 00 00 00 00 00 00 00 00 00 00 01 06 00 00 00 08 00 00 00 00 00 00 07 06 00 02 00 09 00 00 00 00 00 03 F7'))
  })
  it('parses its own write as a model event', () => {
    expect(parseMessage(setModel(9, 0x0c000011))).toEqual({ type: 'model', module: 9, effectId: 0x0c000011 })
  })
})

describe('effect tables', () => {
  it('splits all models by catalog', () => {
    expect(Object.keys(EFFECTS)).toHaveLength(305)
    for (const [cat, models] of Object.entries(EFFECTS_BY_CATALOG))
      for (const m of Object.values(models)) expect(m.catalog).toBe(cat)
  })
  it('lists models per block', () => {
    const ids = (b: number) => modelsForBlock(b).map(m => m.id)
    expect(ids(0)).toEqual(expect.arrayContaining([0x03000009, 0x00000000]))
    expect(ids(5).some(id => id >>> 16 === 0x0a10)).toBe(false)
    expect(ids(3).some(id => id >>> 24 === 0x0f)).toBe(false)
    for (let b = 0; b <= 10; b++) expect(ids(b).length).toBeGreaterThan(0)
  })
})

describe('chain layout', () => {
  const show = (order: number[], s: number, r: number) =>
    chainLayout(order, s, r).map(i => (i.kind === 'loop' ? i.label : i.index))
  it('puts the FX loop after the first n blocks (27-B Mesa Rock, read live)', () => {
    expect(show([1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 10], 4, 4)).toEqual([1, 2, 3, 4, 'FX LOOP', 0, 5, 6, 7, 8, 9, 10])
  })
  it('splits send and return, including after the last block', () => {
    expect(show([0, 1, 2], 1, 3)).toEqual([0, 'SEND', 1, 2, 'RETURN'])
    expect(show([0, 1, 2], 3, 3)).toEqual([0, 1, 2, 'FX LOOP'])
  })
})

describe('describeMessage', () => {
  const field = (bytes: number[], name: string) => describeMessage(bytes).fields.find(f => f.name === name)

  it('explains a VOL toggle over SysEx, byte by byte', () => {
    const d = describeMessage(toggleModuleSysex(10, true))
    expect(d.kind).toBe('sysex')
    expect(d.summary).toBe('Module VOL on')
    expect(d.fields.map(f => f.name)).toEqual([
      'SysEx start', 'header', 'CMD', 'length', 'offset',
      'record type', 'record length', 'source', 'slot',
      'record type', 'record length', 'block', 'state', 'tail',
      'SysEx end',
    ])
    const tail = field(toggleModuleSysex(10, true), 'tail')!
    expect(tail).toMatchObject({ wire: '09 0C 00 02', decoded: '9C 02', meaning: 'host write marker (9C 02)' })
    expect(field(toggleModuleSysex(10, true), 'CMD')!.meaning).toMatch(/^0x12/)
  })

  it('names models and queries', () => {
    expect(describeMessage(setModel(0, 0x03000009)).summary).toBe(`Model PRE = ${modelName(0x03000009)}`)
    expect(describeMessage(setTempo(120)).summary).toBe('Patch tempo = 120')
    expect(describeMessage(queryPreset()).summary).toBe('Query current preset')
    expect(describeMessage(readActiveDump(107)).summary).toBe('Read active dump')
    expect(describeMessage(handshake()).summary).toBe('Query 0x2002 startup query (unknown)')
  })

  it('reads incoming preset changes', () => {
    const body = [0, 0, 0, 0, 8, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 6, 0xb, 0, 0]
    expect(describeMessage(msg(0x12, 0x08, body)).summary).toBe(`Preset ${presetLabel(0x6b)}`)
  })

  it('explains CC, CTRL and Program Change, using the last bank select', () => {
    const ctx = {}
    const [cc0, pc] = selectPreset(200)
    expect(describeMessage(cc0!, ctx).summary).toBe('Bank 1')
    expect(describeMessage(pc!, ctx).summary).toBe(`Program 72 → ${presetLabel(200)}`)
    expect(describeMessage(toggleModule(2, false)).summary).toBe('DST off (CC 49)')
    expect(describeMessage(pressCtrl(1)).summary).toBe('CTRL 2 press (CC 70)')
  })

  it('annotates dump chunks', () => {
    const first = describeMessage(withFraming(chunks[0]!))
    expect(first.kind).toBe('dump')
    expect(first.summary).toBe('Dump chunk 1/7 (bytes 0..184)')
    expect(first.fields.find(f => f.name === 'name')!.meaning).toBe(`"${parseDump(bin).name}"`)
    expect(first.fields.find(f => f.name === 'chain order')).toBeDefined()
    for (const c of chunks) expect(describeMessage(withFraming(c)).kind).toBe('dump')
  })

  it('flags fragments instead of throwing', () => {
    expect(describeMessage([0xf0, 0x21, 0x25]).kind).toBe('sysex?')
  })
})
