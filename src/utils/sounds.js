let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Resume on first user gesture (browsers require this)
if (typeof window !== 'undefined') {
  const resume = () => {
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
    } catch {}
    document.removeEventListener('click', resume);
    document.removeEventListener('touchstart', resume);
  };
  document.addEventListener('click', resume);
  document.addEventListener('touchstart', resume);
}

// Mute state
export function isMuted() {
  return localStorage.getItem('chuiniu_muted') === '1';
}

export function setMuted(muted) {
  localStorage.setItem('chuiniu_muted', muted ? '1' : '0');
}

export function toggleMute() {
  const next = !isMuted();
  setMuted(next);
  return next;
}

// Try file-based audio first
let audioFile = null;
try {
  audioFile = new Audio('/sounds/dice-shuffle.mp3');
  audioFile.addEventListener('error', () => { audioFile = null; });
} catch { /* synthesis fallback */ }

function synthShuffle(duration = 1500) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const durSec = duration / 1000;
    const endTime = now + durSec;
    // More clacks for longer roll, tapering density toward end
    const clackCount = 20 + Math.floor(Math.random() * 8);

    for (let i = 0; i < clackCount; i++) {
      // Position clacks with front-heavy distribution (more at start, fewer at end)
      const progress = i / clackCount;
      const timeOffset = Math.pow(progress, 0.7) * durSec; // front-loaded
      const clackTime = now + timeOffset + Math.random() * 0.05;
      if (clackTime > endTime) break;

      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800 + Math.random() * 2000;
      filter.Q.value = 2;

      // Volume tapers from louder at start to softer at end
      const volumeScale = 1.0 - progress * 0.5;
      const gain = ctx.createGain();
      gain.gain.value = (0.08 + Math.random() * 0.1) * volumeScale;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(clackTime);
    }
  } catch {}
}

export function playDiceShuffle(duration = 1500) {
  if (isMuted()) return;
  if (audioFile) {
    audioFile.currentTime = 0;
    audioFile.volume = 0.4;
    audioFile.play().catch(() => synthShuffle(duration));
  } else {
    synthShuffle(duration);
  }
}
