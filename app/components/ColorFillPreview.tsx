'use client';

import { motion } from 'framer-motion';

interface ColorFillPreviewProps {
  collectedColors: string[];
  totalSpins: number;
}

/** Right-panel "image": shapes that fill with each selected color as the user spins. */
export default function ColorFillPreview({ collectedColors, totalSpins }: ColorFillPreviewProps) {
  const size = 260;
  const center = size / 2;
  const baseR = size * 0.32;

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6"
      style={{ background: '#f5f4f1' }}
    >
      <span
        className="text-[11px] tracking-[0.35em] uppercase font-medium mb-4"
        style={{ color: '#94a3b8', fontFamily: 'var(--font-geist-sans), sans-serif' }}
      >
        Your palette
      </span>
      <div className="relative" style={{ width: size, height: size }}>
        {Array.from({ length: totalSpins }).map((i) => {
          const color = collectedColors[i];
          const angle = (i / totalSpins) * 2 * Math.PI - Math.PI / 2;
          const r = baseR * (0.65 + (i % 3) * 0.12);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          const circleR = size * 0.18;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                left: x - circleR,
                top: y - circleR,
                width: circleR * 2,
                height: circleR * 2,
                borderColor: color ? `${color}99` : '#e2e0da',
                boxShadow: color ? `0 4px 20px ${color}44` : '0 2px 8px rgba(0,0,0,0.06)',
              }}
              initial={false}
              animate={{
                scale: color ? 1 : 0.92,
                opacity: 1,
                background: color || '#f5f4f1',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 24,
                background: { duration: 0.4 },
              }}
            />
          );
        })}
        {/* Optional center circle that shows gradient when all filled */}
        {collectedColors.length === totalSpins && totalSpins >= 2 && (
          <motion.div
            className="absolute rounded-full"
            style={{
              left: center - size * 0.12,
              top: center - size * 0.12,
              width: size * 0.24,
              height: size * 0.24,
              background: `linear-gradient(135deg, ${collectedColors[0]}, ${collectedColors[collectedColors.length - 1]})`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          />
        )}
      </div>
      <p
        className="text-xs mt-4 text-center max-w-[200px]"
        style={{ color: '#94a3b8', fontFamily: 'var(--font-geist-sans), sans-serif' }}
      >
        {collectedColors.length === 0
          ? 'Spin to fill each shape with a color'
          : `${collectedColors.length} of ${totalSpins} colors collected`}
      </p>
    </div>
  );
}
