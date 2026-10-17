<script setup lang="ts">
import { effectModel } from '~/utils/gp200/models'
import type { ModuleState } from '~/stores/gp200'

const props = defineProps<{ m: ModuleState }>()

interface Item { i: number; name: string; value: string; angle?: number }

/** every param of the block's model: continuous ones as knobs, switches and lists as their label */
const items = computed<Item[]>(() => {
  const model = props.m.effectId != null ? effectModel(props.m.effectId) : undefined
  return (model?.params ?? []).map(p => {
    const v = props.m.params[p.i] ?? p.def
    if (p.options) return { i: p.i, name: p.name, value: p.options[Math.round(v)] ?? String(Math.round(v)) }
    const frac = p.max > p.min ? Math.min(1, Math.max(0, (v - p.min) / (p.max - p.min))) : 0
    return { i: p.i, name: p.name, value: format(v, p.step), angle: -135 + 270 * frac }
  })
})

function format(v: number, step?: number) {
  const digits = step && step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : v % 1 ? 1 : 0
  return v.toFixed(digits)
}
</script>

<template>
  <div v-if="items.length" class="params">
    <div v-for="k in items" :key="k.i" class="param" :class="{ list: k.angle == null }">
      <span v-if="k.angle != null" class="knob" :style="{ '--a': `${k.angle}deg` }" />
      <span v-else class="choice">{{ k.value }}</span>
      <span class="name">{{ k.name }}</span>
      <span v-if="k.angle != null" class="value">{{ k.value }}</span>
    </div>
  </div>
  <p v-else class="none">No parameters for this model.</p>
</template>

<style scoped>
.params {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: .75rem .5rem;
}
.param {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .15rem;
  width: 3.5rem;
  text-align: center;
}
.knob {
  position: relative;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--knob-hi), var(--knob-lo) 72%);
  box-shadow: 0 2px 3px var(--shadow), inset 0 0 0 2px #0006, 0 0 0 2px color-mix(in srgb, var(--c) 45%, transparent);
  transform: rotate(var(--a));
  transition: transform .2s;
}
.knob::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 50%;
  width: 2px;
  height: 38%;
  border-radius: 1px;
  background: var(--knob-mark);
  transform: translateX(-50%);
}
.choice {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.9rem;
  max-width: 100%;
  padding: 0 .35rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: .7rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.name {
  max-width: 100%;
  font-size: .6rem;
  font-weight: 600;
  letter-spacing: .03em;
  text-transform: uppercase;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.value { font-size: .7rem; font-variant-numeric: tabular-nums; color: var(--text); }
.none { margin: 0; font-size: .85rem; color: var(--muted); }
</style>
