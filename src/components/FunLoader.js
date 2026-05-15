import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../assets/logo.jpg';

const FunLoader = ({
  size = 96,
  label = 'Loading',
  fullscreen = false,
  inline = false,
  sx = {},
}) => {
  const ring = size;
  const inner = Math.round(size * 0.68);

  const wrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...(fullscreen && {
      position: 'fixed',
      inset: 0,
      zIndex: 1500,
      background:
        'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.96), rgba(248,232,240,0.96))',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }),
    ...(!fullscreen && !inline && { py: 6, width: '100%' }),
    ...sx,
  };

  return (
    <Box sx={wrapper} role="status" aria-live="polite" aria-label={label}>
      <Box
        sx={{
          position: 'relative',
          width: ring,
          height: ring,
          '@keyframes funLoaderSpin': {
            to: { transform: 'rotate(360deg)' },
          },
          '@keyframes funLoaderSpinReverse': {
            to: { transform: 'rotate(-360deg)' },
          },
          '@keyframes funLoaderPulse': {
            '0%, 100%': { transform: 'scale(1)', boxShadow: '0 8px 24px rgba(135,0,58,0.35)' },
            '50%': { transform: 'scale(1.06)', boxShadow: '0 14px 36px rgba(135,0,58,0.55)' },
          },
          '@keyframes funLoaderOrbit': {
            from: { transform: 'rotate(0deg) translateX(var(--r)) rotate(0deg)' },
            to: { transform: 'rotate(360deg) translateX(var(--r)) rotate(-360deg)' },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#87003A',
            borderRightColor: '#c1004f',
            animation: 'funLoaderSpin 1.1s linear infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: '2px dashed rgba(255,193,7,0.85)',
            animation: 'funLoaderSpinReverse 3.2s linear infinite',
          }}
        />

        {[0, 120, 240].map((angle) => (
          <Box
            key={angle}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              marginTop: '-4px',
              marginLeft: '-4px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFC107, #FF6F61)',
              boxShadow: '0 0 10px rgba(255,193,7,0.75)',
              '--r': `${ring / 2 - 4}px`,
              animation: `funLoaderOrbit 2.4s linear infinite`,
              animationDelay: `${-(angle / 360) * 2.4}s`,
            }}
          />
        ))}

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: inner,
            height: inner,
            marginTop: `-${inner / 2}px`,
            marginLeft: `-${inner / 2}px`,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#fff',
            animation: 'funLoaderPulse 1.8s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(1.1)',
            }}
          />
        </Box>
      </Box>

      {label && !inline && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #87003A, #c1004f, #FFC107, #87003A)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'funLoaderShimmer 2.4s linear infinite',
              '@keyframes funLoaderShimmer': {
                to: { backgroundPosition: '200% center' },
              },
            }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              gap: 0.6,
              mt: 0.5,
              '@keyframes funLoaderDot': {
                '0%, 80%, 100%': { opacity: 0.25, transform: 'translateY(0)' },
                '40%': { opacity: 1, transform: 'translateY(-3px)' },
              },
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#87003A',
                  animation: `funLoaderDot 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FunLoader;
