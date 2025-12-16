/**
 * Animated snowfall background effect
 * Performance-optimized with CSS animations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './Snowfall.css';

interface SnowflakeProps {
  delay: number;
  duration: number;
  left: number;
  size: number;
  opacity: number;
}

const Snowflake: React.FC<SnowflakeProps> = ({ delay, duration, left, size, opacity }) => {
  return (
    <motion.div
      className="snowflake"
      initial={{ y: -20, x: 0, opacity: 0 }}
      animate={{
        y: '100vh',
        x: [0, 30, -20, 25, -15, 0],
        opacity: [0, opacity, opacity, opacity, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
        x: {
          duration: duration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      style={{
        left: `${left}%`,
        width: size,
        height: size,
      }}
    />
  );
};

interface SnowfallProps {
  count?: number;
}

export const Snowfall: React.FC<SnowfallProps> = ({ count = 50 }) => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      left: Math.random() * 100,
      size: 3 + Math.random() * 8,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className="snowfall-container">
      {snowflakes.map(flake => (
        <Snowflake key={flake.id} {...flake} />
      ))}
    </div>
  );
};
