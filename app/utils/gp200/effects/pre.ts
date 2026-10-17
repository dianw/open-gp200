// Generated from PROTOCOL-FACTS.md section 5 by tools/gen_effects.py. Do not edit by hand.
// Models the official editor lists under PRE: effect id (dump block +8, u32 LE) -> model.

import type { EffectModel } from './types'

export const PRE_EFFECTS: Record<number, EffectModel> = {
  0x00000000: { name: "COMP", catalog: "PRE", params: [
    { i: 0, name: "Sustain", min: 0, max: 100, def: 20 },
    { i: 1, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x00000001: { name: "COMP4", catalog: "PRE", params: [
    { i: 0, name: "Sustain", min: 0, max: 100, def: 20 },
    { i: 1, name: "Attack", min: 0, max: 100, def: 60 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Clipping", min: 0, max: 100, def: 10 },
  ] },
  0x00000003: { name: "S-Comp", catalog: "PRE", params: [
    { i: 0, name: "Threshold", min: 0, max: 100, def: 20 },
    { i: 1, name: "Ratio", min: 0, max: 100, def: 30 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Attack", min: 0, max: 100, def: 50 },
    { i: 4, name: "Release", min: 0, max: 100, def: 50 },
    { i: 5, name: "Tone", min: 0, max: 100, def: 50 },
    { i: 6, name: "Blend", min: 0, max: 100, def: 50 },
  ] },
  0x0000000A: { name: "AC Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 29 },
    { i: 1, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 2, name: "Bass", min: 0, max: 100, def: 50 },
    { i: 3, name: "Treble", min: 0, max: 100, def: 50 },
  ] },
  0x0000000B: { name: "B-Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 20 },
    { i: 1, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 2, name: "Bass", min: 0, max: 100, def: 50 },
    { i: 3, name: "Treble", min: 0, max: 100, def: 50 },
  ] },
  0x0000000C: { name: "P-Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 20 },
    { i: 1, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 2, name: "Bass", min: 0, max: 100, def: 50 },
    { i: 3, name: "Treble", min: 0, max: 100, def: 50 },
  ] },
  0x0000000E: { name: "14 Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 20 },
  ] },
  0x00000014: { name: "Micro Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 50 },
  ] },
  0x00000019: { name: "FAT BB", catalog: "PRE", params: [
    { i: 0, name: "Bass", min: 0, max: 100, def: 50 },
    { i: 1, name: "Treble", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 20 },
    { i: 3, name: "Low Cut", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0000001A: { name: "Boost", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 20 },
    { i: 1, name: "+3dB", min: 0, max: 1, def: 1, options: ["OFF", "ON"] },
    { i: 2, name: "Bright", min: 0, max: 1, def: 1, options: ["OFF", "ON"] },
  ] },
  0x01000000: { name: "AC Refiner", catalog: "PRE", params: [
    { i: 0, name: "Shape", min: 0, max: 100, def: 50 },
  ] },
  0x01000001: { name: "AC Sim", catalog: "PRE", params: [
    { i: 0, name: "Body", min: 0, max: 100, def: 50 },
    { i: 1, name: "Top", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Mode", min: 0, max: 3, def: 2, options: ["Standard", "Jumbo", "Enhanced", "Piezo"] },
  ] },
  0x0100000F: { name: "T-Wah", catalog: "PRE", params: [
    { i: 0, name: "Sense", min: 0, max: 100, def: 50 },
    { i: 1, name: "Range", min: 0, max: 100, def: 50 },
    { i: 2, name: "Q", min: 0, max: 100, def: 50 },
    { i: 3, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 4, name: "Mode", min: 0, max: 1, def: 0, options: ["Guitar", "Bass"] },
  ] },
  0x01000015: { name: "A-WAH", catalog: "PRE", params: [
    { i: 0, name: "Depth", min: 0, max: 100, def: 50 },
    { i: 1, name: "Rate", min: 0.1, max: 10, def: 0.5, step: 0.1 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Low", min: 0, max: 100, def: 25 },
    { i: 4, name: "Q", min: 0, max: 100, def: 70 },
    { i: 5, name: "High", min: 0, max: 100, def: 60 },
    { i: 6, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x01000019: { name: "Step Filter", catalog: "PRE", params: [
    { i: 0, name: "Step 1", min: 0, max: 100, def: 10 },
    { i: 1, name: "Step 2", min: 0, max: 100, def: 30 },
    { i: 2, name: "Step 3", min: 0, max: 100, def: 55 },
    { i: 3, name: "Step 4", min: 0, max: 100, def: 85 },
    { i: 4, name: "Rate", min: 0, max: 100, def: 10 },
    { i: 5, name: "Sync", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x01000021: { name: "OCTA", catalog: "PRE", params: [
    { i: 0, name: "Low Oct", min: 0, max: 100, def: 50 },
    { i: 1, name: "High Oct", min: 0, max: 100, def: 50 },
    { i: 2, name: "Dry", min: 0, max: 100, def: 50 },
  ] },
  0x01000023: { name: "Pitch", catalog: "PRE", params: [
    { i: 0, name: "Hi Pitch", min: 0, max: 24, def: 12 },
    { i: 1, name: "Low Pitch", min: -24, max: 0, def: -12 },
    { i: 2, name: "Dry", min: 0, max: 100, def: 50 },
    { i: 3, name: "Hi Vol", min: 0, max: 100, def: 50 },
    { i: 4, name: "Low Vol", min: 0, max: 100, def: 50 },
  ] },
  0x01000024: { name: "P-Bend", catalog: "PRE", params: [
    { i: 0, name: "Hi Pitch", min: 0, max: 12, def: 12 },
    { i: 1, name: "Low Pitch", min: -12, max: 0, def: 0 },
    { i: 2, name: "Wet", min: 0, max: 100, def: 50 },
    { i: 3, name: "Dry", min: 0, max: 100, def: 50 },
    { i: 4, name: "Range", min: 0, max: 100, def: 50 },
  ] },
  0x0100002F: { name: "Ring Mod", catalog: "PRE", params: [
    { i: 0, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 1, name: "Freq", min: 0, max: 100, def: 50 },
    { i: 2, name: "Fine", min: -50, max: 50, def: 0 },
    { i: 3, name: "Tone", min: 0, max: 100, def: 50 },
  ] },
  0x01000033: { name: "Saturate", catalog: "PRE", params: [
    { i: 0, name: "Saturation", min: 0, max: 100, def: 50 },
    { i: 1, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "High Cut", min: 0, max: 100, def: 50 },
  ] },
  0x01000049: { name: "Hammy", catalog: "PRE", params: [
    { i: 0, name: "Range", min: 0, max: 5, def: 2, options: ["-2 Oct", "-1 Oct", "+1 Oct", "+2 Oct", "+/-1Oct", "+/-2Oct"] },
    { i: 1, name: "Harmony", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 3, name: "Position", min: 0, max: 100, def: 0 },
  ] },
  0x0100004D: { name: "Harmonizer 1", catalog: "PRE", params: [
    { i: 0, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 1, name: "Key", min: 0, max: 11, def: 0, options: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] },
    { i: 2, name: "Mode", min: 0, max: 7, def: 0, options: ["Major", "Minor", "H. Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"] },
    { i: 3, name: "Interval", min: 0, max: 13, def: 8, options: ["-Oct", "-7th", "-6th", "-5th", "-4th", "-3rd", "-2nd", "+2nd", "+3rd", "+4th", "+5th", "+6th", "+7th", "+Oct"] },
    { i: 4, name: "Smooth Mode", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x0100004E: { name: "Harmonizer 2", catalog: "PRE", params: [
    { i: 0, name: "Mix", min: 0, max: 100, def: 50 },
    { i: 1, name: "Key", min: 0, max: 11, def: 0, options: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] },
    { i: 2, name: "Mode", min: 0, max: 7, def: 0, options: ["Major", "Minor", "H. Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"] },
    { i: 3, name: "Interval 1", min: 0, max: 13, def: 8, options: ["-Oct", "-7th", "-6th", "-5th", "-4th", "-3rd", "-2nd", "+2nd", "+3rd", "+4th", "+5th", "+6th", "+7th", "+Oct"] },
    { i: 4, name: "Interval 2", min: 0, max: 13, def: 10, options: ["-Oct", "-7th", "-6th", "-5th", "-4th", "-3rd", "-2nd", "+2nd", "+3rd", "+4th", "+5th", "+6th", "+7th", "+Oct"] },
    { i: 5, name: "Smooth Mode", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x03000001: { name: "OD 9", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 40 },
    { i: 1, name: "Tone", min: 0, max: 100, def: 70 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x03000002: { name: "Yellow OD", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 40 },
    { i: 1, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x03000006: { name: "Super OD", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 50 },
    { i: 1, name: "Tone", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x03000009: { name: "Blues OD", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 40 },
    { i: 1, name: "Tone", min: 0, max: 100, def: 60 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x03000014: { name: "Penesas", catalog: "PRE", params: [
    { i: 0, name: "Gain", min: 0, max: 100, def: 40 },
    { i: 1, name: "Tone", min: 0, max: 100, def: 50 },
    { i: 2, name: "Volume", min: 0, max: 100, def: 50 },
  ] },
  0x0400002D: { name: "Auto Swell", catalog: "PRE", params: [
    { i: 0, name: "Attack", min: 80, max: 4000, def: 1000 },
    { i: 1, name: "Curve", min: 0, max: 2, def: 0, options: ["Line", "Exp", "Log"] },
  ] },
  0x0400002F: { name: "Hold", catalog: "PRE", params: [
    { i: 0, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 1, name: "Activate", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
  0x04000030: { name: "Freeze", catalog: "PRE", params: [
    { i: 0, name: "Volume", min: 0, max: 100, def: 50 },
    { i: 1, name: "Attack", min: 0, max: 100, def: 30 },
    { i: 2, name: "Release", min: 0, max: 100, def: 50 },
    { i: 3, name: "Activate", min: 0, max: 1, def: 0, options: ["OFF", "ON"] },
  ] },
}
