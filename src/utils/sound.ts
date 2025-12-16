/**
 * Sound utilities using Howler.js
 * Manages all audio effects with toggle support
 */

import { Howl } from 'howler';

// Sound effects URLs (using free sound effects)
const SOUNDS = {
  spin: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  reveal: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
};

type SoundName = keyof typeof SOUNDS;

const soundCache: Partial<Record<SoundName, Howl>> = {};

/**
 * Get or create a Howl instance for a sound
 */
function getSound(name: SoundName): Howl {
  if (!soundCache[name]) {
    soundCache[name] = new Howl({
      src: [SOUNDS[name]],
      volume: 0.5,
      preload: true,
    });
  }
  return soundCache[name]!;
}

/**
 * Play a sound effect if sound is enabled
 */
export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return;
  
  try {
    const sound = getSound(name);
    sound.play();
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
}

/**
 * Preload all sounds for instant playback
 */
export function preloadSounds(): void {
  Object.keys(SOUNDS).forEach(name => {
    getSound(name as SoundName);
  });
}

/**
 * Trigger haptic feedback on supported devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 25 : 50;
    navigator.vibrate(duration);
  }
}
