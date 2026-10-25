import type { InputSnapshot, ScreenState, VirtualButton } from '../core/types';

export interface KeyEventLike {
  key: string;
  code?: string;
  repeat?: boolean;
  preventDefault?: () => void;
}

/**
 * Maps a keyboard event (`key` / `code`) to one or more `VirtualButton` values.
 * Supports both:
 * 1. `tetris_gb_reviews.xml` controls:
 *    - `1` = START
 *    - `Alt` = A (Rotate CW / Confirm)
 *    - `Control` = B (Rotate CCW / Back)
 *    - `ArrowLeft`, `ArrowRight`, `ArrowDown`, `ArrowUp` = Direction
 * 2. Standard PC controls:
 *    - `Enter`, `p`, `P`, `Escape` = START (Start / Pause)
 *    - `x`, `X`, `ArrowUp` (during PLAYING) = A (Rotate CW)
 *    - `z`, `Z` = B (Rotate CCW)
 *    - `Shift`, `Backspace` = SELECT (Toggle Next Preview)
 *    - `a`/`d`/`s`/`w` = Direction
 */
export function mapKeyEventToButtons(
  key: string,
  code = '',
  screen: ScreenState = 'PLAYING'
): VirtualButton[] {
  // 1. Archival tetris_gb_reviews.xml & PC START keys
  if (
    key === '1' ||
    code === 'Digit1' ||
    key === 'Enter' ||
    key === 'p' ||
    key === 'P' ||
    key === 'Escape'
  ) {
    return ['START'];
  }

  // 2. Archival Alt = A & PC X = A
  if (
    key === 'Alt' ||
    code === 'AltLeft' ||
    code === 'AltRight' ||
    key === 'x' ||
    key === 'X'
  ) {
    return ['A'];
  }

  // 3. Archival Ctrl = B & PC Z = B
  if (
    key === 'Control' ||
    code === 'ControlLeft' ||
    code === 'ControlRight' ||
    key === 'z' ||
    key === 'Z'
  ) {
    return ['B'];
  }

  // 4. SELECT (Shift / Backspace)
  if (
    key === 'Shift' ||
    code === 'ShiftLeft' ||
    code === 'ShiftRight' ||
    key === 'Backspace'
  ) {
    return ['SELECT'];
  }

  // 5. Directional keys
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    return ['LEFT'];
  }
  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    return ['RIGHT'];
  }
  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    return ['DOWN'];
  }
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    // During active gameplay, Up Arrow / W rotates Clockwise (A) for PC convenience
    if (screen === 'PLAYING') {
      return ['A'];
    }
    return ['UP'];
  }

  return [];
}

/**
 * Tracks edge-triggered (`pressed`) and level-triggered (`held`) virtual buttons across frames.
 */
export class KeyboardController {
  private pressedBuffer = new Set<VirtualButton>();
  private heldButtons = new Set<VirtualButton>();
  private currentScreen: ScreenState = 'TITLE';

  public setScreenContext(screen: ScreenState): void {
    this.currentScreen = screen;
  }

  public handleKeyDown(event: KeyEventLike): void {
    const buttons = mapKeyEventToButtons(event.key, event.code ?? '', this.currentScreen);
    if (buttons.length === 0) {
      return;
    }

    if (event.preventDefault) {
      event.preventDefault();
    }

    if (event.repeat) {
      return;
    }

    for (const btn of buttons) {
      if (!this.heldButtons.has(btn)) {
        this.pressedBuffer.add(btn);
      }
      this.heldButtons.add(btn);
    }
  }

  public handleKeyUp(event: KeyEventLike): void {
    // Clear both PLAYING and menu interpretations of the released key
    const buttonsPlaying = mapKeyEventToButtons(event.key, event.code ?? '', 'PLAYING');
    const buttonsMenu = mapKeyEventToButtons(event.key, event.code ?? '', 'TITLE');
    const allButtons = new Set([...buttonsPlaying, ...buttonsMenu]);

    if (allButtons.size > 0 && event.preventDefault) {
      event.preventDefault();
    }

    for (const btn of allButtons) {
      this.heldButtons.delete(btn);
    }
  }

  public pressVirtualButton(button: VirtualButton): void {
    this.pressedBuffer.add(button);
    this.heldButtons.add(button);
  }

  public releaseVirtualButton(button: VirtualButton): void {
    this.heldButtons.delete(button);
  }

  /**
   * Consumes the frame's `pressed` set while retaining `held` buttons.
   */
  public consumeFrameSnapshot(): InputSnapshot {
    const snapshot: InputSnapshot = {
      pressed: new Set(this.pressedBuffer),
      held: new Set(this.heldButtons),
    };
    this.pressedBuffer.clear();
    return snapshot;
  }

  public reset(): void {
    this.pressedBuffer.clear();
    this.heldButtons.clear();
  }
}
