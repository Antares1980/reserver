import { TETROMINO_TYPES } from './constants';
import type { TetrominoType } from './types';

export interface RandomPickResult {
  piece: TetrominoType;
  rngState: number;
  pieceHistory: number;
}

/**
 * Advances a deterministic 32-bit xorshift PRNG.
 */
export function nextRandomInt(state: number): { value: number; nextState: number } {
  let x = state | 0;
  if (x === 0) {
    x = 0x19890614;
  }
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const unsigned = x >>> 0;
  return { value: unsigned, nextState: unsigned };
}

/**
 * Implements the 1989 Game Boy Tetris piece randomizer:
 * Draws a candidate index in 0..6 and checks against recent piece history;
 * if it repeats the previous piece, rerolls up to twice to reduce consecutive duplicates
 * while preserving the classic non-bag distribution.
 */
export function pickNextTetromino(rngState: number, pieceHistory: number): RandomPickResult {
  let currentRng = rngState;
  const lastPieceIdx = pieceHistory & 0x07;

  let candidateIdx = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const step = nextRandomInt(currentRng);
    currentRng = step.nextState;
    candidateIdx = step.value % TETROMINO_TYPES.length;
    if (candidateIdx !== lastPieceIdx) {
      break;
    }
  }

  const nextHistory = ((pieceHistory << 3) | (candidateIdx & 0x07)) & 0xfff;
  return {
    piece: TETROMINO_TYPES[candidateIdx],
    rngState: currentRng,
    pieceHistory: nextHistory,
  };
}
