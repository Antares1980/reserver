import {
  DAS_INITIAL_DELAY_FRAMES,
  DAS_REPEAT_INTERVAL_FRAMES,
  HIGH_SCORE_ALPHABET,
  LINE_CLEAR_ANIMATION_FRAMES,
  MAX_LINES_TYPE_A,
  MAX_START_HEIGHT,
  MAX_START_LEVEL,
  SOFT_DROP_FRAMES,
  TYPE_B_INITIAL_LINES,
  WELL_HIDDEN_ROWS,
  WELL_ROWS,
} from './constants';
import {
  formatInitialsFromChars,
  getHighScoreRank,
  insertHighScore,
  loadHighScores,
} from './highScores';
import { pickNextTetromino } from './randomizer';
import {
  calculateLineClearScore,
  calculateSoftDropBonus,
  calculateTypeALevel,
  calculateTypeBVictoryBonus,
  clampScore,
  getGravityFramesForLevel,
} from './scoring';
import { createSpawnPiece, getNextRotation } from './tetrominoes';
import type {
  GameState,
  InputSnapshot,
  MusicType,
  SoundCue,
  StepResult,
} from './types';
import {
  canPlacePiece,
   cloneWell,
  collapseRows,
  createEmptyWell,
  findCompletedRows,
  lockPiece,
  populateTypeBGarbage,
} from './well';

const MUSIC_CYCLE: readonly MusicType[] = ['A', 'B', 'C', 'OFF'];

/**
 * Creates the initial GameState at the Title Screen.
 */
export function createInitialGameState(seed = 0x19890614): GameState {
  const firstPick = pickNextTetromino(seed, 0);
  return {
    screen: 'TITLE',
    titleCursor: 0,
    modeSelectFocus: 'GAME_TYPE',
    levelSelectFocus: 'LEVEL',
    config: {
      gameType: 'A',
      musicType: 'A',
      startLevel: 0,
      startHeight: 0,
    },
    well: createEmptyWell(),
    activePiece: null,
    nextPiece: firstPick.piece,
    showNextPreview: true,
    score: 0,
    level: 0,
    lines: 0,
    totalLinesCleared: 0,
    clearingRows: [],
    animationTimer: 0,
    curtainRow: WELL_ROWS - 1,
    curtainPhase: 'FILL',
    das: {
      direction: null,
      framesHeld: 0,
    },
    highScores: loadHighScores(),
    enteringName: null,
    paletteMode: 'SCREENSHOT',
    rngState: firstPick.rngState,
    pieceHistory: firstPick.pieceHistory,
  };
}

/**
 * Initializes and starts a new Type A or Type B gameplay session from the current `state.config`.
 */
export function startGameplaySession(state: GameState): GameState {
  let rng = state.rngState;
  let well = createEmptyWell();

  if (state.config.gameType === 'B' && state.config.startHeight > 0) {
    const garbage = populateTypeBGarbage(state.config.startHeight, rng);
    well = garbage.well;
    rng = garbage.rngState;
  }

  const firstPick = pickNextTetromino(rng, state.pieceHistory);
  const secondPick = pickNextTetromino(firstPick.rngState, firstPick.pieceHistory);
  const activePiece = createSpawnPiece(firstPick.piece);

  return {
    ...state,
    screen: 'PLAYING',
    well,
    activePiece,
    nextPiece: secondPick.piece,
    score: 0,
    level: state.config.startLevel,
    lines: state.config.gameType === 'B' ? TYPE_B_INITIAL_LINES : 0,
    totalLinesCleared: 0,
    clearingRows: [],
    animationTimer: 0,
    curtainRow: WELL_ROWS - 1,
    curtainPhase: 'FILL',
    das: { direction: null, framesHeld: 0 },
    enteringName: null,
    rngState: secondPick.rngState,
    pieceHistory: secondPick.pieceHistory,
  };
}

/**
 * Advances the game state by a single 60 Hz frame given the current input snapshot.
 */
export function stepGameFrame(state: GameState, input: InputSnapshot): StepResult {
  const soundCues: SoundCue[] = [];
  const next: GameState = {
    ...state,
    config: { ...state.config },
    das: { ...state.das },
    well: cloneWell(state.well),
    activePiece: state.activePiece ? { ...state.activePiece } : null,
    clearingRows: [...state.clearingRows],
    enteringName: state.enteringName
      ? {
          chars: [...state.enteringName.chars] as [number, number, number],
          cursorIndex: state.enteringName.cursorIndex,
          rank: state.enteringName.rank,
        }
      : null,
  };

  switch (next.screen) {
    case 'TITLE':
      stepTitleScreen(next, input, soundCues);
      break;
    case 'MODE_SELECT':
      stepModeSelectScreen(next, input, soundCues);
      break;
    case 'LEVEL_SELECT':
      stepLevelSelectScreen(next, input, soundCues);
      break;
    case 'PLAYING':
      stepPlayingScreen(next, input, soundCues);
      break;
    case 'PAUSED':
      stepPausedScreen(next, input, soundCues);
      break;
    case 'LINE_CLEAR':
      stepLineClearScreen(next, soundCues);
      break;
    case 'VICTORY':
      stepVictoryScreen(next, input, soundCues);
      break;
    case 'GAME_OVER':
      stepGameOverScreen(next, input, soundCues);
      break;
    case 'HIGH_SCORE_ENTRY':
      stepHighScoreEntryScreen(next, input, soundCues);
      break;
  }

  return { state: next, soundCues };
}

function stepTitleScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (input.pressed.has('LEFT') || input.pressed.has('RIGHT') || input.pressed.has('SELECT')) {
    state.titleCursor = state.titleCursor === 0 ? 1 : 0;
    soundCues.push({ type: 'MENU_MOVE' });
  }
  if (input.pressed.has('START') || input.pressed.has('A')) {
    state.screen = 'MODE_SELECT';
    state.modeSelectFocus = 'GAME_TYPE';
    soundCues.push({ type: 'MENU_CONFIRM' });
  }
}

function stepModeSelectScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (input.pressed.has('B')) {
    state.screen = 'TITLE';
    soundCues.push({ type: 'MENU_MOVE' });
    return;
  }

  if (input.pressed.has('SELECT')) {
    state.modeSelectFocus =
      state.modeSelectFocus === 'GAME_TYPE' ? 'MUSIC_TYPE' : 'GAME_TYPE';
    soundCues.push({ type: 'MENU_MOVE' });
  }

  if (state.modeSelectFocus === 'GAME_TYPE') {
    if (input.pressed.has('LEFT') || input.pressed.has('RIGHT')) {
      state.config.gameType = state.config.gameType === 'A' ? 'B' : 'A';
      soundCues.push({ type: 'MENU_MOVE' });
    } else if (input.pressed.has('DOWN') || input.pressed.has('UP')) {
      state.modeSelectFocus = 'MUSIC_TYPE';
      soundCues.push({ type: 'MENU_MOVE' });
    }
  } else {
    const currentIdx = MUSIC_CYCLE.indexOf(state.config.musicType);
    if (input.pressed.has('LEFT')) {
      state.config.musicType =
        MUSIC_CYCLE[(currentIdx + MUSIC_CYCLE.length - 1) % MUSIC_CYCLE.length];
      soundCues.push({ type: 'MENU_MOVE' });
    } else if (input.pressed.has('RIGHT')) {
      state.config.musicType = MUSIC_CYCLE[(currentIdx + 1) % MUSIC_CYCLE.length];
      soundCues.push({ type: 'MENU_MOVE' });
    } else if (input.pressed.has('UP')) {
      state.modeSelectFocus = 'GAME_TYPE';
      soundCues.push({ type: 'MENU_MOVE' });
    } else if (input.pressed.has('DOWN')) {
      state.config.musicType = MUSIC_CYCLE[(currentIdx + 1) % MUSIC_CYCLE.length];
      soundCues.push({ type: 'MENU_MOVE' });
    }
  }

  if (input.pressed.has('START') || input.pressed.has('A')) {
    state.screen = 'LEVEL_SELECT';
    state.levelSelectFocus = 'LEVEL';
    soundCues.push({ type: 'MENU_CONFIRM' });
  }
}

function stepLevelSelectScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (input.pressed.has('B')) {
    if (state.config.gameType === 'B' && state.levelSelectFocus === 'HEIGHT') {
      state.levelSelectFocus = 'LEVEL';
      soundCues.push({ type: 'MENU_MOVE' });
    } else {
      state.screen = 'MODE_SELECT';
      soundCues.push({ type: 'MENU_MOVE' });
    }
    return;
  }

  if (state.config.gameType === 'B' && input.pressed.has('SELECT')) {
    state.levelSelectFocus = state.levelSelectFocus === 'LEVEL' ? 'HEIGHT' : 'LEVEL';
    soundCues.push({ type: 'MENU_MOVE' });
  }

  if (state.levelSelectFocus === 'LEVEL') {
    let lvl = state.config.startLevel;
    if (input.pressed.has('RIGHT')) {
      lvl = Math.min(MAX_START_LEVEL, lvl + 1);
    } else if (input.pressed.has('LEFT')) {
      lvl = Math.max(0, lvl - 1);
    } else if (input.pressed.has('DOWN')) {
      lvl = lvl + 5 <= MAX_START_LEVEL ? lvl + 5 : lvl;
    } else if (input.pressed.has('UP')) {
      lvl = lvl - 5 >= 0 ? lvl - 5 : lvl;
    }
    if (lvl !== state.config.startLevel) {
      state.config.startLevel = lvl;
      soundCues.push({ type: 'MENU_MOVE' });
    }
  } else {
    let h = state.config.startHeight;
    if (input.pressed.has('RIGHT')) {
      h = Math.min(MAX_START_HEIGHT, h + 1);
    } else if (input.pressed.has('LEFT')) {
      h = Math.max(0, h - 1);
    } else if (input.pressed.has('DOWN')) {
      h = h + 3 <= MAX_START_HEIGHT ? h + 3 : h;
    } else if (input.pressed.has('UP')) {
      h = h - 3 >= 0 ? h - 3 : h;
    }
    if (h !== state.config.startHeight) {
      state.config.startHeight = h;
      soundCues.push({ type: 'MENU_MOVE' });
    }
  }

  if (input.pressed.has('A') && state.config.gameType === 'B' && state.levelSelectFocus === 'LEVEL') {
    state.levelSelectFocus = 'HEIGHT';
    soundCues.push({ type: 'MENU_CONFIRM' });
    return;
  }

  if (input.pressed.has('START') || input.pressed.has('A')) {
    const started = startGameplaySession(state);
    Object.assign(state, started);
    soundCues.push({ type: 'MENU_CONFIRM' });
  }
}

function stepPausedScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (input.pressed.has('START')) {
    state.screen = 'PLAYING';
    soundCues.push({ type: 'PAUSE' });
  }
}

function stepPlayingScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (input.pressed.has('START')) {
    state.screen = 'PAUSED';
    soundCues.push({ type: 'PAUSE' });
    return;
  }

  if (input.pressed.has('SELECT')) {
    state.showNextPreview = !state.showNextPreview;
  }

  if (!state.activePiece) {
    spawnNextPieceOrGameOver(state, soundCues);
    return;
  }

  const piece = state.activePiece;

  // 1. Rotation (A = Clockwise, B = Counter-Clockwise)
  if (input.pressed.has('A')) {
    const targetRot = getNextRotation(piece.rotation, 'CW');
    if (canPlacePiece(state.well, piece.type, targetRot, piece.row, piece.col)) {
      piece.rotation = targetRot;
      soundCues.push({ type: 'PIECE_ROTATE' });
    }
  } else if (input.pressed.has('B')) {
    const targetRot = getNextRotation(piece.rotation, 'CCW');
    if (canPlacePiece(state.well, piece.type, targetRot, piece.row, piece.col)) {
      piece.rotation = targetRot;
      soundCues.push({ type: 'PIECE_ROTATE' });
    }
  }

  // 2. Horizontal movement & Delayed Auto-Shift (DAS: 23-frame initial delay, 9-frame repeat)
  let moveDeltaCol = 0;
  if (input.pressed.has('LEFT')) {
    state.das.direction = 'LEFT';
    state.das.framesHeld = 0;
    moveDeltaCol = -1;
  } else if (input.pressed.has('RIGHT')) {
    state.das.direction = 'RIGHT';
    state.das.framesHeld = 0;
    moveDeltaCol = 1;
  } else if (state.das.direction && input.held.has(state.das.direction)) {
    state.das.framesHeld++;
    if (
      state.das.framesHeld === DAS_INITIAL_DELAY_FRAMES ||
      (state.das.framesHeld > DAS_INITIAL_DELAY_FRAMES &&
        (state.das.framesHeld - DAS_INITIAL_DELAY_FRAMES) % DAS_REPEAT_INTERVAL_FRAMES === 0)
    ) {
      moveDeltaCol = state.das.direction === 'LEFT' ? -1 : 1;
    }
  } else {
    state.das.direction = null;
    state.das.framesHeld = 0;
  }

  if (moveDeltaCol !== 0) {
    if (canPlacePiece(state.well, piece.type, piece.rotation, piece.row, piece.col + moveDeltaCol)) {
      piece.col += moveDeltaCol;
      soundCues.push({ type: 'PIECE_MOVE' });
    }
  }

  // 3. Soft Drop (1 row every 3 frames while DOWN held) & Gravity
  const isDownHeld = input.held.has('DOWN') || input.pressed.has('DOWN');
  if (isDownHeld) {
    if (input.pressed.has('DOWN')) {
      piece.softDropFrameTimer = SOFT_DROP_FRAMES;
    } else {
      piece.softDropFrameTimer++;
    }

    if (piece.softDropFrameTimer >= SOFT_DROP_FRAMES) {
      piece.softDropFrameTimer = 0;
      piece.gravityTimer = 0;
      if (canPlacePiece(state.well, piece.type, piece.rotation, piece.row + 1, piece.col)) {
        piece.row++;
        piece.softDropCounter++;
      } else {
        handlePieceLock(state, soundCues);
      }
    }
  } else {
    // Releasing Down resets continuous soft-drop counter
    piece.softDropCounter = 0;
    piece.softDropFrameTimer = 0;

    piece.gravityTimer++;
    const gravityFrames = getGravityFramesForLevel(state.level);
    if (piece.gravityTimer >= gravityFrames) {
      piece.gravityTimer = 0;
      if (canPlacePiece(state.well, piece.type, piece.rotation, piece.row + 1, piece.col)) {
        piece.row++;
      } else {
        handlePieceLock(state, soundCues);
      }
    }
  }
}

function handlePieceLock(state: GameState, soundCues: SoundCue[]): void {
  const piece = state.activePiece;
  if (!piece) {
    return;
  }

  // Award continuous soft-drop points (+1 per soft-dropped row)
  const softDropBonus = calculateSoftDropBonus(piece.softDropCounter);
  state.score = clampScore(state.score + softDropBonus);

  // Lock piece into well
  state.well = lockPiece(state.well, piece);
  state.activePiece = null;

  // Check for completed rows
  const completedRows = findCompletedRows(state.well);
  if (completedRows.length > 0) {
    state.screen = 'LINE_CLEAR';
    state.clearingRows = completedRows;
    state.animationTimer = LINE_CLEAR_ANIMATION_FRAMES;
    soundCues.push({
      type: completedRows.length === 4 ? 'TETRIS_CLEAR' : 'LINE_CLEAR',
    });
  } else {
    soundCues.push({ type: 'PIECE_LOCK' });
    spawnNextPieceOrGameOver(state, soundCues);
  }
}

function stepLineClearScreen(state: GameState, soundCues: SoundCue[]): void {
  state.animationTimer--;
  if (state.animationTimer > 0) {
    return;
  }

  const clearedCount = state.clearingRows.length;
  state.well = collapseRows(state.well, state.clearingRows);
  state.clearingRows = [];

  const lineScore = calculateLineClearScore(clearedCount, state.level);
  state.score = clampScore(state.score + lineScore);
  state.totalLinesCleared += clearedCount;

  if (state.config.gameType === 'A') {
    state.lines = Math.min(MAX_LINES_TYPE_A, state.lines + clearedCount);
    const nextLevel = calculateTypeALevel(state.config.startLevel, state.totalLinesCleared);
    if (nextLevel > state.level) {
      state.level = nextLevel;
      soundCues.push({ type: 'LEVEL_UP' });
    }
    state.screen = 'PLAYING';
    spawnNextPieceOrGameOver(state, soundCues);
  } else {
    // Type B: Countdown from 25 to 0, clamping at 0 on over-clear
    state.lines = Math.max(0, state.lines - clearedCount);
    if (state.lines === 0) {
      const victoryBonus = calculateTypeBVictoryBonus(state.level, state.config.startHeight);
      state.score = clampScore(state.score + victoryBonus);
      state.screen = 'VICTORY';
      state.animationTimer = 90;
      soundCues.push({ type: 'VICTORY' });
    } else {
      state.screen = 'PLAYING';
      spawnNextPieceOrGameOver(state, soundCues);
    }
  }
}

function spawnNextPieceOrGameOver(state: GameState, soundCues: SoundCue[]): void {
  const spawned = createSpawnPiece(state.nextPiece);
  const pick = pickNextTetromino(state.rngState, state.pieceHistory);
  state.nextPiece = pick.piece;
  state.rngState = pick.rngState;
  state.pieceHistory = pick.pieceHistory;

  if (!canPlacePiece(state.well, spawned.type, spawned.rotation, spawned.row, spawned.col)) {
    state.activePiece = null;
    state.screen = 'GAME_OVER';
    state.curtainRow = WELL_ROWS - 1;
    state.curtainPhase = 'FILL';
    state.animationTimer = 0;
    soundCues.push({ type: 'GAME_OVER' });
    return;
  }

  state.activePiece = spawned;
}

function stepVictoryScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (state.animationTimer > 0) {
    state.animationTimer--;
  }
  if (input.pressed.has('START') || input.pressed.has('A')) {
    transitionPostGameToHighScoreOrLevelSelect(state, true, soundCues);
  }
}

function stepGameOverScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  state.animationTimer++;
  if (state.curtainPhase === 'FILL' && state.animationTimer % 2 === 0) {
    if (state.curtainRow >= WELL_HIDDEN_ROWS) {
      for (let c = 0; c < state.well[state.curtainRow].length; c++) {
        state.well[state.curtainRow][c] = 'CURTAIN';
      }
      state.curtainRow--;
    } else {
      state.curtainPhase = 'DONE';
    }
  }

  if (input.pressed.has('START') || input.pressed.has('A')) {
    // In Type A, Game Over checks high scores; in Type B, only Victory records a high score
    const eligibleForHighScore = state.config.gameType === 'A';
    transitionPostGameToHighScoreOrLevelSelect(state, eligibleForHighScore, soundCues);
  }
}

function transitionPostGameToHighScoreOrLevelSelect(
  state: GameState,
  eligibleForHighScore: boolean,
  soundCues: SoundCue[]
): void {
  if (eligibleForHighScore) {
    const rank = getHighScoreRank(state.highScores, state.config, state.score);
    if (rank !== -1) {
      state.screen = 'HIGH_SCORE_ENTRY';
      state.enteringName = {
        chars: [0, 0, 0],
        cursorIndex: 0,
        rank,
      };
      soundCues.push({ type: 'MENU_CONFIRM' });
      return;
    }
  }
  state.screen = 'LEVEL_SELECT';
  state.levelSelectFocus = 'LEVEL';
  soundCues.push({ type: 'MENU_CONFIRM' });
}

function stepHighScoreEntryScreen(
  state: GameState,
  input: InputSnapshot,
  soundCues: SoundCue[]
): void {
  if (!state.enteringName) {
    state.screen = 'LEVEL_SELECT';
    return;
  }

  const entry = state.enteringName;
  const alphaLen = HIGH_SCORE_ALPHABET.length;

  if (input.pressed.has('UP')) {
    entry.chars[entry.cursorIndex] = (entry.chars[entry.cursorIndex] + 1) % alphaLen;
    soundCues.push({ type: 'MENU_MOVE' });
  } else if (input.pressed.has('DOWN')) {
    entry.chars[entry.cursorIndex] =
      (entry.chars[entry.cursorIndex] + alphaLen - 1) % alphaLen;
    soundCues.push({ type: 'MENU_MOVE' });
  } else if (input.pressed.has('LEFT') || input.pressed.has('B')) {
    entry.cursorIndex = Math.max(0, entry.cursorIndex - 1);
    soundCues.push({ type: 'MENU_MOVE' });
  } else if (input.pressed.has('RIGHT')) {
    entry.cursorIndex = Math.min(2, entry.cursorIndex + 1);
    soundCues.push({ type: 'MENU_MOVE' });
  } else if (input.pressed.has('A')) {
    if (entry.cursorIndex < 2) {
      entry.cursorIndex++;
      soundCues.push({ type: 'MENU_MOVE' });
    } else {
      finalizeHighScoreEntry(state, soundCues);
    }
  } else if (input.pressed.has('START')) {
    finalizeHighScoreEntry(state, soundCues);
  }
}

function finalizeHighScoreEntry(state: GameState, soundCues: SoundCue[]): void {
  if (!state.enteringName) {
    return;
  }
  const name = formatInitialsFromChars(state.enteringName.chars);
  state.highScores = insertHighScore(state.highScores, state.config, {
    name,
    score: state.score,
  });
  state.enteringName = null;
  state.screen = 'LEVEL_SELECT';
  state.levelSelectFocus = 'LEVEL';
  soundCues.push({ type: 'MENU_CONFIRM' });
}
