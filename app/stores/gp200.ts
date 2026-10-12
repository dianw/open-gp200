import { defineStore } from 'pinia'
import { MODULES, MODULE_COUNT, PRESET_COUNT } from '~/utils/gp200/constants'
import { handshake, queryPreset, readActiveDump, selectPreset, toggleModule } from '~/utils/gp200/messages'
import { parseMessage, type Gp200Event } from '~/utils/gp200/parser'
import { DumpAssembler, parseDump } from '~/utils/gp200/dump'
import { modelName } from '~/utils/gp200/models'

type Waiter = { pred: (e: Gp200Event) => boolean; resolve: (e: Gp200Event) => void }

export interface ModuleState {
  index: number
  name: string
  on: boolean
  toggleable: boolean
  /** effect model id and display name, from the last dump */
  type: number | null
  model: string
  params: number[]
}

export const useGp200Store = defineStore('gp200', () => {
  const midi = useMidi()

  const preset = ref<number | null>(null)
  const presetName = ref('')
  const order = ref<number[]>(MODULES.map(m => m.index))
  const modules = ref<ModuleState[]>(
    MODULES.map(m => ({ index: m.index, name: m.name, on: false, toggleable: m.cc != null, type: null, model: '', params: [] })),
  )
  const loading = ref(false)
  const error = ref<string | null>(null)

  const assembler = new DumpAssembler()
  const waiters = new Set<Waiter>()
  let queue: Promise<unknown> = Promise.resolve()
  let syncing = false
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  const toggleTimers = new Map<number, ReturnType<typeof setTimeout>>()

  function waitFor<T extends Gp200Event['type']>(
    type: T,
    timeoutMs: number,
    pred: (e: Extract<Gp200Event, { type: T }>) => boolean = () => true,
  ): Promise<Extract<Gp200Event, { type: T }>> {
    return new Promise((resolve, reject) => {
      const w: Waiter = {
        pred: e => e.type === type && pred(e as Extract<Gp200Event, { type: T }>),
        resolve: e => {
          clearTimeout(timer)
          resolve(e as Extract<Gp200Event, { type: T }>)
        },
      }
      const timer = setTimeout(() => {
        waiters.delete(w)
        reject(new Error(`timeout waiting for ${type}`))
      }, timeoutMs)
      waiters.add(w)
    })
  }

  /** One outstanding SysEx request at a time: replies carry no request id. */
  function enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = queue.then(fn, fn)
    queue = next.catch(() => {})
    return next
  }

  function applyModule(index: number, on: boolean) {
    const m = modules.value.find(x => x.index === index)
    if (m) m.on = on
    const t = toggleTimers.get(index)
    if (t) {
      clearTimeout(t)
      toggleTimers.delete(index)
    }
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => void refresh(), 150)
  }

  function handleEvent(e: Gp200Event) {
    for (const w of [...waiters]) {
      if (w.pred(e)) {
        waiters.delete(w)
        w.resolve(e)
      }
    }
    switch (e.type) {
      case 'preset':
        preset.value = e.preset
        if (!syncing) scheduleRefresh()
        break
      case 'module':
        applyModule(e.module, e.on)
        break
      case 'dumpChunk':
        assembler.add(e.offset, e.bytes)
        break
    }
  }

  function onData(data: Uint8Array) {
    if (data[0] !== 0xf0) return // ignore PC/CC echoes
    handleEvent(parseMessage(data))
  }

  /** Query current preset, read the active dump, fill the store. */
  function refresh() {
    return enqueue(async () => {
      if (!midi.connected.value) return
      syncing = true
      loading.value = true
      error.value = null
      try {
        midi.send(queryPreset())
        let p
        try {
          p = await waitFor('preset', 1000)
        } catch {
          // no answer: try the (unverified) handshake once, then retry the query
          midi.send(handshake())
          await new Promise(r => setTimeout(r, 200))
          midi.send(queryPreset())
          p = await waitFor('preset', 1000)
        }
        preset.value = p.preset

        assembler.reset()
        const done = (async () => {
          const start = Date.now()
          while (!assembler.complete) {
            if (Date.now() - start > 2000) throw new Error('timeout reading preset dump')
            await new Promise(r => setTimeout(r, 20))
          }
        })()
        midi.send(readActiveDump(p.preset))
        await done

        const d = parseDump(assembler.buf)
        presetName.value = d.name
        order.value = d.order
        for (const m of d.modules) {
          applyModule(m.index, m.on)
          const ms = modules.value.find(x => x.index === m.index)
          if (ms) {
            ms.type = m.type
            ms.model = modelName(m.index, m.type, m.category)
            ms.params = m.params
          }
        }
      } catch (e) {
        error.value = (e as Error).message
      } finally {
        syncing = false
        loading.value = false
      }
    })
  }

  function setPreset(p: number) {
    if (p < 0 || p >= PRESET_COUNT) return
    for (const m of selectPreset(p)) midi.send(m)
    // the pedal answers with a preset event, which triggers the dump refresh
  }

  function setModule(index: number, on: boolean) {
    const msg = toggleModule(index, on)
    if (!msg) return
    midi.send(msg)
    applyModule(index, on) // optimistic
    // if the pedal doesn't confirm via SysEx, reconcile from a fresh dump
    toggleTimers.set(index, setTimeout(() => {
      toggleTimers.delete(index)
      void refresh()
    }, 300))
  }

  async function connect() {
    await midi.connect()
    if (midi.connected.value) await refresh()
  }

  midi.onMessage(onData)
  midi.onConnectionChange(c => {
    if (c) void refresh()
    else error.value = 'Pedal disconnected'
  })

  return {
    ...midi,
    error: computed(() => error.value ?? midi.error.value),
    preset, presetName, order, modules, loading,
    connect, refresh, setPreset, setModule,
  }
})
