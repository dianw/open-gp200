<script setup lang="ts">
import { PRESET_COUNT, presetLabel } from '~/utils/gp200/constants'

const gp = useGp200Store()

const step = (d: number) => {
  if (gp.preset == null) return
  gp.setPreset((gp.preset + d + PRESET_COUNT) % PRESET_COUNT)
}
</script>

<template>
  <div class="display">
    <button :disabled="!gp.connected" aria-label="Previous preset" @click="step(-1)">◀</button>
    <div class="lcd">
      <strong>{{ gp.preset != null ? presetLabel(gp.preset) : '--' }}</strong>
      <span>{{ gp.presetName || ' ' }}</span>
    </div>
    <button :disabled="!gp.connected" aria-label="Next preset" @click="step(1)">▶</button>
  </div>
</template>

<style scoped>
.display { display: flex; align-items: center; gap: .6rem; }
.lcd {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 14rem;
  padding: .3rem 1rem;
  background: var(--lcd-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--lcd-text);
  font-family: var(--mono);
  text-shadow: 0 0 6px var(--lcd-glow);
}
.lcd strong { font-size: 1.6rem; line-height: 1.1; }
.lcd span { font-size: .85rem; white-space: pre; }
</style>
