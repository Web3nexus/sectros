import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Background Particles
 * Creates a sophisticated "Elite" atmosphere with floating dust and starfield specs.
 */
export default function BackgroundParticles({ 
  count = 25, 
  velocity = 1, 
  color = 'rgba(139, 92, 246, 0.2)', // Subtle Violet
  className = "" 
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[100] ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 0 15px ${color}`,
            width: Math.random() * 5 + 2 + 'px',
            height: Math.random() * 5 + 2 + 'px',
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            y: [0, -110 * velocity + 'vh'],
            x: [0, (Math.random() - 0.5) * 300 + "px"],
            opacity: [0, 0.9, 0],
            scale: [0.5, 2.5, 0.5]
          }}
          transition={{ 
            duration: Math.random() * 15 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
}
