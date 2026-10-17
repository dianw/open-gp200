<script setup lang="ts">
import { effectModel } from '~/utils/gp200/models'
import type { ModuleState } from '~/stores/gp200'

const props = defineProps<{
  m: ModuleState
  selected: boolean
  pending: boolean
  disabled: boolean
  /** keyboard shortcut shown in a corner */
  hotkey?: string
}>()
const emit = defineEmits<{ toggle: []; select: [] }>()

/** small 24x24 stroke drawings on the label plate, by block id (drawn for this project) */
const MOTIFS: Record<number, string> = {
  0: '<path d="M13 3 6 13h5l-1 8 7-10h-5z"/>',
  1: '<path d="M3 18c5 0 5-12 9-12s4 12 9 12"/>',
  2: '<path d="M3 12h3V6h6v12h6v-6h3"/>',
  3: '<path d="M3 8h18v11H3zM9 8V5h6v3M3 12h18"/><path d="M7 15.5h.01M12 15.5h.01M17 15.5h.01" stroke-width="2.5"/>',
  4: '<path d="M3 12c1-6 2-6 3 0s2 6 3 0c.7-2.5 1.3-2.5 2 0h10"/>',
  5: '<path d="M5 3h14v18H5z"/><circle cx="12" cy="13.5" r="4.5"/><circle cx="12" cy="13.5" r="1.2"/><circle cx="12" cy="6.5" r="1"/>',
  6: '<path d="M6 4v16M12 4v16M18 4v16M4 14h4M10 8h4M16 16h4"/>',
  7: '<path d="M3 12c1.5-6 4.5-6 6 0s4.5 6 6 0 4.5-6 6 0"/>',
  8: '<circle cx="5" cy="12" r="2.5"/><circle cx="11.5" cy="12" r="2"/><circle cx="17" cy="12" r="1.4" opacity=".7"/><circle cx="21" cy="12" r=".8" opacity=".45"/>',
  9: '<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="5.5" opacity=".7"/><circle cx="12" cy="12" r="9" opacity=".4"/>',
  10: '<path d="M3 19 21 5v14z"/>',
}

interface Knob { name: string; angle: number; label: string }

/** the model's first few continuous params as knobs; switches and lists are left for the edit panel */
const knobs = computed<Knob[]>(() => {
  const model = props.m.effectId != null ? effectModel(props.m.effectId) : undefined
  const list = (model?.params ?? []).filter(p => !p.options && p.max > p.min).slice(0, 4)
  if (!list.length) return [0, 1].map(() => ({ name: '', angle: 0, label: '' }))
  return list.map(p => {
    const v = props.m.params[p.i] ?? p.def
    const frac = Math.min(1, Math.max(0, (v - p.min) / (p.max - p.min)))
    return { name: p.name, angle: -135 + 270 * frac, label: `${p.name}: ${Math.round(v * 10) / 10}` }
  })
})

const style = computed(() => ({ '--c': `var(--blk-${props.m.index})` }))
</script>

<template>
  <div class="pedal" :class="{ on: m.on, selected }" :style="style">
    <button class="face" :aria-pressed="selected" :aria-label="`${m.name}: ${m.model || 'no model'}, edit`" @click="emit('select')">
      <span class="knobs" :class="`n${knobs.length}`">
        <span v-for="(k, i) in knobs" :key="i" class="knob-wrap" :title="k.label || undefined">
          <span class="knob" :style="{ '--a': `${k.angle}deg` }" />
          <span class="knob-name">{{ k.name }}</span>
        </span>
      </span>
      <span class="led" :class="{ pending }" />
      <span class="plate">
        <!-- eslint-disable-next-line vue/no-v-html -- static strings from MOTIFS -->
        <svg class="motif" viewBox="0 0 24 24" aria-hidden="true" v-html="MOTIFS[m.index]" />
        <span class="name">{{ m.name }}</span>
        <span class="model" :title="m.model">{{ m.model || '—' }}</span>
      </span>
    </button>
    <button
      class="switch"
      :disabled="disabled"
      :aria-pressed="m.on"
      :aria-label="`${m.name} ${m.on ? 'on' : 'off'}`"
      :title="m.on ? 'On: click to bypass' : 'Bypassed: click to turn on'"
      @click="emit('toggle')"
    >
      <span class="cap" />
    </button>
    <kbd v-if="hotkey" class="hotkey" aria-hidden="true">{{ hotkey }}</kbd>
  </div>
</template>

<style scoped>
.pedal {
  position: relative;
  flex: 0 0 12rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: .7rem .7rem .7rem;
  border-radius: 10px;
  /* screws in the corners, then the painted enclosure */
  background:
    radial-gradient(circle at 7px 7px, var(--pedal-screw) 2px, transparent 2.5px),
    radial-gradient(circle at calc(100% - 7px) 7px, var(--pedal-screw) 2px, transparent 2.5px),
    radial-gradient(circle at 7px calc(100% - 7px), var(--pedal-screw) 2px, transparent 2.5px),
    radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), var(--pedal-screw) 2px, transparent 2.5px),
    linear-gradient(160deg, color-mix(in srgb, var(--c), #fff 22%), var(--c) 45%, color-mix(in srgb, var(--c), #000 28%));
  box-shadow:
    inset 0 1px 0 #fff6,
    inset 0 -3px 0 #0004,
    0 4px 10px var(--shadow);
  filter: saturate(.35) brightness(.8);
  transition: filter .15s, transform .15s;
}
.pedal.on { filter: none; }
.hotkey { position: absolute; right: 16px; bottom: 6px; opacity: .8; }
.pedal.selected { outline: 2px solid var(--text); outline-offset: 3px; }
.pedal button { background: none; border: 0; padding: 0; color: inherit; }
.face {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .45rem;
  border-radius: 6px;
}
.face:hover .plate { box-shadow: 0 0 0 1px var(--pedal-plate-text); }

.knobs {
  display: grid;
  /* one row, like a UA pedal; fixed height keeps the LED, plate and footswitch level across pedals */
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: .3rem;
  width: 100%;
  height: 3rem;
  align-items: center;
}
.n1, .n2 { padding: 0 1rem; }
.knob-wrap { display: flex; flex-direction: column; align-items: center; gap: .1rem; min-width: 0; }
.knob {
  position: relative;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--knob-hi), var(--knob-lo) 72%);
  box-shadow: 0 2px 3px #0008, inset 0 0 0 2px #0006;
  transform: rotate(var(--a));
  transition: transform .2s;
}
.knob::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 50%;
  width: 2px;
  height: 40%;
  border-radius: 1px;
  background: var(--knob-mark);
  transform: translateX(-50%);
}
.knob-name {
  max-width: 100%;
  font-size: .52rem;
  font-weight: 700;
  letter-spacing: .02em;
  text-transform: uppercase;
  color: var(--pedal-ink);
  text-shadow: 0 1px 1px #000b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.led { width: .55rem; height: .55rem; box-shadow: inset 0 0 0 1px #0006; }
.on .led { background: var(--pedal-led); box-shadow: 0 0 8px var(--pedal-led), inset 0 0 0 1px #0004; }

.plate {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .1rem;
  padding: .3rem .25rem .35rem;
  border-radius: 4px;
  background: var(--pedal-plate);
  color: var(--pedal-plate-text);
  box-shadow: inset 0 1px 2px #0008;
}
.motif {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: var(--c);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.name { font-weight: 800; font-size: .85rem; letter-spacing: .06em; }
.model {
  max-width: 100%;
  font-size: .62rem;
  opacity: .75;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.switch {
  margin-top: .55rem;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle, var(--metal-lo) 55%, var(--metal-hi) 100%) !important;
  box-shadow: 0 2px 4px #0008, inset 0 0 0 1px #0005;
}
.cap {
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--metal-hi), var(--metal-lo) 75%);
  box-shadow: inset 0 -1px 2px #0007, 0 1px 1px #fff4;
  transition: transform .08s;
}
.switch:hover:not(:disabled) .cap { filter: brightness(1.1); }
.switch:active:not(:disabled) .cap { transform: scale(.9); }

@media (max-width: 760px) {
  .pedal { flex-basis: calc((100% - var(--chain-gap)) / 2); }
}
</style>
