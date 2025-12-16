/**
 * Derangement Algorithm for Secret Santa
 * 
 * A derangement is a permutation where no element appears in its original position.
 * This ensures no one draws themselves in Secret Santa.
 * 
 * Algorithm: Fisher-Yates shuffle with derangement validation
 * We shuffle and check if it's a valid derangement. If not, we retry.
 * 
 * Mathematical note: The probability of a random permutation being a derangement
 * approaches 1/e ≈ 0.368 as n grows, so we expect ~2.7 attempts on average.
 */

import type { Participant, Assignment } from '../types';

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Creates a new array, doesn't mutate the original
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Checks if a permutation is a valid derangement
 * (no element is in its original position)
 */
function isDerangement(original: string[], shuffled: string[]): boolean {
  for (let i = 0; i < original.length; i++) {
    if (original[i] === shuffled[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Generates a valid derangement for Secret Santa assignments
 * 
 * @param participants - Array of participants
 * @param maxAttempts - Maximum shuffle attempts before giving up (default: 1000)
 * @returns Array of assignments or null if generation fails
 * 
 * Each assignment maps a giver to a receiver, ensuring:
 * 1. No one draws themselves
 * 2. Everyone gives exactly one gift
 * 3. Everyone receives exactly one gift
 */
export function generateDerangement(
  participants: Participant[],
  maxAttempts: number = 1000
): Assignment[] | null {
  // Need at least 2 participants for Secret Santa
  if (participants.length < 2) {
    console.error('Need at least 2 participants for Secret Santa');
    return null;
  }

  const ids = participants.map(p => p.id);
  
  // Try to generate a valid derangement
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffledIds = shuffle(ids);
    
    if (isDerangement(ids, shuffledIds)) {
      // Valid derangement found! Create assignments
      const assignments: Assignment[] = ids.map((giverId, index) => ({
        giverId,
        receiverId: shuffledIds[index]
      }));
      
      console.log(`Derangement generated successfully in ${attempt + 1} attempts`);
      return assignments;
    }
  }
  
  // This should be extremely rare - only happens if we're very unlucky
  console.error(`Failed to generate derangement after ${maxAttempts} attempts`);
  return null;
}

/**
 * Validates that assignments form a valid derangement
 * Used to verify persisted data on load
 */
export function validateAssignments(
  participants: Participant[],
  assignments: Assignment[]
): boolean {
  // Check we have the right number of assignments
  if (assignments.length !== participants.length) {
    return false;
  }

  const participantIds = new Set(participants.map(p => p.id));
  const giverIds = new Set<string>();
  const receiverIds = new Set<string>();

  for (const assignment of assignments) {
    // Check both giver and receiver exist
    if (!participantIds.has(assignment.giverId) || 
        !participantIds.has(assignment.receiverId)) {
      return false;
    }

    // Check no self-assignments
    if (assignment.giverId === assignment.receiverId) {
      return false;
    }

    // Check for duplicates
    if (giverIds.has(assignment.giverId) || receiverIds.has(assignment.receiverId)) {
      return false;
    }

    giverIds.add(assignment.giverId);
    receiverIds.add(assignment.receiverId);
  }

  // Check everyone is both a giver and receiver
  return giverIds.size === participants.length && 
         receiverIds.size === participants.length;
}
