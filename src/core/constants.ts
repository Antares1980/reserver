import type { PaletteMode, TetrominoType } from './types';

export const SCREEN_WIDTH = 160;
export const SCREEN_HEIGHT = 144;
export const TILE_SIZE = 8;
export const SCREEN_TILE_COLS = 20;
export const SCREEN_TILE_ROWS = 18;

export const WELL_COLS = 10;
export const WELL_ROWS = 20;
export const WELL_HIDDEN_ROWS = 2;
export const WELL_VISIBLE_ROWS = 18;

/**
 * 1989 Game Boy Tetris gravity table (frames per row drop at ~59.73 Hz) for Levels 0..20.
 */
export const GRAVITY_FRAMES_BY_LEVEL: readonly number[] = [
  53, // Level 0
  49, // Level 1
  45, // Level 2
  41, // Level 3
  37, // Level 4
  33, // Level 5
  28, // Level 6
  22, // Level 7
  17, // Level 8
  11, // Level 9
  10, // Level 10
  9,  // Level 11
  8,  // Level 12
  7,  // Level 13
  6,  // Level 14
  6,  // Level 15
  5,  // Level 16
  5,  // Level 17
  4,  // Level 18
  4,  // Level 19
  3,  // Level 20
];

export const MAX_LEVEL = 20;
export const MAX_START_LEVEL = 9;
export const MAX_START_HEIGHT = 5;
export const MAX_SCORE = 999999;
export const MAX_LINES_TYPE_A = 999;
export const TYPE_B_INITIAL_LINES = 25;

/**
 * Delayed Auto-Shift (DAS) frame timings in 1989 Game Boy Tetris:
 * - Immediate shift on initial keydown (frame 0)
 * - 23 frames initial delay
 * - 9 frames repeat interval thereafter
 */
export const DAS_INITIAL_DELAY_FRAMES = 23;
export const DAS_REPEAT_INTERVAL_FRAMES = 9;

/**
 * Soft-drop rate when Down is held: 1 row every 3 frames.
 */
export const SOFT_DROP_FRAMES = 3;

/**
 * Line-clear animation duration in frames.
 */
export const LINE_CLEAR_ANIMATION_FRAMES = 42;

/**
 * Base score multipliers for 0, 1, 2, 3, and 4 simultaneous line clears.
 * Multiplied by (level + 1).
 */
export const LINE_CLEAR_BASE_SCORES: readonly [number, number, number, number, number] = [
  0,
  40,
  100,
  300,
  1200,
];

/**
 * Type B initial garbage row counts for Height 0..5.
 */
export const TYPE_B_GARBAGE_ROWS_BY_HEIGHT: readonly [number, number, number, number, number, number] = [
  0,
  3,
  5,
  8,
  10,
  12,
];

/**
 * Canonical 7 tetromino types in Game Boy internal index order.
 */
export const TETROMINO_TYPES: readonly TetrominoType[] = [
  'L',
  'J',
  'I',
  'O',
  'Z',
  'S',
  'T',
];

/**
 * Alphabet available for 3-character high score entry.
 */
export const HIGH_SCORE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.- ';

/**
 * 4-shade color palettes:
 * - SCREENSHOT: Exact colors sampled from `tetris_gb/screenshot_00.png`..`screenshot_13.png`
 *   [0 = Lightest `#ffff88`, 1 = Light-mid `#b5a642`, 2 = Dark-mid `#7b7139`, 3 = Darkest `#393829`]
 * - DMG_CLASSIC: Classic olive-green Game Boy LCD shades
 */
export const PALETTES: Record<PaletteMode, readonly [string, string, string, string]> = {
  SCREENSHOT: ['#ffff88', '#b5a642', '#7b7139', '#393829'],
  DMG_CLASSIC: ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'],
};
