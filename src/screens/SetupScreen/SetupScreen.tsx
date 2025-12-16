/**
 * Setup Screen - Add participants and start draw
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSecretSantaStore } from '../../store/useSecretSantaStore';
import { playSound, triggerHaptic } from '../../utils/sound';
import './SetupScreen.css';

export const SetupScreen: React.FC = () => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [showAdminReset, setShowAdminReset] = useState(false);
  
  const { 
    participants, 
    addParticipant, 
    removeParticipant, 
    performDraw,
    resetAll,
    soundEnabled,
    isDrawComplete,
  } = useSecretSantaStore();

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Lütfen bir isim girin');
      return;
    }
    
    const exists = participants.some(
      p => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError('Bu isim zaten eklenmiş');
      return;
    }
    
    addParticipant(trimmed);
    playSound('click', soundEnabled);
    triggerHaptic('light');
    setNewName('');
    setError('');
  };

  const handleRemove = (id: string) => {
    removeParticipant(id);
    playSound('click', soundEnabled);
    triggerHaptic('light');
  };

  const handleDraw = () => {
    if (participants.length < 2) {
      setError('En az 2 katılımcı gerekli');
      return;
    }
    
    const success = performDraw();
    if (success) {
      playSound('success', soundEnabled);
      triggerHaptic('heavy');
    } else {
      setError('Kura çekilirken bir hata oluştu');
    }
  };

  const handleReset = () => {
    resetAll();
    playSound('click', soundEnabled);
    setShowAdminReset(false);
  };

  return (
    <motion.div 
      className="setup-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.h1 
        className="setup-title"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        🎄 Yılbaşı Gizli Noel Baba 🎅
      </motion.h1>
      
      <p className="setup-subtitle">
        Hediye alışverişi için katılımcıları ekleyin
      </p>

      {!isDrawComplete && (
        <form onSubmit={handleAddParticipant} className="add-form">
          <div className="input-group">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              placeholder="Katılımcı adı..."
              className="name-input"
              maxLength={30}
            />
            <motion.button
              type="submit"
              className="add-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Ekle
            </motion.button>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.p 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      )}

      <div className="participants-section">
        <h2 className="section-title">
          Katılımcılar ({participants.length})
        </h2>
        
        <div className="participants-list">
          <AnimatePresence mode="popLayout">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                className="participant-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <span className="participant-icon">🎁</span>
                <span className="participant-name">{participant.name}</span>
                {!isDrawComplete && (
                  <motion.button
                    className="remove-button"
                    onClick={() => handleRemove(participant.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {participants.length === 0 && (
            <p className="empty-message">
              Henüz katılımcı eklenmedi
            </p>
          )}
        </div>
      </div>

      {!isDrawComplete && (
        <motion.button
          className="draw-button"
          onClick={handleDraw}
          disabled={participants.length < 2}
          whileHover={{ scale: participants.length >= 2 ? 1.05 : 1 }}
          whileTap={{ scale: participants.length >= 2 ? 0.95 : 1 }}
        >
          🎲 Kurayı Çek ({participants.length}/2 minimum)
        </motion.button>
      )}

      {/* Admin Reset Button */}
      <div className="admin-section">
        <button 
          className="admin-toggle"
          onClick={() => setShowAdminReset(!showAdminReset)}
        >
          ⚙️ Yönetici
        </button>
        
        <AnimatePresence>
          {showAdminReset && (
            <motion.div
              className="admin-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="admin-warning">
                ⚠️ Bu işlem tüm verileri silecek!
              </p>
              <button className="reset-button" onClick={handleReset}>
                🗑️ Tümünü Sıfırla
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
