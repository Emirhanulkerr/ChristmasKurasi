/**
 * Core types for Secret Santa application
 */

export interface Participant {
  id: string;
  name: string;
}

export interface Assignment {
  giverId: string;
  receiverId: string;
}

export interface AppState {
  // Participants list
  participants: Participant[];
  // Assignments after draw (giver -> receiver mapping)
  assignments: Assignment[];
  // Set of participant IDs who have already revealed their match
  revealedParticipants: Set<string>;
  // Whether the draw has been completed
  isDrawComplete: boolean;
  // Current screen in the app flow
  currentScreen: 'setup' | 'select' | 'spin' | 'reveal';
  // Currently selected participant (for spin/reveal)
  selectedParticipant: Participant | null;
  // Sound enabled state
  soundEnabled: boolean;
}

export interface SecretSantaStore extends AppState {
  // Actions
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  performDraw: () => boolean;
  selectParticipant: (participant: Participant) => boolean;
  markAsRevealed: (participantId: string) => void;
  getAssignmentFor: (participantId: string) => Participant | null;
  resetAll: () => void;
  setScreen: (screen: AppState['currentScreen']) => void;
  toggleSound: () => void;
  isParticipantRevealed: (participantId: string) => boolean;
  // Share functionality
  generateShareLink: () => string;
  loadFromShareData: (data: string) => boolean;
  isSharedSession: boolean;
  setIsSharedSession: (value: boolean) => void;
}

// Data structure for sharing via URL
export interface ShareData {
  participants: Participant[];
  assignments: Assignment[];
}
