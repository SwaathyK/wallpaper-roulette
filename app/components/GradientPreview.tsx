'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hslToHex } from '../utils/colorGenerator';
import { generateGradientDataUrl, downloadGradient } from '../utils/canvasUtils';

interface GradientPreviewProps {
  colors: string[];
  onReset: () => void;
}

export default function GradientPreview({ colors, onReset }: GradientPreviewProps) {
  const [angle] = useState(() => Math.floor(Math.random() * 360));

  useEffect(() => {
    if (colors.length > 0) {
      generateGradientDataUrl(colors, 1920, 1080, angle);
    }
  }, [colors, angle]);

  const cssGradient = `linear-gradient(${angle}deg, ${colors.map(hslToHex).join(', ')})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      {/* 16:9 thumbnail */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: cssGradient,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      />

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => downloadGradient(colors)}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold tracking-wider uppercase transition-all duration-150 hover:opacity-90 active:scale-95"
          style={{ background: '#ff4e10' }}
        >
          ↓ Download PNG
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-150 hover:bg-black/5 active:scale-95 border"
          style={{ color: '#888', borderColor: '#e2e0da', background: 'transparent' }}
        >
          ↺ New Roulette
        </button>
      </div>
    </motion.div>
  );
}
