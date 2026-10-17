// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under MOD: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const MOD_EFFECTS: Record<number, EffectModel> = {
  0x01000029: { name: "Detune", catalog: "MOD", params: [
    { i: 0, name: "Detune", min: -50, max: 50, def: -25 },
    { i: 1, name: "Wet", min: 0, max: 100, def: 50 },
    { i: 2, name: "Dry", min: 0, max: 100, def: 50 },
  ] },
  0x0100002E: { name: "Bit Smash", catalog: "MOD", params: [
    { i: 0, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 1, name: "Krush", min: 0, max: 100, def: 20 },
    { i: 2, name: "Bit", min: 0, max: 100, def: 20 },
    { i: 3, name: "Hi Cut", min: 0, max: 100, def: 50 },
    { i: 4, name: "Lo Cut", min: 0, max: 100, def: 50 },
  ] },
  0x04000000: { name: "A-Chorus", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Tone", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000001: { name: "G-Chorus", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000002: { name: "C-Chorus", catalog: "MOD", params: [
    { i: 0, name: "Mode", min: 0, max: 3, def: 0, options: ["1", "2", "3", "4"] },
  ] },
  0x04000008: { name: "B-Chorus", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0400000F: { name: "M-Chorus", catalog: "MOD", params: [
    { i: 0, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Filter", min: 0, max: 100, def: 50 },
    { i: 3, name: "Depth L", min: 0, max: 100, def: 50 },
    { i: 4, name: "Depth C", min: 0, max: 100, def: 50 },
    { i: 5, name: "Depth R", min: 0, max: 100, def: 50 },
    { i: 6, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000011: { name: "Jet", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Pre Delay", min: 0, max: 100, def: 50 },
    { i: 3, name: "Feedback", min: 0, max: 100, def: 50 },
    { i: 4, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000012: { name: "B-Jet", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Pre Delay", min: 0, max: 100, def: 50 },
    { i: 3, name: "Feedback", min: 0, max: 100, def: 50 },
    { i: 4, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000013: { name: "N-Jet", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Pre Delay", min: 0, max: 100, def: 50 },
    { i: 3, name: "Feedback", min: 0, max: 100, def: 50 },
    { i: 4, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000014: { name: "Trem Jet", catalog: "MOD", params: [
    { i: 0, name: "Flg Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Flg Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Feedback", min: 0, max: 100, def: 50 },
    { i: 3, name: "Trm Depth", min: 0, max: 100, def: 50 },
    { i: 4, name: "Trm Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 5, name: "Flg Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
    { i: 6, name: "Trm Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000015: { name: "V-Roto", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000016: { name: "G-Roto", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000017: { name: "Vibrato", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000018: { name: "Vibrato T", catalog: "MOD", params: [
    { i: 0, name: "Sens", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Output", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000019: { name: "O-Phase", catalog: "MOD", params: [
    { i: 0, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 1, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0400001A: { name: "G-Phase", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0400001B: { name: "S-Phase", catalog: "MOD", params: [
    { i: 0, name: "Color", min: 0, max: 1, def: 0, options: ["Warm", "Sharp"] },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0400001E: { name: "Pan Phase", catalog: "MOD", params: [
    { i: 0, name: "Phs Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Phs Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Pan Depth", min: 0, max: 100, def: 50 },
    { i: 3, name: "Pan Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 4, name: "Phs Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
    { i: 5, name: "Pan Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0400001F: { name: "M-Vibe", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000020: { name: "Vibe", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Mode", min: 0, max: 1, def: 0, options: ["Chorus", "Vibrato"] },
    { i: 4, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000021: { name: "O-Trem", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000026: { name: "Sine Trem", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000027: { name: "Triangle Trem", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000028: { name: "Bias Trem", catalog: "MOD", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
    { i: 4, name: "Bias", min: 0, max: 100, def: 50 },
  ] },
}
