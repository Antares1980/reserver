# TETRIS™ (1989 Game Boy Recreation)

A faithful, zero-dependency TypeScript + HTML5 Canvas + Web Audio API recreation of the 1989 Nintendo Game Boy (*DMG-01*) **Tetris**, built from the archival reference assets in [`tetris_gb/`](file:///c:/Users/rogal/workspaces/ws-games/reserver/tetris_gb).

---

## ✨ Features

- **Authentic 1989 Game Boy Visuals (`160×144` Logical Pixels)**:
  - Exact 4-shade olive-green color palette extracted from `tetris_gb/screenshot_00.png`–`screenshot_13.png` (`#ffff88`, `#b5a642`, `#7b7139`, `#393829`) plus a live toggle for Classic DMG Green (`#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f`).
  - Iconic **Title Screen** featuring the shaded `TETRIS™` banner, St. Basil's Cathedral silhouette with moon and stars, `▶ 1 PLAYER   2 PLAYER`, and `©1989 Nintendo`.
  - Distinct per-tetromino `8×8` pixel-art tile styles (`T` beveled square, `L` solid dark tile, `J`/`S` inner-ring tile, `I` connected horizontal/vertical speckled bar, `Z` center-dot tile, `O` light square with dark center).
  - Brick-bordered `10×18` visible well (`10×20` logical grid) and right-hand HUD (`SCORE`, `LEVEL`, `LINES`, `NEXT` preview box).
- **Complete 1-Player Game Modes (`tetris_gb_meta.xml`)**:
  - **Type A (Endless)**: Select starting `LEVEL 0–9`; level advances after `(startLevel + 1) × 10` cleared lines and every 10 lines thereafter up to Level 20.
  - **Type B (25-Line Set-Clear)**: Select starting `LEVEL 0–9` and initial garbage `HEIGHT 0–5` (`0, 3, 5, 8, 10, or 12` pre-filled incomplete rows); clear `25` lines down to `0` to trigger the stage-clear victory celebration and bonus score.
  - **Persistent Top-3 High Scores**: Scoped per Game Type, Level, and Height with 3-character arcade initial entry (`AAA`–`ZZZ`) stored in `localStorage`.
- **Dual Keyboard Controls (`tetris_gb_reviews.xml` + Standard PC)** & On-Screen Game Boy Pad:
  - Supports both the archival review controls (`1` = Start, `Alt` = A, `Ctrl` = B, `Arrow Keys` = Direction) and standard PC keys (`Enter` = Start, `X`/`Up` = Rotate CW, `Z` = Rotate CCW, `Shift` = Toggle Next Preview, `P` = Pause, `M` = Mute).
- **Procedural 8-Bit Chiptune Web Audio**:
  - Synthesizes `A-TYPE` (*Korobeiniki*), `B-TYPE`, `C-TYPE` (*J.S. Bach French Suite No. 3 in B Minor*), and `OFF` plus 8-bit sound effects.

---

## 🎮 Controls

| Action | `tetris_gb_reviews.xml` Key | Standard PC Key |
|--------|-----------------------------|-----------------|
| **Start / Pause** | `1` | `Enter` / `P` / `Escape` |
| **A (Rotate CW / Confirm)** | `Alt` | `X` / `Up Arrow` (in game) |
| **B (Rotate CCW / Back)** | `Ctrl` | `Z` |
| **Move Left / Right** | `Left` / `Right Arrow` | `A` / `D` or `Left` / `Right Arrow` |
| **Soft Drop (+1 pt/row)** | `Down Arrow` | `S` or `Down Arrow` |
| **Select (Toggle Next Box)** | — | `Shift` / `Backspace` |
| **Mute / Unmute Audio** | — | `M` |

---

## 🚀 Quickstart

```powershell
# Install dependencies
npm install

# Run automated unit & integration tests
npm test

# Run TypeScript typechecking
npm run typecheck

# Build production bundle
npm run build

# Start local development server
npm run dev
```
