import { HIGH_SCORE_ALPHABET, MAX_SCORE } from './constants';
import type { GameConfig, HighScoreEntry } from './types';

export const HIGH_SCORE_STORAGE_KEY = 'reserver_tetris_gb_high_scores_v1';
export const MAX_HIGH_SCORE_ENTRIES = 3;

let memoryFallbackStore: Record<string, HighScoreEntry[]> = {};

/**
 * Builds the canonical storage scope key for a GameConfig:
 * e.g. `A-L9-H0` or `B-L9-H2`.
 */
export function getHighScoreKey(config: Pick<GameConfig, 'gameType' | 'startLevel' | 'startHeight'>): string {
  const h = config.gameType === 'B' ? config.startHeight : 0;
  return `${config.gameType}-L${config.startLevel}-H${h}`;
}

/**
 * Converts 3 alphabet indices into a 3-character string.
 */
export function formatInitialsFromChars(chars: readonly [number, number, number]): string {
  return chars
    .map((idx) => HIGH_SCORE_ALPHABET[((idx % HIGH_SCORE_ALPHABET.length) + HIGH_SCORE_ALPHABET.length) % HIGH_SCORE_ALPHABET.length])
    .join('')
    .trimEnd() || 'AAA';
}

/**
 * Loads the high score dictionary from `localStorage` or in-memory fallback.
 */
export function loadHighScores(): Record<string, HighScoreEntry[]> {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      const raw = globalThis.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, HighScoreEntry[]>;
        if (parsed && typeof parsed === 'object') {
          memoryFallbackStore = parsed;
          return structuredClone(parsed);
        }
      }
    }
  } catch {
    // Fallback to in-memory store when localStorage is unavailable or blocked
  }
  return structuredClone(memoryFallbackStore);
}

/**
 * Saves the high score dictionary to `localStorage` and in-memory fallback.
 */
export function saveHighScores(store: Record<string, HighScoreEntry[]>): void {
  memoryFallbackStore = structuredClone(store);
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      globalThis.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(store));
    }
  } catch {
    // Ignore storage quota / security errors in restricted environments
  }
}

/**
 * Clears all stored high scores (useful for testing).
 */
export function clearHighScores(): void {
  memoryFallbackStore = {};
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      globalThis.localStorage.removeItem(HIGH_SCORE_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Returns the Top-3 High Score list for the given config.
 */
export function getHighScoresForConfig(
  store: Record<string, HighScoreEntry[]>,
  config: Pick<GameConfig, 'gameType' | 'startLevel' | 'startHeight'>
): HighScoreEntry[] {
  const key = getHighScoreKey(config);
  return store[key] ? [...store[key]] : [];
}

/**
 * Determines whether a positive score qualifies for the Top-3 table for the given config.
 * Returns the 0-based rank (0, 1, or 2) or -1 if it does not qualify.
 */
export function getHighScoreRank(
  store: Record<string, HighScoreEntry[]>,
  config: Pick<GameConfig, 'gameType' | 'startLevel' | 'startHeight'>,
  score: number
): number {
  if (score <= 0) {
    return -1;
  }
  const existing = getHighScoresForConfig(store, config);
  for (let i = 0; i < MAX_HIGH_SCORE_ENTRIES; i++) {
    if (i >= existing.length || score > existing[i].score) {
      return i;
    }
  }
  return -1;
}

/**
 * Inserts a new HighScoreEntry into the Top-3 list for the given config and persists it.
 */
export function insertHighScore(
  store: Record<string, HighScoreEntry[]>,
  config: Pick<GameConfig, 'gameType' | 'startLevel' | 'startHeight'>,
  entry: HighScoreEntry
): Record<string, HighScoreEntry[]> {
  const key = getHighScoreKey(config);
  const sanitizedName = (entry.name.toUpperCase().slice(0, 6) || 'AAA');
  const sanitizedScore = Math.max(0, Math.min(MAX_SCORE, Math.floor(entry.score)));
  const current = getHighScoresForConfig(store, config);
  const updated = [...current, { name: sanitizedName, score: sanitizedScore }]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_HIGH_SCORE_ENTRIES);

  const nextStore: Record<string, HighScoreEntry[]> = {
    ...store,
    [key]: updated,
  };
  saveHighScores(nextStore);
  return nextStore;
}
