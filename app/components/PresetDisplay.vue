<script setup lang="ts">
import { PRESET_COUNT, presetLabel } from '~/utils/gp200/constants'
import { describeChange } from '~/utils/gp200/snapshot'

const gp = useGp200Store()

const step = (d: number) => {
  if (gp.preset == null) return
  gp.setPreset((gp.preset + d + PRESET_COUNT) % PRESET_COUNT)
}

const edited = computed(() => gp.changes.length > 0)
const resetTitle = computed(() => `Revert to the stored preset:\n${gp.changes.map(describeChange).join('\n')}`)
</script>

<template>
  <div class="display">
    <button :disabled="!gp.connected" aria-label="Previous preset" @click="step(-1)">◀</button>
    <div class="lcd">
      <strong>{{ gp.preset != null ? presetLabel(gp.preset) : '--' }}</strong>
      <span>{{ gp.presetName || ' ' }}<em v-if="edited" title="Edited, not saved">*</em></span>
    </div>
    <button :disabled="!gp.connected" aria-label="Next preset" @click="step(1)">▶</button>
    <button
      class="reset" :class="{ off: !edited }" :disabled="!edited || !gp.connected || gp.resetting" :title="resetTitle"
      :aria-hidden="!edited"
      @click="gp.resetPreset()"
    >
      ↺ Reset <span class="count">{{ gp.changes.length || 1 }}</span>
    </button>
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
.reset.off { visibility: hidden; }
.lcd em { font-style: normal; margin-left: .2rem; }
.reset { display: flex; align-items: center; gap: .35rem; white-space: nowrap; border-color: var(--accent); }
.count {
  min-width: 1.2rem;
  padding: 0 .3rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--panel);
  font-size: .75rem;
  font-weight: 700;
  line-height: 1.2rem;
}
</style>
