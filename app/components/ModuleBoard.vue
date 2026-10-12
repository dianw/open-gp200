<script setup lang="ts">
const gp = useGp200Store()
const ordered = computed(() =>
  gp.order.map(i => gp.modules.find(m => m.index === i)).filter((m): m is NonNullable<typeof m> => !!m),
)
</script>

<template>
  <section class="board">
    <button
      v-for="m in ordered" :key="m.index"
      class="mod" :class="{ on: m.on }"
      :disabled="!gp.connected"
      @click="gp.setModule(m.index, !m.on)"
    >
      <span class="led" />
      <span>{{ m.name }}</span>
      <small v-if="m.model">{{ m.model }}</small>
    </button>
  </section>
</template>

<style scoped>
.board { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
.mod { width: 6rem; height: 6rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4rem; }
.led { width: .8rem; height: .8rem; border-radius: 50%; background: #444; }
.on .led { background: #2ecc71; box-shadow: 0 0 8px #2ecc71; }
.mod small { font-size: .7rem; opacity: .75; }
</style>
