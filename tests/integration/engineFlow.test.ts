import { beforeEach, describe, expect, it } from 'vitest';
import {
  DAS_INITIAL_DELAY_FRAMES,
  LINE_CLEAR_ANIMATION_FRAMES,
  WELL_COLS,
} from '../../src/core/constants';
import { createInitialGameState, stepGameFrame } from '../../src/core/engine';
import { clearHighScores } from '../../src/core/highScores';
import type { InputSnapshot, VirtualButton } from '../../src/core/types';

function input(
  pressed: VirtualButton[] = [],
  held: VirtualButton[] = pressed
): InputSnapshot {
  return {
    pressed: new Set(pressed),
    held: new Set(held),
  };
}

describe('End-to-End 60 Hz Engine Flow (Title -> Menus -> Type A/B Play -> Victory/GameOver -> High Score)', () => {
  beforeEach(() => {
    clearHighScores();
  });

  it('navigates Title -> Mode/Music Select -> Level Select -> Playing -> Pause -> Resume', () => {
    let state = createInitialGameState(0x19890614);
    expect(state.screen).toBe('TITLE');

    // Press START (1 / Enter) on Title Screen
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('MODE_SELECT');

    // Switch Music Type to B-TYPE
    state = stepGameFrame(state, input(['DOWN'])).state;
    expect(state.modeSelectFocus).toBe('MUSIC_TYPE');
    state = stepGameFrame(state, input(['RIGHT'])).state;
    expect(state.config.musicType).toBe('B');

    // Confirm to Level Select
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('LEVEL_SELECT');

    // Select Level 9 (Down -> Level 5, Right x4 -> Level 9)
    state = stepGameFrame(state, input(['DOWN'])).state;
    for (let i = 0; i < 4; i++) {
      state = stepGameFrame(state, input(['RIGHT'])).state;
    }
    expect(state.config.startLevel).toBe(9);

    // Start Gameplay
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('PLAYING');
    expect(state.level).toBe(9);
    expect(state.activePiece).not.toBeNull();

    // Toggle NEXT piece preview with SELECT
    expect(state.showNextPreview).toBe(true);
    state = stepGameFrame(state, input(['SELECT'])).state;
    expect(state.showNextPreview).toBe(false);

    // Pause and Resume
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('PAUSED');
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('PLAYING');
  });

  it('supports DAS horizontal auto-shift, soft-drop scoring, and 4-line Tetris clear in Type A', () => {
    let state = createInitialGameState(0x19890614);
    // Advance to PLAYING at Level 0
    state = stepGameFrame(state, input(['START'])).state;
    state = stepGameFrame(state, input(['START'])).state;
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('PLAYING');

    // Force an I-piece in vertical orientation at col 0
    state.activePiece = {
      type: 'I',
      rotation: 1,
      row: 2,
      col: 3,
      gravityTimer: 0,
      softDropCounter: 0,
      softDropFrameTimer: 0,
    };

    // Test DAS: initial press shifts 1 col left (col 2), holding for 23 frames shifts again (col 1)
    state = stepGameFrame(state, input(['LEFT'], ['LEFT'])).state;
    expect(state.activePiece?.col).toBe(2);
    for (let f = 1; f <= DAS_INITIAL_DELAY_FRAMES; f++) {
      state = stepGameFrame(state, input([], ['LEFT'])).state;
    }
    expect(state.activePiece?.col).toBe(1);

    // Fill rows 16, 17, 18, 19 across cols 0..8, leaving col 9 empty for a vertical I-piece Tetris
    for (let r = 16; r <= 19; r++) {
      for (let c = 0; c < WELL_COLS - 1; c++) {
        state.well[r][c] = 'L';
      }
      state.well[r][9] = 0;
    }

    // Place vertical I-piece above col 9 (at baseCol = 8, since vertical I is in col index 1 of 4x4)
    state.activePiece = {
      type: 'I',
      rotation: 1,
      row: 14,
      col: 8,
      gravityTimer: 0,
      softDropCounter: 0,
      softDropFrameTimer: 0,
    };

    // Soft-drop it into rows 16..19 and lock
    for (let i = 0; i < 12; i++) {
      state = stepGameFrame(state, i === 0 ? input(['DOWN'], ['DOWN']) : input([], ['DOWN'])).state;
      if (state.screen === 'LINE_CLEAR') {
        break;
      }
    }

    expect(state.screen).toBe('LINE_CLEAR');
    expect(state.clearingRows).toEqual([16, 17, 18, 19]);
    // Soft-dropped 2 rows before lock -> +2 points immediately
    expect(state.score).toBe(2);

    // Step through LINE_CLEAR animation
    for (let f = 0; f < LINE_CLEAR_ANIMATION_FRAMES; f++) {
      state = stepGameFrame(state, input()).state;
    }

    expect(state.screen).toBe('PLAYING');
    expect(state.lines).toBe(4);
    // 4-line Tetris at Level 0 awards 1200 * (0 + 1) = 1200 + 2 soft-drop = 1202
    expect(state.score).toBe(1202);
  });

  it('completes Type B 25-line countdown (clamping to 0 on over-clear), triggers VICTORY, and saves High Score initials', () => {
    let state = createInitialGameState(0x19890614);
    state.config = {
      gameType: 'B',
      musicType: 'A',
      startLevel: 2,
      startHeight: 1,
    };
    state.screen = 'LEVEL_SELECT';
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('PLAYING');
    expect(state.lines).toBe(25);

    // Simulate 2 lines remaining in Type B and clearing 4 lines (over-clear)
    state.lines = 2;
    for (let r = 16; r <= 19; r++) {
      for (let c = 0; c < WELL_COLS - 1; c++) {
        state.well[r][c] = 'Z';
      }
      state.well[r][9] = 0;
    }
    state.activePiece = {
      type: 'I',
      rotation: 1,
      row: 16,
      col: 8,
      gravityTimer: 0,
      softDropCounter: 0,
      softDropFrameTimer: 0,
    };

    // Lock the I-piece via soft drop
    state = stepGameFrame(state, input(['DOWN'], ['DOWN'])).state;
    expect(state.screen).toBe('LINE_CLEAR');

    for (let f = 0; f < LINE_CLEAR_ANIMATION_FRAMES; f++) {
      state = stepGameFrame(state, input()).state;
    }

    // Lines must clamp to 0 and transition to VICTORY
    expect(state.lines).toBe(0);
    expect(state.screen).toBe('VICTORY');

    // Press START on VICTORY screen -> transitions to HIGH_SCORE_ENTRY
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('HIGH_SCORE_ENTRY');
    expect(state.enteringName).not.toBeNull();

    // Enter initials 'B', 'A', 'A' and press START to save
    state = stepGameFrame(state, input(['UP'])).state;
    state = stepGameFrame(state, input(['START'])).state;
    expect(state.screen).toBe('LEVEL_SELECT');
    expect(state.highScores['B-L2-H1'][0].name).toBe('BAA');
  });
});
