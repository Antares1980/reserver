# Tasks: Game Boy Tetris (1989) Recreation

**Input**: Design documents from `/specs/001-tetris-gb-game/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/game-engine-contract.md`, `quickstart.md`

**Tests**: Automated unit and integration tests (Vitest) are REQUIRED per Constitution Principle III (`Automated Test Parity`).

**Organization**: Tasks are grouped by user story (`[US1]`, `[US2]`, `[US3]`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, TypeScript/Vite/Vitest configuration, and directory scaffolding

- [X] T001 Create project configuration and dependencies (`package.json`, `.gitignore`) at `package.json` and `.gitignore`
- [X] T002 [P] Configure TypeScript strict compiler options and Vite/Vitest test runner at `tsconfig.json` and `vite.config.ts`
- [X] T003 [P] Create HTML entry shell and retro Game Boy viewport stylesheet (`160×144` logical canvas with `image-rendering: pixelated`) at `index.html` and `src/style.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, constants, pixel-art 8×8 font, and 8×8 tile bitmaps required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define core enumerations (`TetrominoType: 'L' | 'J' | 'I' | 'O' | 'Z' | 'S' | 'T'`, `CellValue: 0 | TetrominoType | 'GARBAGE' | 'CURTAIN'`, `GameType: 'A' | 'B'`, `MusicType: 'A' | 'B' | 'C' | 'OFF'`, `ScreenState`, `VirtualButton`) and state interfaces (`ActivePiece`, `DASState`, `GameConfig`, `HighScoreEntry`, `GameState`, `InputSnapshot`, `SoundCue`, `StepResult`) at `src/core/types.ts`
- [X] T005 [P] Define 1989 Game Boy constants including gravity frame table (`[53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3]` for Levels `0`–`20`), DAS timings (`23` initial, `9` repeat), soft-drop interval (`3` frames), scoring multipliers (`[0, 40, 100, 300, 1200]`), Type B garbage heights (`[0, 3, 5, 8, 10, 12]` for Heights `0`–`5`), well dimensions (`20` rows × `10` cols, `2` hidden top rows), and 4-shade palettes (`#ffff88`, `#b5a642`, `#7b7139`, `#393829` and `#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f`) at `src/core/constants.ts`
- [X] T006 [P] Implement `8×8` pixel-art bitmap font renderer (`A–Z`, `0–9`, `-`, `.`, `:`, `™`, `©`, `♥`, `▶`, arrows) at `src/render/font8x8.ts`
- [X] T007 [P] Implement `8×8` pixel-art tile bitmaps matching `tetris_gb/screenshot_01.png`–`screenshot_13.png` for all 7 tetrominoes (`T` bevel, `L` solid dark, `J` dark with inner ring, `I` connected horizontal/vertical bar with speckled interior, `S` dark with inner ring, `Z` medium with center dot, `O` light with center square), brick wall tiles, and double-line HUD box borders at `src/render/tiles8x8.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Core 1989 Game Boy Tetris Gameplay & Visual HUD (Priority: P1) 🎯 MVP

**Goal**: Deliver the complete playable 1989 Game Boy Tetris well (`10×20`), 7 tetrominoes with Nintendo right-handed rotation, gravity, DAS, soft drop, line clear animation, scoring, pause masking, Game Over curtain, and right-hand HUD (`SCORE`, `LEVEL`, `LINES`, `NEXT`).

**Independent Test**: Start a gameplay session and verify piece spawning, movement, CW/CCW rotation, wall/stack collision rejection, soft-drop +1/row scoring, 1–4 line clear scoring (`40/100/300/1200 × (level + 1)`), HUD rendering, pause anti-cheat masking, and Game Over curtain when topping out.

### Tests for User Story 1

- [X] T008 [P] [US1] Create unit tests for all 7 tetromino 4×4 rotation states, spawn coordinates, and wall/floor/stack collision checks at `tests/unit/tetrominoes.test.ts`
- [X] T009 [P] [US1] Create unit tests for `20×10` well operations (piece locking, 1–4 completed row detection, row collapse shifting, and top-out detection) at `tests/unit/well.test.ts`
- [X] T010 [P] [US1] Create unit tests for Nintendo scoring formula (`40/100/300/1200 × (level + 1)`), continuous soft-drop points, and level gravity frame lookup at `tests/unit/scoring.test.ts`

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement 1989 Game Boy 4×4 tetromino rotation matrices (`L`, `J`, `I`, `O`, `Z`, `S`, `T`), right-handed CW/CCW rotation transitions, and spawn position calculation at `src/core/tetrominoes.ts`
- [X] T012 [P] [US1] Implement deterministic seeded PRNG and 1989 Game Boy 7-piece randomizer with consecutive-repeat reroll bias at `src/core/randomizer.ts`
- [X] T013 [US1] Implement `20×10` well grid helpers (`createEmptyWell`, `canPlacePiece`, `lockPiece`, `findCompletedRows`, `collapseRows`, `populateTypeBGarbage`) enforcing at least 1 empty cell (`0`) and 1 occupied cell per Type B garbage row at `src/core/well.ts`
- [X] T014 [US1] Implement Nintendo line-clear scoring (`40/100/300/1200 × (level + 1)`), soft-drop point calculation, Type A level transition threshold (`(startLevel + 1) * 10` lines then every 10 lines up to Level 20), and Type B victory bonus at `src/core/scoring.ts`
- [X] T015 [US1] Implement core 60 Hz gameplay state machine (`PLAYING`, `LINE_CLEAR`, `PAUSED`, `GAME_OVER`, `SELECT` preview toggle, DAS 23/9 frame auto-shift, 3-frame soft drop, and Game Over brick curtain animation) at `src/core/engine.ts`
- [X] T016 [US1] Implement gameplay screen and HUD Canvas renderer (`160×144` logical pixels: brick walls at cols `1` and `12`, 10×18 visible well at cols `2–11`, `SCORE`, `LEVEL`, `LINES`, `NEXT` preview box, `PAUSE` well mask, line-clear blink, and `GAME OVER / PLEASE TRY AGAIN ♥` curtain) at `src/render/canvasRenderer.ts`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Title Screen, Mode Selection, Type A, Type B & High Scores (Priority: P2)

**Goal**: Deliver the faithful 1989 Game Boy Title Screen (`screenshot_00.png`), `GAME TYPE` (`A-TYPE` / `B-TYPE`) & `MUSIC TYPE` (`A-TYPE` / `B-TYPE` / `C-TYPE` / `OFF`) menu, `LEVEL` (`0`–`9`) & `HEIGHT` (`0`–`5`) selection menu, Type B 25-line countdown to 0 with victory screen, and persistent Top-3 High Score table with 3-character initials entry.

**Independent Test**: Navigate from `TITLE` → `MODE_SELECT` → `LEVEL_SELECT` → play both Type A and Type B (verifying Height `0`–`5` garbage rows and 25-line countdown clamping at `0` on over-clear) → verify Top-3 High Score entry and `localStorage` persistence.

### Tests for User Story 2

- [X] T017 [P] [US2] Create unit tests for Top-3 High Score ranking, 3-character name entry (`AAA`–`ZZZ`), scoping by `${gameType}-L${startLevel}-H${startHeight}`, and `localStorage` persistence with memory fallback at `tests/unit/highScores.test.ts`
- [X] T018 [P] [US2] Create integration tests for full state transitions (`TITLE` → `MODE_SELECT` → `LEVEL_SELECT` → `PLAYING` → `LINE_CLEAR` → `VICTORY` / `GAME_OVER` → `HIGH_SCORE_ENTRY` → `LEVEL_SELECT`), Type A level progression, and Type B 25-line countdown clamping to `0` at `tests/integration/engineFlow.test.ts`

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement Top-3 High Score store (`loadHighScores`, `saveHighScores`, `qualifiesForHighScore`, `insertHighScore`) scoped per mode/level/height key (`0`..`999999` score cap) with `localStorage` and memory fallback at `src/core/highScores.ts`
- [X] T020 [P] [US2] Implement pixel-art Title Screen renderer (`TETRIS™` logo banner, St. Basil's Cathedral silhouette with moon and stars, `▶ 1 PLAYER   2 PLAYER`, and `©1989 Nintendo` matching `tetris_gb/screenshot_00.png`) at `src/render/titleArt.ts`
- [X] T021 [US2] Extend `stepGameFrame` in `src/core/engine.ts` with `TITLE`, `MODE_SELECT`, `LEVEL_SELECT`, `VICTORY`, and `HIGH_SCORE_ENTRY` screen navigation, Type B `25`-to-`0` line countdown (clamping to `0` on over-clear), and 3-initial high-score entry cursor logic at `src/core/engine.ts`
- [X] T022 [US2] Extend `renderGameState` in `src/render/canvasRenderer.ts` to render `TITLE`, `MODE_SELECT`, `LEVEL_SELECT` (including Top-3 High Score table), `VICTORY` celebration, and `HIGH_SCORE_ENTRY` screens at `src/render/canvasRenderer.ts`

**Checkpoint**: User Stories 1 AND 2 work independently and together

---

## Phase 5: User Story 3 - Dual Control Schemes & 8-Bit Chiptune Audio (Priority: P3)

**Goal**: Support both the `tetris_gb_reviews.xml` control scheme (`1` = Start, `Alt` = A, `Ctrl` = B, `Arrow Keys` = Direction) and standard PC controls (`Enter` = Start, `Z` = B, `X` / `Up` = A, `Arrow Keys` = Direction, `Shift`/`Backspace` = Select, `P`/`Escape` = Pause, `M` = Mute) with `preventDefault()`, plus procedural Web Audio 8-bit chiptune music (`A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF`) and SFX.

**Independent Test**: Verify both keymaps trigger identical `VirtualButton` snapshots, `preventDefault()` suppresses browser scrolling/focus loss on `Alt`/`Ctrl`/`Arrows`, and `SoundEngine` switches melodies for `A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF` and plays SFX cues.

### Tests for User Story 3

- [X] T023 [P] [US3] Create unit tests for dual keyboard mapping (`1`/`Alt`/`Ctrl`/`Arrows` and `Enter`/`Z`/`X`/`Up`/`Arrows`), edge-triggered `pressed` vs level-triggered `held` states, and `preventDefault()` invocation at `tests/unit/keyboard.test.ts`
- [X] T024 [P] [US3] Create integration tests for Canvas rendering across all `ScreenState` modes and headless Web Audio `SoundEngine` music/SFX state transitions at `tests/integration/rendererAndAudio.test.ts`

### Implementation for User Story 3

- [X] T025 [P] [US3] Implement dual keyboard input manager (`mapKeyToVirtualButton`, `KeyboardController` with `pressed`/`held` snapshot extraction, `preventDefault()` on game keys, and interactive on-screen button bindings) at `src/input/keyboard.ts`
- [X] T026 [P] [US3] Define 8-bit chiptune note sequences and tempos for `A-TYPE` (Korobeiniki), `B-TYPE` (Game Boy B-Type theme), `C-TYPE` (Bach French Suite No. 3 in B Minor Menuet), `VICTORY`, and `GAME_OVER` jingles at `src/audio/melodies.ts`
- [X] T027 [US3] Implement Web Audio API pulse/square/noise synthesizer (`SoundEngine`) supporting `setMusicType`, `playSoundCue` for all 11 `SoundCue` types, `toggleMute`, and headless fallback at `src/audio/soundEngine.ts`
- [X] T028 [US3] Implement main application bootstrap (`60 Hz` fixed-timestep `requestAnimationFrame` loop, Canvas mounting, keyboard + on-screen Game Boy controls bar, palette toggle, and audio mute status) at `src/main.ts`

**Checkpoint**: All user stories (`US1`, `US2`, `US3`) are independently functional and integrated

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, changelog, full test/typecheck/build verification

- [X] T029 [P] Create comprehensive `README.md` and `CHANGELOG.md` documenting gameplay modes, `tetris_gb` visual/control fidelity, dual keyboard shortcuts, and build/test commands at `README.md` and `CHANGELOG.md`
- [X] T030 Execute full validation gate (`npm test`, `npm run typecheck`, `npm run build`) per `specs/001-tetris-gb-game/quickstart.md` and verify 100% passing checks
