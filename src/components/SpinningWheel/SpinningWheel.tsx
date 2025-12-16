/**
 * 3D Spinning Wheel Component
 * CSS 3D transforms with realistic physics
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { Participant } from '../../types';
import { playSound, triggerHaptic } from '../../utils/sound';
import './SpinningWheel.css';

interface SpinningWheelProps {
  participants: Participant[];
  targetParticipant: Participant;
  onSpinComplete: () => void;
  soundEnabled: boolean;
}

// Festive colors for wheel segments
const SEGMENT_COLORS = [
  '#e74c3c', // Red
  '#27ae60', // Green
  '#f39c12', // Gold
  '#3498db', // Blue
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#e91e63', // Pink
  '#ff9800', // Orange
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  participants,
  targetParticipant,
  onSpinComplete,
  soundEnabled,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const [, setBaseRotation] = useState(() => Math.random() * 360);
  const controls = useAnimation();
  
  const segmentAngle = 360 / participants.length;
  
  // Find the index of the target participant
  const targetIndex = participants.findIndex(p => p.id === targetParticipant.id);
  
  /**
   * Calculate the final rotation angle to land on target
   * Segments start from top (12 o'clock) and go clockwise.
   * Pointer is fixed at top (0deg).
   * To land on a segment, we need to rotate so that segment is at top.
   */
  const calculateFinalRotation = useCallback(() => {
    // Base rotations for effect (5-8 full rotations)
    const baseRotations = 5 + Math.floor(Math.random() * 3);
    const fullRotations = baseRotations * 360;

    // Mid-angle of the target slice (from top, going clockwise)
    const targetMidAngle = targetIndex * segmentAngle + segmentAngle / 2;

    // Small random offset within the slice to avoid mechanical look
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.3);

    // To bring target segment to the top (pointer position):
    // We need to rotate the wheel so the target segment's mid-point aligns with 0 degrees (top)
    // Since segments start at top and go clockwise, we rotate by negative of targetMidAngle
    // But CSS rotates clockwise with positive values, so we go: 360 - targetMidAngle
    return fullRotations + (360 - targetMidAngle) + jitter;
  }, [targetIndex, segmentAngle]);

  const gradient = useMemo(() => {
    // Conic gradient starts at 0deg (right/3 o'clock) by default
    // We need to start from top (12 o'clock) which is -90deg
    // Using "from -90deg" to align segments with our label calculations
    let acc = 0;
    return `conic-gradient(from -90deg, ${participants
      .map((_, i) => {
        const start = acc;
        const end = acc + segmentAngle;
        acc = end;
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        return `${color} ${start}deg ${end}deg`;
      })
      .join(', ')})`;
  }, [participants, segmentAngle]);

  const handleSpin = useCallback(async () => {
    if (isSpinning || hasSpun) return;
    
    // Randomize starting orientation for visual variety
    const start = Math.random() * 360;
    setBaseRotation(start);
    await controls.set({ rotate: start });

    setIsSpinning(true);
    playSound('spin', soundEnabled);
    triggerHaptic('medium');
    
    const finalRotation = calculateFinalRotation();
    const targetRotation = start + finalRotation;

    // Animate with realistic physics (ease-out deceleration)
    await controls.start({
      rotate: targetRotation,
      transition: {
        duration: 5 + Math.random() * 1.5,
        ease: [0.08, 0.82, 0.12, 1],
      },
    });

    // Tiny bounce back for excitement
    await controls.start({
      rotate: targetRotation + 6,
      transition: { duration: 0.3, ease: 'easeOut' },
    });
    await controls.start({
      rotate: targetRotation,
      transition: { duration: 0.25, ease: 'easeInOut' },
    });

    setIsSpinning(false);
    setHasSpun(true);
    setLandedIndex(targetIndex);
    setBaseRotation(((targetRotation % 360) + 360) % 360);
    playSound('reveal', soundEnabled);
    triggerHaptic('heavy');
    
    // Small delay before calling complete
    setTimeout(onSpinComplete, 500);
  }, [isSpinning, hasSpun, calculateFinalRotation, controls, onSpinComplete, soundEnabled]);

  // Click tick sound during spin
  useEffect(() => {
    if (!isSpinning || !soundEnabled) return;
    
    const interval = setInterval(() => {
      triggerHaptic('light');
    }, 150);
    
    return () => clearInterval(interval);
  }, [isSpinning, soundEnabled]);

  return (
    <div className="spinning-wheel-container">
      {/* Pointer */}
      <div className="wheel-pointer">
        <svg viewBox="0 0 40 50" fill="none">
          <path 
            d="M20 50L0 0H40L20 50Z" 
            fill="url(#pointerGradient)"
            stroke="#ffd700"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="pointerGradient" x1="20" y1="0" x2="20" y2="50">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#ff8c00" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Wheel */}
      <div className={`wheel-wrapper ${isSpinning ? 'spinning' : ''}`}>
        <motion.div 
          className="wheel"
          animate={controls}
          style={{ 
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            background: gradient,
          }}
        >
          <div className="wheel-glow" aria-hidden />
          <div className="wheel-speedlines" aria-hidden />
          {/* Sparks around the wheel during spin */}
          <div className={`wheel-sparks ${isSpinning ? 'active' : ''}`} aria-hidden />

          {/* Labels */}
          <div className="wheel-labels">
            {participants.map((participant, index) => {
              const start = index * segmentAngle;
              const mid = start + segmentAngle / 2;
              const isLanded = hasSpun && landedIndex === index;
              
              // Calculate position on outer ring
              const radius = 100; // Distance from center
              const angleRad = (mid - 90) * (Math.PI / 180); // -90 to start from top
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              return (
                <div
                  key={participant.id}
                  className={`wheel-label ${isLanded ? 'highlighted' : ''}`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                >
                  {participant.name}
                </div>
              );
            })}
          </div>

          {/* Highlight ring after landing */}
          {hasSpun && (
            <div className="wheel-highlight" aria-hidden />
          )}

          {/* Center decoration */}
          <div className="wheel-center">
            <span>🎄</span>
          </div>
          
          {/* Outer ring decoration */}
          <div className="wheel-outer-ring" />
        </motion.div>
      </div>
      
      {/* Spin Button */}
      <motion.button
        className="spin-button"
        onClick={handleSpin}
        disabled={isSpinning || hasSpun}
        whileHover={{ scale: isSpinning || hasSpun ? 1 : 1.05 }}
        whileTap={{ scale: isSpinning || hasSpun ? 1 : 0.95 }}
      >
        {isSpinning ? '🎰 Döndürülüyor...' : hasSpun ? '✨ Tamamlandı!' : '🎁 Çarkı Çevir!'}
      </motion.button>
    </div>
  );
};
