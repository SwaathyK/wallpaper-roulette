'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { colorLabel } from '../utils/colorGenerator';

interface ColorChipProps {
  color: string;
  index: number;
  onReSpin: (index: number) => void;
  canReSpin: boolean;
}

export default function ColorChip({ color, index, onReSpin, canReSpin }: ColorChipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.05 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="relative w-11 h-11 rounded-full cursor-pointer transition-transform duration-150"
        style={{
          background: color,
          boxShadow: hovered && canReSpin
            ? `0 0 0 3px #fff, 0 0 0 5px #ff4e10, 0 4px 16px rgba(0,0,0,0.15)`
            : `0 0 0 2px #fff, 0 2px 10px rgba(0,0,0,0.12)`,
          transform: hovered && canReSpin ? 'scale(1.18)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => canReSpin && onReSpin(index)}
        title={colorLabel(color)}
      >
        {hovered && canReSpin && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/25">
            <span className="text-white text-sm font-bold">↻</span>
          </div>
        )}
      </div>
      <span className="text-[9px] font-mono tracking-wider" style={{ color: '#888' }}>
        {colorLabel(color)}
      </span>
    </motion.div>
  );
}
