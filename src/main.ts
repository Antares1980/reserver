import { SoundEngine } from './audio/soundEngine';
import { createInitialGameState, stepGameFrame } from './core/engine';
import type { VirtualButton } from './core/types';
import { KeyboardController } from './input/keyboard';
import { renderGameState } from './render/canvasRenderer';

const FRAME_DURATION_MS = 1000 / 59.7275;

export function bootstrapApp(): void {
  const canvas = document.getElementById('gb-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  let state = createInitialGameState();
  const keyboard = new KeyboardController();
  const sound = new SoundEngine();

  // Palette toggle button
  const btnPalette = document.getElementById('btn-palette');
  if (btnPalette) {
    btnPalette.addEventListener('click', () => {
      state = {
        ...state,
        paletteMode: state.paletteMode === 'SCREENSHOT' ? 'DMG_CLASSIC' : 'SCREENSHOT',
      };
      btnPalette.textContent = `PALETTE: ${state.paletteMode === 'SCREENSHOT' ? 'SCREENSHOT' : 'DMG GREEN'}`;
    });
  }

  // Audio mute button
  const btnMute = document.getElementById('btn-mute');
  const toggleAudioMute = () => {
    const muted = sound.toggleMute();
    if (btnMute) {
      btnMute.textContent = `AUDIO: ${muted ? 'OFF' : 'ON'}`;
    }
  };
  if (btnMute) {
    btnMute.addEventListener('click', toggleAudioMute);
  }

  // Keyboard event listeners
  window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
      toggleAudioMute();
      return;
    }
    keyboard.setScreenContext(state.screen);
    keyboard.handleKeyDown(event);
  });

  window.addEventListener('keyup', (event) => {
    keyboard.handleKeyUp(event);
  });

  // On-screen Game Boy pad & button bindings
  const onScreenButtons = document.querySelectorAll<HTMLButtonElement>('[data-btn]');
  onScreenButtons.forEach((btnEl) => {
    const virtualBtn = btnEl.dataset.btn as VirtualButton | undefined;
    if (!virtualBtn) {
      return;
    }
    btnEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keyboard.pressVirtualButton(virtualBtn);
    });
    btnEl.addEventListener('pointerup', (e) => {
      e.preventDefault();
      keyboard.releaseVirtualButton(virtualBtn);
    });
    btnEl.addEventListener('pointerleave', () => {
      keyboard.releaseVirtualButton(virtualBtn);
    });
  });

  // Fixed-timestep 59.73 Hz Game Boy frame loop
  let lastTimestamp = performance.now();
  let accumulator = 0;

  const tick = (now: number) => {
    const delta = Math.min(100, now - lastTimestamp);
    lastTimestamp = now;
    accumulator += delta;

    while (accumulator >= FRAME_DURATION_MS) {
      accumulator -= FRAME_DURATION_MS;
      keyboard.setScreenContext(state.screen);
      const inputSnapshot = keyboard.consumeFrameSnapshot();
      const result = stepGameFrame(state, inputSnapshot);
      state = result.state;

      for (const cue of result.soundCues) {
        sound.playSoundCue(cue);
      }

      // Sync background music with current screen and MusicType
      const shouldPlayMusic =
        state.screen === 'MODE_SELECT' ||
        state.screen === 'PLAYING' ||
        state.screen === 'LINE_CLEAR';
      sound.setMusicType(state.config.musicType, shouldPlayMusic);
    }

    renderGameState(ctx, state);
    requestAnimationFrame(tick);
  };

  renderGameState(ctx, state);
  requestAnimationFrame(tick);
}

if (typeof document !== 'undefined') {
  bootstrapApp();
}
