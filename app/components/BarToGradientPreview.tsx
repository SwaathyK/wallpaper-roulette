'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hslToHex } from '../utils/colorGenerator';
import { generateGradientDataUrl, downloadDataUrl } from '../utils/canvasUtils';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface BarToGradientPreviewProps {
  collectedColors: string[];
  totalSpins: number;
  showGradient: boolean;
  onReset: () => void;
  onRequestGenerate?: () => void;
}

/** One 16:9 block: bars fill as you spin, then fuse in-place into gradient. Buttons below. */
export default function BarToGradientPreview({
  collectedColors,
  totalSpins,
  showGradient,
  onReset,
  onRequestGenerate,
}: BarToGradientPreviewProps) {
  const [fuseComplete, setFuseComplete] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(() => Math.floor(Math.random() * 360));
  const [gradientColorOrder, setGradientColorOrder] = useState<number[]>([]);
  const initialOrderRef = useRef<number[] | null>(null);
  const barWidthPercent = totalSpins > 0 ? 100 / totalSpins : 0;

  useLayoutEffect(() => {
    if (!showGradient) {
      setFuseComplete(false);
      initialOrderRef.current = null;
      return;
    }
    if (initialOrderRef.current && initialOrderRef.current.length === collectedColors.length) {
      setGradientColorOrder(initialOrderRef.current);
    }
  }, [showGradient, collectedColors.length]);

  useEffect(() => {
    if (!showGradient) return;
    const fallback = setTimeout(() => setFuseComplete(true), 800);
    return () => clearTimeout(fallback);
  }, [showGradient]);

  const orderedColors =
    gradientColorOrder.length === collectedColors.length
      ? gradientColorOrder.map((i) => collectedColors[i])
      : (() => {
          if (!showGradient || collectedColors.length === 0) return collectedColors;
          if (initialOrderRef.current === null || initialOrderRef.current.length !== collectedColors.length) {
            initialOrderRef.current = shuffle(collectedColors.map((_, i) => i));
          }
          return initialOrderRef.current.map((i) => collectedColors[i]);
        })();

  const randomizeDirection = () => {
    setGradientAngle(Math.floor(Math.random() * 360));
    const indices = gradientColorOrder.length === collectedColors.length
      ? gradientColorOrder
      : collectedColors.map((_, i) => i);
    setGradientColorOrder(shuffle([...indices]));
  };

  const cssGradient =
    orderedColors.length > 0
      ? `linear-gradient(${gradientAngle}deg, ${orderedColors.map(hslToHex).join(', ')})`
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
            /* Bars + optional Generate overlay when all filled */
            <>
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
              {/* Generate Background overlay when all slots filled */}
              {collectedColors.length === totalSpins && onRequestGenerate && (
                <button
                  type="button"
                  onClick={onRequestGenerate}
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/20 transition-colors hover:bg-black/30 active:bg-black/40"
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(14px, 2.8vw, 22px)',
                    color: 'rgba(255,255,255,0.92)',
                    letterSpacing: '-0.02em',
                    textShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }}
                >
                  Generate Background
                </button>
              )}
            </>
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
                {orderedColors.map((color, i) => (
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

      {/* Hint when bars are partially filled */}
      {!showGradient && collectedColors.length > 0 && collectedColors.length < totalSpins && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center"
          style={{ color: '#94a3b8', fontFamily: 'var(--font-geist-sans), sans-serif' }}
        >
          {collectedColors.length} of {totalSpins} colors · spin again or remove one above
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
            onClick={() => downloadDataUrl(generateGradientDataUrl(orderedColors, 1920, 1080, gradientAngle))}
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
