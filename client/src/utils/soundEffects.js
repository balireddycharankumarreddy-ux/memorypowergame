/**
 * Sound Effects for Memory Card Game
 * Uses Web Audio API - no external dependencies needed
 */

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  _playTone(frequency, duration, type = 'sine', volume = 0.3, detune = 0) {
    if (!this.enabled || !this.audioContext) return;
    this.ensureContext();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    if (detune) oscillator.detune.setValueAtTime(detune, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  _playNotes(notes, type = 'sine', volume = 0.25) {
    if (!this.enabled || !this.audioContext) return;
    this.ensureContext();

    notes.forEach(({ freq, time, duration }) => {
      setTimeout(() => {
        this._playTone(freq, duration, type, volume);
      }, time);
    });
  }

  // Card flip sound - quick rising click
  flipCard() {
    this._playTone(800, 0.08, 'sine', 0.2);
    setTimeout(() => this._playTone(1200, 0.06, 'sine', 0.15), 30);
  }

  // Match found - happy ascending chime
  matchFound() {
    this._playNotes([
      { freq: 523, time: 0, duration: 0.15 },    // C5
      { freq: 659, time: 80, duration: 0.15 },   // E5
      { freq: 784, time: 160, duration: 0.2 },   // G5
      { freq: 1047, time: 240, duration: 0.3 },  // C6
    ]);
  }

  // No match - soft descending tone
  noMatch() {
    this._playNotes([
      { freq: 400, time: 0, duration: 0.15, type: 'triangle' },
      { freq: 300, time: 100, duration: 0.2, type: 'triangle' },
    ], 'triangle', 0.2);
  }

  // Game won - victory fanfare
  gameWon() {
    this._playNotes([
      { freq: 523, time: 0, duration: 0.2 },      // C5
      { freq: 587, time: 150, duration: 0.2 },    // D5
      { freq: 659, time: 300, duration: 0.2 },    // E5
      { freq: 698, time: 450, duration: 0.2 },    // F5
      { freq: 784, time: 600, duration: 0.2 },    // G5
      { freq: 880, time: 800, duration: 0.2 },    // A5
      { freq: 988, time: 1000, duration: 0.2 },   // B5
      { freq: 1047, time: 1200, duration: 0.5 },  // C6
    ], 'sine', 0.3);

    // Add a sparkle layer
    setTimeout(() => {
      this._playNotes([
        { freq: 1319, time: 0, duration: 0.3 },
        { freq: 1568, time: 200, duration: 0.3 },
        { freq: 2093, time: 400, duration: 0.5 },
      ], 'sine', 0.15);
    }, 1400);
  }

  // Button click
  buttonClick() {
    this._playTone(600, 0.05, 'sine', 0.1);
  }

  // Score saved
  scoreSaved() {
    this._playNotes([
      { freq: 880, time: 0, duration: 0.1 },
      { freq: 1109, time: 80, duration: 0.1 },
      { freq: 1319, time: 160, duration: 0.2 },
    ], 'sine', 0.2);
  }

  // Difficulty change
  difficultyChange() {
    this._playTone(500, 0.1, 'triangle', 0.15);
    setTimeout(() => this._playTone(700, 0.1, 'triangle', 0.15), 80);
  }
}

// Singleton
const soundEffects = new SoundEffects();
export default soundEffects;
