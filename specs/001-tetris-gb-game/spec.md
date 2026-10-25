# Feature Specification: Game Boy Tetris (1989) Recreation

**Feature Branch**: `feat/001-tetris-gb-game`

**Created**: 2026-10-25

**Status**: Approved

**Input**: User description: "I want to create the tetris game based on the information in the folder tetris_gb"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core 1989 Game Boy Tetris Gameplay & Visual HUD (Priority: P1)

Players can play a complete game of 1989 Game Boy Tetris inside the classic 160×144 4-shade olive-green screen layout, placing falling tetrominoes inside a brick-bordered 10-column well while viewing live score, level, line count, and next-piece preview on the right-hand HUD.

**Why this priority**: This is the foundational playable loop captured in `tetris_gb/screenshot_01.png` through `tetris_gb/screenshot_13.png` and `tetris_gb/tetris_gb_meta.xml`. Without authentic piece movement, rotation, collision, line clearing, scoring, and the iconic Game Boy visual layout, the game cannot function.

**Independent Test**: Can be independently tested by starting a gameplay session, moving and rotating all 7 tetrominoes (`T`, `J`, `Z`, `O`, `S`, `L`, `I`), soft-dropping pieces to lock them, clearing 1 to 4 lines simultaneously, verifying HUD updates (`SCORE`, `LEVEL`, `LINES`, `NEXT`), pausing/resuming, and topping out the well to trigger the Game Over sequence.

**Acceptance Scenarios**:

1. **Given** an active gameplay session, **When** a tetromino spawns at the top of the 10-wide well, **Then** it renders with its distinct 1989 Game Boy tile pattern (e.g., beveled square for `T`, dotted connected bar for `I`, solid dark tile for `L`, inner-ring tile for `J`/`S`, center-dot tile for `Z`/`O`) and the upcoming piece is displayed inside the bottom-right `NEXT` preview frame.
2. **Given** a falling tetromino in the well, **When** the player presses Left or Right (single tap or held for auto-shift) or Rotate Clockwise (`A`) / Counter-Clockwise (`B`), **Then** the tetromino shifts horizontally or rotates using the 1989 Nintendo right-handed rotation orientations without overlapping the brick walls or locked tiles.
3. **Given** a falling tetromino, **When** the player holds Down to soft-drop the piece until it locks on the stack, **Then** the piece descends at accelerated soft-drop speed and awards 1 point per continuous soft-dropped cell upon locking (`SCORE` increments immediately as seen in `screenshot_03.png` and `screenshot_04.png`).
4. **Given** locked tiles in the well, **When** a newly locked tetromino completes 1, 2, 3, or 4 full horizontal rows of 10 tiles, **Then** the completed rows play the line-clear blink animation, disappear, shift upper rows down by the exact number of cleared rows, update `LINES`, and award `(40, 100, 300, or 1200) × (level + 1)` points to `SCORE`.
5. **Given** a stack of locked tiles reaching the top of the well, **When** the next spawning tetromino overlaps an existing locked tile, **Then** the classic upward/downward brick-curtain fill animation plays across the well and the `GAME OVER / PLEASE TRY AGAIN ♥` screen is displayed.

---

### User Story 2 - Title Screen, Mode Selection, Type A (Endless), Type B (25-Line Set-Clear) & High Scores (Priority: P2)

Players start at the iconic 1989 Game Boy Tetris title screen (`TETRIS™`, St. Basil's Cathedral silhouette with moon and stars, `▶ 1 PLAYER`, `©1989 Nintendo`), configure Game Type (`A-TYPE` or `B-TYPE`) and Music Type (`A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF`), select starting `LEVEL` (`0`–`9`) and (for `B-TYPE`) starting garbage `HEIGHT` (`0`–`5`), compete for victory or endless high scores, and record top-3 high scores.

**Why this priority**: Directly fulfills the mode structure documented in `tetris_gb/tetris_gb_meta.xml` ("featuring the same Type A endless and Type B set-clear modes") and the title screen in `tetris_gb/screenshot_00.png`.

**Independent Test**: Can be independently tested by navigating from the Title Screen → Game/Music Type Menu → Level (and Height) Selection Menu → playing both Type A (verifying level progression every 10 lines after the initial threshold) and Type B (verifying pre-filled garbage rows for Height 0–5 and 25-line countdown to 0 with victory screen) → entering initials in the Top-3 High Score table.

**Acceptance Scenarios**:

1. **Given** the application launches, **When** the Title Screen is displayed, **Then** it matches `tetris_gb/screenshot_00.png` (`TETRIS™` logo banner, St. Basil's Cathedral night scene, `▶ 1 PLAYER   2 PLAYER`, `©1989 Nintendo`) and pressing Start advances to the Game Type / Music Type selection screen.
2. **Given** the player selects `A-TYPE` and starting `LEVEL` (`0`–`9`), **When** gameplay begins, **Then** `LINES` starts at `0`, gravity matches the chosen starting level, and `LEVEL` increments once `(startLevel + 1) × 10` lines are cleared and every 10 lines thereafter (up to Level 20).
3. **Given** the player selects `B-TYPE`, starting `LEVEL` (`0`–`9`), and `HEIGHT` (`0`–`5`), **When** gameplay begins, **Then** the bottom of the well is pre-populated with `0, 3, 5, 8, 10, or 12` rows of randomized incomplete garbage tiles (at least 1 empty cell per row), `LINES` starts at `25`, and each cleared line decrements `LINES` toward `0`.
4. **Given** an active `B-TYPE` session with `LINES` near `0`, **When** the player clears the final required line(s) so `LINES` reaches `0`, **Then** gameplay stops, the Type B stage-clear victory sequence and height/level bonus calculation are displayed, and the player proceeds to high-score check.
5. **Given** a finished game in `A-TYPE` or completed `B-TYPE` whose final score ranks in the top 3 for that mode/level configuration, **When** the High Score table appears, **Then** the player can enter their name/initials and the high score is persisted across browser reloads.

---

### User Story 3 - Dual Control Schemes & 8-Bit Chiptune Audio (Priority: P3)

Players can control every screen and gameplay action using either the archival control scheme documented in `tetris_gb/tetris_gb_reviews.xml` (`1` = Start, `Alt` = A, `Ctrl` = B, `Arrow Keys` = Direction) or standard PC keyboard keys (`Enter` = Start, `Z`/`X`/`Up` = Rotate, `Arrow Keys` = Direction, `P`/`Escape` = Pause, `M` = Mute), accompanied by synthesized 8-bit chiptune music (`A-TYPE`, `B-TYPE`, `C-TYPE`, `OFF`) and sound effects.

**Why this priority**: Ensures immediate playability for both players following the `tetris_gb_reviews.xml` instructions and modern desktop players, while delivering the iconic Game Boy audio atmosphere.

**Independent Test**: Can be independently tested by playing through menus and gameplay using only `[1, Alt, Ctrl, Arrows]` and then using only `[Enter, Z, X, Up, Arrows]`, toggling pause and audio mute, and verifying distinct chiptune melodies for Music Types A, B, C, and silence for OFF.

**Acceptance Scenarios**:

1. **Given** any menu or active gameplay screen, **When** the player presses `1` or `Enter`, **Then** the `START` action triggers (advancing menus or toggling `PAUSE` during gameplay, which hides the well contents behind a pause screen to prevent cheating, just like original Game Boy Tetris).
2. **Given** an active falling tetromino, **When** the player presses `Alt`, `X`, or `Up Arrow`, **Then** the piece rotates 90° clockwise (`A` button); **When** the player presses `Ctrl` or `Z`, **Then** the piece rotates 90° counter-clockwise (`B` button).
3. **Given** the Game Type / Music Type screen, **When** the player highlights `A-TYPE`, `B-TYPE`, `C-TYPE`, or `OFF`, **Then** the corresponding 8-bit chiptune theme (or silence for `OFF`) previews immediately and plays during gameplay alongside 8-bit sound effects for movement, rotation, piece lock, line clear, Tetris (4-line clear), level up, and game over.

---

### Edge Cases

- **Wall and Stack Rotation Blocking**: When a tetromino is adjacent to the left/right brick wall or locked stack tiles and rotation would cause any of its 4 minoes to overlap an occupied cell or go out of bounds (`col < 0` or `col >= 10`), the rotation MUST be rejected cleanly with no position corruption (matching 1989 Game Boy Tetris behavior, which has no wall kicks).
- **Top-Row Spawn & Above-Well Locking**: The well has 20 logical rows (rows `0`–`19` from top to bottom, with rows `2`–`19` visible in the 18-row viewport). Pieces spawn at rows `2`–`3` (top of visible well) and if overlapping an existing locked tile on spawn, trigger immediate Game Over.
- **Type B Line Over-Clear**: If `LINES` remaining in Type B is `1`, `2`, or `3` and the player clears more lines than remaining (e.g., clearing a 4-line Tetris when `2` lines remain), `LINES` MUST clamp to `0` (never displaying negative values), award full points for the lines cleared, and trigger Type B victory.
- **Browser Focus & Modifier Key Suppression**: Pressing `Alt`, `Ctrl`, or `Arrow Keys` during gameplay MUST prevent default browser scrolling or menu-bar focus loss (`preventDefault()`) so the `tetris_gb_reviews.xml` control scheme works without interruption.
- **Pause Anti-Cheat Masking**: While paused during gameplay, the well tiles and `NEXT` piece preview MUST be hidden behind the `PAUSE` state so players cannot inspect the board while the timer is stopped, matching authentic Game Boy behavior.
- **Preview Toggle (`SELECT`)**: Pressing `Select` (`Shift` / `Backspace` / `Tab`) during gameplay toggles the `NEXT` piece preview visibility on/off, matching the original 1989 Game Boy mechanic.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the game at the native 1989 Game Boy logical resolution of `160×144` pixels (20×18 tiles of `8×8` pixels) scaled cleanly with crisp pixel-art rendering (`image-rendering: pixelated`) and the 4-shade olive-green DMG color palette (`#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f` or the exact screenshot palette `#ffff88`, `#b5a642`, `#7b7139`, `#393829` derived from `tetris_gb/screenshot_*.png`, with a palette toggle or faithful default).
- **FR-002**: System MUST implement the Title Screen matching `tetris_gb/screenshot_00.png` (`TETRIS™` logo, St. Basil's Cathedral silhouette with moon and stars, `▶ 1 PLAYER   2 PLAYER` cursor where `1 PLAYER` launches the 1-Player flow, and `©1989 Nintendo` footer).
- **FR-003**: System MUST implement the Game Type & Music Type configuration screen allowing selection between `A-TYPE` and `B-TYPE` game modes and `A-TYPE`, `B-TYPE`, `C-TYPE`, and `OFF` music options.
- **FR-004**: System MUST implement the Level Selection screen (`LEVEL 0`–`9`) for `A-TYPE` and the combined Level (`0`–`9`) + Height (`0`–`5`) Selection screen for `B-TYPE`, displaying the top-3 High Scores for the currently selected configuration.
- **FR-005**: System MUST implement a 10-column by 20-row logical well (18 visible rows bordered on left and right by 1-tile brick walls, matching `tetris_gb/screenshot_01.png`–`screenshot_13.png`) and the right-hand HUD displaying `SCORE` (up to 6 digits), `LEVEL`, `LINES`, and the bordered `NEXT` piece preview box.
- **FR-006**: System MUST implement all 7 tetrominoes (`L`, `J`, `I`, `O`, `Z`, `S`, `T`) with their exact 1989 Game Boy 4×4 rotation states (4 orientations for `L`, `J`, `T`; 2 orientations for `I`, `Z`, `S`; 1 orientation for `O`) and their distinct per-piece `8×8` pixel tile patterns matching `tetris_gb/screenshot_01.png`–`screenshot_13.png`:
  - `T`: Light tile with inner bevel square (`screenshot_01.png`)
  - `L`: Solid dark olive tile (`screenshot_03.png`)
  - `J`: Dark tile with light inner square ring (`screenshot_04.png`, `screenshot_09.png`)
  - `I`: Connected horizontal/vertical bar with speckled interior (`screenshot_04.png`, `screenshot_05.png`)
  - `S`: Dark tile with light inner square ring (`screenshot_09.png`, `screenshot_10.png`)
  - `Z`: Medium-dark tile with dark center dot (`screenshot_12.png`)
  - `O`: Light tile with dark center square (`screenshot_12.png`)
- **FR-007**: System MUST implement the 1989 Game Boy pseudo-random piece generator (7-piece selection with reroll bias against repeating the same piece consecutively) and display the next queued tetromino inside the `NEXT` preview box.
- **FR-008**: System MUST implement the 1989 Game Boy gravity speed curve across Levels `0` through `20` (measured in 60 Hz frames per row drop: Level 0 = 53, Level 1 = 49, Level 2 = 45, Level 3 = 41, Level 4 = 37, Level 5 = 33, Level 6 = 28, Level 7 = 22, Level 8 = 17, Level 9 = 11, Level 10 = 10, Level 11 = 9, Level 12 = 8, Level 13 = 7, Level 14 = 6, Level 15 = 6, Level 16 = 5, Level 17 = 5, Level 18 = 4, Level 19 = 4, Level 20 = 3 frames) and Delayed Auto-Shift (DAS: 23-frame initial delay, 9-frame repeat interval).
- **FR-009**: System MUST implement soft drop when Down is held (dropping 1 row every 3 frames) and award 1 point per continuous soft-dropped row when the piece locks onto the stack.
- **FR-010**: System MUST detect 1, 2, 3, or 4 completed rows upon piece lock, play a line-clear blink animation, collapse the cleared rows, and award `(40, 100, 300, or 1200) × (level + 1)` points to `SCORE`.
- **FR-011**: System MUST implement `A-TYPE` endless progression (advancing `LEVEL` after `(startLevel + 1) × 10` cleared lines and every 10 lines thereafter up to Level 20) and `B-TYPE` set-clear mode (starting with `0, 3, 5, 8, 10, or 12` garbage rows for Heights `0`–`5`, counting `LINES` down from `25` to `0`, and awarding victory when `0` is reached).
- **FR-012**: System MUST support both keyboard control schemes simultaneously:
  - **Archival `tetris_gb_reviews.xml` keys**: `1` = Start, `Alt` = A (Rotate CW / Confirm), `Ctrl` = B (Rotate CCW / Back), `Arrow Keys` = Left/Right/Up/Down.
  - **Standard PC keys**: `Enter` = Start, `X` or `Up Arrow` = A (Rotate CW), `Z` = B (Rotate CCW), `Arrow Keys` = Left/Right/Down, `Shift`/`Backspace` = Select (toggle `NEXT` preview), `P`/`Escape` = Pause, `M` = Mute audio.
- **FR-013**: System MUST synthesize 8-bit Game Boy chiptune audio for `A-TYPE` (Korobeiniki), `B-TYPE`, and `C-TYPE` (Bach French Suite) music tracks plus sound effects for cursor movement, piece shift, rotation, piece lock, line clear, 4-line Tetris clear, level up, victory, and game over.
- **FR-014**: System MUST persist Top-3 High Scores (name/initials and score) per mode, level, and height in local browser storage with in-memory fallback.

### Key Entities

- **Well (Board)**: 10 columns × 20 rows grid holding empty cells or locked tile IDs (`T`, `J`, `Z`, `O`, `S`, `L`, `I`, or `GARBAGE`).
- **ActivePiece**: Currently falling tetromino with `type`, `rotation` (`0`–`3`), `row`, `col`, `gravityTimer`, and `softDropCells` counter.
- **GameConfig**: Selected `gameType` (`A` or `B`), `musicType` (`A`, `B`, `C`, `OFF`), `startLevel` (`0`–`9`), and `startHeight` (`0`–`5`).
- **GameSessionState**: Current screen (`TITLE`, `MODE_SELECT`, `LEVEL_SELECT`, `PLAYING`, `PAUSED`, `LINE_CLEAR`, `GAME_OVER`, `VICTORY`, `HIGH_SCORE_ENTRY`), `score`, `level`, `lines`, `nextPiece`, and `showNextPreview`.
- **HighScoreEntry**: Player initials (up to 3 characters) and numeric score associated with a mode/level/height key.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can launch the game and reach active gameplay from the Title Screen in under 5 seconds using either `[1, Alt, Ctrl, Arrows]` or `[Enter, Z, X, Arrows]`.
- **SC-002**: Visual layout of the Title Screen and Gameplay Screen matches the 20×18 tile grid (`160×144` logical pixels) and distinct per-piece tile styles shown in `tetris_gb/screenshot_00.png` through `tetris_gb/screenshot_13.png` with 100% fidelity across all 7 tetromino types.
- **SC-003**: Core gameplay mechanics (piece movement, rotation, collision boundaries, soft-drop scoring, 1–4 line clear scoring, Type A level transitions, and Type B 25-line countdown with Heights 0–5) pass 100% of automated verification tests.
- **SC-004**: Game logic maintains a steady 60 FPS update rate with zero dropped input events or browser page scrolling when pressing `Alt`, `Ctrl`, or `Arrow Keys`.
- **SC-005**: High scores recorded in Type A and Type B persist across page reloads and accurately rank the top 3 scores per configuration.

## Assumptions

- **Single-Player Focus**: As confirmed during requirement discovery, the `2 PLAYER` label on the Title Screen is preserved for visual authenticity with `tetris_gb/screenshot_00.png` while gameplay focuses on the complete 1-Player `A-TYPE` and `B-TYPE` experience.
- **Palette Authenticity**: The default palette uses the exact 4 colors extracted from `tetris_gb/screenshot_00.png`–`screenshot_13.png` (`#ffff88`, `#b5a642`, `#7b7139`, `#393829`) so that rendered frames match the reference screenshots pixel-for-pixel, with an optional toggle for classic DMG pocket green.
- **Procedural Web Audio**: All chiptune music and sound effects are synthesized at runtime using square/pulse/noise channels so no external copyrighted audio assets are required.
