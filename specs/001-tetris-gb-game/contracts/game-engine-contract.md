# Interface Contracts: Game Boy Tetris (1989) Engine & UI

**Feature**: `001-tetris-gb-game`  
**Date**: 2026-10-25

## 1. Pure Game Engine Contract (`src/core/engine.ts`)

The core game engine is a deterministic, side-effect-free state machine operating at 60 Hz ticks.

```typescript
export type VirtualButton =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'A'       // Rotate Clockwise / Confirm
  | 'B'       // Rotate Counter-Clockwise / Back
  | 'START'   // Start / Pause
  | 'SELECT'; // Toggle Next Piece Preview

export interface InputSnapshot {
  pressed: Set<VirtualButton>;      // Buttons newly pressed on this frame (edge-triggered)
  held: Set<VirtualButton>;         // Buttons currently held down on this frame (level-triggered)
}

export interface SoundCue {
  type:
    | 'MENU_MOVE'
    | 'MENU_CONFIRM'
    | 'PIECE_MOVE'
    | 'PIECE_ROTATE'
    | 'PIECE_LOCK'
    | 'LINE_CLEAR'
    | 'TETRIS_CLEAR'
    | 'LEVEL_UP'
    | 'VICTORY'
    | 'GAME_OVER'
    | 'PAUSE';
}

export interface StepResult {
  state: GameState;
  soundCues: SoundCue[];
}

export function createInitialGameState(seed?: number): GameState;
export function stepGameFrame(state: GameState, input: InputSnapshot): StepResult;
```

## 2. Keyboard Input Mapping Contract (`src/input/keyboard.ts`)

Simultaneously maps both the `tetris_gb_reviews.xml` archival keys and standard PC keys:

| Virtual Button | `tetris_gb_reviews.xml` Key (`event.key` / `event.code`) | Standard PC Key (`event.key` / `event.code`) |
|----------------|----------------------------------------------------------|----------------------------------------------|
| `START`        | `'1'` (`Digit1`)                                         | `'Enter'`, `'p'`, `'P'`, `'Escape'`          |
| `A` (CW / OK)  | `'Alt'` (`AltLeft`, `AltRight`)                          | `'x'`, `'X'`, `'ArrowUp'` (in `PLAYING`)     |
| `B` (CCW/Back) | `'Control'` (`ControlLeft`, `ControlRight`)              | `'z'`, `'Z'`                                 |
| `LEFT`         | `'ArrowLeft'`                                            | `'ArrowLeft'`, `'a'`, `'A'`                  |
| `RIGHT`        | `'ArrowRight'`                                           | `'ArrowRight'`, `'d'`, `'D'`                 |
| `DOWN`         | `'ArrowDown'`                                            | `'ArrowDown'`, `'s'`, `'S'`                  |
| `UP`           | `'ArrowUp'`                                              | `'ArrowUp'`, `'w'`, `'W'`                    |
| `SELECT`       | —                                                        | `'Shift'`, `'Backspace'`                     |

## 3. Canvas Renderer Contract (`src/render/canvasRenderer.ts`)

- **Logical Canvas Size**: `160` px width × `144` px height (`20 × 18` tiles of `8 × 8` pixels).
- **Public API**:
  - `renderGameState(ctx: CanvasRenderingContext2D, state: GameState): void`
  - Renders the active `ScreenState` (`TITLE`, `MODE_SELECT`, `LEVEL_SELECT`, `PLAYING`, `LINE_CLEAR`, `PAUSED`, `VICTORY`, `GAME_OVER`, `HIGH_SCORE_ENTRY`) using deterministic pixel-art tile bitmaps.

## 4. Web Audio Chiptune Synthesizer Contract (`src/audio/soundEngine.ts`)

- **Public API**:
  - `setMusicType(music: MusicType, active: boolean): void`
  - `playSoundCue(cue: SoundCue): void`
  - `toggleMute(): boolean`
  - Gracefully no-ops in headless/test environments where `AudioContext` is unavailable.
