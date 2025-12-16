/**
 * Spin Screen - Display the spinning wheel
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useSecretSantaStore } from '../../store/useSecretSantaStore';
import { SpinningWheel } from '../../components/SpinningWheel/SpinningWheel';
import './SpinScreen.css';

export const SpinScreen: React.FC = () => {
  const { 
    participants,
    selectedParticipant,
    getAssignmentFor,
    markAsRevealed,
    soundEnabled,
  } = useSecretSantaStore();

  // Get the assigned person for the selected participant
  const assignedPerson = selectedParticipant 
    ? getAssignmentFor(selectedParticipant.id) 
    : null;

  const handleSpinComplete = () => {
    if (selectedParticipant) {
      markAsRevealed(selectedParticipant.id);
    }
  };

  if (!selectedParticipant || !assignedPerson) {
    return (
      <div className="spin-screen error-state">
        <p>Bir hata oluştu. Lütfen geri dönün.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="spin-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h2 
        className="spin-greeting"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        🎄 Merhaba, <span className="name-highlight">{selectedParticipant.name}</span>!
      </motion.h2>
      
      <p className="spin-instruction">
        Çarkı çevirin ve hediye alacağınız kişiyi öğrenin!
      </p>

      <SpinningWheel
        participants={participants}
        targetParticipant={assignedPerson}
        onSpinComplete={handleSpinComplete}
        soundEnabled={soundEnabled}
      />
    </motion.div>
  );
};
