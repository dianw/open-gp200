// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under WAH: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const WAH_EFFECTS: Record<number, EffectModel> = {
  0x05000001: { name: "V-Wah", catalog: "WAH", params: [
    { i: 0, name: "Range", min: 0, max: 100, def: 50 },
    { i: 1, name: "Q", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 50 },
  ] },
  0x05000006: { name: "S-Wah", catalog: "WAH", params: [
    { i: 0, name: "Range", min: 0, max: 100, def: 50 },
    { i: 1, name: "Q", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 50 },
  ] },
  0x05000007: { name: "B-Wah", catalog: "WAH", params: [
    { i: 0, name: "Range", min: 0, max: 100, def: 50 },
    { i: 1, name: "Q", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 50 },
  ] },
  0x05000008: { name: "C-Wah", catalog: "WAH", params: [
    { i: 0, name: "Range", min: 0, max: 100, def: 50 },
    { i: 1, name: "Q", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 50 },
  ] },
  0x0500000A: { name: "P-Wah", catalog: "WAH", params: [
    { i: 0, name: "Range", min: 0, max: 100, def: 50 },
    { i: 1, name: "Q", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 50 },
    { i: 4, name: "EQ", min: 0, max: 1, def: 1, options: ["OFF", "ON"] },
  ] },
}
