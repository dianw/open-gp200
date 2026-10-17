import { describe, expect, it } from 'vitest'
import { cablePaths, roundedPath, type JackBox } from '../app/utils/cables'

const box = (x: number, y: number, w = 100, h = 100): JackBox => ({ x, y, w, h, jack: y + h / 2 })

describe('cablePaths', () => {
  it('runs straight between boxes in the same row', () => {
    expect(cablePaths([box(0, 0), box(120, 0)], 20)).toEqual(['M100 50 L120 50'])
  })

  it('loops right, down the row gap and back left across a wrap', () => {
    const [d] = cablePaths([box(120, 0), box(0, 140)], 20, 0)
    // out of the right jack, turn at gap/2, drop to the middle of the 40px row gap, in at the next box's left
    expect(d).toBe('M220 50 L230 50 L230 120 L-10 120 L-10 190 L0 190')
  })

  it('gives one cable per neighbouring pair', () => {
    expect(cablePaths([box(0, 0), box(120, 0), box(0, 140), box(120, 140)], 20)).toHaveLength(3)
  })
})

describe('roundedPath', () => {
  it('rounds a corner with a quadratic curve no bigger than half a segment', () => {
    expect(roundedPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 8)).toBe('M0 0 L5 0 Q10 0 10 5 L10 10')
  })
})
