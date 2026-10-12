import { TEMPO_MIN, TEMPO_MAX } from './constants'

/** A gap longer than this starts a new tap sequence. */
export const TAP_RESET_MS = 2000
/** Average over at most this many intervals, so the tempo can still move. */
const TAP_WINDOW = 4

/**
 * Tap tempo: add a tap time (ms) to the sequence and return the new sequence and its BPM.
 * BPM is null until there are two taps; it is rounded and clamped to the pedal's 40..250.
 */
export function tap(taps: number[], now: number): { taps: number[]; bpm: number | null } {
  const last = taps[taps.length - 1]
  const next = last != null && now - last <= TAP_RESET_MS ? [...taps, now].slice(-(TAP_WINDOW + 1)) : [now]
  if (next.length < 2) return { taps: next, bpm: null }
  const avg = (next[next.length - 1]! - next[0]!) / (next.length - 1)
  const bpm = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, Math.round(60000 / avg)))
  return { taps: next, bpm }
}
