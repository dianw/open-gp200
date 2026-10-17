<script setup lang="ts">
import { modelsForBlock } from '~/utils/gp200/models'
import { cablePaths, type JackBox } from '~/utils/cables'
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

/** pedal size in the chain, remembered per browser; 100% draws the pedals at BASE_ZOOM of their CSS size */
const BASE_ZOOM = .8
const ZOOM_KEY = 'gp200.chain.size'
const ZOOMS = [80, 90, 100, 110, 120]
const zoom = ref(100)
onMounted(() => {
  try {
    const z = Number(localStorage.getItem(ZOOM_KEY))
    if (ZOOMS.includes(z)) zoom.value = z
  } catch { /* storage blocked: keep the default */ }
})
watch(zoom, z => {
  try {
    localStorage.setItem(ZOOM_KEY, String(z))
  } catch { /* ignore */ }
  nextTick(measure)
})

const color = (index: number) => ({ '--c': `var(--blk-${index})` })

// cables: measured from where the pedals actually landed, so they follow every wrap
const chainEl = ref<HTMLElement>()
const cables = ref<string[]>([])
const jacks = ref<{ x: number; y: number }[]>([])

/** pedal jacks sit this far down the enclosure, between the knobs and the label plate */
const JACK_AT = .42

function measure() {
  const root = chainEl.value
  if (!root) return
  const base = root.getBoundingClientRect()
  const boxes: JackBox[] = []
  const ends: number[] = []
  const pins: { x: number; y: number }[] = []
  for (const el of root.querySelectorAll<HTMLElement>('[data-jack]')) {
    const r = el.getBoundingClientRect()
    if (!r.width) continue // IN/OUT are hidden on phones
    const pedal = el.dataset.jack === 'pedal'
    const box = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height, jack: 0 }
    box.jack = box.y + box.h * (pedal ? JACK_AT : .5)
    if (!pedal) ends.push(boxes.length)
    boxes.push(box)
    if (pedal) pins.push({ x: box.x, y: box.jack }, { x: box.x + box.w, y: box.jack })
  }
  // IN/OUT take the jack height of the pedal they plug into, so those cables run level
  for (const i of ends) {
    const next = boxes[i === 0 ? 1 : i - 1]
    if (next && next.y < boxes[i]!.y + boxes[i]!.h && boxes[i]!.y < next.y + next.h) boxes[i]!.jack = next.jack
  }
  cables.value = cablePaths(boxes, parseFloat(getComputedStyle(root).columnGap) || 0)
  jacks.value = pins
}

let observer: ResizeObserver | undefined
onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (chainEl.value) observer.observe(chainEl.value)
})
onBeforeUnmount(() => observer?.disconnect())
watch(ordered, () => nextTick(measure))
</script>

<template>
  <section class="panel">
    <div class="head">
      <h2 class="panel-title">Signal chain</h2>
      <label class="zoom">
        <span class="sr-only">Pedal size</span>
        <select v-model.number="zoom" title="Pedal size">
          <option v-for="z in ZOOMS" :key="z" :value="z">{{ z }}%</option>
        </select>
      </label>
    </div>
    <div ref="chainEl" class="chain">
      <svg class="cables" aria-hidden="true">
        <g v-for="(d, i) in cables" :key="i">
          <path class="cable" :d="d" />
          <path class="cable-sheen" :d="d" />
        </g>
        <rect v-for="(j, i) in jacks" :key="`j${i}`" class="jack" :x="j.x - 3" :y="j.y - 6" width="6" height="12" rx="1.5" />
      </svg>
      <span class="end" data-jack="end">IN</span>
      <Stompbox
        v-for="t in ordered" :key="t.index"
        data-jack="pedal"
        :style="{ zoom: BASE_ZOOM * zoom / 100 }"
        :m="t"
        :selected="t.index === selected"
        :pending="gp.pending.has(t.index)"
        :disabled="!gp.connected"
        @select="selected = t.index"
        @toggle="gp.setModule(t.index, !t.on)"
      />
      <span class="end" data-jack="end">OUT</span>
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
      <ParamKnobs :m="current" />
    </div>
  </section>
</template>

<style scoped>
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.zoom select { font-size: .75rem; padding: .1rem .3rem; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.chain {
  --chain-gap: 1.75rem;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.75rem var(--chain-gap);
  padding: .25rem .5rem .5rem;
}
.cables {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 2px 2px var(--shadow));
}
.cable, .cable-sheen { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.cable { stroke: var(--cable); stroke-width: 6; }
.cable-sheen { stroke: var(--cable-hi); stroke-width: 1.5; opacity: .7; transform: translateY(-1px); }
.jack { fill: var(--metal-lo); stroke: var(--cable); stroke-width: 1; }
.end {
  position: relative;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: 0 .35rem;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  color: var(--muted);
}
/* puts the label's middle level with the pedals' jacks (JACK_AT) */
.end::before { content: ''; flex: none; height: calc(42% - .42rem); }

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
.on .led { background: var(--c); box-shadow: 0 0 8px var(--c); }
.state { display: inline-flex; align-items: center; gap: .4rem; font-size: .85rem; }
.field { display: flex; align-items: center; gap: .5rem; font-size: .85rem; color: var(--muted); }
.field select { color: var(--text); min-width: 14rem; max-width: 100%; }

@media (max-width: 760px) {
  .end { display: none; }
  .chain { --chain-gap: 1rem; row-gap: 1.25rem; }
  .field { flex-wrap: wrap; width: 100%; }
  .field select { min-width: 0; width: 100%; }
}
</style>
