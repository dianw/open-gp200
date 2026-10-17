<script setup lang="ts">
import { BANK_COUNT, SLOTS } from '~/utils/gp200/constants'
import { SLOT_KEYS } from '~/utils/shortcuts'

const gp = useGp200Store()
const bank = ref(1)
watch(() => gp.preset, p => { if (p != null) bank.value = Math.floor(p / 4) + 1 }, { immediate: true })
</script>

<template>
  <section>
    <h2 class="panel-title">Preset</h2>
    <div class="pick">
      <select v-model.number="bank" aria-label="Bank" title="Bank (↑ ↓ keys)">
        <option v-for="b in BANK_COUNT" :key="b" :value="b">Bank {{ b }}</option>
      </select>
      <button
        v-for="(s, i) in SLOTS" :key="s"
        class="slot"
        :disabled="!gp.connected"
        :class="{ active: gp.preset === (bank - 1) * 4 + i }"
        :title="`Slot ${s} (key ${SLOT_KEYS[i]}; ← → step through presets)`"
        @click="gp.setPreset((bank - 1) * 4 + i)"
      >{{ s }}</button>
    </div>
  </section>
</template>

<style scoped>
.pick { display: flex; flex-wrap: wrap; gap: .5rem; }
.slot { min-width: 3rem; font-weight: 600; }
@media (max-width: 760px) {
  .pick select { flex: 1 1 100%; }
  .slot { flex: 1; }
}
.slot.active, .slot.active:hover:not(:disabled) { background: var(--on); border-color: var(--on); color: var(--on-text); }
</style>
