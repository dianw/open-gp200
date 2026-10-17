import { describe, expect, it } from 'vitest'
import { shortcutAction, slotInBank, stepPreset } from '../app/utils/shortcuts'

describe('shortcutAction', () => {
  it('maps the top row to chain positions 0..10', () => {
    expect(shortcutAction('Digit1')).toEqual({ type: 'block', pos: 0 })
    expect(shortcutAction('Digit9')).toEqual({ type: 'block', pos: 8 })
    expect(shortcutAction('Digit0')).toEqual({ type: 'block', pos: 9 })
    expect(shortcutAction('Minus')).toEqual({ type: 'block', pos: 10 })
  })

  it('maps arrows to preset steps', () => {
    expect(shortcutAction('ArrowLeft')).toEqual({ type: 'preset', delta: -1 })
    expect(shortcutAction('ArrowRight')).toEqual({ type: 'preset', delta: 1 })
    expect(shortcutAction('ArrowUp')).toEqual({ type: 'preset', delta: -4 })
    expect(shortcutAction('ArrowDown')).toEqual({ type: 'preset', delta: 4 })
  })

  it('maps A S D F to slots and Q W E R to CTRL', () => {
    expect(['KeyA', 'KeyS', 'KeyD', 'KeyF'].map(c => shortcutAction(c))).toEqual(
      [0, 1, 2, 3].map(slot => ({ type: 'slot', slot })),
    )
    expect(['KeyQ', 'KeyW', 'KeyE', 'KeyR'].map(c => shortcutAction(c))).toEqual(
      [0, 1, 2, 3].map(i => ({ type: 'ctrl', i })),
    )
  })

  it('opens help on ? whatever the key position, and ignores other keys', () => {
    expect(shortcutAction('Slash', '?')).toEqual({ type: 'help' })
    expect(shortcutAction('KeyT', 't')).toBeNull()
    expect(shortcutAction('Enter')).toBeNull()
  })
})

describe('stepPreset / slotInBank', () => {
  it('wraps around both ends', () => {
    expect(stepPreset(255, 1)).toBe(0)
    expect(stepPreset(0, -1)).toBe(255)
    expect(stepPreset(253, 4)).toBe(1)
    expect(stepPreset(2, -4)).toBe(254)
    expect(stepPreset(10, 1)).toBe(11)
  })

  it('picks a slot in the preset\'s bank', () => {
    expect(slotInBank(109, 0)).toBe(108)
    expect(slotInBank(109, 3)).toBe(111)
  })
})
