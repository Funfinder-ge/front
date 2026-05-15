import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const RevealOnScroll = ({
  children,
  delay = 0,
  duration = 700,
  distance = 24,
  direction = 'up',
  threshold = 0,
  rootMargin = '0px 0px -80px 0px',
  once = true,
  sx = {},
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    const fallback = setTimeout(() => setVisible(true), 1500);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [threshold, rootMargin, once]);

  const offset = (() => {
    switch (direction) {
      case 'down': return `0, -${distance}px`;
      case 'left': return `${distance}px, 0`;
      case 'right': return `-${distance}px, 0`;
      case 'up':
      default: return `0, ${distance}px`;
    }
  })();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(${offset})`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default RevealOnScroll;
