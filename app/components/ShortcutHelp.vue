<script setup lang="ts">
import { SHORTCUT_HELP } from '~/utils/shortcuts'

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <section class="panel help" role="dialog" aria-modal="true" aria-labelledby="shortcut-title">
      <div class="head">
        <h2 id="shortcut-title" class="panel-title">Keyboard shortcuts</h2>
        <button class="close" aria-label="Close" @click="emit('close')">×</button>
      </div>
      <dl>
        <template v-for="s in SHORTCUT_HELP" :key="s.keys">
          <dt><kbd>{{ s.keys }}</kbd></dt>
          <dd>{{ s.what }}</dd>
        </template>
      </dl>
      <p class="note">Keys do nothing while you type in a field. Esc closes this list.</p>
    </section>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: color-mix(in srgb, var(--bg) 60%, transparent);
}
.help { width: min(26rem, 100%); box-shadow: 0 8px 24px var(--shadow); }
.head { display: flex; justify-content: space-between; align-items: flex-start; }
.close { padding: 0 .5rem; line-height: 1.4; }
dl { display: grid; grid-template-columns: auto 1fr; gap: .5rem 1rem; margin: .5rem 0; align-items: center; }
dt { text-align: right; }
dd { margin: 0; }
.note { margin: .75rem 0 0; font-size: .8rem; color: var(--muted); }
</style>
