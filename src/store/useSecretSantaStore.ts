/**
 * Zustand store for Secret Santa state management
 * Handles all state with localStorage persistence
 */

import { create } from 'zustand';
import type { SecretSantaStore, Participant, AppState } from '../types';
import { generateDerangement, validateAssignments } from '../utils/derangement';
import { saveState, loadState, clearState } from '../utils/storage';

/**
 * Generate a unique ID for participants
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get initial state, hydrating from localStorage if available
 */
function getInitialState(): Omit<AppState, 'currentScreen' | 'selectedParticipant'> {
  const stored = loadState();
  
  if (stored) {
    // Validate stored assignments if draw was complete
    if (stored.isDrawComplete && stored.assignments.length > 0) {
      const isValid = validateAssignments(stored.participants, stored.assignments);
      if (!isValid) {
        console.warn('Invalid stored assignments, resetting...');
        clearState();
        return {
          participants: [],
          assignments: [],
          revealedParticipants: new Set(),
          isDrawComplete: false,
          soundEnabled: true,
        };
      }
    }
    
    return {
      participants: stored.participants,
      assignments: stored.assignments,
      revealedParticipants: new Set(stored.revealedParticipants),
      isDrawComplete: stored.isDrawComplete,
      soundEnabled: stored.soundEnabled,
    };
  }
  
  return {
    participants: [],
    assignments: [],
    revealedParticipants: new Set(),
    isDrawComplete: false,
    soundEnabled: true,
  };
}

export const useSecretSantaStore = create<SecretSantaStore>((set, get) => {
  const initial = getInitialState();
  
  return {
    // Initial state
    ...initial,
    currentScreen: initial.isDrawComplete ? 'select' : 'setup',
    selectedParticipant: null,

    // Add a new participant
    addParticipant: (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      
      // Check for duplicate names
      const exists = get().participants.some(
        p => p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (exists) return;

      const newParticipant: Participant = {
        id: generateId(),
        name: trimmedName,
      };

      set(state => {
        const newState = {
          participants: [...state.participants, newParticipant],
        };
        saveState({
          ...state,
          ...newState,
        });
        return newState;
      });
    },

    // Remove a participant (only before draw)
    removeParticipant: (id: string) => {
      if (get().isDrawComplete) return;
      
      set(state => {
        const newState = {
          participants: state.participants.filter(p => p.id !== id),
        };
        saveState({
          ...state,
          ...newState,
        });
        return newState;
      });
    },

    // Perform the Secret Santa draw
    performDraw: () => {
      const state = get();
      
      // Don't allow redraw
      if (state.isDrawComplete) {
        console.warn('Draw already completed');
        return false;
      }

      // Need at least 2 participants
      if (state.participants.length < 2) {
        console.warn('Need at least 2 participants');
        return false;
      }

      // Generate derangement
      const assignments = generateDerangement(state.participants);
      
      if (!assignments) {
        console.error('Failed to generate valid assignments');
        return false;
      }

      set(state => {
        const newState = {
          assignments,
          isDrawComplete: true,
          currentScreen: 'select' as const,
        };
        saveState({
          ...state,
          ...newState,
        });
        return newState;
      });

      return true;
    },

    // Select a participant to reveal their match
    selectParticipant: (participant: Participant) => {
      const state = get();
      
      // Check if already revealed
      if (state.revealedParticipants.has(participant.id)) {
        return false;
      }

      set({
        selectedParticipant: participant,
        currentScreen: 'spin',
      });

      return true;
    },

    // Mark a participant as having revealed their match
    markAsRevealed: (participantId: string) => {
      set(state => {
        const newRevealed = new Set(state.revealedParticipants);
        newRevealed.add(participantId);
        
        const newState = {
          revealedParticipants: newRevealed,
          currentScreen: 'reveal' as const,
        };
        
        saveState({
          ...state,
          revealedParticipants: newRevealed,
        });
        
        return newState;
      });
    },

    // Get the assigned receiver for a giver
    getAssignmentFor: (participantId: string) => {
      const state = get();
      const assignment = state.assignments.find(a => a.giverId === participantId);
      
      if (!assignment) return null;
      
      return state.participants.find(p => p.id === assignment.receiverId) || null;
    },

    // Reset everything (admin only)
    resetAll: () => {
      clearState();
      set({
        participants: [],
        assignments: [],
        revealedParticipants: new Set(),
        isDrawComplete: false,
        currentScreen: 'setup',
        selectedParticipant: null,
      });
    },

    // Set current screen
    setScreen: (screen: AppState['currentScreen']) => {
      set({ currentScreen: screen });
    },

    // Toggle sound
    toggleSound: () => {
      set(state => {
        const newState = { soundEnabled: !state.soundEnabled };
        saveState({
          ...state,
          ...newState,
        });
        return newState;
      });
    },

    // Check if participant has revealed
    isParticipantRevealed: (participantId: string) => {
      return get().revealedParticipants.has(participantId);
    },
  };
});
