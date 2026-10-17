// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.

export interface EffectParam {
  /** index into the block's 15 float params */
  i: number
  name: string
  min: number
  max: number
  def: number
  step?: number
  /** switch / list labels, indexed by the stored value */
  options?: string[]
}

export interface EffectModel {
  name: string
  /** module the official editor lists the model under (not a constraint on the block) */
  catalog: string
  params: EffectParam[]
}
