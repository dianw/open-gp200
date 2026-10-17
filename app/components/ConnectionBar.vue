<script setup lang="ts">
const gp = useGp200Store()
</script>

<template>
  <div class="bar">
    <span class="led" :class="{ on: gp.connected }" />
    <span class="status" :title="gp.portName ?? undefined">{{ gp.connected ? gp.portName : 'Not connected' }}</span>
    <button v-if="!gp.connected" @click="gp.connect()">Connect</button>
    <button v-else :disabled="gp.loading" title="Re-read the preset from the pedal" @click="gp.refresh()">Refresh</button>
    <span v-if="gp.error" class="err">{{ gp.error }}</span>
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; min-width: 0; }
.led.on { background: var(--on); box-shadow: 0 0 6px var(--on); }
.status { color: var(--muted); font-size: .85rem; max-width: 12rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.err { font-size: .85rem; }
</style>
