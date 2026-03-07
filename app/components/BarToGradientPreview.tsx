'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hslToHex } from '../utils/colorGenerator';
import { generateGradientDataUrl, downloadDataUrl } from '../utils/canvasUtils';

interface BarToGradientPreviewProps {
  collectedColors: string[];
  totalSpins: number;
  showGradient: boolean;
  onReset: () => void;
}

/** One 16:9 block: bars fill as you spin, then fuse in-place into gradient. Buttons below. */
export default function BarToGradientPreview({
  collectedColors,
  totalSpins,
  showGradient,
  onReset,
}: BarToGradientPreviewProps) {
  const [fuseComplete, setFuseComplete] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(() => Math.floor(Math.random() * 360));
  const barWidthPercent = totalSpins > 0 ? 100 / totalSpins : 0;

  useEffect(() => {
    if (!showGradient) setFuseComplete(false);
  }, [showGradient]);

  const randomizeDirection = () => {
    setGradientAngle(Math.floor(Math.random() * 360));
  };

  const cssGradient =
    collectedColors.length > 0
      ? `linear-gradient(${gradientAngle}deg, ${collectedColors.map(hslToHex).join(', ')})`
      : 'transparent';

  return (
    <div className="w-full max-w-md flex flex-col gap-4 items-center justify-center flex-1">
      {/* Single 16:9 block: bars OR gradient (fuse in place) */}
      <div
        className="w-full rounded-2xl overflow-hidden relative"
        style={{
          aspectRatio: '16/9',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <AnimatePresence mode="wait">
          {!showGradient ? (
            /* Bars */
            <motion.div
              key="bars"
              initial={false}
              className="absolute inset-0 flex flex-row"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Array.from({ length: totalSpins }).map((_, i) => {
                const color = collectedColors[i];
                const filled = !!color;
                return (
                  <motion.div
                    key={`${i}-${color ?? 'empty'}`}
                    initial={filled ? { scaleX: 0, opacity: 0.9 } : { scaleX: 1, opacity: 1 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    style={{
                      width: `${barWidthPercent}%`,
                      flexShrink: 0,
                      height: '100%',
                      background: color || '#e8e6e3',
                      transformOrigin: 'center',
                    }}
                  />
                );
              })}
            </motion.div>
          ) : (
            /* Fuse: bars squeeze/fade, gradient fades in same container */
            <motion.div
              key="fuse"
              className="absolute inset-0"
              initial={false}
            >
              {/* Bars squeezing and fading */}
              <motion.div
                className="absolute inset-0 flex flex-row"
                initial={false}
                animate={{ opacity: 0, scaleX: 0.98, scaleY: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'center center' }}
                onAnimationComplete={() => setFuseComplete(true)}
              >
                {collectedColors.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${100 / collectedColors.length}%`,
                      height: '100%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </motion.div>
              {/* Gradient appears in same space */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ background: cssGradient }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons: only show download + randomizer when gradient is shown; hint when bars */}
      {!showGradient && collectedColors.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center"
          style={{ color: '#94a3b8', fontFamily: 'var(--font-geist-sans), sans-serif' }}
        >
          {collectedColors.length} of {totalSpins} colors · Click Generate to fuse
        </motion.p>
      )}

      {showGradient && fuseComplete && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 w-full"
        >
          {/* Square download icon button */}
          <button
            onClick={() => downloadDataUrl(generateGradientDataUrl(collectedColors, 1920, 1080, gradientAngle))}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: '#ff4e10', boxShadow: '0 2px 12px rgba(255,78,16,0.3)' }}
            title="Download PNG"
            aria-label="Download PNG"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          {/* Square randomizer (reload direction) button */}
          <button
            onClick={randomizeDirection}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-black/5 active:scale-95 border"
            style={{ color: '#64748b', borderColor: '#e2e0da', background: '#fff' }}
            title="Randomize gradient direction"
            aria-label="Randomize gradient direction"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          {/* New Roulette — keep as is */}
          <button
            onClick={onReset}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-150 hover:bg-black/5 active:scale-95 border"
            style={{ color: '#888', borderColor: '#e2e0da', background: 'transparent' }}
          >
            ↺ New Roulette
          </button>
        </motion.div>
      )}
    </div>
  );
}
