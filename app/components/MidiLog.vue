<script setup lang="ts">
const gp = useGp200Store()
</script>

<template>
  <details>
    <summary>Raw MIDI log ({{ gp.log.length }})</summary>
    <pre><template v-for="(l, i) in gp.log.slice(-100)" :key="i">{{ l.dir === 'in' ? '←' : '→' }} {{ l.hex }}
</template></pre>
  </details>
</template>

<style scoped>
pre { max-height: 20rem; overflow: auto; font-size: .75rem; }
</style>
