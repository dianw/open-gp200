import { EFFECTS, type EffectModel } from './effects'

export function effectModel(effectId: number): EffectModel | undefined {
  return EFFECTS[effectId]
}

/** Display name for a block's effect id; unknown ids show as hex so they can be reported. */
export function modelName(effectId: number): string {
  return EFFECTS[effectId]?.name ?? `Model 0x${effectId.toString(16).toUpperCase().padStart(8, '0')}`
}
