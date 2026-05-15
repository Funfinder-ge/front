import React, { useEffect, useState, useRef } from 'react';
import { Box, IconButton, Tooltip, Fab, Backdrop } from '@mui/material';
import {
  Close as CloseIcon,
  RocketLaunch as RocketIcon,
  CurrencyExchange as CurrencyIcon,
  AccessibilityNew as AccessibilityIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';

const triggerOriginal = (id) => {
  const node = document.querySelector(`[data-fab-trigger="${id}"]`);
  if (!node) return;
  const button = node.querySelector('button') || node;
  if (button && typeof button.click === 'function') button.click();
};

const planets = [
  { id: 'scrolltop', label: 'Scroll to top', icon: <RocketIcon />, ring: 'inner', angle: 90, color: '#FF6F61' },
  { id: 'currency', label: 'Currency', icon: <CurrencyIcon />, ring: 'inner', angle: 135, color: '#FFC107' },
  { id: 'accessibility', label: 'Accessibility', icon: <AccessibilityIcon />, ring: 'inner', angle: 180, color: '#43A047' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, ring: 'outer', angle: 100, color: '#25D366' },
  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon />, ring: 'outer', angle: 125, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon />, ring: 'outer', angle: 150, color: '#E1306C' },
  { id: 'email', label: 'Email', icon: <EmailIcon />, ring: 'outer', angle: 175, color: '#1E88E5' },
];

const RING_RADIUS = { inner: 100, outer: 170 };

const polarToCartesian = (radius, angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: -Math.round(Math.cos(rad) * radius * 100) / 100 * -1,
    y: -Math.round(Math.sin(rad) * radius * 100) / 100,
  };
};

const sliderIcons = [
  { key: 'facebook', icon: <FacebookIcon sx={{ fontSize: 30 }} /> },
  { key: 'instagram', icon: <InstagramIcon sx={{ fontSize: 30 }} /> },
  { key: 'whatsapp', icon: <WhatsAppIcon sx={{ fontSize: 30 }} /> },
  { key: 'email', icon: <EmailIcon sx={{ fontSize: 30 }} /> },
  { key: 'rocket', icon: <RocketIcon sx={{ fontSize: 30 }} /> },
];

const OrbitalFab = () => {
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const { toggleCurrency } = useCurrency();
  const styleRef = useRef(null);

  useEffect(() => {
    if (open) return undefined;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % sliderIcons.length);
    }, 1600);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-fab-trigger="currency"],
      [data-fab-trigger="accessibility"],
      [data-fab-trigger="scrolltop"],
      [data-fab-trigger="chat"] {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: scale(0) !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
      }
    };
  }, []);

  const handlePlanetClick = (id) => {
    setOpen(false);
    setTimeout(() => {
      switch (id) {
        case 'scrolltop':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'currency':
          toggleCurrency();
          break;
        case 'accessibility':
          triggerOriginal('accessibility');
          break;
        case 'whatsapp':
          window.open('https://wa.me/995555346132', '_blank', 'noopener,noreferrer');
          break;
        case 'facebook':
          window.open('https://www.facebook.com/IPvideoo', '_blank', 'noopener,noreferrer');
          break;
        case 'instagram':
          window.open('https://www.instagram.com/funfinderge/', '_blank', 'noopener,noreferrer');
          break;
        case 'email':
          window.open('mailto:info@funfinder.ge?subject=Help%20with%20Funfinder', '_blank');
          break;
        default:
          break;
      }
    }, 150);
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={() => setOpen(false)}
        sx={{
          zIndex: 1399,
          background: 'radial-gradient(circle at bottom right, rgba(0,0,0,0.55), rgba(0,0,0,0.25))',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 64,
          height: 64,
          zIndex: 1400,
        }}
      >
        {planets.map((p, idx) => {
          const radius = RING_RADIUS[p.ring];
          const { x, y } = polarToCartesian(radius, p.angle);
          const stagger = open ? idx * 55 : (planets.length - idx - 1) * 35;
          return (
            <Tooltip key={p.id} title={p.label} placement="left" arrow>
              <IconButton
                onClick={() => handlePlanetClick(p.id)}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)`,
                  color: '#fff',
                  boxShadow: `0 6px 18px ${p.color}66, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transform: open
                    ? `translate3d(${x}px, ${y}px, 0) scale(1) rotate(0deg)`
                    : 'translate3d(0, 0, 0) scale(0.2) rotate(-180deg)',
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? 'auto' : 'none',
                  transition: `transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1) ${stagger}ms, opacity 360ms ease ${stagger}ms, box-shadow 0.25s ease`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${p.color}, ${p.color})`,
                    boxShadow: `0 10px 26px ${p.color}aa`,
                    transform: open
                      ? `translate3d(${x}px, ${y}px, 0) scale(1.12) rotate(0deg)`
                      : 'translate3d(0, 0, 0) scale(0.2)',
                  },
                  '&::after': open ? {
                    content: '""',
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: `1px dashed ${p.color}55`,
                    animation: 'orbitSpin 8s linear infinite',
                  } : {},
                  '@keyframes orbitSpin': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                }}
              >
                {p.icon}
              </IconButton>
            </Tooltip>
          );
        })}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,193,7,0.55), transparent 70%)',
              animation: open ? 'none' : 'orbitalCorePulse 2.4s ease-in-out infinite',
              pointerEvents: 'none',
            },
            '@keyframes orbitalCorePulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.85 },
              '50%': { transform: 'scale(1.3)', opacity: 0.25 },
            },
          }}
        >
          <Tooltip title={open ? 'Close' : 'Quick actions'} placement="left">
            <Fab
              onClick={() => setOpen((o) => !o)}
              sx={{
                width: 64,
                height: 64,
                background: open
                  ? 'linear-gradient(135deg, #3d000f, #87003A)'
                  : 'linear-gradient(135deg, #87003A, #c1004f)',
                color: '#fff',
                boxShadow: '0 10px 26px rgba(135,0,58,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                transform: open ? 'rotate(135deg) scale(1.05)' : 'rotate(0deg) scale(1)',
                transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), background 280ms ease, box-shadow 280ms ease',
                '&:hover': {
                  background: open
                    ? 'linear-gradient(135deg, #87003A, #3d000f)'
                    : 'linear-gradient(135deg, #c1004f, #87003A)',
                  boxShadow: '0 14px 32px rgba(135,0,58,0.65)',
                  transform: open ? 'rotate(135deg) scale(1.1)' : 'rotate(0deg) scale(1.06)',
                },
              }}
            >
              {open ? (
                <CloseIcon sx={{ fontSize: 28 }} />
              ) : (
                <Box
                  sx={{
                    position: 'relative',
                    width: 34,
                    height: 34,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sliderIcons.map((s, i) => {
                    const diff = (i - slideIndex + sliderIcons.length) % sliderIcons.length;
                    const isActive = diff === 0;
                    const isNext = diff === 1;
                    return (
                      <Box
                        key={s.key}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: isActive
                            ? 'translateY(0) scale(1)'
                            : isNext
                              ? 'translateY(100%) scale(0.85)'
                              : 'translateY(-100%) scale(0.85)',
                          opacity: isActive ? 1 : 0,
                          transition:
                            'transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 360ms ease',
                        }}
                      >
                        {s.icon}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Fab>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default OrbitalFab;
