/**
 * Tiny synthesized click, generated with WebAudio so the app ships no audio
 * assets. Sound is off by default and must be enabled in Settings.
 */
let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (context) return context
  const Ctor = window.AudioContext
  if (typeof Ctor !== 'function') return null
  try {
    context = new Ctor()
    return context
  } catch {
    return null
  }
}

export function playClickSound(): void {
  const audio = getContext()
  if (!audio) return
  if (audio.state === 'suspended') {
    void audio.resume().catch(() => undefined)
  }

  const now = audio.currentTime
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(880, now)
  oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.09)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.13)
}
