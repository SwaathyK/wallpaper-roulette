'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import RouletteWheel from './components/RouletteWheel';
import ColorChip from './components/ColorChip';

const BarToGradientPreview = dynamic(
  () => import('./components/BarToGradientPreview'),
  { ssr: false, loading: () => <div className="w-full max-w-md aspect-video rounded-2xl bg-[#e8e6e3] animate-pulse" /> }
);

export default function Home() {
  const [totalSpins, setTotalSpins] = useState(3);
  const [collectedColors, setCollectedColors] = useState<string[]>([]);
  const [originalColors, setOriginalColors] = useState<string[]>([]); // the raw spun colors, never mutated
  const [showGradient, setShowGradient] = useState(false);

  const allSpinsDone = collectedColors.length >= totalSpins;
  const blackUsed = collectedColors.includes('#000000');
  const whiteUsed = collectedColors.includes('#ffffff');

  const handleColorSelected = useCallback((color: string) => {
    setCollectedColors(prev => [...prev, color]);
    setOriginalColors(prev => [...prev, color]);
  }, []);

  // Cycle: original → black (if free) → white (if free) → original
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

  const handleSpinCountChange = (n: number) => {
    setTotalSpins(n);
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
        <div className="flex flex-col gap-1">
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
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#888', fontFamily: 'var(--font-geist-sans), sans-serif' }}
            >
              Spin the wheel · collect colors<br />
              get your gradient
            </p>
          </div>

          {/* Spin count */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[0.25em] uppercase font-medium" style={{ color: '#aaa' }}>
              Number of spins
            </label>
            <div className="relative inline-block" style={{ width: 140 }}>
              <select
                value={totalSpins}
                onChange={e => handleSpinCountChange(Number(e.target.value))}
                className="w-full py-2.5 pl-4 pr-9 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-all duration-150"
                style={{
                  background: '#fff',
                  borderColor: '#e2e0da',
                  color: '#222',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
                onFocus={e => { e.target.style.borderColor = '#ff4e10'; e.target.style.boxShadow = '0 0 0 3px rgba(255,78,16,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e0da'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
              >
                <option value={2}>2 spins</option>
                <option value={3}>3 spins</option>
                <option value={4}>4 spins</option>
                <option value={5}>5 spins</option>
              </select>
            </div>
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
                      onCycle={handleCycleColor}
                      onRemove={handleRemoveColor}
                      canCycle={
                        color !== originalColors[i] // currently switched → can always cycle back
                        || !blackUsed              // black slot free
                        || !whiteUsed              // white slot free
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center">
          {collectedColors.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs tracking-wider uppercase transition-colors hover:opacity-80"
              style={{ color: '#bbb', fontFamily: 'var(--font-geist-sans), sans-serif' }}
            >
              ↺ Start over
            </button>
          )}
        </div>
      </div>

      {/* ── MIDDLE: Wheel ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[30%] lg:shrink-0 lg:h-full py-8 lg:py-0 gap-4 lg:gap-6 border-b lg:border-b-0 lg:border-r border-[#e2e0da] bg-[#f5f4f1]">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSpins }).map((_, i) => (
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
                boxShadow: i < collectedColors.length
                  ? `0 0 8px ${collectedColors[i]}88`
                  : 'none',
              }}
            />
          ))}
          <span className="text-xs font-mono ml-1" style={{ color: '#94a3b8' }}>
            {collectedColors.length}/{totalSpins}
          </span>
        </div>

        <RouletteWheel
          onColorSelected={handleColorSelected}
          disabled={allSpinsDone}
        />
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto">
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 lg:px-6 lg:py-8 bg-[#f5f4f1]">
          <BarToGradientPreview
            collectedColors={collectedColors}
            totalSpins={totalSpins}
            showGradient={showGradient}
            onReset={handleReset}
            onRequestGenerate={() => setShowGradient(true)}
          />
        </div>
      </div>
    </main>
  );
}
