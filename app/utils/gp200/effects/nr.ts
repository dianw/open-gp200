// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under NR: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const NR_EFFECTS: Record<number, EffectModel> = {
  0x0000001B: { name: "Gate 1", catalog: "NR", params: [
    { i: 0, name: "Threshold", min: 0, max: 100, def: 20 },
  ] },
  0x0000001D: { name: "Gate 2", catalog: "NR", params: [
    { i: 0, name: "Threshold", min: 0, max: 100, def: 20 },
    { i: 1, name: "Attack", min: 0, max: 100, def: 25 },
    { i: 2, name: "Release", min: 0, max: 100, def: 60 },
  ] },
  0x00000021: { name: "Gate 3", catalog: "NR", params: [
    { i: 0, name: "Threshold", min: 0, max: 100, def: 20 },
    { i: 1, name: "Ratio", min: 0, max: 100, def: 20 },
    { i: 2, name: "Attack", min: 1, max: 500, def: 20 },
    { i: 3, name: "Release", min: 10, max: 10000, def: 200 },
    { i: 4, name: "Hold", min: 0, max: 1000, def: 500 },
    { i: 5, name: "Hysteresis", min: -10, max: 0, def: -3 },
  ] },
}
