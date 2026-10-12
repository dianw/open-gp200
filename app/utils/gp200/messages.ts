import { HEADER, CMD_QUERY, CMD_DATA, REC, MODULES, PATCH_SETTING, TEMPO_MIN, TEMPO_MAX, CTRL_CC_BASE } from './constants'
import { encodeNibbles } from './nibble'

const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff]

/** One TLV record: u16 type, u16 length, data. */
export function record(type: number, data: number[]): number[] {
  return [...u16(type), ...u16(data.length), ...data]
}

/** Single-chunk frame: header, CMD, payload length (7-bit split), offset 0, nibble-encoded payload. */
export function frame(cmd: number, payload: number[]): number[] {
  return [...HEADER, cmd, payload.length & 0x7f, payload.length >> 7, 0, 0, ...encodeNibbles(payload), 0xf7]
}

/** Address record: source 0 = edit buffer, 1 = stored copy. */
const address = (source: number, slot: number) => record(REC.address, [...u16(source), ...u16(slot)])

/** Ask the pedal for the current preset; reply is a "preset" event. Does not switch preset. */
export function queryPreset(): number[] {
  return frame(CMD_QUERY, record(REC.slot, [...u16(0), ...u16(0)]))
}

/** Request the live (edit buffer) dump. `preset` should be the current preset. */
export function readActiveDump(preset: number): number[] {
  return frame(CMD_QUERY, [...address(0, preset & 0xff), ...record(0x0001, [...u16(0xffff), ...u16(0)])])
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

/** Module on/off over SysEx, the only way to reach VOL (no CC). The trailing `9C 02` is what host writes carry. */
export function toggleModuleSysex(module: number, on: boolean): number[] {
  return frame(CMD_DATA, [...address(0, 0), ...record(REC.module, [module, on ? 1 : 0, 0x9c, 0x02])])
}

/** CC toggle where the module has one (confirmed on the device), SysEx otherwise. */
export function toggleModule(module: number, on: boolean): number[] {
  const cc = MODULES[module]?.cc
  if (cc == null) return toggleModuleSysex(module, on)
  return [0xb0, cc, on ? 127 : 0]
}

/** Press CTRL footswitch 0..3 (CTRL 1..4), like tapping it on the pedal. */
export function pressCtrl(ctrl: number): number[] {
  return [0xb0, CTRL_CC_BASE + ctrl, 127]
}

/** Patch tempo of the active preset, in BPM (clamped to 40..250). Changes the edit buffer only, not flash. */
export function setTempo(bpm: number): number[] {
  const v = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, Math.round(bpm)))
  return frame(CMD_DATA, [...address(0, 0), ...record(REC.patchSetting, [...u16(PATCH_SETTING.tempo), ...u16(v)])])
}

/** Record 0x2002 with no data: the official app sends it 1 s after start. Meaning unknown. */
export function handshake(): number[] {
  return frame(CMD_QUERY, record(0x2002, []))
}
