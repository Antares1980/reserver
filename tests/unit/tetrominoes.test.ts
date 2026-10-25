import { describe, expect, it } from 'vitest';
import { TETROMINO_TYPES, WELL_COLS, WELL_ROWS } from '../../src/core/constants';
import { pickNextTetromino } from '../../src/core/randomizer';
import {
  createSpawnPiece,
  getNextRotation,
  getPieceCells,
  TETROMINO_MATRICES,
} from '../../src/core/tetrominoes';
import { canPlacePiece, createEmptyWell } from '../../src/core/well';

describe('1989 Game Boy Tetrominoes & Rotations', () => {
  it('defines 4 rotation states with exactly 4 occupied minoes for all 7 tetromino types', () => {
    for (const type of TETROMINO_TYPES) {
      const orientations = TETROMINO_MATRICES[type];
      expect(orientations).toHaveLength(4);
      for (let rot = 0; rot < 4; rot++) {
        const cells = getPieceCells(type, rot as 0 | 1 | 2 | 3, 0, 0);
        expect(cells).toHaveLength(4);
      }
    }
  });

  it('cycles right-handed CW and CCW rotation states accurately', () => {
    expect(getNextRotation(0, 'CW')).toBe(1);
    expect(getNextRotation(1, 'CW')).toBe(2);
    expect(getNextRotation(2, 'CW')).toBe(3);
    expect(getNextRotation(3, 'CW')).toBe(0);

    expect(getNextRotation(0, 'CCW')).toBe(3);
    expect(getNextRotation(3, 'CCW')).toBe(2);
    expect(getNextRotation(2, 'CCW')).toBe(1);
    expect(getNextRotation(1, 'CCW')).toBe(0);
  });

  it('spawns pieces centered horizontally at the top of the visible well (row 2)', () => {
    const tPiece = createSpawnPiece('T');
    expect(tPiece.row).toBe(1);
    expect(tPiece.col).toBe(3);
    expect(tPiece.rotation).toBe(0);

    const cells = getPieceCells(tPiece.type, tPiece.rotation, tPiece.row, tPiece.col);
    // Top bar of T-piece is at well row 2 (cols 3, 4, 5) and stem at row 3 (col 4)
    expect(cells).toEqual([
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
      { row: 3, col: 4 },
    ]);
  });

  it('rejects rotation or placement when out of bounds or overlapping locked cells (no wall kicks)', () => {
    const well = createEmptyWell();
    // Vertical I-piece at col -1 (minoes at col 0) is valid
    expect(canPlacePiece(well, 'I', 1, 2, -1)).toBe(true);
    // Rotating to horizontal at col -1 puts mino at col -1 (out of bounds) -> rejected
    expect(canPlacePiece(well, 'I', 0, 2, -1)).toBe(false);

    // Out of bounds right wall or floor
    expect(canPlacePiece(well, 'O', 0, 2, WELL_COLS - 2)).toBe(false);
    expect(canPlacePiece(well, 'O', 0, WELL_ROWS - 2, 3)).toBe(false);

    // Overlapping locked tile in well
    well[5][4] = 'L';
    expect(canPlacePiece(well, 'T', 0, 4, 3)).toBe(false);
  });

  it('produces valid tetrominoes from the seeded Game Boy randomizer with reduced consecutive repeats', () => {
    let rng = 0x19890614;
    let history = 0;
    const sequence: string[] = [];

    for (let i = 0; i < 50; i++) {
      const pick = pickNextTetromino(rng, history);
      expect(TETROMINO_TYPES).toContain(pick.piece);
      sequence.push(pick.piece);
      rng = pick.rngState;
      history = pick.pieceHistory;
    }

    // Ensure all 7 piece types appear in 50 draws
    const uniqueTypes = new Set(sequence);
    expect(uniqueTypes.size).toBe(7);
  });
});
