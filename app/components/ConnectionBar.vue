<script setup lang="ts">
const gp = useGp200Store()
</script>

<template>
  <header class="bar">
    <span class="dot" :class="{ on: gp.connected }" />
    <span>{{ gp.connected ? `Connected: ${gp.portName}` : 'Not connected' }}</span>
    <button v-if="!gp.connected" @click="gp.connect()">Connect</button>
    <button v-else :disabled="gp.loading" @click="gp.refresh()">Refresh</button>
    <span v-if="gp.error" class="err">{{ gp.error }}</span>
  </header>
</template>

<style scoped>
.bar { display: flex; gap: .75rem; align-items: center; padding: .5rem 0; }
.dot { width: .75rem; height: .75rem; border-radius: 50%; background: #888; }
.dot.on { background: #2ecc71; }
.err { color: #e74c3c; }
</style>
