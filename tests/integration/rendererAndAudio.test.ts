import { describe, expect, it, vi } from 'vitest';
import { SoundEngine } from '../../src/audio/soundEngine';
import { createInitialGameState, startGameplaySession } from '../../src/core/engine';
import type { ScreenState } from '../../src/core/types';
import { renderGameState } from '../../src/render/canvasRenderer';

function createMockCanvasContext() {
  return {
    fillStyle: '#000000',
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('160x144 Canvas Renderer & 8-Bit SoundEngine Integration', () => {
  it('renders all ScreenState modes without errors on a 160x144 Canvas context', () => {
    const ctx = createMockCanvasContext();
    let state = createInitialGameState(0x19890614);

    const screens: ScreenState[] = [
      'TITLE',
      'MODE_SELECT',
      'LEVEL_SELECT',
      'PLAYING',
      'LINE_CLEAR',
      'PAUSED',
      'VICTORY',
      'GAME_OVER',
      'HIGH_SCORE_ENTRY',
    ];

    state = startGameplaySession(state);
    for (const screen of screens) {
      state.screen = screen;
      if (screen === 'GAME_OVER') {
        state.curtainPhase = 'DONE';
      }
      if (screen === 'HIGH_SCORE_ENTRY') {
        state.enteringName = { chars: [0, 1, 2], cursorIndex: 1, rank: 0 };
      }
      renderGameState(ctx, state);
    }

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('tracks Music Type (A, B, C, OFF), mute state, and SFX cues in SoundEngine', () => {
    const sound = new SoundEngine();
    expect(sound.isMuted()).toBe(false);

    sound.setMusicType('A', true);
    expect(sound.getCurrentMusic()).toBe('A');
    expect(sound.isMusicPlaying()).toBe(true);

    sound.setMusicType('C', true);
    expect(sound.getCurrentMusic()).toBe('C');
    expect(sound.isMusicPlaying()).toBe(true);

    sound.setMusicType('OFF', true);
    expect(sound.isMusicPlaying()).toBe(false);

    sound.playSoundCue({ type: 'TETRIS_CLEAR' });
    sound.playSoundCue({ type: 'LEVEL_UP' });
    expect(sound.getPlayedCues()).toEqual(['TETRIS_CLEAR', 'LEVEL_UP']);

    sound.toggleMute();
    expect(sound.isMuted()).toBe(true);
    sound.dispose();
  });
});
