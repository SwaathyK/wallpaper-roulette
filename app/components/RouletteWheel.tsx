'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { WHEEL_COLORS, colorFromAngle } from '../utils/colorGenerator';

const FALLBACK_SPIN_DURATION_S = 3;

interface RouletteWheelProps {
  onColorSelected: (color: string) => void;
  disabled?: boolean;
}

export default function RouletteWheel({ onColorSelected, disabled }: RouletteWheelProps) {
  const controls = useAnimation();
  const [spinning, setSpinning] = useState(false);
  const [landedColor, setLandedColor] = useState<string | null>(null);
  const accumulatedRotation = useRef(0);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const spinDurationRef = useRef(FALLBACK_SPIN_DURATION_S);

  // Preload sound and use its real duration so wheel stops when sound ends
  useEffect(() => {
    const audio = new Audio('/sounds/spin.mp3');
    spinSoundRef.current = audio;
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        spinDurationRef.current = audio.duration;
      }
    };
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.load();
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  const NUM_SEGMENTS = WHEEL_COLORS.length;
  const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
  const SIZE = 340;
  const R = SIZE / 2;
  const cx = R;
  const cy = R;

  const buildPath = (index: number) => {
    const startAngle = ((index * SEGMENT_ANGLE - 90) * Math.PI) / 180;
    const endAngle = (((index + 1) * SEGMENT_ANGLE - 90) * Math.PI) / 180;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    return `M${cx},${cy} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`;
  };

  const spin = async () => {
    if (spinning || disabled) return;
    setSpinning(true);
    setLandedColor(null);

    const durationS = spinDurationRef.current;

    try {
      if (spinSoundRef.current) {
        spinSoundRef.current.currentTime = 0;
        spinSoundRef.current.play().catch(() => {});
      }
    } catch {
      // No sound if file missing or autoplay blocked
    }

    const extraRotations = 3 + Math.floor(Math.random() * 3);
    const randomExtra = Math.random() * 360;
    const delta = extraRotations * 360 + randomExtra;
    accumulatedRotation.current += delta;

    await controls.start({
      rotate: accumulatedRotation.current,
      transition: { duration: durationS, ease: [0.22, 1, 0.36, 1] },
    });

    const color = colorFromAngle(accumulatedRotation.current, WHEEL_COLORS);
    setLandedColor(color);
    setSpinning(false);
    onColorSelected(color);
  };

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <div className="relative" style={{ width: SIZE + 24, height: SIZE + 24 }}>
        {/* Landed glow */}
        {landedColor && (
          <div
            className="absolute inset-4 rounded-full opacity-20 blur-3xl transition-all duration-700 pointer-events-none"
            style={{ background: landedColor }}
          />
        )}

        {/* Pointer at top */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 pointer-events-none">
          <svg width="20" height="26" viewBox="0 0 20 26">
            <path d="M10 24 L2 4 Q10 0 18 4 Z" fill="#222" />
          </svg>
        </div>

        {/* Spinning wheel */}
        <motion.div
          className="absolute"
          style={{
            top: 12,
            left: 12,
            width: SIZE,
            height: SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          }}
          animate={controls}
          initial={{ rotate: 0 }}
        >
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {WHEEL_COLORS.map((color, i) => (
              <path
                key={i}
                d={buildPath(i)}
                fill={color}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />
            ))}
            {/* Center cap: background colour only */}
            <circle cx={cx} cy={cy} r={32} fill="#f5f4f1" />
            <circle cx={cx} cy={cy} r={30} fill="#f5f4f1" />
          </svg>
        </motion.div>

        {/* Center spin button — centered with wheel (no offset) */}
        <button
          onClick={spin}
          disabled={spinning || disabled}
          className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center"
          aria-label="Spin"
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-150
              ${spinning || disabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:scale-110 active:scale-95 cursor-pointer'
              }`}
            style={{ background: '#f5f4f1', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
          >
            {spinning ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
                className="text-[#64748b] text-xl leading-none"
              >
                ◌
              </motion.span>
            ) : (
              <span className="text-[#64748b] text-xl leading-none">⚡</span>
            )}
          </div>
        </button>
      </div>

      {/* Status label */}
      <p
        className="text-xs tracking-[0.25em] uppercase font-medium"
        style={{ color: spinning ? '#64748b' : disabled ? '#1fbb34' : '#888' }}
      >
        {spinning ? 'Spinning…' : disabled ? 'All done!' : 'Click ⚡ to spin'}
      </p>
    </div>
  );
}
