/** F0 + manufacturer/device header. Web MIDI delivers messages including F0 and F7. */
export const HEADER = [0xf0, 0x21, 0x25, 0x7e, 0x47, 0x50, 0x2d, 0x32] as const

/**
 * Frame: header, CMD, u14 payload length (7-bit low, high), u14 chunk offset, nibble payload, F7.
 * 0x11 = query (app -> pedal); 0x12 = data: replies and notifications, but also every write the app sends.
 */
export const CMD_QUERY = 0x11
export const CMD_DATA = 0x12

/** Index of the first payload nibble (after F0 + header + CMD + length + offset). */
export const PAYLOAD_START = HEADER.length + 5

/** TLV record types inside a decoded payload: u16 type, u16 length, data. */
export const REC = {
  address: 0x0000, // { u16 source (0 = edit buffer, 1 = stored), u16 slot }
  param: 0x0005, // { u8 block, u8 param, u16 display value, u32 effect id, f32 value }
  patchSetting: 0x0006, // { u16 target (PATCH_SETTING), s16 value }: live write to the active patch
  module: 0x0015, // { u8 block, u8 on, 2 bytes }
  model: 0x0016, // { u8 block, 3 bytes, u32 effect id }
  tempo: 0x1001, // { u16 2, u16 value } after every slot change; probably the patch tempo (unverified)
  slot: 0x1008, // { u16 setting id (0 = current slot), u16 value }
  save: 0x2003, // { u16 slot, u16 flag, 16-byte name }: sent by the pedal when a preset is saved on it
} as const

export interface ModuleInfo {
  /** SysEx module number == index in the dump's module block table */
  index: number
  name: string
  /** Toggle CC number, null when the module has none */
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
  { index: 10, name: 'VOL', cc: null }, // no CC: toggled over SysEx
]

export const MODULE_COUNT = MODULES.length

/** Targets of record 0x0006. */
export const PATCH_SETTING = { volume: 0, tempo: 1, pan: 6 } as const

/** The LT has 4 CTRL footswitches (the protocol carries 8); CC 69..72 press CTRL 1..4. */
export const CTRL_COUNT = 4
export const CTRL_CC_BASE = 69
/** CTRL mask bit 11; bits 0..10 are the blocks */
export const CTRL_FX_LOOP_BIT = 11

export const TEMPO_MIN = 40
export const TEMPO_MAX = 250

export const DUMP_SIZE = 1176
export const DUMP_CHUNK_SIZE = 185

/** Dump = file offset - 0x28; the dump starts with an address record { source, slot }. */
export const DUMP_OFFSETS = {
  preset: 0x06,
  tempo: 0x0e,
  volume: 0x10,
  pan: 0x12,
  style: 0x14,
  name: 0x1c,
  nameMaxLen: 16,
  author: 0x2c,
  send: 0x6a,
  return: 0x6b,
  order: 0x6c,
  modules: 0x78,
  moduleStride: 0x48,
  /** 8 records of 12 bytes: type 0x000F header, u8 index, u8 state, 2 junk, u16 mask, 2 junk */
  ctrl: 0x438,
  ctrlStride: 12,
} as const

export const PRESET_COUNT = 256
export const BANK_COUNT = 64
export const SLOTS = ['A', 'B', 'C', 'D'] as const

export function presetLabel(preset: number): string {
  return `${Math.floor(preset / 4) + 1}-${SLOTS[preset % 4]}`
}
