import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const value = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(value);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 2000,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 35%, #87003A 100%)',
          boxShadow: '0 0 10px rgba(255,193,7,0.6), 0 0 20px rgba(135,0,58,0.4)',
          transition: 'width 80ms linear',
        }}
      />
    </Box>
  );
};

export default ScrollProgressBar;
