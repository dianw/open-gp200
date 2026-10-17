// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under VOL: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const VOL_EFFECTS: Record<number, EffectModel> = {
  0x06000003: { name: "Volume", catalog: "VOL", params: [
    { i: 0, name: "Volume", min: 0, max: 100, def: 100 },
  ] },
}
