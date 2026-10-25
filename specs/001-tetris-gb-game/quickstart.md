# Quickstart & Validation Guide: Game Boy Tetris (1989) Recreation

**Feature**: `001-tetris-gb-game`  
**Date**: 2026-10-25

## Prerequisites

- **Node.js**: v20+ and `npm`

## Installation & Commands

```powershell
# 1. Install dependencies
npm install

# 2. Run unit and integration test suite
npm test

# 3. Run TypeScript typechecking
npm run typecheck

# 4. Build production bundle
npm run build

# 5. Start interactive development server
npm run dev
```

## End-to-End Validation Scenarios

1. **Title Screen & Menu Navigation**:
   - Open the local URL shown by `npm run dev`.
   - Confirm the `160×144` Game Boy Title Screen displays `TETRIS™`, St. Basil's Cathedral with moon and stars, `▶ 1 PLAYER   2 PLAYER`, and `©1989 Nintendo` matching `tetris_gb/screenshot_00.png`.
   - Press `1` (or `Enter`) to open the `GAME TYPE` / `MUSIC TYPE` menu.
   - Use Arrow keys to switch between `A-TYPE` and `B-TYPE` game modes and `A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF` music options; verify chiptune preview plays.

2. **Type A Gameplay & HUD Verification**:
   - Select `A-TYPE` and `LEVEL 9` (matching `tetris_gb/screenshot_01.png`), then press `1` or `Enter`.
   - Verify the 10-column well is bordered by brick walls, `SCORE` starts at `0`, `LEVEL` is `9`, `LINES` is `0`, and `NEXT` displays the upcoming tetromino.
   - Move pieces with `ArrowLeft` / `ArrowRight`, rotate Clockwise with `Alt` (or `X` / `ArrowUp`), rotate Counter-Clockwise with `Ctrl` (or `Z`), and soft-drop with `ArrowDown`.
   - Verify soft-dropping awards 1 point per row upon locking and clearing 1/2/3/4 lines awards `40/100/300/1200 × (level + 1)` points.

3. **Type B (25-Line Set-Clear) & High Score Persistence**:
   - Return to `MODE_SELECT`, pick `B-TYPE`, choose `LEVEL 0` and `HEIGHT 2` (5 rows of incomplete garbage), and start.
   - Verify 5 rows of incomplete garbage blocks appear at the bottom of the well and `LINES` starts at `25`.
   - Clear lines or finish a game to verify Top-3 High Score entry and `localStorage` persistence across browser refreshes.
