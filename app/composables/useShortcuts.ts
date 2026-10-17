import { shortcutAction, slotInBank, stepPreset } from '~/utils/shortcuts'

/** global keyboard shortcuts (see `utils/shortcuts.ts`); returns whether the help list is open */
export function useShortcuts() {
  const gp = useGp200Store()
  const helpOpen = ref(false)

  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if ((e.target as HTMLElement | null)?.closest('input, select, textarea')) return
    if (e.key === 'Escape' && helpOpen.value) {
      helpOpen.value = false
      return
    }
    const a = shortcutAction(e.code, e.key)
    if (!a) return
    if (a.type === 'help') {
      e.preventDefault()
      helpOpen.value = !helpOpen.value
      return
    }
    // holding a key would flood the pedal with program changes and toggles
    if (e.shiftKey || e.repeat || !gp.connected) {
      if (a.type === 'preset') e.preventDefault()
      return
    }
    switch (a.type) {
      case 'block': {
        const m = gp.modules.find(x => x.index === gp.order[a.pos])
        if (m) gp.setModule(m.index, !m.on)
        break
      }
      case 'preset':
        e.preventDefault() // no page scroll
        if (gp.preset != null) gp.setPreset(stepPreset(gp.preset, a.delta))
        break
      case 'slot':
        if (gp.preset != null) gp.setPreset(slotInBank(gp.preset, a.slot))
        break
      case 'ctrl':
        gp.pressCtrl(a.i)
        break
    }
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

  return { helpOpen }
}
