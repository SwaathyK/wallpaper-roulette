'use client';

import { motion } from 'framer-motion';
import { colorLabel } from '../utils/colorGenerator';

interface ColorChipProps {
  color: string;
  index: number;
  onCycle: (index: number) => void;
  onRemove: (index: number) => void;
  canCycle: boolean;
}

export default function ColorChip({ color, index, onCycle, onRemove, canCycle }: ColorChipProps) {
  const isSwitched = color === '#000000' || color === '#ffffff';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.05 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex flex-col items-center gap-1">
        <div
          onClick={() => canCycle && onCycle(index)}
          className="w-11 h-11 rounded-full transition-transform duration-150 group relative"
          style={{
            background: color,
            cursor: canCycle ? 'pointer' : 'default',
            boxShadow: isSwitched
              ? '0 0 0 2px #fff, 0 0 0 4px #ff4e10, 0 2px 10px rgba(0,0,0,0.12)'
              : '0 0 0 2px #fff, 0 2px 10px rgba(0,0,0,0.12)',
          }}
        >
          {canCycle && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-150">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-bold drop-shadow">↻</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[10px] text-[#aaa] hover:text-[#ff4e10] transition-colors font-medium uppercase tracking-wider"
        >
          × Remove
        </button>
      </div>

      <span className="text-[9px] font-mono tracking-wider" style={{ color: '#888' }}>
        {colorLabel(color)}
      </span>
    </motion.div>
  );
}
