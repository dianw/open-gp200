<script setup lang="ts">
import { modelsForBlock } from '~/utils/gp200/models'
import type { ModuleState } from '~/stores/gp200'

const gp = useGp200Store()
const ordered = computed(() =>
  gp.order.map(i => gp.modules.find(m => m.index === i)).filter((m): m is ModuleState => !!m),
)

/** the block's model list, plus its current model if the list doesn't have it */
function options(m: ModuleState) {
  const list = modelsForBlock(m.index)
  if (m.effectId != null && !list.some(o => o.id === m.effectId)) list.unshift({ id: m.effectId, name: m.model })
  return list
}

function onModel(index: number, ev: Event) {
  gp.setModel(index, Number((ev.target as HTMLSelectElement).value))
}
</script>

<template>
  <section class="board">
    <template v-for="t in ordered" :key="t.index">
      <div class="mod" :class="{ on: t.on }">
        <button class="toggle" :disabled="!gp.connected" @click="gp.setModule(t.index, !t.on)">
          <span class="led" />
          <span>{{ t.name }}</span>
        </button>
        <select
          :value="t.effectId ?? ''"
          :disabled="!gp.connected || gp.loading || t.effectId == null"
          :title="t.model"
          @change="onModel(t.index, $event)"
        >
          <option v-for="o in options(t)" :key="o.id" :value="o.id">{{ o.name }}</option>
        </select>
      </div>
    </template>
  </section>
</template>

<style scoped>
.board { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
.mod { width: 8rem; display: flex; flex-direction: column; gap: .3rem; }
.toggle { height: 4.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4rem; }
.led { width: .8rem; height: .8rem; border-radius: 50%; background: #444; }
.on .led { background: #2ecc71; box-shadow: 0 0 8px #2ecc71; }
.mod select { width: 100%; font-size: .75rem; padding: .3rem .4rem; }
</style>
