'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hslToHex } from '../utils/colorGenerator';
import { generateMeshGradientDataUrl, downloadDataUrl } from '../utils/canvasUtils';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── Hex helpers ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function averageHex(hexColors: string[]): string {
  const rgbs = hexColors.map(hexToRgb);
  const avg = [0, 1, 2].map(i => rgbs.reduce((s, c) => s + c[i], 0) / rgbs.length);
  return rgbToHex(avg[0], avg[1], avg[2]);
}

function shiftBrightness(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + delta, g + delta, b + delta);
}

// ── Blob generation ──────────────────────────────────────────────────────────

type ShapeMode = 'smooth' | 'angular';

interface BlobConfig {
  style: {
    width: string;
    height: string;
    top: string;
    left: string;
    borderRadius?: string;
    clipPath?: string;
  };
  animation: string;
  opacity: number;
}

const DRIFT_ANIMS = ['blob-drift-1', 'blob-drift-2', 'blob-drift-3', 'blob-drift-4'];
const DRIFT_DURATIONS = ['20s', '24s', '28s', '32s', '36s'];

function randomBorderRadius(): string {
  const r = () => `${20 + Math.floor(Math.random() * 60)}%`;
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
}

function randomClipPath(): string {
  const numPoints = 3 + Math.floor(Math.random() * 6);
  const angleStep = (Math.PI * 2) / numPoints;
  const coords = Array.from({ length: numPoints }, (_, i) => {
    const angle = i * angleStep + (Math.random() - 0.5) * angleStep * 0.6;
    const radius = 28 + Math.random() * 44;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return `${Math.round(x)}% ${Math.round(y)}%`;
  });
  return `polygon(${coords.join(', ')})`;
}

function generateBlobConfigs(mode: ShapeMode): BlobConfig[] {
  return Array.from({ length: 4 }, (_, i) => {
    const w = 65 + Math.floor(Math.random() * 35);
    const h = 65 + Math.floor(Math.random() * 35);
    const x = -25 + Math.floor(Math.random() * 78);
    const y = -25 + Math.floor(Math.random() * 78);
    const duration = DRIFT_DURATIONS[Math.floor(Math.random() * DRIFT_DURATIONS.length)];
    const delay = `-${Math.floor(Math.random() * 12)}s`;

    return {
      style: {
        width: `${w}%`,
        height: `${h}%`,
        top: `${y}%`,
        left: `${x}%`,
        ...(mode === 'smooth'
          ? { borderRadius: randomBorderRadius() }
          : { clipPath: randomClipPath() }
        ),
      },
      animation: `${DRIFT_ANIMS[i]} ${duration} ease-in-out ${delay} infinite`,
      opacity: 0.75 + Math.random() * 0.18,
    };
  });
}

function buildBlobColors(hexColors: string[]): string[] {
  return Array.from({ length: 4 }, (_, i) => hexColors[i % hexColors.length]);
}

// ── MeshGradient ─────────────────────────────────────────────────────────────

function MeshGradient({ colors, blobs }: { colors: string[]; blobs: BlobConfig[] }) {
  const hexColors = colors.map(hslToHex);
  // If the user switched a color to black, use a near-black base; otherwise derive from the palette
  const hasDark = hexColors.includes('#000000');
  const base = hasDark ? '#0e0e0e' : shiftBrightness(averageHex(hexColors), -40);
  const blobColors = buildBlobColors(hexColors);

  return (
    <div className="absolute inset-0" style={{ background: base }}>
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: blob.style.width,
            height: blob.style.height,
            top: blob.style.top,
            left: blob.style.left,
            opacity: blob.opacity,
            filter: 'blur(40px)',
            animation: blob.animation,
            willChange: 'transform',
            // Smooth mode: borderRadius + background on the blurred div itself
            // so blur bleeds naturally beyond the rounded shape
            ...(blob.style.borderRadius
              ? { borderRadius: blob.style.borderRadius, background: blobColors[i] }
              : {}
            ),
          }}
        >
          {/* Angular mode: clipPath on inner div so blur bleeds beyond the polygon */}
          {blob.style.clipPath && (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: blobColors[i],
                clipPath: blob.style.clipPath,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface BarToGradientPreviewProps {
  collectedColors: string[];
  showGradient: boolean;
  onReset: () => void;
}

export default function BarToGradientPreview({
  collectedColors,
  showGradient,
  onReset,
}: BarToGradientPreviewProps) {
  const [gradientColorOrder, setGradientColorOrder] = useState<number[]>([]);
  const [shapeMode, setShapeMode] = useState<ShapeMode>('smooth');
  const [blobConfigs, setBlobConfigs] = useState<BlobConfig[]>(() => generateBlobConfigs('smooth'));
  const [actionsVisible, setActionsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const downloadDimensions = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.screen.width * dpr;
    const h = window.screen.height * dpr;
    // Ensure portrait for mobile, landscape for desktop
    return isMobile
      ? { width: Math.min(w, h), height: Math.max(w, h) }
      : { width: Math.max(w, h), height: Math.min(w, h) };
  };

  // Generate blobs once when gradient first appears
  useLayoutEffect(() => {
    if (!showGradient) {
      setActionsVisible(false);
      setGradientColorOrder([]);
      return;
    }
    setBlobConfigs(generateBlobConfigs('smooth'));
    setShapeMode('smooth');
    setGradientColorOrder(shuffle(collectedColors.map((_, i) => i)));
  }, [showGradient]);

  useEffect(() => {
    if (!showGradient) return;
    const t = setTimeout(() => setActionsVisible(true), 600);
    return () => clearTimeout(t);
  }, [showGradient]);

  // Live updates: when colors added/removed the order goes stale — fall back to direct order
  const orderedColors = gradientColorOrder.length === collectedColors.length
    ? gradientColorOrder.map(i => collectedColors[i])
    : collectedColors;

  const randomizeMesh = () => {
    const nextMode: ShapeMode = shapeMode === 'smooth' ? 'angular' : 'smooth';
    setShapeMode(nextMode);
    setBlobConfigs(generateBlobConfigs(nextMode));
    const indices = gradientColorOrder.length === collectedColors.length
      ? gradientColorOrder
      : collectedColors.map((_, i) => i);
    setGradientColorOrder(shuffle([...indices]));
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4 items-center justify-center flex-1">
      <div
        className="w-full rounded-2xl overflow-hidden relative"
        style={{
          aspectRatio: isMobile ? '9/16' : '16/9',
          maxHeight: isMobile ? '70vh' : undefined,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <AnimatePresence mode="wait">
          {!showGradient ? (
            /* Placeholder before first spin */
            <motion.div
              key="empty"
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ background: '#e8e6e3' }}
            >
              <p
                className="text-sm tracking-widest uppercase select-none"
                style={{ color: '#bbb', fontFamily: 'var(--font-geist-sans), sans-serif', letterSpacing: '0.2em' }}
              >
                Spin to generate
              </p>
            </motion.div>
          ) : (
            /* Gradient — fades in on first appearance, updates live after */
            <motion.div
              key="gradient"
              className="absolute inset-0 rounded-2xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <MeshGradient colors={orderedColors} blobs={blobConfigs} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showGradient && actionsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 w-full"
        >
          {/* Download */}
          <button
            onClick={() => {
              const { width, height } = downloadDimensions();
              downloadDataUrl(generateMeshGradientDataUrl(orderedColors, width, height));
            }}
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

          {/* Remix */}
          <button
            onClick={randomizeMesh}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-black/5 active:scale-95 border"
            style={{ color: '#64748b', borderColor: '#e2e0da', background: '#fff' }}
            title={`Remix · currently ${shapeMode}`}
            aria-label="Remix gradient"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>

          {/* New Roulette */}
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
