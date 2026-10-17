import { CTRL_COUNT, PRESET_COUNT, SLOTS } from './gp200/constants'

/** keyboard actions; keys are physical positions (`KeyboardEvent.code`), so they work on any layout */
export type ShortcutAction =
  | { type: 'block'; pos: number }
  | { type: 'preset'; delta: number }
  | { type: 'slot'; slot: number }
  | { type: 'ctrl'; i: number }
  | { type: 'help' }

/** block toggles by chain position: the top row 1..9, 0, - */
const BLOCK_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus']
export const BLOCK_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-']
const SLOT_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF']
export const SLOT_KEYS = ['A', 'S', 'D', 'F']
const CTRL_CODES = ['KeyQ', 'KeyW', 'KeyE', 'KeyR']
export const CTRL_KEYS = ['Q', 'W', 'E', 'R']
const PRESET_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -SLOTS.length, ArrowDown: SLOTS.length }

/** the action for a key, or null; `key` is only used for `?`, which sits on different keys per layout */
export function shortcutAction(code: string, key = ''): ShortcutAction | null {
  if (key === '?') return { type: 'help' }
  let i = BLOCK_CODES.indexOf(code)
  if (i >= 0) return { type: 'block', pos: i }
  i = SLOT_CODES.indexOf(code)
  if (i >= 0) return { type: 'slot', slot: i }
  i = CTRL_CODES.indexOf(code)
  if (i >= 0 && i < CTRL_COUNT) return { type: 'ctrl', i }
  const delta = PRESET_STEPS[code]
  return delta ? { type: 'preset', delta } : null
}

/** preset `p` moved by `delta`, wrapping around both ends (64-D → 1-A) */
export function stepPreset(p: number, delta: number): number {
  return (((p + delta) % PRESET_COUNT) + PRESET_COUNT) % PRESET_COUNT
}

/** slot `slot` (0 = A) in the bank of preset `p` */
export function slotInBank(p: number, slot: number): number {
  return Math.floor(p / SLOTS.length) * SLOTS.length + slot
}

/** the list shown by `?` */
export const SHORTCUT_HELP: { keys: string; what: string }[] = [
  { keys: '1 … 9, 0, -', what: 'Turn the 1st … 11th block in the chain on/off' },
  { keys: '← →', what: 'Previous / next preset' },
  { keys: '↑ ↓', what: 'Previous / next bank (same slot)' },
  { keys: SLOT_KEYS.join(' '), what: 'Slot A-D in this bank' },
  { keys: CTRL_KEYS.join(' '), what: 'CTRL 1-4' },
  { keys: 'T', what: 'Tap tempo' },
  { keys: '?', what: 'Show / hide this list' },
]
