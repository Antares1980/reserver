import {
  HIGH_SCORE_ALPHABET,
  PALETTES,
  SCREEN_HEIGHT,
  SCREEN_TILE_ROWS,
  SCREEN_WIDTH,
  TILE_SIZE,
  WELL_COLS,
  WELL_HIDDEN_ROWS,
  WELL_ROWS,
} from '../core/constants';
import { getHighScoresForConfig } from '../core/highScores';
import { getPieceCells } from '../core/tetrominoes';
import type { ActivePiece, GameState, PaletteMode, TetrominoType } from '../core/types';
import { drawText8x8 } from './font8x8';
import { drawTile8x8, getCellTileKey } from './tiles8x8';
import { renderTitleScreen } from './titleArt';

/**
 * Renders the complete `160x144` Game Boy screen for the given `GameState`.
 */
export function renderGameState(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  switch (state.screen) {
    case 'TITLE':
      renderTitleScreen(ctx, state.titleCursor, state.paletteMode);
      break;
    case 'MODE_SELECT':
      renderModeSelectScreen(ctx, state);
      break;
    case 'LEVEL_SELECT':
    case 'HIGH_SCORE_ENTRY':
      renderLevelSelectScreen(ctx, state);
      break;
    case 'PLAYING':
    case 'LINE_CLEAR':
    case 'PAUSED':
    case 'GAME_OVER':
    case 'VICTORY':
      renderGameplayScreen(ctx, state);
      break;
  }
}

/**
 * Renders the Game Type (`A-TYPE` / `B-TYPE`) and Music Type (`A-TYPE` / `B-TYPE` / `C-TYPE` / `OFF`) screen.
 */
function renderModeSelectScreen(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = PALETTES[state.paletteMode];
  ctx.fillStyle = p[0];
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  drawFramedWindow(ctx, 8, 8, 144, 52, state.paletteMode);
  drawText8x8(ctx, 'GAME TYPE', 44, 16, state.paletteMode, 3);

  const gameTypeCursorX = state.config.gameType === 'A' ? 16 : 88;
  drawText8x8(
    ctx,
    state.modeSelectFocus === 'GAME_TYPE' ? '▶' : ' ',
    gameTypeCursorX,
    36,
    state.paletteMode,
    3
  );
  drawText8x8(ctx, 'A-TYPE', 24, 36, state.paletteMode, 3);
  drawText8x8(ctx, 'B-TYPE', 96, 36, state.paletteMode, 3);

  drawFramedWindow(ctx, 8, 68, 144, 68, state.paletteMode);
  drawText8x8(ctx, 'MUSIC TYPE', 40, 76, state.paletteMode, 3);

  const musicOptions: readonly { type: GameState['config']['musicType']; label: string; x: number; y: number }[] = [
    { type: 'A', label: 'A-TYPE', x: 24, y: 96 },
    { type: 'B', label: 'B-TYPE', x: 96, y: 96 },
    { type: 'C', label: 'C-TYPE', x: 24, y: 114 },
    { type: 'OFF', label: 'OFF', x: 104, y: 114 },
  ];

  for (const opt of musicOptions) {
    if (state.config.musicType === opt.type) {
      drawText8x8(
        ctx,
        state.modeSelectFocus === 'MUSIC_TYPE' ? '▶' : '-',
        opt.x - 8,
        opt.y,
        state.paletteMode,
        3
      );
    }
    drawText8x8(ctx, opt.label, opt.x, opt.y, state.paletteMode, 3);
  }
}

/**
 * Renders the Level (0-9), Height (0-5 for B-TYPE), and Top-3 High Score screen.
 */
function renderLevelSelectScreen(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = PALETTES[state.paletteMode];
  ctx.fillStyle = p[0];
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  const headerTitle = state.config.gameType === 'A' ? 'A-TYPE' : 'B-TYPE';
  drawFramedWindow(ctx, 8, 4, 144, 72, state.paletteMode);
  drawText8x8(ctx, headerTitle, 16, 10, state.paletteMode, 3);

  // Level 0..9 selector
  drawText8x8(ctx, 'LEVEL', 24, 22, state.paletteMode, 3);
  for (let lvl = 0; lvl <= 9; lvl++) {
    const row = lvl < 5 ? 0 : 1;
    const col = lvl % 5;
    const lx = 18 + col * 14;
    const ly = 34 + row * 14;
    if (lvl === state.config.startLevel) {
      ctx.fillStyle = state.levelSelectFocus === 'LEVEL' ? p[3] : p[2];
      ctx.fillRect(lx - 2, ly - 2, 12, 12);
      drawText8x8(ctx, String(lvl), lx, ly, state.paletteMode, 0);
    } else {
      drawText8x8(ctx, String(lvl), lx, ly, state.paletteMode, 3);
    }
  }

  // Height 0..5 selector (only in B-TYPE)
  if (state.config.gameType === 'B') {
    drawText8x8(ctx, 'HEIGHT', 96, 22, state.paletteMode, 3);
    for (let h = 0; h <= 5; h++) {
      const row = h < 3 ? 0 : 1;
      const col = h % 3;
      const hx = 98 + col * 14;
      const hy = 34 + row * 14;
      if (h === state.config.startHeight) {
        ctx.fillStyle = state.levelSelectFocus === 'HEIGHT' ? p[3] : p[2];
        ctx.fillRect(hx - 2, hy - 2, 12, 12);
        drawText8x8(ctx, String(h), hx, hy, state.paletteMode, 0);
      } else {
        drawText8x8(ctx, String(h), hx, hy, state.paletteMode, 3);
      }
    }
  }

  // Top-3 High Score Table (y = 80..140)
  drawFramedWindow(ctx, 8, 80, 144, 60, state.paletteMode);
  drawText8x8(ctx, 'TOP-SCORE', 44, 86, state.paletteMode, 3);

  const scores = getHighScoresForConfig(state.highScores, state.config);
  for (let i = 0; i < 3; i++) {
    const sy = 98 + i * 12;
    drawText8x8(ctx, `${i + 1}.`, 16, sy, state.paletteMode, 3);

    if (state.screen === 'HIGH_SCORE_ENTRY' && state.enteringName && state.enteringName.rank === i) {
      const chars = state.enteringName.chars.map((idx) => HIGH_SCORE_ALPHABET[idx]).join('');
      drawText8x8(ctx, chars, 36, sy, state.paletteMode, 3);
      // Underline active character
      const cursorX = 36 + state.enteringName.cursorIndex * 8;
      ctx.fillStyle = p[3];
      ctx.fillRect(cursorX, sy + 7, 7, 1);
      const scoreText = String(state.score).padStart(6, '0');
      drawText8x8(ctx, scoreText, 92, sy, state.paletteMode, 3);
    } else if (scores[i]) {
      drawText8x8(ctx, scores[i].name.padEnd(6, ' '), 36, sy, state.paletteMode, 3);
      const scoreText = String(scores[i].score).padStart(6, '0');
      drawText8x8(ctx, scoreText, 92, sy, state.paletteMode, 3);
    } else {
      drawText8x8(ctx, '---', 36, sy, state.paletteMode, 2);
      drawText8x8(ctx, '000000', 92, sy, state.paletteMode, 2);
    }
  }
}

/**
 * Renders the active Gameplay screen (`160x144` pixels = `20x18` tiles of `8x8` px)
 * matching `tetris_gb/screenshot_01.png`..`screenshot_13.png`:
 * - Col 0 (x = 0..7): Dark outer strip
 * - Col 1 (x = 8..15): Left brick wall
 * - Cols 2..11 (x = 16..95): 10-column × 18-visible-row playable well
 * - Col 12 (x = 96..103): Right brick wall
 * - Cols 13..19 (x = 104..159): Right-hand HUD (`SCORE`, `LEVEL`, `LINES`, `NEXT` preview box)
 */
function renderGameplayScreen(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = PALETTES[state.paletteMode];

  // 1. Dark background for outer left strip (col 0) and right HUD background (cols 13..19)
  ctx.fillStyle = p[3];
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // 2. Lightest background for the 10x18 playable well (x = 16..95, y = 0..143)
  ctx.fillStyle = p[0];
  ctx.fillRect(16, 0, WELL_COLS * TILE_SIZE, SCREEN_HEIGHT);

  // 3. Brick walls on column 1 (x = 8) and column 12 (x = 96)
  for (let tileRow = 0; tileRow < SCREEN_TILE_ROWS; tileRow++) {
    const py = tileRow * TILE_SIZE;
    drawTile8x8(ctx, 'BRICK_WALL', 8, py, state.paletteMode);
    drawTile8x8(ctx, 'BRICK_WALL', 96, py, state.paletteMode);
  }

  // 4. Well contents (masked during PAUSED to prevent cheating)
  if (state.screen === 'PAUSED') {
    drawText8x8(ctx, 'PAUSE', 36, 64, state.paletteMode, 3);
  } else {
    renderWellContents(ctx, state);
  }

  // 5. Overlays for VICTORY and GAME_OVER (when curtain finishes)
  if (state.screen === 'GAME_OVER' && state.curtainPhase === 'DONE') {
    ctx.fillStyle = p[0];
    ctx.fillRect(16, 24, 80, 88);
    drawFramedWindow(ctx, 18, 28, 76, 36, state.paletteMode);
    drawText8x8(ctx, 'GAME', 40, 36, state.paletteMode, 3);
    drawText8x8(ctx, 'OVER', 40, 48, state.paletteMode, 3);

    drawText8x8(ctx, 'PLEASE', 32, 76, state.paletteMode, 3);
    drawText8x8(ctx, 'TRY', 44, 88, state.paletteMode, 3);
    drawText8x8(ctx, 'AGAIN♥', 32, 100, state.paletteMode, 3);
  } else if (state.screen === 'VICTORY') {
    ctx.fillStyle = p[0];
    ctx.fillRect(16, 24, 80, 96);
    drawFramedWindow(ctx, 18, 28, 76, 88, state.paletteMode);
    drawText8x8(ctx, 'TYPE-B', 32, 36, state.paletteMode, 3);
    drawText8x8(ctx, 'CLEAR!', 32, 48, state.paletteMode, 3);
    drawText8x8(ctx, 'CONGRATS', 24, 68, state.paletteMode, 3);
    drawText8x8(ctx, 'PRESS', 36, 88, state.paletteMode, 3);
    drawText8x8(ctx, 'START', 36, 100, state.paletteMode, 3);
  }

  // 6. Right-hand HUD (`SCORE`, `LEVEL`, `LINES`, `NEXT` preview box)
  renderRightHud(ctx, state);
}

function renderWellContents(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = PALETTES[state.paletteMode];
  const clearingSet = new Set(state.clearingRows);
  const blinkHide =
    state.screen === 'LINE_CLEAR' && Math.floor(state.animationTimer / 5) % 2 === 1;

  for (let wellRow = WELL_HIDDEN_ROWS; wellRow < WELL_ROWS; wellRow++) {
    const screenRow = wellRow - WELL_HIDDEN_ROWS;
    const py = screenRow * TILE_SIZE;

    if (clearingSet.has(wellRow)) {
      if (blinkHide) {
        ctx.fillStyle = p[0];
        ctx.fillRect(16, py, WELL_COLS * TILE_SIZE, TILE_SIZE);
        continue;
      }
    }

    for (let col = 0; col < WELL_COLS; col++) {
      const cell = state.well[wellRow][col];
      if (cell !== 0) {
        const px = 16 + col * TILE_SIZE;
        drawTile8x8(ctx, getCellTileKey(cell), px, py, state.paletteMode);
      }
    }
  }

  // Active falling piece
  if (state.activePiece && state.screen === 'PLAYING') {
    renderActivePiece(ctx, state.activePiece, state.paletteMode);
  }
}

/**
 * Renders the active falling piece inside the well, including connected end/middle bar tiles for `I`.
 */
function renderActivePiece(
  ctx: CanvasRenderingContext2D,
  piece: ActivePiece,
  paletteMode: PaletteMode
): void {
  const cells = getPieceCells(piece.type, piece.rotation, piece.row, piece.col);
  const isHorizontalI = piece.type === 'I' && (piece.rotation === 0 || piece.rotation === 2);
  const isVerticalI = piece.type === 'I' && (piece.rotation === 1 || piece.rotation === 3);

  cells.forEach(({ row, col }, idx) => {
    if (row < WELL_HIDDEN_ROWS || row >= WELL_ROWS) {
      return;
    }
    const px = 16 + col * TILE_SIZE;
    const py = (row - WELL_HIDDEN_ROWS) * TILE_SIZE;

    let tileKey: string = piece.type;
    if (isHorizontalI) {
      tileKey = idx === 0 ? 'I_HORIZ_LEFT' : idx === 3 ? 'I_HORIZ_RIGHT' : 'I_HORIZ_MID';
    } else if (isVerticalI) {
      tileKey = idx === 0 ? 'I_VERT_TOP' : idx === 3 ? 'I_VERT_BOTTOM' : 'I_VERT_MID';
    }

    drawTile8x8(ctx, tileKey, px, py, paletteMode);
  });
}

/**
 * Renders the Right-Hand HUD (`x = 104..159`, `y = 0..143`) matching `tetris_gb/screenshot_01.png`..`screenshot_13.png`.
 */
function renderRightHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  const p = PALETTES[state.paletteMode];

  // 1. SCORE Header Box (`x = 109..154`, `y = 3..18`)
  drawFramedWindow(ctx, 109, 3, 46, 15, state.paletteMode);
  drawText8x8(ctx, 'SCORE', 113, 7, state.paletteMode, 3);

  // Score value band (`x = 104..159`, `y = 20..35`)
  ctx.fillStyle = p[1];
  ctx.fillRect(104, 14, 56, 6);
  ctx.fillStyle = p[0];
  ctx.fillRect(104, 21, 56, 13);
  const scoreStr = String(state.score);
  const scoreX = Math.max(106, 152 - scoreStr.length * 8);
  drawText8x8(ctx, scoreStr, scoreX, 24, state.paletteMode, 3);

  // 2. LEVEL Box (`x = 109..154`, `y = 45..67`)
  drawFramedWindow(ctx, 109, 45, 46, 22, state.paletteMode);
  drawText8x8(ctx, 'LEVEL', 113, 48, state.paletteMode, 3);
  const levelStr = String(state.level);
  drawText8x8(ctx, levelStr, 145 - (levelStr.length - 1) * 8, 57, state.paletteMode, 3);

  // 3. LINES Box (`x = 109..154`, `y = 69..91`)
  drawFramedWindow(ctx, 109, 69, 46, 22, state.paletteMode);
  drawText8x8(ctx, 'LINES', 113, 72, state.paletteMode, 3);
  const linesStr = String(state.lines);
  drawText8x8(ctx, linesStr, 145 - (linesStr.length - 1) * 8, 81, state.paletteMode, 3);

  // 4. NEXT Piece Preview Box (`x = 115..156`, `y = 100..141`)
  drawFramedWindow(ctx, 115, 100, 42, 42, state.paletteMode);
  if (state.showNextPreview && state.screen !== 'PAUSED') {
    renderPreviewPiece(ctx, state.nextPiece, 120, 106, state.paletteMode);
  }
}

function renderPreviewPiece(
  ctx: CanvasRenderingContext2D,
  type: TetrominoType,
  baseX: number,
  baseY: number,
  paletteMode: PaletteMode
): void {
  const cells = getPieceCells(type, 0, 0, 0);
  cells.forEach(({ row, col }, idx) => {
    const px = baseX + col * TILE_SIZE;
    const py = baseY + row * TILE_SIZE;
    let tileKey: string = type;
    if (type === 'I') {
      tileKey = idx === 0 ? 'I_HORIZ_LEFT' : idx === 3 ? 'I_HORIZ_RIGHT' : 'I_HORIZ_MID';
    }
    drawTile8x8(ctx, tileKey, px, py, paletteMode);
  });
}

/**
 * Draws a classic Game Boy double-bordered rounded HUD box.
 */
function drawFramedWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  paletteMode: PaletteMode
): void {
  const p = PALETTES[paletteMode];
  ctx.fillStyle = p[0];
  ctx.fillRect(x + 1, y, w - 2, h);
  ctx.fillRect(x, y + 1, w, h - 2);

  ctx.fillStyle = p[2];
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

  ctx.fillStyle = p[3];
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

  ctx.fillStyle = p[0];
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
}
