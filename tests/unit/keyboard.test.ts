import { describe, expect, it, vi } from 'vitest';
import { KeyboardController, mapKeyEventToButtons } from '../../src/input/keyboard';

describe('Dual Keyboard Controls (tetris_gb_reviews.xml + Standard PC)', () => {
  it('maps tetris_gb_reviews.xml keys (1=Start, Alt=A, Ctrl=B, Arrows=Direction)', () => {
    expect(mapKeyEventToButtons('1', 'Digit1', 'TITLE')).toEqual(['START']);
    expect(mapKeyEventToButtons('Alt', 'AltLeft', 'PLAYING')).toEqual(['A']);
    expect(mapKeyEventToButtons('Control', 'ControlLeft', 'PLAYING')).toEqual(['B']);
    expect(mapKeyEventToButtons('ArrowLeft', 'ArrowLeft', 'PLAYING')).toEqual(['LEFT']);
    expect(mapKeyEventToButtons('ArrowRight', 'ArrowRight', 'PLAYING')).toEqual(['RIGHT']);
    expect(mapKeyEventToButtons('ArrowDown', 'ArrowDown', 'PLAYING')).toEqual(['DOWN']);
  });

  it('maps standard PC keys (Enter=Start, X/Up=A in gameplay, Z=B, Shift=Select)', () => {
    expect(mapKeyEventToButtons('Enter', 'Enter', 'TITLE')).toEqual(['START']);
    expect(mapKeyEventToButtons('x', 'KeyX', 'PLAYING')).toEqual(['A']);
    expect(mapKeyEventToButtons('ArrowUp', 'ArrowUp', 'PLAYING')).toEqual(['A']);
    expect(mapKeyEventToButtons('ArrowUp', 'ArrowUp', 'MODE_SELECT')).toEqual(['UP']);
    expect(mapKeyEventToButtons('z', 'KeyZ', 'PLAYING')).toEqual(['B']);
    expect(mapKeyEventToButtons('Shift', 'ShiftLeft', 'PLAYING')).toEqual(['SELECT']);
  });

  it('calls preventDefault() on game keys and separates edge-triggered pressed from held state', () => {
    const controller = new KeyboardController();
    controller.setScreenContext('PLAYING');

    const preventDefault = vi.fn();
    controller.handleKeyDown({ key: 'Alt', code: 'AltLeft', preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);

    // First frame snapshot has A in both pressed and held
    const frame1 = controller.consumeFrameSnapshot();
    expect(frame1.pressed.has('A')).toBe(true);
    expect(frame1.held.has('A')).toBe(true);

    // Second frame while still held has A only in held, not pressed
    const frame2 = controller.consumeFrameSnapshot();
    expect(frame2.pressed.has('A')).toBe(false);
    expect(frame2.held.has('A')).toBe(true);

    // Keyup removes A from held
    controller.handleKeyUp({ key: 'Alt', code: 'AltLeft' });
    const frame3 = controller.consumeFrameSnapshot();
    expect(frame3.held.has('A')).toBe(false);
  });
});
