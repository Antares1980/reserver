export interface NoteStep {
  freq: number;
  durationMs: number;
}

const NOTE_FREQS: Record<string, number> = {
  REST: 0,
  G3: 196.0,
  'G#3': 207.65,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  G5: 783.99,
  A5: 880.0,
};

function n(note: string, beats: number, bpm = 148): NoteStep {
  const beatMs = (60 / bpm) * 1000;
  return {
    freq: NOTE_FREQS[note] ?? 0,
    durationMs: Math.round(beats * beatMs),
  };
}

/**
 * A-TYPE Music: Korobeiniki (1989 Game Boy Tetris iconic theme).
 */
export const MELODY_A_TYPE: readonly NoteStep[] = [
  n('E5', 1),
  n('B4', 0.5),
  n('C5', 0.5),
  n('D5', 1),
  n('C5', 0.5),
  n('B4', 0.5),
  n('A4', 1),
  n('A4', 0.5),
  n('C5', 0.5),
  n('E5', 1),
  n('D5', 0.5),
  n('C5', 0.5),
  n('B4', 1.5),
  n('C5', 0.5),
  n('D5', 1),
  n('E5', 1),
  n('C5', 1),
  n('A4', 1),
  n('A4', 1),
  n('REST', 1),
  n('D5', 1.5),
  n('F5', 0.5),
  n('A5', 1),
  n('G5', 0.5),
  n('F5', 0.5),
  n('E5', 1.5),
  n('C5', 0.5),
  n('E5', 1),
  n('D5', 0.5),
  n('C5', 0.5),
  n('B4', 1),
  n('B4', 0.5),
  n('C5', 0.5),
  n('D5', 1),
  n('E5', 1),
  n('C5', 1),
  n('A4', 1),
  n('A4', 1),
  n('REST', 1),
];

/**
 * B-TYPE Music: Hirokazu Tanaka's upbeat Game Boy B-Type theme.
 */
export const MELODY_B_TYPE: readonly NoteStep[] = [
  n('E5', 0.5, 156),
  n('C5', 0.5, 156),
  n('A4', 0.5, 156),
  n('C5', 0.5, 156),
  n('E5', 0.5, 156),
  n('A5', 1.0, 156),
  n('G5', 0.5, 156),
  n('E5', 0.5, 156),
  n('F5', 0.5, 156),
  n('D5', 0.5, 156),
  n('B4', 0.5, 156),
  n('D5', 0.5, 156),
  n('F5', 0.5, 156),
  n('E5', 1.0, 156),
  n('C5', 0.5, 156),
  n('A4', 1.0, 156),
  n('REST', 0.5, 156),
];

/**
 * C-TYPE Music: J.S. Bach - French Suite No. 3 in B Minor, BWV 814 (Menuet).
 */
export const MELODY_C_TYPE: readonly NoteStep[] = [
  n('F#4', 1, 132),
  n('B4', 1, 132),
  n('D5', 1, 132),
  n('C#5', 1.5, 132),
  n('D5', 0.5, 132),
  n('E5', 1, 132),
  n('D5', 1, 132),
  n('C#5', 1, 132),
  n('B4', 1, 132),
  n('C#5', 1, 132),
  n('A#4', 1, 132),
  n('F#4', 1, 132),
  n('B4', 1, 132),
  n('C#5', 1, 132),
  n('D5', 1, 132),
  n('E5', 1, 132),
  n('F#5', 1, 132),
  n('G5', 1, 132),
  n('E5', 1.5, 132),
  n('D5', 0.5, 132),
  n('C#5', 1, 132),
  n('B4', 2, 132),
  n('REST', 1, 132),
];
