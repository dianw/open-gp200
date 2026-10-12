/** F0 + manufacturer/device header. Web MIDI delivers messages including F0 and F7. */
export const HEADER = [0xf0, 0x21, 0x25, 0x7e, 0x47, 0x50, 0x2d, 0x32] as const

export const DIR_APP_TO_PEDAL = 0x11
export const DIR_PEDAL_TO_APP = 0x12

export const CMD_EVENT = 0x08
export const CMD_PARAM = 0x10
export const CMD_DUMP_CHUNK = 0x18

/** Index of the first body byte (after F0 + header + DIR + CMD). */
export const BODY_START = HEADER.length + 2

export interface ModuleInfo {
  /** SysEx module number == index in the dump's module block table */
  index: number
  name: string
  /** Toggle CC number, null when unknown */
  cc: number | null
}

export const MODULES: readonly ModuleInfo[] = [
  { index: 0, name: 'PRE', cc: 48 },
  { index: 1, name: 'WAH', cc: 57 },
  { index: 2, name: 'DST', cc: 49 },
  { index: 3, name: 'AMP', cc: 50 },
  { index: 4, name: 'NR', cc: 51 },
  { index: 5, name: 'CAB', cc: 52 },
  { index: 6, name: 'EQ', cc: 53 },
  { index: 7, name: 'MOD', cc: 54 },
  { index: 8, name: 'DLY', cc: 55 },
  { index: 9, name: 'RVB', cc: 56 },
  { index: 10, name: '#11', cc: null },
]

export const MODULE_COUNT = MODULES.length

export const DUMP_SIZE = 1176
export const DUMP_CHUNK_SIZE = 185

export const DUMP_OFFSETS = {
  preset: 0x06,
  name: 0x1c,
  nameMaxLen: 0x40,
  order: 0x6c,
  modules: 0x78,
  moduleStride: 0x48,
} as const

export const PRESET_COUNT = 256
export const BANK_COUNT = 64
export const SLOTS = ['A', 'B', 'C', 'D'] as const

export function presetLabel(preset: number): string {
  return `${Math.floor(preset / 4) + 1}-${SLOTS[preset % 4]}`
}
