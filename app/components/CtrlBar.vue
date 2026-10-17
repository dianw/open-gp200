<script setup lang="ts">
import { CTRL_COUNT, MODULES } from '~/utils/gp200/constants'
import { CTRL_KEYS } from '~/utils/shortcuts'

const gp = useGp200Store()
const ctrls = computed(() =>
  Array.from({ length: CTRL_COUNT }, (_, i) => {
    const c = gp.ctrls[i]
    const chips = c
      ? [
          ...c.modules.map(m => ({ key: `m${m}`, name: MODULES[m]?.name ?? `#${m}`, color: `var(--blk-${m})` })),
          ...(c.fxLoop ? [{ key: 'fx', name: 'FX LOOP', color: 'var(--muted)' }] : []),
        ]
      : []
    return { i, on: c?.on ?? false, chips }
  }),
)
</script>

<template>
  <section>
    <h2 class="panel-title">CTRL</h2>
    <div class="ctrls">
      <div v-for="c in ctrls" :key="c.i" class="ctrl">
        <span class="led" :class="{ on: c.on }" />
        <button
          class="switch"
          :disabled="!gp.connected"
          :aria-pressed="c.on"
          :aria-label="`CTRL ${c.i + 1} ${c.on ? 'on' : 'off'}`"
          :title="`CTRL ${c.i + 1} (key ${CTRL_KEYS[c.i]})`"
          @click="gp.pressCtrl(c.i)"
        >{{ c.i + 1 }}</button>
        <kbd aria-hidden="true">{{ CTRL_KEYS[c.i] }}</kbd>
        <div class="chips">
          <span v-for="ch in c.chips" :key="ch.key" class="chip" :style="{ '--c': ch.color }">{{ ch.name }}</span>
          <span v-if="!c.chips.length" class="none">unassigned</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ctrls { display: grid; grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr)); gap: var(--gap); }
.ctrl { display: flex; flex-direction: column; align-items: center; gap: .5rem; }
.led.on { background: var(--ctrl); box-shadow: 0 0 8px var(--ctrl); }
.switch {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  font-weight: 700;
  background: radial-gradient(circle at 35% 30%, var(--switch-hi), var(--raised) 70%);
  box-shadow: inset 0 -2px 4px var(--shadow), 0 2px 4px var(--shadow);
}
.switch:active:not(:disabled) { box-shadow: inset 0 2px 4px var(--shadow); }
.chips { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; min-height: 1.2rem; }
.chip {
  font-size: .65rem;
  font-weight: 700;
  padding: .1rem .35rem;
  border-radius: 4px;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
}
.none { font-size: .7rem; color: var(--muted); }
</style>
