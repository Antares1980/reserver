# Phase 0 Research: Game Boy Tetris (1989) Recreation

**Feature**: `001-tetris-gb-game`  
**Date**: 2026-10-25

## 1. Visual Architecture & Palette Analysis (`tetris_gb/screenshot_*.png`)

- **Decision**: Render on an HTML5 `<canvas>` with native logical dimensions `160×144` pixels (`20×18` grid of `8×8` pixel tiles), scaled up with CSS `image-rendering: pixelated` (e.g., 4× to `640×576`).
- **Rationale**:
  - Inspection of `tetris_gb/screenshot_00.png` through `screenshot_13.png` confirms the exact `160×144` Game Boy screen dimensions and a 4-color olive-green palette:
    - Shade 0 (Lightest background): `#ffff88` (classic DMG alternative: `#9bbc0f`)
    - Shade 1 (Light-mid tone): `#b5a642` (classic DMG alternative: `#8bac0f`)
    - Shade 2 (Dark-mid tone): `#7b7139` (classic DMG alternative: `#306230`)
    - Shade 3 (Darkest outline/ink): `#393829` (classic DMG alternative: `#0f380f`)
  - Gameplay screen layout (`20×18` tiles = `160×144` px):
    - Column `0`: Left outer border (`1` tile wide, dark fill)
    - Column `1`: Left brick wall (`1` tile wide, rows `0`–`17`)
    - Columns `2`–`11`: Playable 10-column well (`10` tiles wide × `18` visible rows; rows `0`–`1` of the 20-row logical well are hidden above the viewport, and rows `2`–`19` map to screen tile rows `0`–`17`)
    - Column `12`: Right brick wall (`1` tile wide, rows `0`–`17`)
    - Columns `13`–`19`: Right HUD (`7` tiles wide = `56` px):
      - `SCORE` header box + 6-digit right-aligned numeric score (`rows 0–4`)
      - `LEVEL` box with label and right-aligned level number (`rows 6–8`)
      - `LINES` box with label and right-aligned line count (`rows 9–11`)
      - `NEXT` piece preview framed box (`rows 13–17`, columns `14–18`, showing the 4×4 next piece)
- **Alternatives Considered**:
  - DOM/CSS grid rendering: Rejected because pixel-exact `8×8` tile patterns (such as the connected `I` bar ends/middle tiles, `T` bevels, brick wall mortar, and title screen St. Basil's Cathedral artwork) are cleaner, faster, and deterministic on an HTML5 2D Canvas.

## 2. 1989 Game Boy Rotation System, Gravity & Timing Tables

- **Decision**: Implement the exact 1989 Game Boy (Nintendo right-handed) rotation matrices, frame-based gravity table, Delayed Auto-Shift (DAS), and soft-drop timing at 59.7275 Hz (~60 FPS fixed timestep).
- **Rationale**:
  - **Gravity Table (frames per row drop)**:
    `[53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3]` for Levels `0`–`20`.
  - **DAS (Delayed Auto-Shift)**: Initial delay = `23` frames, auto-repeat = `9` frames.
  - **Soft Drop**: `1` row every `3` frames while `Down` is held continuously; awards `+1` point per soft-dropped row upon piece lock (verified in `screenshot_03.png` where score becomes `1` and `screenshot_04.png` where score becomes `14`).
  - **Scoring Formula**:
    - 1 line (Single): `40 × (level + 1)`
    - 2 lines (Double): `100 × (level + 1)`
    - 3 lines (Triple): `300 × (level + 1)`
    - 4 lines (Tetris): `1200 × (level + 1)`
  - **Type A Level Transition**: First level-up occurs at `(startLevel + 1) × 10` lines cleared, then every `10` lines thereafter up to Level `20`.
  - **Type B Mode**: Starts with `25` lines remaining (`LINES` counts down to `0`) and pre-fills the bottom of the well with `0, 3, 5, 8, 10, or 12` garbage rows for `HEIGHT` `0, 1, 2, 3, 4, 5` respectively.
- **Alternatives Considered**:
  - Modern SRS (Super Rotation System) with wall kicks and 7-bag randomizer: Rejected because the user and constitution require faithful 1989 Game Boy Tetris behavior (`tetris_gb`).

## 3. Dual Input Handling (`tetris_gb_reviews.xml` + Standard PC Keys)

- **Decision**: Map virtual Game Boy buttons (`UP`, `DOWN`, `LEFT`, `RIGHT`, `A`, `B`, `START`, `SELECT`) from both key sets simultaneously and call `event.preventDefault()` on mapped keys.
- **Rationale**:
  - `tetris_gb_reviews.xml` explicitly documents:
    - `1` = `START`
    - `Alt` = `A` (Rotate Clockwise / Menu Confirm)
    - `Ctrl` = `B` (Rotate Counter-Clockwise / Menu Back)
    - `Arrow Keys` = `Direction`
  - Standard PC players also expect:
    - `Enter` = `START`
    - `X` or `Up Arrow` (during gameplay) = `A` (Rotate Clockwise)
    - `Z` = `B` (Rotate Counter-Clockwise)
    - `Shift` / `Backspace` = `SELECT` (Toggle `NEXT` preview)
    - `P` / `Escape` = `PAUSE`
    - `M` = Mute/Unmute audio
- **Alternatives Considered**:
  - Requiring manual key remapping before playing: Rejected; supporting both sets out of the box satisfies every user immediately.

## 4. Procedural 8-Bit Web Audio Synthesis

- **Decision**: Build a Web Audio API chiptune synthesizer using square wave oscillators + gain envelopes + noise channel to play Music Types `A-TYPE` (Korobeiniki), `B-TYPE` (Game Boy B-Type theme), `C-TYPE` (Bach French Suite No. 3 in B Minor, BWV 814 Menuet), and `OFF`, plus 8-bit sound effects.
- **Rationale**: Zero external MP3/WAV dependencies, instant startup on first user interaction, and authentic pulse-channel Game Boy timbre.
- **Alternatives Considered**:
  - Bundling external audio files: Rejected due to copyright/licensing and unnecessary asset weight.
