<script setup lang="ts">
const { mode, cycle } = useTheme()
const LABEL = { system: 'System theme', light: 'Grey theme', dark: 'Dark theme' } as const
const ICON = { system: '◐', light: '☁', dark: '☾' } as const
</script>

<template>
  <button class="theme" :title="`${LABEL[mode]} (click to change)`" :aria-label="LABEL[mode]" @click="cycle">
    {{ ICON[mode] }}
  </button>
</template>

<style scoped>
.theme { width: 2.2rem; padding: .4rem 0; font-size: 1rem; line-height: 1; }
</style>
