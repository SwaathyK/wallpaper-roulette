'use client';

import { useState, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import RouletteWheel from './components/RouletteWheel';
import ColorChip from './components/ColorChip';

const MAX_COLORS = 5;

const BarToGradientPreview = dynamic(
  () => import('./components/BarToGradientPreview'),
  { ssr: false, loading: () => <div className="w-full max-w-md aspect-video rounded-2xl bg-[#e8e6e3] animate-pulse" /> }
);

export default function Home() {
  const [collectedColors, setCollectedColors] = useState<string[]>([]);
  const [originalColors, setOriginalColors] = useState<string[]>([]);
  const [showGradient, setShowGradient] = useState(false);

  const allSpinsDone = collectedColors.length >= MAX_COLORS;

  const handleColorSelected = useCallback((color: string) => {
    setCollectedColors(prev => [...prev, color]);
    setOriginalColors(prev => [...prev, color]);
    setShowGradient(true);
  }, []);

  const blackUsed = collectedColors.includes('#000000');
  const whiteUsed = collectedColors.includes('#ffffff');

  const handleCycleColor = (index: number) => {
    const current = collectedColors[index];
    const original = originalColors[index];
    let next: string | null = null;
    if (current === original) {
      if (!blackUsed) next = '#000000';
      else if (!whiteUsed) next = '#ffffff';
    } else if (current === '#000000') {
      next = !whiteUsed ? '#ffffff' : original;
    } else if (current === '#ffffff') {
      next = original;
    }
    if (next !== null) {
      setCollectedColors(prev => { const n = [...prev]; n[index] = next!; return n; });
    }
  };

  const handleRemoveColor = (index: number) => {
    setCollectedColors(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setShowGradient(false);
      return next;
    });
    setOriginalColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setCollectedColors([]);
    setOriginalColors([]);
    setShowGradient(false);
  };

  return (
    <main
      className="w-full min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row"
      style={{ background: '#f5f4f1', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
    >
      {/* ── LEFT ── */}
      <div className="flex flex-col justify-between w-full lg:w-[28%] lg:shrink-0 lg:h-full px-6 py-8 lg:px-8 lg:py-12 border-b lg:border-b-0 lg:border-r border-[#e2e0da]">
        <div>
          <span
            className="text-[11px] tracking-[0.35em] uppercase font-medium whitespace-nowrap"
            style={{ color: '#ff4e10' }}
          >
            ✦ Wallpaper Roulette
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-col gap-3">
            <h1
              className="leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(32px, 8vw, 62px)',
                color: '#222',
                letterSpacing: '-0.02em',
              }}
            >
              Spin &amp;<br />Generate.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#888', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
              Spin the wheel · collect up to 5 colors<br />
              get your wallpaper
            </p>
          </div>

          {/* Collected colors */}
          <AnimatePresence>
            {collectedColors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <span className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: '#aaa' }}>
                  Collected colors
                </span>
                <div className="flex gap-4 flex-wrap">
                  {collectedColors.map((color, i) => (
                    <ColorChip
                      key={`${i}-${color}`}
                      color={color}
                      index={i}
                      onRemove={handleRemoveColor}
                      onCycle={handleCycleColor}
                      canCycle={
                        color !== originalColors[i]
                        || !blackUsed
                        || !whiteUsed
                      }
                    />
                  ))}
                </div>

                {/* Hint — shown until both black and white slots are used */}
                {(!blackUsed || !whiteUsed) && (
                  <p className="text-[10px]" style={{ color: '#bbb', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
                    Tap a color to switch it to black or white
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3">
          {collectedColors.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs tracking-wider uppercase transition-colors hover:opacity-80 text-left"
              style={{ color: '#bbb', fontFamily: 'var(--font-geist-sans), sans-serif' }}
            >
              ↺ Start over
            </button>
          )}
          <p className="text-[11px] flex items-center gap-1" style={{ color: '#ccc', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
            <span>Made by</span>
            <a href="https://x.com/SwaathyK" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" style={{ color: '#aaa' }}>
              @SwaathyK
            </a>
            <span>·</span>
            <a href="http://swaathykumaran.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:opacity-70 transition-opacity" style={{ color: '#aaa' }}>
              <ExternalLink size={11} />
            </a>
          </p>
        </div>
      </div>

      {/* ── MIDDLE: Wheel ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[30%] lg:shrink-0 lg:h-full py-8 lg:py-0 gap-4 lg:gap-6 border-b lg:border-b-0 lg:border-r border-[#e2e0da] bg-[#f5f4f1]">
        {/* Color progress pills — up to 5 slots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: MAX_COLORS }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i < collectedColors.length ? 32 : 8,
                background: i < collectedColors.length ? collectedColors[i] : '#e2e0da',
              }}
              transition={{ duration: 0.35 }}
              style={{
                height: 8,
                borderRadius: 4,
                boxShadow: i < collectedColors.length ? `0 0 8px ${collectedColors[i]}88` : 'none',
              }}
            />
          ))}
        </div>

        <RouletteWheel
          onColorSelected={handleColorSelected}
          disabled={allSpinsDone}
        />

        {allSpinsDone && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs tracking-widest uppercase"
            style={{ color: '#94a3b8' }}
          >
            Max 5 colors reached
          </motion.p>
        )}
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto">
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 lg:px-6 lg:py-8 bg-[#f5f4f1]">
          <BarToGradientPreview
            collectedColors={collectedColors}
            showGradient={showGradient}
            onReset={handleReset}
          />
        </div>
      </div>
    </main>
  );
}
