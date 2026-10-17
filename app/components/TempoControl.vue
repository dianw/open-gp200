<script setup lang="ts">
import { TEMPO_MIN, TEMPO_MAX } from '~/utils/gp200/constants'
import { tap } from '~/utils/gp200/tap'

const gp = useGp200Store()
const draft = ref<number | null>(null)
watch(() => gp.tempo, t => { draft.value = t }, { immediate: true })

const commit = () => {
  if (draft.value == null || !Number.isFinite(draft.value)) draft.value = gp.tempo
  else gp.setTempo(draft.value)
}
const step = (d: number) => { if (gp.tempo != null) gp.setTempo(gp.tempo + d) }

// the TAP button blinks on the beat like the pedal's LED; a tap restarts the blink on that tap
const beat = ref(0)
const beatStyle = computed(() => (gp.tempo ? { animationDuration: `${60 / gp.tempo}s` } : undefined))

let taps: number[] = []
const onTap = () => {
  if (!gp.connected) return
  const r = tap(taps, performance.now())
  taps = r.taps
  if (r.bpm != null) gp.setTempo(r.bpm)
  beat.value++
}

// T taps too, unless typing in a field
const onKey = (e: KeyboardEvent) => {
  if (e.key.toLowerCase() !== 't' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
  if ((e.target as HTMLElement | null)?.closest('input, select, textarea')) return
  onTap()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="tempo">
    <label class="title" for="tempo-bpm">Tempo</label>
    <button :disabled="!gp.connected || gp.tempo == null" aria-label="Tempo down" @click="step(-1)">−</button>
    <input
      id="tempo-bpm" v-model.number="draft" type="number" :min="TEMPO_MIN" :max="TEMPO_MAX"
      :disabled="!gp.connected || gp.tempo == null"
      @change="commit" @keydown.enter="($event.target as HTMLInputElement).blur()"
    >
    <span class="unit">BPM</span>
    <button :disabled="!gp.connected || gp.tempo == null" aria-label="Tempo up" @click="step(1)">+</button>
    <button class="tap" :disabled="!gp.connected" title="Tap (or press T)" @click="onTap">
      <span v-if="gp.connected && gp.tempo" :key="`${beat}-${gp.tempo}`" class="beat" :style="beatStyle" />
      <span class="label">TAP</span>
    </button>
  </section>
</template>

<style scoped>
.tempo { display: flex; align-items: center; gap: .4rem; }
.title { font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-right: .25rem; }
input { width: 4.2rem; font-size: 1.15rem; text-align: center; font-family: var(--mono); }
.unit { color: var(--muted); font-size: .85rem; }
.tap { position: relative; overflow: hidden; min-width: 4.5rem; font-weight: 700; margin-left: .5rem; }
.label { position: relative; }
.beat { position: absolute; inset: 0; background: var(--accent); animation: beat linear infinite; pointer-events: none; }
@keyframes beat {
  0%, 50% { opacity: .9; }
  60%, 100% { opacity: 0; }
}
</style>
