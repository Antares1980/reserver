export type TetrominoType = 'L' | 'J' | 'I' | 'O' | 'Z' | 'S' | 'T';

export type CellValue = 0 | TetrominoType | 'GARBAGE' | 'CURTAIN';

export type RotationState = 0 | 1 | 2 | 3;

export type GameType = 'A' | 'B';

export type MusicType = 'A' | 'B' | 'C' | 'OFF';

export type PaletteMode = 'SCREENSHOT' | 'DMG_CLASSIC';

export type ScreenState =
  | 'TITLE'
  | 'MODE_SELECT'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'LINE_CLEAR'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'HIGH_SCORE_ENTRY';

export type VirtualButton =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'A'
  | 'B'
  | 'START'
  | 'SELECT';

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationState;
  row: number;
  col: number;
  gravityTimer: number;
  softDropCounter: number;
  softDropFrameTimer: number;
}

export interface DASState {
  direction: 'LEFT' | 'RIGHT' | null;
  framesHeld: number;
}

export interface GameConfig {
  gameType: GameType;
  musicType: MusicType;
  startLevel: number;
  startHeight: number;
}

export interface HighScoreEntry {
  name: string;
  score: number;
}

export interface HighScoreEntryState {
  chars: [number, number, number];
  cursorIndex: number;
  rank: number;
}

export type ModeSelectFocus = 'GAME_TYPE' | 'MUSIC_TYPE';

export type LevelSelectFocus = 'LEVEL' | 'HEIGHT';

export interface GameState {
  screen: ScreenState;
  titleCursor: 0 | 1;
  modeSelectFocus: ModeSelectFocus;
  levelSelectFocus: LevelSelectFocus;
  config: GameConfig;
  well: CellValue[][];
  activePiece: ActivePiece | null;
  nextPiece: TetrominoType;
  showNextPreview: boolean;
  score: number;
  level: number;
  lines: number;
  totalLinesCleared: number;
  clearingRows: number[];
  animationTimer: number;
  curtainRow: number;
  curtainPhase: 'FILL' | 'DONE';
  das: DASState;
  highScores: Record<string, HighScoreEntry[]>;
  enteringName: HighScoreEntryState | null;
  paletteMode: PaletteMode;
  rngState: number;
  pieceHistory: number;
}

export interface InputSnapshot {
  pressed: Set<VirtualButton>;
  held: Set<VirtualButton>;
}

export type SoundCueType =
  | 'MENU_MOVE'
  | 'MENU_CONFIRM'
  | 'PIECE_MOVE'
  | 'PIECE_ROTATE'
  | 'PIECE_LOCK'
  | 'LINE_CLEAR'
  | 'TETRIS_CLEAR'
  | 'LEVEL_UP'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'PAUSE';

export interface SoundCue {
  type: SoundCueType;
}

export interface StepResult {
  state: GameState;
  soundCues: SoundCue[];
}
