<script setup lang="ts">
useHead({ title: 'GP-200LT Controller' })
const gp = useGp200Store()
</script>

<template>
  <main class="wrap">
    <h1>GP-200LT Controller</h1>
    <p v-if="!gp.supported" class="err">
      Web MIDI isn't supported here. Use Chrome, Edge, Opera or Brave on desktop (Safari has no Web MIDI).
    </p>
    <ConnectionBar />
    <PresetPicker />
    <TempoControl />
    <ModuleBoard />
    <CtrlBar />
    <MidiLog />
  </main>
</template>

<style>
body { font-family: system-ui, sans-serif; background: #111; color: #eee; margin: 0; }
button, select { background: #2a2a2a; color: inherit; border: 1px solid #555; border-radius: 6px; padding: .4rem .8rem; cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
.wrap { max-width: 48rem; margin: 0 auto; padding: 1rem; }
.err { color: #e74c3c; }
</style>
