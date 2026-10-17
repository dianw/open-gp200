// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Effect model table of the Valeton GP-200 family, split by editor catalog.

import type { EffectModel } from './types'
import { PRE_EFFECTS } from './pre'
import { WAH_EFFECTS } from './wah'
import { DST_EFFECTS } from './dst'
import { AMP_EFFECTS } from './amp'
import { NR_EFFECTS } from './nr'
import { CAB_EFFECTS } from './cab'
import { EQ_EFFECTS } from './eq'
import { MOD_EFFECTS } from './mod'
import { DLY_EFFECTS } from './dly'
import { RVB_EFFECTS } from './rvb'
import { VOL_EFFECTS } from './vol'

export type { EffectModel, EffectParam } from './types'

/** catalog name (the block names) -> its models */
export const EFFECTS_BY_CATALOG: Record<string, Record<number, EffectModel>> = {
  PRE: PRE_EFFECTS,
  WAH: WAH_EFFECTS,
  DST: DST_EFFECTS,
  AMP: AMP_EFFECTS,
  NR: NR_EFFECTS,
  CAB: CAB_EFFECTS,
  EQ: EQ_EFFECTS,
  MOD: MOD_EFFECTS,
  DLY: DLY_EFFECTS,
  RVB: RVB_EFFECTS,
  VOL: VOL_EFFECTS,
}

/** every model by effect id */
export const EFFECTS: Record<number, EffectModel> = Object.assign({}, ...Object.values(EFFECTS_BY_CATALOG))
