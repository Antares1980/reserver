import { PALETTES } from '../core/constants';
import type { PaletteMode } from '../core/types';
import { drawText8x8 } from './font8x8';

/**
 * Renders the 1989 Game Boy Tetris Title Screen (`160x144` pixels)
 * matching `tetris_gb/screenshot_00.png`:
 * - Top dark header band (`y = 0..7`)
 * - Framed `TETRIS™` metallic/striped logo (`y = 8..55`)
 * - Night sky with crescent/full moon, stars, and St. Basil's Cathedral onion domes (`y = 56..104`)
 * - Bottom light band (`y = 108..143`) with `▶ 1PLAYER  2PLAYER` and `©1989 Nintendo`
 */
export function renderTitleScreen(
  ctx: CanvasRenderingContext2D,
  cursor: 0 | 1,
  paletteMode: PaletteMode
): void {
  const p = PALETTES[paletteMode];

  // Background fill (darkest border bands)
  ctx.fillStyle = p[3];
  ctx.fillRect(0, 0, 160, 144);

  // 1. Top Logo Frame (y = 8..54, x = 4..155)
  ctx.fillStyle = p[0];
  ctx.fillRect(4, 8, 152, 46);
  ctx.fillStyle = p[1];
  ctx.fillRect(5, 9, 150, 44);
  ctx.fillStyle = p[3];
  ctx.fillRect(7, 11, 146, 40);
  ctx.fillStyle = p[0];
  ctx.fillRect(8, 12, 144, 38);

  // Draw the stylized large "TETRIS" block letters with 3-shade horizontal gradient
  drawStylizedTetrisLogo(ctx, p);

  // Small "TM" at top-right of logo box
  drawText8x8(ctx, 'TM', 134, 15, paletteMode, 3);

  // 2. St. Basil's Cathedral Night Scene (x = 8..151, y = 58..103)
  ctx.fillStyle = p[1];
  ctx.fillRect(8, 58, 144, 46);
  // Top horizon lines
  ctx.fillStyle = p[2];
  ctx.fillRect(8, 58, 144, 2);
  ctx.fillRect(8, 62, 144, 1);

  // Full Moon (x = 24..38, y = 66..80)
  ctx.fillStyle = p[0];
  ctx.fillRect(26, 66, 10, 14);
  ctx.fillRect(24, 68, 14, 10);
  ctx.fillRect(25, 67, 12, 12);

  // Twinkling Stars
  const stars: readonly [number, number, number][] = [
    [11, 77, 1],
    [43, 94, 1],
    [59, 69, 1],
    [75, 77, 2],
    [107, 69, 1],
    [131, 69, 2],
  ];
  for (const [sx, sy, sz] of stars) {
    ctx.fillRect(sx, sy, sz, sz);
  }

  // Distant Kremlin / Cathedral silhouettes (shade 2)
  ctx.fillStyle = p[2];
  ctx.fillRect(76, 98, 66, 6);
  ctx.fillRect(80, 94, 8, 6);
  ctx.fillRect(82, 92, 4, 2);
  ctx.fillRect(91, 92, 5, 8);
  ctx.fillRect(93, 88, 2, 4);

  // Main Onion Dome (x = 104..136, y = 60..103)
  drawOnionDome(ctx, 120, 103, p);
  // Right Smaller Spire (x = 138..150, y = 82..103)
  drawSmallSpire(ctx, 144, 103, p);

  // 3. Bottom Menu & Copyright Band (y = 108..143)
  ctx.fillStyle = p[0];
  ctx.fillRect(0, 108, 160, 36);

  // Cursor & 1PLAYER / 2PLAYER
  if (cursor === 0) {
    drawText8x8(ctx, '▶', 8, 113, paletteMode, 3);
  } else {
    drawText8x8(ctx, '▶', 88, 113, paletteMode, 3);
  }
  drawText8x8(ctx, '1PLAYER', 16, 113, paletteMode, 3);
  drawText8x8(ctx, '2PLAYER', 96, 113, paletteMode, 3);

  // Underlines under 1PLAYER and 2PLAYER
  ctx.fillStyle = p[2];
  ctx.fillRect(16, 121, 56, 1);
  ctx.fillRect(96, 121, 56, 1);

  // Footer: ©1989 Nintendo
  drawText8x8(ctx, '©1989 NINTENDO', 24, 130, paletteMode, 3);
}

function drawStylizedTetrisLogo(
  ctx: CanvasRenderingContext2D,
  p: readonly [string, string, string, string]
): void {
  // Helper to draw a shaded vertical pillar with top/middle/bottom Game Boy gradient
  const drawShadedRect = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = p[3];
    ctx.fillRect(x, y, w, h);
    if (w > 2 && h > 2) {
      for (let ry = 1; ry < h - 1; ry++) {
        const ratio = ry / h;
        ctx.fillStyle = ratio < 0.35 ? p[0] : ratio < 0.7 ? p[1] : p[2];
        ctx.fillRect(x + 1, y + ry, w - 2, 1);
      }
    }
  };

  // T (x = 14..36)
  drawShadedRect(14, 16, 22, 6);
  drawShadedRect(21, 21, 8, 25);

  // E (x = 39..57)
  drawShadedRect(39, 16, 8, 30);
  drawShadedRect(46, 16, 11, 6);
  drawShadedRect(46, 28, 9, 6);
  drawShadedRect(46, 40, 11, 6);

  // T (x = 60..82)
  drawShadedRect(60, 16, 22, 6);
  drawShadedRect(67, 21, 8, 25);

  // R (x = 85..105)
  drawShadedRect(85, 16, 8, 30);
  drawShadedRect(92, 16, 12, 6);
  drawShadedRect(98, 21, 6, 9);
  drawShadedRect(92, 28, 10, 6);
  drawShadedRect(95, 34, 9, 12);

  // I (x = 108..116)
  drawShadedRect(108, 16, 8, 30);

  // S (x = 119..136)
  drawShadedRect(119, 16, 16, 6);
  drawShadedRect(119, 21, 7, 9);
  drawShadedRect(119, 28, 16, 6);
  drawShadedRect(128, 33, 7, 8);
  drawShadedRect(119, 40, 16, 6);
}

function drawOnionDome(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baseY: number,
  p: readonly [string, string, string, string]
): void {
  // Spire top
  ctx.fillStyle = p[3];
  ctx.fillRect(centerX - 1, baseY - 43, 2, 12);
  ctx.fillStyle = p[0];
  ctx.fillRect(centerX - 2, baseY - 42, 4, 5);

  // Bulb layers from top to bottom
  const widths = [4, 8, 12, 16, 20, 24, 28, 30, 32, 32, 30, 28, 24, 20];
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    const y = baseY - 31 + i * 2;
    const left = centerX - Math.floor(w / 2);
    // Dark outline
    ctx.fillStyle = p[3];
    ctx.fillRect(left, y, w, 2);
    // Left highlight (shade 0)
    ctx.fillStyle = p[0];
    ctx.fillRect(left + 1, y, Math.max(2, Math.floor(w * 0.28)), 2);
    // Mid ribs (shade 1 & 2)
    ctx.fillStyle = p[1];
    ctx.fillRect(left + 1 + Math.floor(w * 0.28), y, Math.max(2, Math.floor(w * 0.32)), 2);
    ctx.fillStyle = p[2];
    ctx.fillRect(left + 1 + Math.floor(w * 0.6), y, Math.max(1, Math.floor(w * 0.3) - 1), 2);
  }

  // Base pedestal
  ctx.fillStyle = p[3];
  ctx.fillRect(centerX - 12, baseY - 3, 24, 3);
  ctx.fillStyle = p[0];
  ctx.fillRect(centerX - 10, baseY - 2, 20, 1);
}

function drawSmallSpire(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baseY: number,
  p: readonly [string, string, string, string]
): void {
  ctx.fillStyle = p[3];
  ctx.fillRect(centerX - 1, baseY - 20, 2, 10);
  ctx.fillStyle = p[0];
  ctx.fillRect(centerX - 2, baseY - 19, 4, 4);
  ctx.fillStyle = p[3];
  ctx.fillRect(centerX - 6, baseY - 6, 12, 6);
  ctx.fillStyle = p[0];
  ctx.fillRect(centerX - 4, baseY - 5, 4, 4);
  ctx.fillStyle = p[2];
  ctx.fillRect(centerX, baseY - 5, 4, 4);
}
