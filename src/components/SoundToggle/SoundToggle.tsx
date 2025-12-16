/**
 * Sound Toggle Button Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useSecretSantaStore } from '../../store/useSecretSantaStore';
import './SoundToggle.css';

export const SoundToggle: React.FC = () => {
  const { soundEnabled, toggleSound } = useSecretSantaStore();

  return (
    <motion.button
      className="sound-toggle"
      onClick={toggleSound}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
    >
      {soundEnabled ? '🔔' : '🔕'}
    </motion.button>
  );
};
