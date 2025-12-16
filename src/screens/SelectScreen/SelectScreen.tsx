/**
 * Select Screen - Participant selects themselves
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretSantaStore } from '../../store/useSecretSantaStore';
import { playSound, triggerHaptic } from '../../utils/sound';
import './SelectScreen.css';

export const SelectScreen: React.FC = () => {
  const { 
    participants, 
    selectParticipant,
    isParticipantRevealed,
    soundEnabled,
    setScreen,
  } = useSecretSantaStore();

  const handleSelect = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    // Check if already revealed
    if (isParticipantRevealed(participantId)) {
      playSound('click', soundEnabled);
      triggerHaptic('light');
      return;
    }

    const success = selectParticipant(participant);
    if (success) {
      playSound('click', soundEnabled);
      triggerHaptic('medium');
    }
  };

  const revealedCount = participants.filter(
    p => isParticipantRevealed(p.id)
  ).length;

  const allRevealed = revealedCount === participants.length;

  return (
    <motion.div 
      className="select-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h1 
        className="select-title"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        🎁 Noel Çekilişi 2025
      </motion.h1>
      
      <p className="select-subtitle">
        Kendi adınızı seçin ve çarkı çevirin!
      </p>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(revealedCount / participants.length) * 100}%` }}
        />
        <span className="progress-text">
          {revealedCount} / {participants.length} görüntülendi
        </span>
      </div>

      {allRevealed && (
        <motion.div 
          className="all-revealed-message"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          🎉 Herkes eşleşmesini öğrendi!
        </motion.div>
      )}

      <div className="participants-grid">
        <AnimatePresence mode="popLayout">
          {participants.map((participant, index) => {
            const isRevealed = isParticipantRevealed(participant.id);
            
            return (
              <motion.button
                key={participant.id}
                className={`select-card ${isRevealed ? 'revealed' : ''}`}
                onClick={() => handleSelect(participant.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: isRevealed ? 1 : 1.05,
                  boxShadow: isRevealed 
                    ? undefined 
                    : '0 10px 40px rgba(255, 215, 0, 0.3)'
                }}
                whileTap={{ scale: isRevealed ? 1 : 0.95 }}
                layout
              >
                <span className="card-icon">
                  {isRevealed ? '✅' : '🎁'}
                </span>
                <span className="card-name">{participant.name}</span>
                {isRevealed && (
                  <span className="revealed-badge">Görüntülendi</span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.button
        className="back-button"
        onClick={() => setScreen('setup')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Katılımcıları Görüntüle
      </motion.button>
    </motion.div>
  );
};
