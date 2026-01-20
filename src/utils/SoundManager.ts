class SoundEngine {
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(this.audioCtx.currentTime + startTime);
    osc.stop(this.audioCtx.currentTime + startTime + duration);
  }

  // UIクリック音
  playClick() {
    this.playTone(800, 'sine', 0.1);
  }

  // ★追加: 通知音 (ポン！という音)
  playNotification() {
    if (!this.audioCtx) return;
    this.playTone(600, 'sine', 0.1, 0);
    this.playTone(800, 'sine', 0.3, 0.1);
  }
}

export const soundManager = new SoundEngine();