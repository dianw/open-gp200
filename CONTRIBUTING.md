# Contributing

## Setup

The app is a client-only [Nuxt](https://nuxt.com) 4 app (Vue 3, Pinia, TypeScript) using the Web MIDI API. There's no backend.

```bash
npm install
npm run dev        # http://localhost:3000
```

Open it in a browser with Web MIDI (Brave recommended; see the README).

## Checks

```bash
npm test             # unit tests (Vitest)
npx nuxt typecheck
npm run build        # production build
npm run generate     # static site, for hosting anywhere
npm run preview      # preview the production build
```

## Code layout

- `app/utils/gp200/`: the protocol, as plain TypeScript with no Vue or browser APIs, so it can be unit-tested.
  - `constants.ts`: frame header, commands, record types, module table, dump offsets.
  - `nibble.ts`: nibble encoding and little-endian readers.
  - `parser.ts`: SysEx frame → records → events.
  - `messages.ts`: builders for everything the app sends.
  - `dump.ts`: reassembling and parsing a preset dump.
  - `effects.ts`: the effect model table. **Generated; don't edit by hand.**
  - `models.ts`, `tap.ts`: model-name lookup, tap tempo.
- `app/composables/useMidi.ts`: MIDI port handling and the raw log.
- `app/stores/gp200.ts`: app state; sends requests one at a time and applies incoming events.
- `app/components/`, `app/pages/`: the UI.
- `tests/`: message builders are pinned to byte strings captured from a real pedal. Add a captured-bytes test for every new message you handle.

## Testing on hardware

Anything that talks to the pedal has to be checked on a real GP-200LT. The MIDI log panel in the app shows the raw bytes in both directions, which helps when reporting a problem.

## License

Contributions are accepted under the project's MIT license.
