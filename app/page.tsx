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
  const [reSpinIndex, setReSpinIndex] = useState<number | null>(null);
  const [showGradient, setShowGradient] = useState(false);

  const allSpinsDone = collectedColors.length === totalSpins;
  const wheelDisabled = allSpinsDone && reSpinIndex === null;

  const handleColorSelected = useCallback((color: string) => {
    if (reSpinIndex !== null) {
      setCollectedColors(prev => {
        const next = [...prev];
        next[reSpinIndex] = color;
        return next;
      });
      setReSpinIndex(null);
    } else {
      setCollectedColors(prev => [...prev, color]);
    }
  }, [reSpinIndex]);

  const handleReSpin = (index: number) => {
    if (reSpinIndex !== null) return;
    setReSpinIndex(index);
    setShowGradient(false);
  };

  const handleReset = () => {
    setCollectedColors([]);
    setReSpinIndex(null);
    setShowGradient(false);
  };

  const handleSpinCountChange = (n: number) => {
    setTotalSpins(n);
    setCollectedColors([]);
    setReSpinIndex(null);
    setShowGradient(false);
  };

  return (
    <main
      className="w-screen h-screen overflow-hidden flex"
      style={{ background: '#f5f4f1', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
    >
      {/* ── LEFT: Heading + contents ── */}
      <div
        className="flex flex-col justify-between h-full px-8 py-12 shrink-0"
        style={{ width: '28%', borderRight: '1px solid #e2e0da' }}
      >
        {/* Top: branding */}
        <div className="flex flex-col gap-1">
          <span
            className="text-[11px] tracking-[0.35em] uppercase font-medium whitespace-nowrap"
            style={{ color: '#ff4e10' }}
          >
            ✦ Wallpaper Roulette
          </span>
        </div>

        {/* Middle: heading + controls */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1
              className="leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(42px, 4.2vw, 62px)',
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

          {/* Spin count dropdown */}
          <div className="flex flex-col gap-2">
            <label
              className="text-[11px] tracking-[0.25em] uppercase font-medium"
              style={{ color: '#aaa' }}
            >
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

          {/* Collected color chips */}
          <AnimatePresence>
            {collectedColors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <span
                  className="text-[11px] tracking-[0.25em] uppercase font-medium"
                  style={{ color: '#aaa' }}
                >
                  Collected colors
                </span>
                <div className="flex gap-4 flex-wrap">
                  {collectedColors.map((color, i) => (
                    <ColorChip
                      key={`${i}-${color}`}
                      color={color}
                      index={i}
                      onReSpin={handleReSpin}
                      canReSpin={reSpinIndex === null && !showGradient}
                    />
                  ))}
                </div>
                {reSpinIndex !== null && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs"
                    style={{ color: '#ff4e10' }}
                  >
                    Re-spinning slot {reSpinIndex + 1}… click ⚡ on the wheel
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate button */}
          <AnimatePresence>
            {allSpinsDone && !showGradient && reSpinIndex === null && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGradient(true)}
                className="py-3.5 px-6 rounded-xl text-white text-sm font-semibold tracking-wider uppercase transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{ background: '#ff4e10', boxShadow: '0 4px 20px rgba(255,78,16,0.3)' }}
              >
                ✨ Generate Background
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: reset link */}
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

      {/* ── MIDDLE: Spinner only ── */}
      <div
        className="flex flex-col items-center justify-center h-full shrink-0 gap-6"
        style={{ width: '30%', borderRight: '1px solid #e2e0da', background: '#f5f4f1' }}
      >
        {/* Progress pills */}
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
          <span
            className="text-xs font-mono ml-1"
            style={{ color: '#94a3b8' }}
          >
            {collectedColors.length}/{totalSpins}
          </span>
        </div>

        <RouletteWheel
          onColorSelected={handleColorSelected}
          disabled={wheelDisabled}
        />
      </div>

      {/* ── RIGHT: Single block (bars → fuse in place → gradient), centered ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-auto">
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-8" style={{ background: '#f5f4f1' }}>
          <BarToGradientPreview
            collectedColors={collectedColors}
            totalSpins={totalSpins}
            showGradient={showGradient}
            onReset={handleReset}
          />
        </div>
      </div>
    </main>
  );
}
