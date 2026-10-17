<script setup lang="ts">
import { modelsForBlock } from '~/utils/gp200/models'
import type { ModuleState } from '~/stores/gp200'

const gp = useGp200Store()
const ordered = computed(() =>
  gp.order.map(i => gp.modules.find(m => m.index === i)).filter((m): m is ModuleState => !!m),
)

/** block shown in the panel under the chain (AMP to start with) */
const selected = ref(3)
const current = computed(() => gp.modules.find(m => m.index === selected.value) ?? null)

/** the block's model list, plus its current model if the list doesn't have it */
function options(m: ModuleState) {
  const list = modelsForBlock(m.index)
  if (m.effectId != null && !list.some(o => o.id === m.effectId)) list.unshift({ id: m.effectId, name: m.model })
  return list
}

function onModel(index: number, ev: Event) {
  gp.setModel(index, Number((ev.target as HTMLSelectElement).value))
}

const color = (index: number) => ({ '--c': `var(--blk-${index})` })
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Signal chain</h2>
    <div class="chain">
      <span class="end">IN</span>
      <div
        v-for="t in ordered" :key="t.index"
        class="blk" :class="{ on: t.on, selected: t.index === selected }" :style="color(t.index)"
      >
        <button
          class="power"
          :disabled="!gp.connected"
          :aria-pressed="t.on"
          :aria-label="`${t.name} ${t.on ? 'on' : 'off'}`"
          :title="t.on ? 'On: click to bypass' : 'Bypassed: click to turn on'"
          @click="gp.setModule(t.index, !t.on)"
        >
          <span class="led" :class="{ pending: gp.pending.has(t.index) }" />
        </button>
        <button class="body" :aria-pressed="t.index === selected" @click="selected = t.index">
          <span class="name">{{ t.name }}</span>
          <span class="model" :title="t.model">{{ t.model || '—' }}</span>
        </button>
      </div>
      <span class="end">OUT</span>
    </div>

    <div v-if="current" class="detail" :style="color(current.index)">
      <div class="detail-head">
        <span class="swatch" />
        <strong>{{ current.name }}</strong>
        <button
          class="state" :class="{ on: current.on }"
          :disabled="!gp.connected"
          :aria-pressed="current.on"
          @click="gp.setModule(current.index, !current.on)"
        >
          <span class="led" :class="{ pending: gp.pending.has(current.index) }" />
          {{ current.on ? 'On' : 'Bypassed' }}
        </button>
      </div>
      <label class="field">
        <span>Model</span>
        <select
          :value="current.effectId ?? ''"
          :disabled="!gp.connected || gp.loading || current.effectId == null"
          @change="onModel(current.index, $event)"
        >
          <option v-for="o in options(current)" :key="o.id" :value="o.id">{{ o.name }}</option>
        </select>
      </label>
    </div>
  </section>
</template>

<style scoped>
.chain { display: flex; flex-wrap: wrap; align-items: stretch; gap: .5rem; }
.end {
  align-self: center;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  color: var(--muted);
}

.blk {
  position: relative;
  flex: 1 1 5.25rem;
  min-width: 5.25rem;
  max-width: 8rem;
  display: flex;
  flex-direction: column;
  background: var(--raised);
  border: 1px solid var(--border);
  border-top: 3px solid color-mix(in srgb, var(--c) 35%, var(--border));
  border-radius: var(--radius-sm);
  opacity: .7;
  transition: opacity .15s, border-color .15s;
}
/* the wire between blocks */
.blk::before {
  content: '';
  position: absolute;
  left: calc(-.5rem - 1px);
  top: 50%;
  width: .5rem;
  height: 2px;
  background: var(--border-strong);
}
.blk.on { opacity: 1; border-top-color: var(--c); }
.blk.selected { border-color: var(--c); box-shadow: 0 0 0 1px var(--c); }

.blk button { background: none; border: 0; border-radius: 0; }
.blk button:hover:not(:disabled) { background: var(--raised-hover); }
.power { padding: .45rem 0 .2rem; display: flex; justify-content: center; }
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .15rem;
  padding: .2rem .35rem .5rem;
  min-width: 0;
}
.name { font-weight: 700; font-size: .9rem; }
.model {
  max-width: 100%;
  font-size: .7rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.on .led { background: var(--c); box-shadow: 0 0 8px var(--c); }

.detail {
  margin-top: var(--gap);
  padding-top: var(--gap);
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--gap) 1.5rem;
}
.detail-head { display: flex; align-items: center; gap: .6rem; }
.swatch { width: .8rem; height: .8rem; border-radius: 3px; background: var(--c); }
.state { display: inline-flex; align-items: center; gap: .4rem; font-size: .85rem; }
.field { display: flex; align-items: center; gap: .5rem; font-size: .85rem; color: var(--muted); }
.field select { color: var(--text); min-width: 14rem; max-width: 100%; }

@media (max-width: 760px) {
  .end, .blk::before { display: none; }
  .field { flex-wrap: wrap; width: 100%; }
  .field select { min-width: 0; width: 100%; }
}
</style>
