import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearHighScores,
  formatInitialsFromChars,
  getHighScoreKey,
  getHighScoreRank,
  getHighScoresForConfig,
  insertHighScore,
  loadHighScores,
} from '../../src/core/highScores';

describe('Top-3 High Score Ranking & Persistence', () => {
  beforeEach(() => {
    clearHighScores();
  });

  it('scopes keys by gameType, startLevel, and startHeight (ignoring startHeight for A-TYPE)', () => {
    expect(getHighScoreKey({ gameType: 'A', startLevel: 9, startHeight: 4 })).toBe('A-L9-H0');
    expect(getHighScoreKey({ gameType: 'B', startLevel: 9, startHeight: 4 })).toBe('B-L9-H4');
  });

  it('inserts, sorts descending, caps at Top 3, and persists scores', () => {
    const cfg = { gameType: 'A' as const, startLevel: 9, startHeight: 0 };
    let store = loadHighScores();

    expect(getHighScoreRank(store, cfg, 0)).toBe(-1);
    expect(getHighScoreRank(store, cfg, 500)).toBe(0);

    store = insertHighScore(store, cfg, { name: 'BOB', score: 1200 });
    store = insertHighScore(store, cfg, { name: 'ACE', score: 4800 });
    store = insertHighScore(store, cfg, { name: 'MAX', score: 2400 });
    store = insertHighScore(store, cfg, { name: 'LOW', score: 300 });

    const top3 = getHighScoresForConfig(store, cfg);
    expect(top3).toEqual([
      { name: 'ACE', score: 4800 },
      { name: 'MAX', score: 2400 },
      { name: 'BOB', score: 1200 },
    ]);

    // Reload from persistence
    const reloaded = getHighScoresForConfig(loadHighScores(), cfg);
    expect(reloaded).toEqual(top3);
  });

  it('formats 3-character initials from alphabet indices', () => {
    expect(formatInitialsFromChars([0, 1, 2])).toBe('ABC');
    expect(formatInitialsFromChars([25, 26, 27])).toBe('Z01');
  });
});
