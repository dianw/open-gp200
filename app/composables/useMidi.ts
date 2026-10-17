export interface MidiLogEntry {
  dir: 'in' | 'out'
  hex: string
  /** raw message bytes; absent for text notes */
  bytes?: number[]
  t: number
}

/** Thin Web MIDI wrapper: port discovery, hot-plug, send, message subscription. */
export function useMidi() {
  const supported = ref(true)
  const connected = ref(false)
  const error = ref<string | null>(null)
  const portName = ref('')
  const sysexEnabled = ref(false)
  const log = ref<MidiLogEntry[]>([])

  let access: MIDIAccess | null = null
  let input: MIDIInput | null = null
  let output: MIDIOutput | null = null
  const messageCbs = new Set<(data: Uint8Array) => void>()
  const connectCbs = new Set<(connected: boolean) => void>()

  const hex = (d: ArrayLike<number>) =>
    Array.from(d, x => x.toString(16).padStart(2, '0')).join(' ')

  function note(text: string) {
    log.value.push({ dir: 'in', hex: `[${text}]`, t: Date.now() })
  }

  function pushLog(dir: 'in' | 'out', data: ArrayLike<number>) {
    log.value.push({ dir, hex: hex(data), bytes: Array.from(data), t: Date.now() })
    if (log.value.length > 300) log.value.splice(0, log.value.length - 300)
  }

  // Reassemble SysEx that arrives split across events, and split events holding several frames.
  let partial: number[] = []

  function onMidiMessage(e: MIDIMessageEvent) {
    if (!e.data) return
    pushLog('in', e.data)
    let data = Array.from(e.data)
    if (partial.length) {
      if (data[0] === 0xf0 || data[0]! >= 0x80) partial = [] // new message: drop stale fragment
      else {
        data = [...partial, ...data]
        partial = []
      }
    }
    if (data[0] !== 0xf0) {
      messageCbs.forEach(cb => cb(Uint8Array.from(data)))
      return
    }
    let start = 0
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0xf7) {
        const frame = Uint8Array.from(data.slice(start, i + 1))
        messageCbs.forEach(cb => cb(frame))
        start = i + 1
      }
    }
    if (start < data.length) partial = data.slice(start)
  }

  function pickPorts() {
    if (!access) return
    const find = (ports: MIDIInputMap | MIDIOutputMap) =>
      [...ports.values()].find(p => /GP-200/i.test(p.name ?? '') && p.state === 'connected')
    const nextIn = (find(access.inputs) as MIDIInput | undefined) ?? null
    const nextOut = (find(access.outputs) as MIDIOutput | undefined) ?? null

    if (input && input !== nextIn) input.onmidimessage = null
    input = nextIn
    if (input) {
      input.onmidimessage = onMidiMessage
      const opening = input
      void opening.open().then(() => note(`input "${opening.name}" state=${opening.state} connection=${opening.connection}`))
        .catch(e => note(`input open failed: ${(e as Error).message}`))
    }
    output = nextOut
    note(`ports in=[${[...access.inputs.values()].map(p => p.name).join(', ')}] out=[${[...access.outputs.values()].map(p => p.name).join(', ')}] picked in=${input?.name ?? '-'} out=${output?.name ?? '-'}`)

    const now = !!(input && output)
    portName.value = input?.name ?? ''
    if (now !== connected.value) {
      connected.value = now
      connectCbs.forEach(cb => cb(now))
    }
  }

  /** Must be called from a user gesture (permission prompt). */
  async function connect() {
    error.value = null
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      supported.value = false
      error.value = 'Web MIDI is not available in this browser. Use Chrome, Edge, Opera or Brave.'
      return
    }
    try {
      access = await navigator.requestMIDIAccess({ sysex: true })
    } catch (e) {
      error.value = `MIDI access denied: ${(e as Error).message}`
      return
    }
    sysexEnabled.value = access.sysexEnabled
    log.value.push({ dir: 'in', hex: `[sysexEnabled=${access.sysexEnabled}]`, t: Date.now() })
    if (!access.sysexEnabled) {
      error.value = 'SysEx permission was not granted; the pedal state cannot be read.'
    }
    access.onstatechange = pickPorts
    pickPorts()
    if (!connected.value) error.value = 'No GP-200 MIDI port found. Plug the pedal in via USB.'
  }

  function send(bytes: number[]) {
    if (!output) throw new Error('MIDI output not connected')
    pushLog('out', bytes)
    output.send(bytes)
  }

  function onMessage(cb: (data: Uint8Array) => void) {
    messageCbs.add(cb)
    return () => messageCbs.delete(cb)
  }

  function onConnectionChange(cb: (connected: boolean) => void) {
    connectCbs.add(cb)
    return () => connectCbs.delete(cb)
  }

  return { supported, connected, sysexEnabled, error, portName, log, connect, send, onMessage, onConnectionChange }
}
