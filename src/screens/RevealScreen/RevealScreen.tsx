/**
 * Reveal Screen - Show the assigned person with celebration
 */

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSecretSantaStore } from '../../store/useSecretSantaStore';
import { playSound, triggerHaptic } from '../../utils/sound';
import './RevealScreen.css';

export const RevealScreen: React.FC = () => {
  const { 
    selectedParticipant,
    getAssignmentFor,
    setScreen,
    soundEnabled,
  } = useSecretSantaStore();

  const assignedPerson = selectedParticipant 
    ? getAssignmentFor(selectedParticipant.id) 
    : null;

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Multiple bursts for better effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#ffd700', '#ff6b6b', '#4ecdc4'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ffd700', '#ffffff'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#ff6b6b', '#4ecdc4', '#ffd700'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#ffffff', '#ffd700'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#4ecdc4', '#ff6b6b'],
    });
  }, []);

  // Snow burst effect
  const fireSnow = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 90,
        spread: 180,
        origin: { x: Math.random(), y: -0.1 },
        colors: ['#ffffff', '#e0f7fa', '#b3e5fc'],
        shapes: ['circle'],
        gravity: 0.3,
        scalar: 0.8,
        drift: (Math.random() - 0.5) * 2,
        ticks: 300,
        zIndex: 1000,
      });
    }, 100);
  }, []);

  useEffect(() => {
    // Celebration effects on mount
    fireConfetti();
    fireSnow();
    playSound('success', soundEnabled);
    triggerHaptic('heavy');
  }, [fireConfetti, fireSnow, soundEnabled]);

  const handleDone = () => {
    playSound('click', soundEnabled);
    triggerHaptic('light');
    setScreen('select');
  };

  if (!selectedParticipant || !assignedPerson) {
    return (
      <div className="reveal-screen error-state">
        <p>Bir hata oluştu. Lütfen geri dönün.</p>
        <button onClick={handleDone}>Geri Dön</button>
      </div>
    );
  }

  return (
    <motion.div 
      className="reveal-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="reveal-card"
        initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 20,
          delay: 0.2 
        }}
      >
        <div className="reveal-header">
          <span className="reveal-emoji">🎉</span>
          <h2 className="reveal-title">Eşleşmeniz Belli Oldu!</h2>
        </div>

        <div className="reveal-content">
          <p className="giver-text">
            <span className="giver-name">{selectedParticipant.name}</span>
            <span className="arrow">→</span>
          </p>
          
          <motion.div 
            className="receiver-box"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="gift-icon">🎁</span>
            <h3 className="receiver-name">{assignedPerson.name}</h3>
            <p className="receiver-hint">için hediye alacaksınız!</p>
          </motion.div>
        </div>

        <motion.div 
          className="reveal-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>🤫 Bu bir sır! Kimseye söylemeyin.</p>
        </motion.div>
      </motion.div>

      <motion.button
        className="done-button"
        onClick={handleDone}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ✓ Anladım, Kapat
      </motion.button>
    </motion.div>
  );
};
