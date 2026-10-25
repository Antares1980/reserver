import type { MusicType, SoundCue, SoundCueType } from '../core/types';
import { MELODY_A_TYPE, MELODY_B_TYPE, MELODY_C_TYPE, type NoteStep } from './melodies';

/**
 * Procedural 8-bit Game Boy chiptune synthesizer using Web Audio API.
 * Gracefully degrades to state-tracking no-ops in headless/Node test environments.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private currentMusic: MusicType = 'A';
  private musicPlaying = false;
  private noteIndex = 0;
  private musicTimerId: ReturnType<typeof setTimeout> | null = null;
  private cueHistory: SoundCueType[] = [];

  public isMuted(): boolean {
    return this.muted;
  }

  public getCurrentMusic(): MusicType {
    return this.currentMusic;
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying && !this.muted && this.currentMusic !== 'OFF';
  }

  public getPlayedCues(): readonly SoundCueType[] {
    return this.cueHistory;
  }

  public clearPlayedCues(): void {
    this.cueHistory = [];
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusicLoop();
    } else if (this.musicPlaying && this.currentMusic !== 'OFF') {
      this.startMusicLoop();
    }
    return this.muted;
  }

  public setMusicType(music: MusicType, active: boolean): void {
    const changed = this.currentMusic !== music || this.musicPlaying !== active;
    this.currentMusic = music;
    this.musicPlaying = active;

    if (!changed) {
      return;
    }

    this.stopMusicLoop();
    this.noteIndex = 0;
    if (active && !this.muted && music !== 'OFF') {
      this.startMusicLoop();
    }
  }

  public playSoundCue(cue: SoundCue): void {
    this.cueHistory.push(cue.type);
    if (this.muted) {
      return;
    }

    switch (cue.type) {
      case 'MENU_MOVE':
      case 'PIECE_MOVE':
        this.playTone(620, 0.03, 'square', 0.06);
        break;
      case 'MENU_CONFIRM':
      case 'PIECE_ROTATE':
        this.playTone(880, 0.045, 'square', 0.07);
        break;
      case 'PIECE_LOCK':
        this.playTone(190, 0.06, 'triangle', 0.09);
        break;
      case 'LINE_CLEAR':
        this.playArpeggio([523.25, 659.25, 783.99, 1046.5], 0.06);
        break;
      case 'TETRIS_CLEAR':
        this.playArpeggio([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98], 0.065);
        break;
      case 'LEVEL_UP':
        this.playArpeggio([440, 554.37, 659.25, 880], 0.07);
        break;
      case 'VICTORY':
        this.playArpeggio([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5], 0.09);
        break;
      case 'GAME_OVER':
        this.playArpeggio([440, 415.3, 392.0, 349.23, 293.66], 0.11);
        break;
      case 'PAUSE':
        this.playArpeggio([880, 659.25, 880], 0.05);
        break;
    }
  }

  public dispose(): void {
    this.stopMusicLoop();
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }
  }

  private ensureAudioContext(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => undefined);
      }
      return this.ctx;
    }
    if (typeof globalThis !== 'undefined' && 'AudioContext' in globalThis) {
      try {
        this.ctx = new globalThis.AudioContext();
        return this.ctx;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getMelodyForType(music: MusicType): readonly NoteStep[] {
    switch (music) {
      case 'A':
        return MELODY_A_TYPE;
      case 'B':
        return MELODY_B_TYPE;
      case 'C':
        return MELODY_C_TYPE;
      case 'OFF':
        return [];
    }
  }

  private startMusicLoop(): void {
    this.stopMusicLoop();
    const melody = this.getMelodyForType(this.currentMusic);
    if (melody.length === 0) {
      return;
    }

    const stepNote = () => {
      if (!this.musicPlaying || this.muted || this.currentMusic === 'OFF') {
        return;
      }
      const activeMelody = this.getMelodyForType(this.currentMusic);
      if (activeMelody.length === 0) {
        return;
      }
      const step = activeMelody[this.noteIndex % activeMelody.length];
      this.noteIndex = (this.noteIndex + 1) % activeMelody.length;

      if (step.freq > 0) {
        this.playTone(step.freq, (step.durationMs * 0.82) / 1000, 'square', 0.045);
      }
      this.musicTimerId = setTimeout(stepNote, step.durationMs);
    };

    stepNote();
  }

  private stopMusicLoop(): void {
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  private playTone(
    freq: number,
    durationSec: number,
    wave: OscillatorType,
    volume: number
  ): void {
    const audioCtx = this.ensureAudioContext();
    if (!audioCtx) {
      return;
    }

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + durationSec);
    } catch {
      // Ignore audio errors when autoplay is not yet unlocked
    }
  }

  private playArpeggio(freqs: readonly number[], stepDurationSec: number): void {
    const audioCtx = this.ensureAudioContext();
    if (!audioCtx) {
      return;
    }
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        if (!this.muted) {
          this.playTone(f, stepDurationSec, 'square', 0.065);
        }
      }, Math.round(idx * stepDurationSec * 1000));
    });
  }
}
