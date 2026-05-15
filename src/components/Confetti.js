import React, { useEffect, useState, useMemo } from 'react';
import { Box } from '@mui/material';

const COLORS = ['#FFC107', '#FF6F61', '#87003A', '#43A047', '#1E88E5', '#fff'];

const Confetti = ({ active = true, count = 90, duration = 3500 }) => {
  const [running, setRunning] = useState(active);

  useEffect(() => {
    if (!active) return;
    setRunning(true);
    const t = setTimeout(() => setRunning(false), duration + 500);
    return () => clearTimeout(t);
  }, [active, duration]);

  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 600;
      const fallDuration = 2200 + Math.random() * 1800;
      const size = 6 + Math.random() * 8;
      const rotateStart = Math.random() * 360;
      const rotateEnd = rotateStart + 360 + Math.random() * 720;
      const swayAmp = 20 + Math.random() * 40;
      const color = COLORS[i % COLORS.length];
      const shape = Math.random() > 0.5 ? '50%' : '2px';
      return { left, delay, fallDuration, size, rotateStart, rotateEnd, swayAmp, color, shape };
    });
  }, [count]);

  if (!running) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 3000,
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translate3d(0, -10vh, 0) rotate(var(--r0)); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(var(--sway), 110vh, 0) rotate(var(--r1)); opacity: 1; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * (Math.random() > 0.5 ? 1 : 1.6)}px`,
            background: p.color,
            borderRadius: p.shape,
            boxShadow: `0 0 6px ${p.color}66`,
            '--r0': `${p.rotateStart}deg`,
            '--r1': `${p.rotateEnd}deg`,
            '--sway': `${(Math.random() > 0.5 ? 1 : -1) * p.swayAmp}px`,
            animation: `confettiFall ${p.fallDuration}ms cubic-bezier(0.25, 0.5, 0.5, 1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </Box>
  );
};

export default Confetti;
