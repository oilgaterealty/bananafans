/**
 * Oilgate AI - Premium Sound Design Engine
 * Powered by Web Audio API (100% Client-Side Procedural Synthesis)
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Sound state local tracking - Default is ENABLED (sound on) on first visit
let isSoundEnabled = true;
if (typeof localStorage !== 'undefined') {
  const stored = localStorage.getItem('oilgate_sound_enabled');
  if (stored !== null) {
    isSoundEnabled = stored === 'true';
  } else {
    // Force true by default
    localStorage.setItem('oilgate_sound_enabled', 'true');
  }
}

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled = enabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('oilgate_sound_enabled', String(enabled));
  }
  // Try to resume if enabling
  if (enabled) {
    unlockAudio();
  }
}

export function getSoundEnabled(): boolean {
  return isSoundEnabled;
}

// Soft Audio Unlock Attempt
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      // Fail silently, modern browsers block audio without a user gesture
    });
  }
}

// Global window event listeners to eagerly unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'suspended') {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    }
  };
  window.addEventListener('click', handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { capture: true, passive: true });
}

interface ToneParams {
  freqs: number[];
  type?: OscillatorType;
  duration: number;
  gainStart: number;
  gainEnd?: number;
  detune?: number;
  timing?: number;
  pitchSweep?: { endFreq: number; duration: number } | null;
}

// Helper core function to synthesize beautiful tones
function playTone({
  freqs,
  type = 'sine',
  duration,
  gainStart,
  gainEnd = 0.0001,
  detune = 0,
  timing = 0,
  pitchSweep = null
}: ToneParams) {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqs[0], now + timing);
    
    if (pitchSweep) {
      osc.frequency.setValueAtTime(freqs[0], now + timing);
      osc.frequency.exponentialRampToValueAtTime(pitchSweep.endFreq, now + timing + pitchSweep.duration);
    }
    
    if (detune) {
      osc.detune.setValueAtTime(detune, now + timing);
    }

    gainNode.gain.setValueAtTime(gainStart, now + timing);
    gainNode.gain.exponentialRampToValueAtTime(gainEnd, now + timing + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + timing);
    osc.stop(now + timing + duration + 0.05);
  } catch (err) {
    // Fail silently to respect UX guidelines
    console.debug('Audio playback error details:', err);
  }
}

// -------------------------------------------------------------
// INDIVIDUAL UX HANDLERS WITH SPAM PROTECTION COOLDOWNS
// -------------------------------------------------------------

// 1. Live Telemeter Counter Hover Sound
let lastCounterHover = 0;
export function playCounterHover() {
  const now = Date.now();
  if (now - lastCounterHover < 900) return; // Cooldown to prevent spam
  lastCounterHover = now;

  playTone({
    freqs: [1300],
    type: 'sine',
    duration: 0.07,
    gainStart: 0.015,
    pitchSweep: { endFreq: 750, duration: 0.07 }
  });
}

// 2. Telemetry Counter Increment Sound
export function playCounterIncrement() {
  // Rapid premium micro clicks on live scale roll
  playTone({
    freqs: [620],
    type: 'sine',
    duration: 0.03,
    gainStart: 0.02,
    pitchSweep: { endFreq: 220, duration: 0.03 }
  });
  playTone({
    freqs: [680],
    type: 'sine',
    duration: 0.03,
    gainStart: 0.015,
    pitchSweep: { endFreq: 270, duration: 0.03 },
    timing: 0.03
  });
}

// 3. CTA Action Call Hover Sound
let lastCtaHover = 0;
export function playCtaHover() {
  const now = Date.now();
  if (now - lastCtaHover < 500) return;
  lastCtaHover = now;

  // Premium glassy light brush
  playTone({
    freqs: [880],
    type: 'sine',
    duration: 0.16,
    gainStart: 0.015,
    pitchSweep: { endFreq: 1760, duration: 0.16 }
  });
}

// 4 & 5. Combined CTA Click / Modal Cinematic Open sound
export function playModalOpen() {
  // Low ambient whoosh
  playTone({
    freqs: [170],
    type: 'sine',
    duration: 0.35,
    gainStart: 0.06,
    pitchSweep: { endFreq: 80, duration: 0.35 }
  });
  // Airy premium chime overlay
  playTone({
    freqs: [440],
    type: 'sine',
    duration: 0.22,
    gainStart: 0.015,
    pitchSweep: { endFreq: 820, duration: 0.2 },
    timing: 0.02
  });
}

// 6. Modal Dismiss Close sound
export function playModalClose() {
  playTone({
    freqs: [330],
    type: 'sine',
    duration: 0.14,
    gainStart: 0.025,
    pitchSweep: { endFreq: 150, duration: 0.14 }
  });
}

// 7. Submit - Fields validation success feedback
export function playSubmitSuccess() {
  // Upward premium tech arpeggio
  playTone({
    freqs: [523.25], // C5
    type: 'sine',
    duration: 0.14,
    gainStart: 0.04
  });
  playTone({
    freqs: [783.99], // G5
    type: 'sine',
    duration: 0.22,
    gainStart: 0.035,
    timing: 0.07
  });
}

// 7. Submit - Fields validation failed feedback (soft low buzz)
export function playSubmitFailure() {
  playTone({
    freqs: [110], // A2
    type: 'triangle',
    duration: 0.18,
    gainStart: 0.04,
    pitchSweep: { endFreq: 80, duration: 0.18 }
  });
}

// 8. Error Fields shake warning (single trigger warning per action)
let lastErrorShake = 0;
export function playErrorShake() {
  const now = Date.now();
  if (now - lastErrorShake < 600) return;
  lastErrorShake = now;

  playTone({
    freqs: [130],
    type: 'sine',
    duration: 0.22,
    gainStart: 0.04,
    pitchSweep: { endFreq: 75, duration: 0.2 }
  });
}

// 9. Success cinemactics layout reveal sound
export function playSuccessChime() {
  // Elegant digital Major chord scale
  playTone({ freqs: [392.00], type: 'sine', duration: 0.22, gainStart: 0.02 }); // G4
  playTone({ freqs: [493.88], type: 'sine', duration: 0.22, gainStart: 0.018, timing: 0.05 }); // B4
  playTone({ freqs: [587.33], type: 'sine', duration: 0.22, gainStart: 0.018, timing: 0.1 }); // D5
  playTone({ freqs: [987.77], type: 'sine', duration: 0.32, gainStart: 0.024, timing: 0.15 }); // B5
}

// 10. Bottom-left trademark drop logo hover sound
let lastLogoHover = 0;
export function playLogoHover() {
  const now = Date.now();
  if (now - lastLogoHover < 900) return;
  lastLogoHover = now;

  playTone({
    freqs: [190],
    type: 'sine',
    duration: 0.15,
    gainStart: 0.025,
    pitchSweep: { endFreq: 100, duration: 0.15 }
  });
}

// 11. Bottom-left trademark logo CLICK 1: Glitch-pulse sound matching layout shake
export function playLogoGlitch() {
  if (!isSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const now = ctx.currentTime;
    // Generate 3 rapid randomized triangle/saw bursts overlapping to sound like a digital glitch
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = i % 2 === 0 ? 'triangle' : 'sawtooth';
      const startFreq = 100 + Math.random() * 110;
      osc.frequency.setValueAtTime(startFreq, now + (i * 0.04));
      osc.frequency.linearRampToValueAtTime(startFreq * 1.6, now + (i * 0.04) + 0.03);

      gainNode.gain.setValueAtTime(0.015, now + (i * 0.04));
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (i * 0.04) + 0.035);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + (i * 0.04));
      osc.stop(now + (i * 0.04) + 0.045);
    }
  } catch (err) {
    // Fail silently
  }
}

// 12. Bottom-left trademark logo CLICK 2: Portal clean warp sound
export function playLogoRedirect() {
  playTone({
    freqs: [220],
    type: 'sine',
    duration: 0.28,
    gainStart: 0.025,
    pitchSweep: { endFreq: 880, duration: 0.26 }
  });
  playTone({
    freqs: [440],
    type: 'sine',
    duration: 0.28,
    gainStart: 0.025,
    pitchSweep: { endFreq: 1100, duration: 0.26 },
    timing: 0.04
  });
}

// 13. Temptation gauge scan sound (plays soft scan swoop on reload)
export function playGaugeScan() {
  playTone({
    freqs: [190],
    type: 'sine',
    duration: 1.3,
    gainStart: 0.015,
    pitchSweep: { endFreq: 360, duration: 1.3 }
  });
}
