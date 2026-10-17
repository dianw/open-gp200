// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under EQ: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const EQ_EFFECTS: Record<number, EffectModel> = {
  0x01000035: { name: "Guitar EQ 1", catalog: "EQ", params: [
    { i: 0, name: "125Hz", min: -50, max: 50, def: 0 },
    { i: 1, name: "400Hz", min: -50, max: 50, def: 0 },
    { i: 2, name: "800Hz", min: -50, max: 50, def: 0 },
    { i: 3, name: "1.6kHz", min: -50, max: 50, def: 0 },
    { i: 4, name: "4kHz", min: -50, max: 50, def: 0 },
    { i: 5, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x01000036: { name: "Guitar EQ 2", catalog: "EQ", params: [
    { i: 0, name: "100Hz", min: -50, max: 50, def: 0 },
    { i: 1, name: "500Hz", min: -50, max: 50, def: 0 },
    { i: 2, name: "1kHz", min: -50, max: 50, def: 0 },
    { i: 3, name: "3kHz", min: -50, max: 50, def: 0 },
    { i: 4, name: "6kHz", min: -50, max: 50, def: 0 },
    { i: 5, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x01000039: { name: "Bass EQ 1", catalog: "EQ", params: [
    { i: 0, name: "33Hz", min: -50, max: 50, def: 0 },
    { i: 1, name: "150Hz", min: -50, max: 50, def: 0 },
    { i: 2, name: "600Hz", min: -50, max: 50, def: 0 },
    { i: 3, name: "2kHz", min: -50, max: 50, def: 0 },
    { i: 4, name: "8kHz", min: -50, max: 50, def: 0 },
    { i: 5, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x0100003A: { name: "Bass EQ 2", catalog: "EQ", params: [
    { i: 0, name: "50Hz", min: -50, max: 50, def: 0 },
    { i: 1, name: "120Hz", min: -50, max: 50, def: 0 },
    { i: 2, name: "400Hz", min: -50, max: 50, def: 0 },
    { i: 3, name: "800Hz", min: -50, max: 50, def: 0 },
    { i: 4, name: "4.5kHz", min: -50, max: 50, def: 0 },
    { i: 5, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x0100003C: { name: "Mess EQ", catalog: "EQ", params: [
    { i: 0, name: "80Hz", min: -50, max: 50, def: 0 },
    { i: 1, name: "240Hz", min: -50, max: 50, def: 0 },
    { i: 2, name: "750Hz", min: -50, max: 50, def: 0 },
    { i: 3, name: "2.2kHz", min: -50, max: 50, def: 0 },
    { i: 4, name: "6.6kHz", min: -50, max: 50, def: 0 },
  ] },
  0x01000043: { name: "Hyper EQ", catalog: "EQ", params: [
    { i: 0, name: "31Hz", min: -12, max: 12, def: 0 },
    { i: 1, name: "63Hz", min: -12, max: 12, def: 0 },
    { i: 2, name: "125Hz", min: -12, max: 12, def: 0 },
    { i: 3, name: "250Hz", min: -12, max: 12, def: 0 },
    { i: 4, name: "500Hz", min: -12, max: 12, def: 0 },
    { i: 5, name: "1kHz", min: -12, max: 12, def: 0 },
    { i: 6, name: "2kHz", min: -12, max: 12, def: 0 },
    { i: 7, name: "4kHz", min: -12, max: 12, def: 0 },
    { i: 8, name: "8kHz", min: -12, max: 12, def: 0 },
    { i: 9, name: "16kHz", min: -12, max: 12, def: 0 },
    { i: 10, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
}
