export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_KEY = 'gp200.theme'
const MODES: readonly ThemeMode[] = ['system', 'light', 'dark']

const systemQuery = () => window.matchMedia('(prefers-color-scheme: light)')

function apply(mode: ThemeMode) {
  const light = mode === 'light' || (mode === 'system' && systemQuery().matches)
  document.documentElement.dataset.theme = light ? 'light' : 'dark'
}

function stored(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch { /* storage blocked: follow the system */ }
  return 'system'
}

let listening = false

/** Theme choice (system / light / dark), saved per browser and applied as `data-theme` on <html>. */
export function useTheme() {
  const mode = useState<ThemeMode>('theme', stored)

  if (!listening) {
    listening = true
    // follow the OS while in system mode
    systemQuery().addEventListener('change', () => { if (mode.value === 'system') apply('system') })
    watch(mode, m => {
      apply(m)
      try {
        if (m === 'system') localStorage.removeItem(THEME_KEY)
        else localStorage.setItem(THEME_KEY, m)
      } catch { /* ignore */ }
    }, { immediate: true })
  }

  const cycle = () => { mode.value = MODES[(MODES.indexOf(mode.value) + 1) % MODES.length]! }
  return { mode, cycle }
}
