<script setup lang="ts">
import { CTRL_COUNT, MODULES } from '~/utils/gp200/constants'

const gp = useGp200Store()
const ctrls = computed(() =>
  Array.from({ length: CTRL_COUNT }, (_, i) => {
    const c = gp.ctrls[i]
    const names = c ? [...c.modules.map(m => MODULES[m]?.name ?? `#${m}`), ...(c.fxLoop ? ['FX LOOP'] : [])] : []
    return { i, on: c?.on ?? false, assigned: names.join(' ') }
  }),
)
</script>

<template>
  <section class="ctrls">
    <button
      v-for="c in ctrls" :key="c.i"
      class="ctrl" :class="{ on: c.on }"
      :disabled="!gp.connected"
      @click="gp.pressCtrl(c.i)"
    >
      <span class="led" />
      <span>CTRL {{ c.i + 1 }}</span>
      <small>{{ c.assigned || '—' }}</small>
    </button>
  </section>
</template>

<style scoped>
.ctrls { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
.ctrl { width: 6rem; height: 5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4rem; }
.led { width: .8rem; height: .8rem; border-radius: 50%; background: #444; }
.on .led { background: #3498db; box-shadow: 0 0 8px #3498db; }
.ctrl small { font-size: .7rem; opacity: .75; }
</style>
