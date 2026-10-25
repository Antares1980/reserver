# Implementation Plan: Game Boy Tetris (1989) Recreation

**Branch**: `feat/001-tetris-gb-game` | **Date**: 2026-10-25 | **Spec**: [spec.md](file:///c:/Users/rogal/workspaces/ws-games/reserver/specs/001-tetris-gb-game/spec.md)

**Input**: Feature specification from `/specs/001-tetris-gb-game/spec.md`

## Summary

Build a faithful, self-contained Web recreation of the 1989 Nintendo Game Boy (DMG-01) *Tetris* based on the archival reference assets in `tetris_gb/`. The implementation uses a pure, deterministic TypeScript 60 Hz game engine decoupled from an HTML5 Canvas pixel-art renderer (`160×144` logical resolution, 4-shade olive-green palette, authentic per-tetromino tile patterns, brick walls, and right-hand HUD) and a procedural Web Audio API 8-bit chiptune synthesizer (`A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF` music + SFX), supporting both `tetris_gb_reviews.xml` controls (`1`, `Alt`, `Ctrl`, `Arrows`) and standard PC controls (`Enter`, `Z`, `X`, `Up`, `Arrows`).

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 target, strict mode)

**Primary Dependencies**: Zero runtime library dependencies (Vite 5.x for bundling/dev server)

**Storage**: Browser `localStorage` (with in-memory fallback) for Top-3 High Score persistence per Game Type / Level / Height

**Testing**: Vitest (unit and integration tests covering engine rules, rotations, gravity, scoring, Type A/B progression, input mapping, renderer, and audio state)

**Target Platform**: Modern Desktop & Mobile Web Browsers (HTML5 Canvas + Web Audio API)

**Project Type**: Single-project Web Application (`src/` + `tests/`)

**Performance Goals**: Locked 59.73 Hz (~60 FPS) fixed-timestep simulation with `< 2 ms` frame render time at `160×144` logical resolution

**Constraints**: Offline-capable, zero external proprietary audio/font files, exact visual parity with `tetris_gb/screenshot_00.png`–`screenshot_13.png`

**Scale/Scope**: Full 1-Player 1989 Game Boy Tetris (`TITLE`, `MODE_SELECT`, `LEVEL_SELECT`, `PLAYING` for `A-TYPE` & `B-TYPE`, `PAUSED`, `LINE_CLEAR`, `VICTORY`, `GAME_OVER`, `HIGH_SCORE_ENTRY`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Authentic 1989 Game Boy Fidelity**: `160×144` canvas, 4-shade palette extracted from `tetris_gb/screenshot_*.png`, per-piece `8×8` tile bitmaps (`T`, `J`, `Z`, `O`, `S`, `L`, `I`), 10×20 well (18 visible rows), right-hand HUD, Nintendo rotation/gravity/scoring, Type A & Type B modes.
- [x] **II. Pure, Deterministic Game Core Architecture**: `src/core/` contains pure TypeScript modules (`constants.ts`, `tetrominoes.ts`, `randomizer.ts`, `well.ts`, `scoring.ts`, `engine.ts`) with zero DOM/Canvas/Audio imports.
- [x] **III. Automated Test Parity (NON-NEGOTIABLE)**: Vitest unit and integration test suites in `tests/unit/` and `tests/integration/` cover all core mechanics, mode rules, controls, and storage.
- [x] **IV. Dual Control & Web Audio Accessibility**: `src/input/keyboard.ts` maps both `[1, Alt, Ctrl, Arrows]` and `[Enter, Z, X, Up, Arrows]`; `src/audio/soundEngine.ts` synthesizes Music A/B/C/OFF and 8-bit SFX via Web Audio API.
- [x] **V. Zero-Runtime-Dependency Simplicity**: Standard Vite + TypeScript setup with zero runtime npm dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/001-tetris-gb-game/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output (/speckit-plan command)
├── data-model.md                    # Phase 1 output (/speckit-plan command)
├── quickstart.md                    # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── game-engine-contract.md      # Phase 1 output (/speckit-plan command)
├── checklists/
│   ├── requirements.md              # Spec quality checklist
│   └── gameplay-and-fidelity.md     # Domain quality checklist
└── tasks.md                         # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
index.html
package.json
tsconfig.json
vite.config.ts
src/
├── main.ts                          # Application bootstrap, 60 Hz game loop, UI shell & controls bar
├── style.css                        # Retro Game Boy viewport styling, pixelated canvas scaling, responsive controls
├── core/
│   ├── types.ts                     # Core types, interfaces, and enumerations
│   ├── constants.ts                 # Gravity frames, DAS timings, scoring multipliers, Type B heights, palettes
│   ├── tetrominoes.ts               # 1989 Game Boy 4x4 rotation matrices & spawn positions for L, J, I, O, Z, S, T
│   ├── randomizer.ts                # Deterministic seeded PRNG & Game Boy 7-piece bias generator
│   ├── well.ts                      # 10x20 well collision detection, piece locking, line clear & Type B garbage generator
│   ├── scoring.ts                   # Nintendo line-clear scoring, soft-drop points, Type A level up, Type B bonus
│   ├── highScores.ts                # Top-3 high score ranking and localStorage persistence with memory fallback
│   └── engine.ts                    # Pure 60 Hz state machine (TITLE, MODE_SELECT, LEVEL_SELECT, PLAYING, PAUSED, etc.)
├── input/
│   └── keyboard.ts                  # Dual keymap handler (1/Alt/Ctrl/Arrows + Enter/Z/X/Up/Arrows) & on-screen buttons
├── render/
│   ├── font8x8.ts                   # 8x8 pixel-art bitmap font (A-Z, 0-9, punctuation, heart, copyright, arrows)
│   ├── tiles8x8.ts                  # 8x8 pixel-art tile bitmaps for T, J, Z, O, S, L, I (connected bar), bricks, UI borders
│   ├── titleArt.ts                  # Procedural/bitmap rendering of the 1989 TETRIS™ logo & St. Basil's Cathedral scene
│   └── canvasRenderer.ts            # 160x144 Canvas 2D renderer for all screens and HUD
└── audio/
    ├── melodies.ts                  # Note sequences for Music A (Korobeiniki), Music B, Music C (Bach), Victory & Game Over
    └── soundEngine.ts               # Web Audio API 8-bit pulse/noise chiptune synthesizer and SFX player
tests/
├── unit/
│   ├── tetrominoes.test.ts          # Rotation states, wall/floor/stack collision checks
│   ├── well.test.ts                 # Piece lock, 1-4 line clear collapse, Type B garbage heights 0-5
│   ├── scoring.test.ts              # 40/100/300/1200*(level+1) scoring, soft-drop points, Type A level transitions
│   ├── highScores.test.ts           # Top-3 high score sorting, initials entry, persistence
│   └── keyboard.test.ts             # Archival (1/Alt/Ctrl/Arrows) and standard PC keybindings
└── integration/
    ├── engineFlow.test.ts           # End-to-end state transitions: Title -> Mode -> Level -> Type A/B Play -> Pause -> GameOver/Victory
    └── rendererAndAudio.test.ts     # Canvas rendering verification across screens & headless audio state verification
```

**Structure Decision**: Single-project TypeScript web application (`src/` + `tests/`) separating pure game rules (`src/core/`) from input (`src/input/`), pixel-art Canvas rendering (`src/render/`), and Web Audio synthesis (`src/audio/`).

## Complexity Tracking

No Constitution Check violations exist.
