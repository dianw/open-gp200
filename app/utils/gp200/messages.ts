import { HEADER, DIR_APP_TO_PEDAL, CMD_EVENT, CMD_PARAM, MODULES } from './constants'

const nib = (n: number) => [(n >> 4) & 0x0f, n & 0x0f]

/** Ask the pedal for the current preset; reply is a "preset" event. Does not switch preset. */
export function queryPreset(): number[] {
  return [
    ...HEADER, DIR_APP_TO_PEDAL, CMD_EVENT,
    0, 0, 0, 0, 8, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0x06, 0x0c, 0, 0,
    0xf7,
  ]
}

/** Request the live (edit buffer) dump. `preset` should be the current preset. */
export function readActiveDump(preset: number): number[] {
  return [
    ...HEADER, DIR_APP_TO_PEDAL, CMD_PARAM,
    0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0,
    0, 0, 0, ...nib(preset & 0xff),
    0, 0, 0, 1, 0, 0, 0, 4, 0, 0,
    0x0f, 0x0f, 0x0f, 0x0f,
    0, 0, 0, 0,
    0xf7,
  ]
}

/**
 * Select a preset (0..255): CC0 bank-select then Program Change on channel 1.
 * Verified on the device: CC0=0 selects 1-A..32-D (PC=p), CC0=1 selects 33-A..64-D (PC=p-128).
 * (The manual lists these the other way round.)
 */
export function selectPreset(preset: number): number[][] {
  const upper = preset >= 128
  return [
    [0xb0, 0x00, upper ? 1 : 0],
    [0xc0, upper ? preset - 128 : preset],
  ]
}

export function toggleModule(module: number, on: boolean): number[] | null {
  const cc = MODULES[module]?.cc
  if (cc == null) return null
  return [0xb0, cc, on ? 127 : 0]
}

/** Probably "editor mode on": the last message the official app sent after its sync (advisor's guess). */
export function handshake(): number[] {
  return [...HEADER, DIR_APP_TO_PEDAL, 0x04, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0xf7]
}
