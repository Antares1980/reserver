# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **1989 Game Boy Tetris Recreation (`001-tetris-gb-game`)**:
  - Implemented deterministic 60 Hz Game Boy Tetris engine (`src/core/`) with authentic Nintendo right-handed 4×4 rotation states, Levels `0`–`20` gravity table, Delayed Auto-Shift (`23`-frame delay / `9`-frame repeat), continuous soft-drop scoring (`+1` pt/row), and line-clear scoring (`40/100/300/1200 × (level + 1)`).
  - Implemented **Type A** (Endless mode with selectable Level `0`–`9`) and **Type B** (25-line countdown mode with selectable Level `0`–`9` and garbage Height `0`–`5` generating `0, 3, 5, 8, 10, or 12` incomplete rows).
  - Implemented `160×144` HTML5 Canvas pixel-art renderer (`src/render/`) matching `tetris_gb/screenshot_00.png`–`screenshot_13.png`, including the St. Basil's Cathedral Title Screen, distinct per-piece `8×8` tile patterns (`T`, `L`, `J`, `I` connected bar, `S`, `Z`, `O`), brick walls, right-hand HUD (`SCORE`, `LEVEL`, `LINES`, `NEXT`), pause well masking, and Game Over brick curtain animation.
  - Added dual keyboard input handler (`src/input/keyboard.ts`) supporting both `tetris_gb_reviews.xml` keys (`1` = Start, `Alt` = A, `Ctrl` = B, `Arrow Keys` = Direction) and standard PC keys (`Enter`, `Z`, `X`, `Up`, `Shift`, `P`, `M`), plus interactive on-screen Game Boy controls.
  - Added procedural Web Audio API 8-bit chiptune synthesizer (`src/audio/`) for Music Types `A-TYPE` (*Korobeiniki*), `B-TYPE`, `C-TYPE` (*Bach French Suite*), `OFF`, and gameplay sound effects.
  - Added persistent Top-3 High Score storage per mode/level/height with 3-character initials entry.
