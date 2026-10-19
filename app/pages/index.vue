<script setup lang="ts">
useHead({ title: 'GP-200LT Controller' })
const gp = useGp200Store()
const { helpOpen } = useShortcuts()
</script>

<template>
  <header class="top">
    <div class="top-inner">
      <ConnectionBar class="conn" />
      <PresetDisplay class="display" />
      <div class="right">
        <TempoControl />
        <div class="tools">
          <button class="keys" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts" @click="helpOpen = true">?</button>
          <ThemeToggle />
        </div>
      </div>
    </div>
    <div class="progress" :class="{ on: gp.loading }" />
  </header>

  <main class="wrap">
    <p v-if="!gp.supported" class="panel err">
      Web MIDI isn't supported here. Use Chrome, Edge, Opera or Brave on desktop (Safari has no Web MIDI).
    </p>
    <PresetPicker class="panel" />
    <ModuleBoard />
    <CtrlBar class="panel" />
    <MidiLog class="panel" />
  </main>
  <footer class="foot">
    open-gp200 · MIT ·
    <a href="https://github.com/dianw/open-gp200" target="_blank" rel="noopener">Source on GitHub</a>
  </footer>
  <ShortcutHelp v-if="helpOpen" @close="helpOpen = false" />
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}
.top-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: .6rem 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--gap);
}
.right { justify-self: end; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: .5rem; }
.tools { display: flex; gap: .5rem; }
.keys { width: 2.2rem; padding: .4rem 0; line-height: 1; font-weight: 700; }
.progress { height: 2px; background: transparent; }
.progress.on {
  background: linear-gradient(90deg, transparent, var(--accent), transparent) 0 0 / 40% 100% no-repeat;
  animation: progress 1s linear infinite;
}
@keyframes progress { from { background-position: -40% 0; } to { background-position: 140% 0; } }

.wrap {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.foot {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem 1.5rem;
  text-align: center;
  font-size: .85rem;
  color: var(--muted);
}
.foot a { color: inherit; }

@media (max-width: 760px) {
  .top-inner { grid-template-columns: 1fr; justify-items: center; }
  .display { order: -1; }
  .right { justify-self: center; flex-wrap: wrap; }
}
</style>
