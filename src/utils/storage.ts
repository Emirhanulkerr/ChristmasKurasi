/**
 * LocalStorage persistence utilities
 * Handles safe serialization/deserialization with Set support
 */

import type { Participant, Assignment } from '../types';

const STORAGE_KEYS = {
  PARTICIPANTS: 'secretsanta_participants',
  ASSIGNMENTS: 'secretsanta_assignments',
  REVEALED: 'secretsanta_revealed',
  IS_DRAW_COMPLETE: 'secretsanta_draw_complete',
  SOUND_ENABLED: 'secretsanta_sound',
} as const;

interface StoredState {
  participants: Participant[];
  assignments: Assignment[];
  revealedParticipants: string[]; // Stored as array, converted to Set
  isDrawComplete: boolean;
  soundEnabled: boolean;
}

/**
 * Saves the current state to localStorage
 */
export function saveState(state: {
  participants: Participant[];
  assignments: Assignment[];
  revealedParticipants: Set<string>;
  isDrawComplete: boolean;
  soundEnabled: boolean;
}): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PARTICIPANTS,
      JSON.stringify(state.participants)
    );
    localStorage.setItem(
      STORAGE_KEYS.ASSIGNMENTS,
      JSON.stringify(state.assignments)
    );
    // Convert Set to Array for storage
    localStorage.setItem(
      STORAGE_KEYS.REVEALED,
      JSON.stringify([...state.revealedParticipants])
    );
    localStorage.setItem(
      STORAGE_KEYS.IS_DRAW_COMPLETE,
      JSON.stringify(state.isDrawComplete)
    );
    localStorage.setItem(
      STORAGE_KEYS.SOUND_ENABLED,
      JSON.stringify(state.soundEnabled)
    );
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Loads state from localStorage with safe hydration
 */
export function loadState(): StoredState | null {
  try {
    const participantsStr = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    const assignmentsStr = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    const revealedStr = localStorage.getItem(STORAGE_KEYS.REVEALED);
    const isDrawCompleteStr = localStorage.getItem(STORAGE_KEYS.IS_DRAW_COMPLETE);
    const soundEnabledStr = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);

    // If no participants stored, return null (fresh start)
    if (!participantsStr) {
      return null;
    }

    const participants: Participant[] = JSON.parse(participantsStr);
    const assignments: Assignment[] = assignmentsStr 
      ? JSON.parse(assignmentsStr) 
      : [];
    const revealedParticipants: string[] = revealedStr 
      ? JSON.parse(revealedStr) 
      : [];
    const isDrawComplete: boolean = isDrawCompleteStr 
      ? JSON.parse(isDrawCompleteStr) 
      : false;
    const soundEnabled: boolean = soundEnabledStr !== null
      ? JSON.parse(soundEnabledStr)
      : true;

    return {
      participants,
      assignments,
      revealedParticipants,
      isDrawComplete,
      soundEnabled,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Clears all stored state
 */
export function clearState(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
