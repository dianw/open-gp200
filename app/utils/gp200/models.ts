import { EFFECTS, EFFECTS_BY_CATALOG, type EffectModel } from './effects'
import { MODULES } from './constants'

export function effectModel(effectId: number): EffectModel | undefined {
  return EFFECTS[effectId]
}

/** Display name for a block's effect id; unknown ids show as hex so they can be reported. */
export function modelName(effectId: number): string {
  return EFFECTS[effectId]?.name ?? `Model 0x${effectId.toString(16).toUpperCase().padStart(8, '0')}`
}

// User IR (0x0A10xxxx) and SnapTone (0x0Fxxxxxx) slots: live selection is untested and their names need a sweep
const isUserSlot = (id: number) => (id >>> 16) === 0x0a10 || (id >>> 24) === 0x0f

/** Models the official editor offers for a block, sorted by name. */
export function modelsForBlock(block: number): { id: number; name: string }[] {
  const models = EFFECTS_BY_CATALOG[MODULES[block]?.name ?? ''] ?? {}
  return Object.entries(models)
    .map(([id, m]) => ({ id: Number(id), name: m.name }))
    .filter(m => !isUserSlot(m.id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}
