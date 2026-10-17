import { MODULES } from './constants'
import { effectModel } from './models'

/** The parts of a preset the app can see change in the edit buffer. */
export interface PresetSnapshot {
  tempo: number | null
  order: number[]
  modules: { index: number; on: boolean; effectId: number | null; params: number[] }[]
}

export type PresetChange =
  | { kind: 'on'; module: number; from: boolean }
  | { kind: 'model'; module: number; from: number | null }
  | { kind: 'params'; module: number }
  | { kind: 'tempo'; from: number | null }
  | { kind: 'order' }

export function takeSnapshot(s: PresetSnapshot): PresetSnapshot {
  return {
    tempo: s.tempo,
    order: [...s.order],
    modules: s.modules.map(m => ({ index: m.index, on: m.on, effectId: m.effectId, params: [...m.params] })),
  }
}

// the dump holds f32s; an event's value can come back rounded differently
const close = (a: number | undefined, b: number | undefined) =>
  a === b || (a != null && b != null && Math.abs(a - b) <= 1e-4 * Math.max(1, Math.abs(a)))

/** What differs in `cur` from `base`, in block order. Params are compared only when the model is unchanged, and only the slots the model uses. */
export function diffSnapshot(base: PresetSnapshot, cur: PresetSnapshot): PresetChange[] {
  const out: PresetChange[] = []
  if (base.tempo !== cur.tempo) out.push({ kind: 'tempo', from: base.tempo })
  if (base.order.join() !== cur.order.join()) out.push({ kind: 'order' })
  for (const b of base.modules) {
    const c = cur.modules.find(m => m.index === b.index)
    if (!c) continue
    if (b.on !== c.on) out.push({ kind: 'on', module: b.index, from: b.on })
    if (b.effectId !== c.effectId) {
      out.push({ kind: 'model', module: b.index, from: b.effectId })
      continue
    }
    const used = b.effectId != null ? effectModel(b.effectId)?.params.map(p => p.i) : undefined
    const slots = used ?? b.params.map((_, i) => i)
    if (slots.some(i => !close(b.params[i], c.params[i]))) out.push({ kind: 'params', module: b.index })
  }
  return out
}

export function describeChange(c: PresetChange): string {
  const name = 'module' in c ? MODULES[c.module]?.name ?? `Block ${c.module}` : ''
  switch (c.kind) {
    case 'on': return `${name} turned ${c.from ? 'off' : 'on'}`
    case 'model': return `${name} model`
    case 'params': return `${name} params`
    case 'tempo': return `Tempo (was ${c.from ?? '?'})`
    case 'order': return 'Chain order'
  }
}
