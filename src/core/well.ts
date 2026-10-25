import {
  TETROMINO_TYPES,
  TYPE_B_GARBAGE_ROWS_BY_HEIGHT,
  WELL_COLS,
  WELL_ROWS,
} from './constants';
import { nextRandomInt } from './randomizer';
import { getPieceCells } from './tetrominoes';
import type { ActivePiece, CellValue, RotationState, TetrominoType } from './types';

/**
 * Creates an empty 20x10 well filled with 0.
 */
export function createEmptyWell(): CellValue[][] {
  return Array.from({ length: WELL_ROWS }, () =>
    Array.from({ length: WELL_COLS }, () => 0 as CellValue)
  );
}

/**
 * Clones a 20x10 well grid.
 */
export function cloneWell(well: CellValue[][]): CellValue[][] {
  return well.map((row) => [...row]);
}

/**
 * Checks whether a tetromino at (baseRow, baseCol, rotation) fits inside the 20x10 well
 * without overlapping walls, floor, or locked cells.
 * Note: 1989 Game Boy Tetris has no wall kicks; out-of-bounds or occupied cells reject placement.
 */
export function canPlacePiece(
  well: CellValue[][],
  type: TetrominoType,
  rotation: RotationState,
  baseRow: number,
  baseCol: number
): boolean {
  const cells = getPieceCells(type, rotation, baseRow, baseCol);
  for (const { row, col } of cells) {
    if (col < 0 || col >= WELL_COLS || row < 0 || row >= WELL_ROWS) {
      return false;
    }
    if (well[row][col] !== 0) {
      return false;
    }
  }
  return true;
}

/**
 * Locks an active piece into a new copy of the well.
 */
export function lockPiece(well: CellValue[][], piece: ActivePiece): CellValue[][] {
  const next = cloneWell(well);
  const cells = getPieceCells(piece.type, piece.rotation, piece.row, piece.col);
  for (const { row, col } of cells) {
    if (row >= 0 && row < WELL_ROWS && col >= 0 && col < WELL_COLS) {
      next[row][col] = piece.type;
    }
  }
  return next;
}

/**
 * Returns the sorted indices of all completed rows (all 10 columns non-zero).
 */
export function findCompletedRows(well: CellValue[][]): number[] {
  const completed: number[] = [];
  for (let r = 0; r < WELL_ROWS; r++) {
    if (well[r].every((cell) => cell !== 0)) {
      completed.push(r);
    }
  }
  return completed;
}

/**
 * Removes the specified completed rows and shifts upper rows down, inserting empty rows at the top.
 */
export function collapseRows(well: CellValue[][], rowsToRemove: number[]): CellValue[][] {
  if (rowsToRemove.length === 0) {
    return cloneWell(well);
  }
  const removeSet = new Set(rowsToRemove);
  const remaining = well
    .filter((_, idx) => !removeSet.has(idx))
    .map((row) => [...row]);

  while (remaining.length < WELL_ROWS) {
    remaining.unshift(Array.from({ length: WELL_COLS }, () => 0 as CellValue));
  }
  return remaining;
}

/**
 * Populates the bottom rows of the well with Type B garbage for Height 0..5.
 * Heights 0..5 correspond to [0, 3, 5, 8, 10, 12] garbage rows at the bottom of the 20-row well.
 * Every garbage row is guaranteed to have at least 1 empty cell (`0`) and at least 1 occupied cell
 * so no pre-filled row starts already complete or completely blank.
 */
export function populateTypeBGarbage(
  height: number,
  seed = 0x19890614
): { well: CellValue[][]; rngState: number } {
  const well = createEmptyWell();
  const clampedHeight = Math.max(0, Math.min(5, Math.floor(height)));
  const garbageRowCount = TYPE_B_GARBAGE_ROWS_BY_HEIGHT[clampedHeight];
  let rng = seed;

  for (let r = WELL_ROWS - garbageRowCount; r < WELL_ROWS; r++) {
    let filledCount = 0;
    for (let c = 0; c < WELL_COLS; c++) {
      const step = nextRandomInt(rng);
      rng = step.nextState;
      // ~55% chance to fill each cell with a decorative tile
      if (step.value % 100 < 55) {
        const tileType = TETROMINO_TYPES[step.value % TETROMINO_TYPES.length];
        well[r][c] = tileType === 'I' ? 'Z' : tileType;
        filledCount++;
      }
    }

    // Guarantee at least 1 empty cell so the row is not pre-completed
    if (filledCount === WELL_COLS) {
      const step = nextRandomInt(rng);
      rng = step.nextState;
      const holeCol = step.value % WELL_COLS;
      well[r][holeCol] = 0;
    }

    // Guarantee at least 1 occupied cell so the garbage row is non-empty
    if (filledCount === 0) {
      const step = nextRandomInt(rng);
      rng = step.nextState;
      const fillCol = step.value % WELL_COLS;
      well[r][fillCol] = 'T';
    }
  }

  return { well, rngState: rng };
}
