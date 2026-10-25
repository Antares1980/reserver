import type { CellValue, PaletteMode } from '../core/types';
import { PALETTES } from '../core/constants';

/**
 * Each 8x8 tile is represented by 8 rows of 8 characters ('0', '1', '2', '3'),
 * mapping directly to the 4 Game Boy shades in `PALETTES`:
 * - '0': Lightest (`#ffff88` in screenshot palette)
 * - '1': Light-mid (`#b5a642`)
 * - '2': Dark-mid (`#7b7139`)
 * - '3': Darkest (`#393829`)
 *
 * All tile patterns below are modeled directly from `tetris_gb/screenshot_01.png`..`screenshot_13.png`.
 */
export type TileBitmap8x8 = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export const TILE_BITMAPS: Record<string, TileBitmap8x8> = {
  /**
   * Brick wall tile (columns 1 and 12 in `screenshot_01.png`..`screenshot_13.png`).
   */
  BRICK_WALL: [
    '33333333',
    '11131113',
    '22232223',
    '33333333',
    '13111311',
    '23222322',
    '33333333',
    '11131113',
  ],

  /**
   * T-piece tile (`screenshot_01.png`, `screenshot_02.png`):
   * Dark outer frame, light inner bevel, dark-mid bottom/right inner shadow, center dot.
   */
  T: [
    '33333333',
    '30000013',
    '30333213',
    '30312213',
    '30322213',
    '30222213',
    '31111113',
    '33333333',
  ],

  /**
   * L-piece tile (`screenshot_03.png`):
   * Solid dark-mid (`2`) interior with darkest (`3`) 1px border.
   */
  L: [
    '33333333',
    '32222223',
    '32222223',
    '32222223',
    '32222223',
    '32222223',
    '32222223',
    '33333333',
  ],

  /**
   * J-piece tile (`screenshot_04.png`, `screenshot_09.png`):
   * Darkest border, dark-mid ring, light inner square ring, dark center dot.
   */
  J: [
    '33333333',
    '32222223',
    '32000023',
    '32033023',
    '32033023',
    '32000023',
    '32222223',
    '33333333',
  ],

  /**
   * S-piece tile (`screenshot_09.png`, `screenshot_10.png`):
   * Matches the Game Boy dark-framed inner-ring tile style.
   */
  S: [
    '33333333',
    '32222223',
    '32000023',
    '32033023',
    '32033023',
    '32000023',
    '32222223',
    '33333333',
  ],

  /**
   * Z-piece tile (`screenshot_10.png`, `screenshot_12.png`):
   * Light-mid (`1`) interior with darkest (`3`) 2x2 center square.
   */
  Z: [
    '33333333',
    '31111113',
    '31111113',
    '31133113',
    '31133113',
    '31111113',
    '31111113',
    '33333333',
  ],

  /**
   * O-piece tile (`screenshot_12.png`):
   * Lightest (`0`) inner frame with darkest (`3`) 4x4 center square.
   */
  O: [
    '33333333',
    '30000003',
    '30333303',
    '30333303',
    '30333303',
    '30333303',
    '30000003',
    '33333333',
  ],

  /**
   * I-piece tiles (`screenshot_04.png`, `screenshot_05.png`, `screenshot_06.png`):
   * Connected speckled bar with horizontal & vertical end/middle caps, plus standalone locked tile.
   */
  I_SINGLE: [
    '33333333',
    '31121113',
    '31211213',
    '31112113',
    '31211123',
    '31121113',
    '31111213',
    '33333333',
  ],
  I_HORIZ_LEFT: [
    '33333333',
    '31121111',
    '31211211',
    '31112112',
    '31211121',
    '31121111',
    '31111211',
    '33333333',
  ],
  I_HORIZ_MID: [
    '33333333',
    '11121111',
    '11211211',
    '21112112',
    '11211121',
    '11121111',
    '11111211',
    '33333333',
  ],
  I_HORIZ_RIGHT: [
    '33333333',
    '11121113',
    '11211213',
    '21112113',
    '11211123',
    '11121113',
    '11111213',
    '33333333',
  ],
  I_VERT_TOP: [
    '33333333',
    '31121113',
    '31211213',
    '31112113',
    '31211123',
    '31121113',
    '31111213',
    '31211123',
  ],
  I_VERT_MID: [
    '31121113',
    '31211213',
    '31112113',
    '31211123',
    '31121113',
    '31111213',
    '31211123',
    '31121113',
  ],
  I_VERT_BOTTOM: [
    '31121113',
    '31211213',
    '31112113',
    '31211123',
    '31121113',
    '31111213',
    '31211123',
    '33333333',
  ],

  /**
   * Type B garbage / Game Over curtain tile.
   */
  GARBAGE: [
    '33333333',
    '31010103',
    '30101013',
    '31010103',
    '30101013',
    '31010103',
    '30101013',
    '33333333',
  ],
  CURTAIN: [
    '33333333',
    '30000013',
    '30333213',
    '30312213',
    '30322213',
    '30222213',
    '31111113',
    '33333333',
  ],
};

/**
 * Draws an 8x8 tile bitmap at pixel coordinates (x, y).
 */
export function drawTile8x8(
  ctx: CanvasRenderingContext2D,
  bitmapKey: string,
  x: number,
  y: number,
  paletteMode: PaletteMode
): void {
  const bitmap = TILE_BITMAPS[bitmapKey] ?? TILE_BITMAPS.T;
  const palette = PALETTES[paletteMode];

  for (let r = 0; r < 8; r++) {
    const rowStr = bitmap[r];
    for (let c = 0; c < 8; c++) {
      const shadeIdx = Number(rowStr[c]) as 0 | 1 | 2 | 3;
      ctx.fillStyle = palette[shadeIdx];
      ctx.fillRect(x + c, y + r, 1, 1);
    }
  }
}

/**
 * Resolves the appropriate tile key for a locked well cell.
 */
export function getCellTileKey(cell: Exclude<CellValue, 0>): string {
  if (cell === 'I') {
    return 'I_SINGLE';
  }
  return cell;
}
