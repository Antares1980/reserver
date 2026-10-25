import { describe, expect, it } from 'vitest';
import {
  TYPE_B_GARBAGE_ROWS_BY_HEIGHT,
  WELL_COLS,
  WELL_ROWS,
} from '../../src/core/constants';
import {
  canPlacePiece,
  collapseRows,
  createEmptyWell,
  findCompletedRows,
  lockPiece,
  populateTypeBGarbage,
} from '../../src/core/well';

describe('20x10 Well Operations & Type B Garbage Generation', () => {
  it('creates an empty 20x10 well and locks an active piece without mutating the original well', () => {
    const empty = createEmptyWell();
    expect(empty).toHaveLength(WELL_ROWS);
    expect(empty[0]).toHaveLength(WELL_COLS);

    const locked = lockPiece(empty, {
      type: 'O',
      rotation: 0,
      row: 16,
      col: 4,
      gravityTimer: 0,
      softDropCounter: 0,
      softDropFrameTimer: 0,
    });

    expect(empty[17][5]).toBe(0);
    expect(locked[17][5]).toBe('O');
    expect(locked[17][6]).toBe('O');
    expect(locked[18][5]).toBe('O');
    expect(locked[18][6]).toBe('O');
  });

  it('detects 1 to 4 completed rows and collapses them while shifting upper rows down', () => {
    const well = createEmptyWell();
    // Put a marker tile on row 15
    well[15][2] = 'J';
    // Complete rows 16, 17, 18, 19 (4-line Tetris)
    for (const r of [16, 17, 18, 19]) {
      for (let c = 0; c < WELL_COLS; c++) {
        well[r][c] = 'I';
      }
    }

    const completed = findCompletedRows(well);
    expect(completed).toEqual([16, 17, 18, 19]);

    const collapsed = collapseRows(well, completed);
    expect(findCompletedRows(collapsed)).toEqual([]);
    // The marker tile from row 15 should have shifted down by 4 rows to row 19
    expect(collapsed[19][2]).toBe('J');
    expect(collapsed[15][2]).toBe(0);
  });

  it('populates Type B garbage for Heights 0..5 with exact row counts and at least 1 empty and 1 filled cell per garbage row', () => {
    for (let height = 0; height <= 5; height++) {
      const { well } = populateTypeBGarbage(height, 0x12345678 + height);
      const expectedGarbageRows = TYPE_B_GARBAGE_ROWS_BY_HEIGHT[height];

      // Upper rows must be completely empty
      for (let r = 0; r < WELL_ROWS - expectedGarbageRows; r++) {
        expect(well[r].every((c) => c === 0)).toBe(true);
      }

      // Bottom garbage rows must be incomplete (at least 1 zero and at least 1 non-zero)
      for (let r = WELL_ROWS - expectedGarbageRows; r < WELL_ROWS; r++) {
        const nonZeroCount = well[r].filter((c) => c !== 0).length;
        expect(nonZeroCount).toBeGreaterThanOrEqual(1);
        expect(nonZeroCount).toBeLessThan(WELL_COLS);
      }
    }
  });

  it('detects spawn collision at top of well when stack reaches row 2', () => {
    const well = createEmptyWell();
    well[2][4] = 'T';
    expect(canPlacePiece(well, 'T', 0, 1, 3)).toBe(false);
  });
});
