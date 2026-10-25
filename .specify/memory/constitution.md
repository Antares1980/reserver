# Reserver (Tetris GB) Constitution

## Core Principles

### I. Authentic 1989 Game Boy Fidelity
The game MUST faithfully recreate the 1989 Nintendo Game Boy (DMG-01) Tetris experience based on the reference assets in `tetris_gb/`. This includes the 160×144 native logical resolution, the 4-shade olive-green DMG palette, the distinct per-tetromino tile patterns (T, J, Z, O, S, L, I), the brick-bordered 10×20 well (18 visible rows + 2 top spawn rows), the right-hand HUD (`SCORE`, `LEVEL`, `LINES`, and `NEXT` piece box), the St. Basil's Cathedral title screen, and original Nintendo/Bullet-Proof Software rotation, gravity, scoring, Type A (Endless), and Type B (25-line clear with Level 0–9 and Height 0–5) rules.

### II. Pure, Deterministic Game Core Architecture
All core Tetris rules (well state, tetromino matrices, Nintendo right-handed rotation states, collision detection, gravity frame tables, DAS/auto-shift, line-clear detection, Nintendo scoring formula, Type A/B progression, and deterministic PRNG/piece generation) MUST reside in pure, framework-agnostic TypeScript modules decoupled from HTML5 Canvas rendering, DOM events, and Web Audio synthesis.

### III. Automated Test Parity (NON-NEGOTIABLE)
Every core game mechanic and state transition MUST be covered by automated unit and integration tests (Vitest). Tests MUST verify piece spawning, rotation states, wall/floor collisions, line clears (1–4 lines), original Game Boy scoring (`40/100/300/1200 × (level + 1)` plus soft-drop points), Type A level advancement, Type B 25-line countdown and garbage generation (Heights 0–5), dual control schemes (`1`/`Alt`/`Ctrl`/Arrows and `Enter`/`Z`/`X`/`Up`/Arrows), and high-score persistence.

### IV. Dual Control & Web Audio Accessibility
Input handling MUST simultaneously support the `tetris_gb_reviews.xml` reference keymap (`1` = Start, `Alt` = A / Rotate CW, `Ctrl` = B / Rotate CCW, `Arrow Keys` = Direction) and standard PC keyboard controls (`Enter` = Start, `Z`/`X`/`Up` = Rotate, `Arrow Keys` = Direction, `P`/`Escape` = Pause, `M` = Mute). Audio MUST be synthesized procedurally via the Web Audio API (no external proprietary audio files required) supporting Music Types A (Korobeiniki), B, C (Bach French Suite), and OFF, plus 8-bit sound effects.

### V. Zero-Runtime-Dependency Simplicity
The application MUST run as a fast, self-contained TypeScript + HTML5 Canvas web application bundled with Vite, with zero heavy runtime framework dependencies. Local persistence MUST use standard browser `localStorage` with graceful fallback when unavailable.

## Technical & Performance Standards

- **Stack**: TypeScript (strict mode), HTML5 Canvas (`image-rendering: pixelated`), Web Audio API, Vite, and Vitest.
- **Frame Timing**: Logic updates MUST operate at the Game Boy's 59.73 Hz (~60 FPS) tick rate using fixed-timestep accumulation so gravity and DAS timings match original frame tables regardless of display refresh rate.
- **Asset Reference**: All visual layouts and tile patterns MUST align with `tetris_gb/screenshot_00.png` through `tetris_gb/screenshot_13.png`, `tetris_gb/tetris_gb_meta.xml`, and `tetris_gb/tetris_gb_reviews.xml`.

## Development Workflow & Quality Gates

- All changes MUST pass TypeScript typechecking (`tsc --noEmit`), linting/formatting checks, unit/integration tests (`vitest run`), and production build (`vite build`) with zero errors before completion.
- Feature specifications, plans, checklists, and task lists under `specs/` MUST remain synchronized with the codebase.

## Governance

This Constitution governs all architectural, specification, planning, and implementation decisions in the repository. Any amendment requires updating `.specify/memory/constitution.md`, incrementing the semantic version, and verifying downstream specification and plan compliance.

**Version**: 1.0.0 | **Ratified**: 2026-10-25 | **Last Amended**: 2026-10-25
