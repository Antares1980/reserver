import type { ActivePiece, RotationState, TetrominoType } from './types';

export interface CellCoord {
  row: number;
  col: number;
}

/**
 * 1989 Game Boy Tetris 4x4 rotation matrices (Nintendo right-handed rotation system).
 * Each tetromino has 4 rotation states (0, 1, 2, 3), where 1 represents aclockwise 90° step.
 * Notice that in Game Boy Tetris:
 * - I, Z, S have 2 distinct orientations (0 === 2, 1 === 3)
 * - O has 1 distinct orientation (0 === 1 === 2 === 3)
 * - L, J, T have 4 distinct orientations
 * Spawn orientation (rotation 0) places the flat side up / horizontal bar on row 1 of the 4x4 box,
 * matching `tetris_gb/screenshot_01.png` (T piece), `screenshot_04.png` (I piece), etc.
 */
export const TETROMINO_MATRICES: Record<
  TetrominoType,
  readonly [
    readonly [number, number, number, number][],
    readonly [number, number, number, number][],
    readonly [number, number, number, number][],
    readonly [number, number, number, number][],
  ]
> = {
  T: [
    // 0: Spawn (down-pointing T, as in screenshot_01.png)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 1: 90° CW (left-pointing T)
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 2: 180° (up-pointing T, as in screenshot_02.png)
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 3: 270° CW (right-pointing T)
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],

  L: [
    // 0: Spawn (down-left L, as in NEXT preview of screenshot_01.png)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 1: 90° CW
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 2: 180° (up-right L, as locked in screenshot_03.png)
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 3: 270° CW
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],

  J: [
    // 0: Spawn (down-right J, as in NEXT preview of screenshot_03.png)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    // 1: 90° CW (as in screenshot_10.png)
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 2: 180°
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 3: 270° CW
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],

  I: [
    // 0: Horizontal bar (as in screenshot_04.png, screenshot_07.png)
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 1: Vertical bar (as in screenshot_05.png)
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    // 2: Horizontal bar
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 3: Vertical bar
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],

  O: [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],

  S: [
    // 0: Horizontal S (as in screenshot_10.png NEXT preview & screenshot_11.png)
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 1: Vertical S
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 2: Horizontal S
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    // 3: Vertical S
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  ],

  Z: [
    // 0: Horizontal Z (as in screenshot_11.png NEXT preview)
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // 1: Vertical Z
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    // 2: Horizontal Z
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    // 3: Vertical Z
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  ],
};

/**
 * Returns the next rotation state for Clockwise ('CW', A button) or Counter-Clockwise ('CCW', B button).
 */
export function getNextRotation(current: RotationState, direction: 'CW' | 'CCW'): RotationState {
  if (direction === 'CW') {
    return ((current + 1) % 4) as RotationState;
  }
  return ((current + 3) % 4) as RotationState;
}

/**
 * Returns the 4 occupied well (row, col) coordinates for a piece.
 */
export function getPieceCells(
  type: TetrominoType,
  rotation: RotationState,
  baseRow: number,
  baseCol: number
): CellCoord[] {
  const matrix = TETROMINO_MATRICES[type][rotation];
  const cells: CellCoord[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (matrix[r][c] === 1) {
        cells.push({ row: baseRow + r, col: baseCol + c });
      }
    }
  }
  return cells;
}

/**
 * Creates a newly spawned ActivePiece at the top center of the visible well.
 * Since row 1 of the 4x4 matrix contains the top bar of the piece, setting `row = 1`
 * places the top minoes at well row 2 (the first visible row on screen), centered at column 3.
 */
export function createSpawnPiece(type: TetrominoType): ActivePiece {
  return {
    type,
    rotation: 0,
    row: 1,
    col: 3,
    gravityTimer: 0,
    softDropCounter: 0,
    softDropFrameTimer: 0,
  };
}
