<script setup lang="ts">
import { BANK_COUNT, SLOTS, PRESET_COUNT, presetLabel } from '~/utils/gp200/constants'

const gp = useGp200Store()
const bank = ref(1)
watch(() => gp.preset, p => { if (p != null) bank.value = Math.floor(p / 4) + 1 }, { immediate: true })

const step = (d: number) => {
  if (gp.preset == null) return
  gp.setPreset((gp.preset + d + PRESET_COUNT) % PRESET_COUNT)
}
</script>

<template>
  <section>
    <div class="head">
      <button :disabled="!gp.connected" @click="step(-1)">◀</button>
      <div class="label">
        <strong>{{ gp.preset != null ? presetLabel(gp.preset) : '--' }}</strong>
        <span>{{ gp.presetName }}</span>
      </div>
      <button :disabled="!gp.connected" @click="step(1)">▶</button>
    </div>
    <div class="pick">
      <select v-model.number="bank">
        <option v-for="b in BANK_COUNT" :key="b" :value="b">Bank {{ b }}</option>
      </select>
      <button
        v-for="(s, i) in SLOTS" :key="s"
        :disabled="!gp.connected"
        :class="{ active: gp.preset === (bank - 1) * 4 + i }"
        @click="gp.setPreset((bank - 1) * 4 + i)"
      >{{ s }}</button>
    </div>
  </section>
</template>

<style scoped>
.head { display: flex; align-items: center; gap: 1rem; margin-bottom: .5rem; }
.label { display: flex; flex-direction: column; min-width: 12rem; text-align: center; }
.label strong { font-size: 2rem; }
.pick { display: flex; gap: .5rem; }
.active { background: #2ecc71; color: #000; }
</style>
