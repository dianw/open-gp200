<script setup lang="ts">
import { describeMessage, type Described, type DescribeContext } from '~/utils/gp200/describe'
import type { MidiLogEntry } from '~/composables/useMidi'

const gp = useGp200Store()

type View = 'table' | 'raw'
const VIEW_KEY = 'gp200.midiLog.view'
const view = ref<View>('table')
onMounted(() => {
  try {
    if (localStorage.getItem(VIEW_KEY) === 'raw') view.value = 'raw'
  } catch { /* storage blocked: keep the default */ }
})
watch(view, v => {
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch { /* ignore */ }
})

const hideDumps = ref(false)
const hideNotes = ref(false)

interface Row {
  entry: MidiLogEntry
  dt: number
  d: Described | null
}

const rows = computed<Row[]>(() => {
  const ctx: DescribeContext = {}
  const entries = gp.log.slice(-100)
  const out: Row[] = []
  entries.forEach((e, i) => {
    const d = e.bytes ? describeMessage(e.bytes, ctx) : null
    if (hideNotes.value && !d) return
    if (hideDumps.value && d?.kind === 'dump') return
    out.push({ entry: e, dt: i ? e.t - entries[i - 1]!.t : 0, d })
  })
  return out
})

const expanded = ref(new Set<MidiLogEntry>())
function toggle(e: MidiLogEntry) {
  if (expanded.value.has(e)) expanded.value.delete(e)
  else expanded.value.add(e)
}

function clear() {
  gp.log.splice(0)
  expanded.value.clear()
}

const time = (t: number) => {
  const d = new Date(t)
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`
}

// stay pinned to the newest message unless the user scrolled up
const scroller = ref<HTMLElement | null>(null)
watch(() => gp.log.length, async () => {
  const el = scroller.value
  if (!el) return
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  await nextTick()
  if (atBottom) el.scrollTop = el.scrollHeight
})
</script>

<template>
  <details class="log">
    <summary>Raw MIDI log ({{ gp.log.length }})</summary>
    <div class="bar">
      <div class="seg">
        <button :class="{ active: view === 'table' }" @click="view = 'table'">Table</button>
        <button :class="{ active: view === 'raw' }" @click="view = 'raw'">Raw</button>
      </div>
      <label><input v-model="hideDumps" type="checkbox"> hide dump chunks</label>
      <label><input v-model="hideNotes" type="checkbox"> hide notes</label>
      <button @click="clear">Clear</button>
    </div>

    <div ref="scroller" class="scroll">
      <pre v-if="view === 'raw'"><template v-for="r in rows" :key="r.entry.t + r.entry.hex">{{ r.entry.dir === 'in' ? '←' : '→' }} {{ r.entry.hex }}
</template></pre>

      <table v-else class="msgs">
        <thead>
          <tr><th>Time</th><th>+ms</th><th /><th>Type</th><th>Summary</th><th>Bytes</th></tr>
        </thead>
        <tbody>
          <template v-for="r in rows" :key="r.entry.t + r.entry.hex">
            <tr
              class="msg"
              :class="[r.entry.dir, r.d?.kind ?? 'note', { open: expanded.has(r.entry) }]"
              @click="r.d && toggle(r.entry)"
            >
              <td class="mono">{{ time(r.entry.t) }}</td>
              <td class="mono num">{{ r.dt }}</td>
              <td class="dir">{{ r.entry.dir === 'in' ? '←' : '→' }}</td>
              <td>{{ r.d?.kind ?? 'note' }}</td>
              <td>{{ r.d?.summary ?? r.entry.hex }}</td>
              <td class="mono num">{{ r.entry.bytes?.length ?? '' }}</td>
            </tr>
            <tr v-if="r.d && expanded.has(r.entry)" class="detail">
              <td colspan="6">
                <table class="fields">
                  <thead>
                    <tr><th>#</th><th>Wire bytes</th><th>Decoded</th><th>Field</th><th>Meaning</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, k) in r.d.fields" :key="k">
                      <td class="mono num">{{ f.at }}</td>
                      <td class="mono wire">{{ f.wire }}</td>
                      <td class="mono">{{ f.decoded ?? '' }}</td>
                      <td>{{ f.name }}</td>
                      <td>{{ f.meaning }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </details>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .5rem 0; font-size: .85rem; }
.seg { display: inline-flex; }
.seg button { border-radius: 0; }
.seg button:first-child { border-radius: 6px 0 0 6px; }
.seg button:last-child { border-radius: 0 6px 6px 0; }
.seg button.active { background: #e67e22; color: #111; }
.scroll { max-height: 24rem; overflow: auto; }
pre { margin: 0; font-size: .75rem; }
table { border-collapse: collapse; width: 100%; font-size: .75rem; }
th { text-align: left; position: sticky; top: 0; background: #1e1e1e; padding: .2rem .4rem; border-bottom: 1px solid #555; }
td { padding: .15rem .4rem; vertical-align: top; }
.mono { font-family: ui-monospace, Menlo, monospace; }
.num { text-align: right; white-space: nowrap; }
.msg { cursor: pointer; border-bottom: 1px solid #2c2c2c; }
.msg:hover { background: #2a2a2a; }
.msg.open { background: #333; }
.msg.note { color: #888; cursor: default; }
.msg.dump { color: #9aa; }
.msg.in .dir { color: #6cf; }
.msg.out .dir { color: #e67e22; }
.detail > td { padding: .25rem .4rem .6rem 1.5rem; background: #181818; }
.fields th { position: static; background: none; }
.fields td { border-bottom: 1px solid #262626; }
.wire { max-width: 22rem; word-break: break-all; }
</style>
