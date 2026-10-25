import {
  GRAVITY_FRAMES_BY_LEVEL,
  LINE_CLEAR_BASE_SCORES,
  MAX_LEVEL,
  MAX_SCORE,
} from './constants';

/**
 * Returns the number of 60 Hz frames per gravity row step for the given level (0..20).
 */
export function getGravityFramesForLevel(level: number): number {
  const clamped = Math.max(0, Math.min(MAX_LEVEL, Math.floor(level)));
  return GRAVITY_FRAMES_BY_LEVEL[clamped];
}

/**
 * Calculates the 1989 Game Boy Tetris line-clear score:
 * - 1 line:  40 * (level + 1)
 * - 2 lines: 100 * (level + 1)
 * - 3 lines: 300 * (level + 1)
 * - 4 lines: 1200 * (level + 1)
 */
export function calculateLineClearScore(linesCleared: number, level: number): number {
  if (linesCleared < 1 || linesCleared > 4) {
    return 0;
  }
  const base = LINE_CLEAR_BASE_SCORES[linesCleared as 1 | 2 | 3 | 4];
  return base * (Math.max(0, Math.floor(level)) + 1);
}

/**
 * Calculates the soft-drop bonus awarded when a piece locks onto the stack.
 * In 1989 Game Boy Tetris, each continuous soft-dropped row awards +1 point.
 */
export function calculateSoftDropBonus(softDropCells: number): number {
  return Math.max(0, Math.floor(softDropCells));
}

/**
 * Clamps the total score to the 6-digit Game Boy maximum (999,999).
 */
export function clampScore(score: number): number {
  return Math.max(0, Math.min(MAX_SCORE, Math.floor(score)));
}

/**
 * Calculates the active level in Type A (Endless) mode based on `startLevel` and `totalLinesCleared`.
 * First level-up occurs at `(startLevel + 1) * 10` lines cleared, then every 10 lines up to Level 20.
 */
export function calculateTypeALevel(startLevel: number, totalLinesCleared: number): number {
  const threshold = (startLevel + 1) * 10;
  if (totalLinesCleared < threshold) {
    return startLevel;
  }
  const extraLevels = Math.floor((totalLinesCleared - threshold) / 10) + 1;
  return Math.min(MAX_LEVEL, startLevel + extraLevels);
}

/**
 * Calculates the Type B completion bonus awarded when all 25 lines are cleared.
 */
export function calculateTypeBVictoryBonus(level: number, height: number): number {
  const levelBonus = (Math.max(0, level) + 1) * 1000;
  const heightBonus = Math.max(0, height) * 500;
  return levelBonus + heightBonus;
}
