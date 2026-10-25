import { describe, expect, it } from 'vitest';
import {
  calculateLineClearScore,
  calculateSoftDropBonus,
  calculateTypeALevel,
  calculateTypeBVictoryBonus,
  clampScore,
  getGravityFramesForLevel,
} from '../../src/core/scoring';

describe('1989 Game Boy Scoring, Gravity & Level Progression', () => {
  it('calculates Nintendo line-clear scores as (40, 100, 300, 1200) * (level + 1)', () => {
    // Level 0
    expect(calculateLineClearScore(1, 0)).toBe(40);
    expect(calculateLineClearScore(2, 0)).toBe(100);
    expect(calculateLineClearScore(3, 0)).toBe(300);
    expect(calculateLineClearScore(4, 0)).toBe(1200);

    // Level 9 (as in tetris_gb screenshots)
    expect(calculateLineClearScore(1, 9)).toBe(400);
    expect(calculateLineClearScore(2, 9)).toBe(1000);
    expect(calculateLineClearScore(3, 9)).toBe(3000);
    expect(calculateLineClearScore(4, 9)).toBe(12000);

    // Invalid line count
    expect(calculateLineClearScore(0, 5)).toBe(0);
  });

  it('calculates soft-drop bonus (+1 point per continuous soft-dropped row) and clamps max score at 999999', () => {
    expect(calculateSoftDropBonus(0)).toBe(0);
    expect(calculateSoftDropBonus(1)).toBe(1);
    expect(calculateSoftDropBonus(13)).toBe(13);
    expect(clampScore(1_250_000)).toBe(999999);
  });

  it('returns the exact 1989 Game Boy gravity frame counts across Levels 0..20', () => {
    expect(getGravityFramesForLevel(0)).toBe(53);
    expect(getGravityFramesForLevel(9)).toBe(11);
    expect(getGravityFramesForLevel(10)).toBe(10);
    expect(getGravityFramesForLevel(20)).toBe(3);
  });

  it('calculates Type A level transitions at (startLevel + 1) * 10 lines and every 10 lines thereafter', () => {
    // Starting at Level 0: advances at 10, 20, 30...
    expect(calculateTypeALevel(0, 0)).toBe(0);
    expect(calculateTypeALevel(0, 9)).toBe(0);
    expect(calculateTypeALevel(0, 10)).toBe(1);
    expect(calculateTypeALevel(0, 25)).toBe(2);

    // Starting at Level 9: stays at Level 9 until 100 lines, then Level 10 at 100 lines
    expect(calculateTypeALevel(9, 50)).toBe(9);
    expect(calculateTypeALevel(9, 99)).toBe(9);
    expect(calculateTypeALevel(9, 100)).toBe(10);
    expect(calculateTypeALevel(9, 110)).toBe(11);
    expect(calculateTypeALevel(9, 300)).toBe(20);
  });

  it('calculates Type B stage-clear victory bonus from level and height', () => {
    expect(calculateTypeBVictoryBonus(0, 0)).toBe(1000);
    expect(calculateTypeBVictoryBonus(9, 5)).toBe(12500);
  });
});
