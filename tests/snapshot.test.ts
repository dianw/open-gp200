import { describe, expect, it } from 'vitest'
import { describeChange, diffSnapshot, takeSnapshot, type PresetSnapshot } from '../app/utils/gp200/snapshot'
import { EFFECTS } from '../app/utils/gp200/effects'

const [idA, idB] = Object.keys(EFFECTS).map(Number).filter(id => EFFECTS[id]!.params.length > 0)
const used = EFFECTS[idA!]!.params[0]!.i

function base(): PresetSnapshot {
  return {
    tempo: 120,
    order: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    modules: [
      { index: 2, on: true, effectId: idA!, params: Array.from({ length: 15 }, (_, i) => i / 10) },
      { index: 3, on: false, effectId: idB!, params: Array(15).fill(0) },
    ],
  }
}

describe('preset snapshot diff', () => {
  it('finds nothing when unchanged, and the copy is independent', () => {
    const b = base()
    const snap = takeSnapshot(b)
    expect(diffSnapshot(snap, b)).toEqual([])
    b.modules[0]!.params[used] = 9
    expect(snap.modules[0]!.params[used]).not.toBe(9)
  })

  it('reports toggles, tempo, order and params', () => {
    const snap = takeSnapshot(base())
    const cur = base()
    cur.tempo = 90
    cur.order = [1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    cur.modules[1]!.on = true
    cur.modules[0]!.params[used] = 5
    const d = diffSnapshot(snap, cur)
    expect(d).toEqual([
      { kind: 'tempo', from: 120 },
      { kind: 'order' },
      { kind: 'params', module: 2 },
      { kind: 'on', module: 3, from: false },
    ])
    expect(d.map(describeChange)).toEqual(['Tempo (was 120)', 'Chain order', 'DST params', 'AMP turned on'])
  })

  it('ignores float noise and slots the model does not use', () => {
    const snap = takeSnapshot(base())
    const cur = base()
    cur.modules[0]!.params[used]! += 1e-7
    const unused = Array.from({ length: 15 }, (_, i) => i).find(i => !EFFECTS[idA!]!.params.some(p => p.i === i))
    if (unused != null) cur.modules[0]!.params[unused] = 42
    expect(diffSnapshot(snap, cur)).toEqual([])
  })

  it('reports a model change without also reporting its params', () => {
    const snap = takeSnapshot(base())
    const cur = base()
    cur.modules[0]!.effectId = idB!
    cur.modules[0]!.params[used] = 5
    expect(diffSnapshot(snap, cur)).toEqual([{ kind: 'model', module: 2, from: idA }])
  })
})
