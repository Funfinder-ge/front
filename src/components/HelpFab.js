import React, { useState } from 'react';
import { Box, Fab, Tooltip, Zoom, Paper, Typography, IconButton } from '@mui/material';
import {
  HelpOutline as HelpOutlineIcon,
  Close as CloseIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const channels = [
  { icon: <WhatsAppIcon />, label: 'WhatsApp', color: '#25D366', href: 'https://wa.me/995555346132' },
  { icon: <TelegramIcon />, label: 'Telegram', color: '#0088CC', href: 'https://t.me/funfinder_ge' },
  { icon: <EmailIcon />, label: 'Email', color: '#87003A', href: 'mailto:info@funfinder.ge' },
  { icon: <PhoneIcon />, label: 'Call', color: '#43A047', href: 'tel:+995555346132' },
];

const HelpFab = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 310, md: 310 },
        right: { xs: 20, md: 20 },
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
      }}
    >
      {open && (
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 3,
            minWidth: 220,
            background: 'linear-gradient(135deg, #fff 0%, #fff8f0 100%)',
            boxShadow: '0 14px 38px rgba(135,0,58,0.25)',
            animation: 'fabPanelIn 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes fabPanelIn': {
              from: { opacity: 0, transform: 'translateY(8px) scale(0.96)' },
              to: { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#87003A' }}>
              Need help?
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            {channels.map((c) => (
              <Box
                key={c.label}
                component="a"
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.primary',
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    background: `${c.color}15`,
                  },
                }}
              >
                <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                <Typography variant="body2" fontWeight={600}>{c.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Tooltip title={open ? 'Close' : 'Need help?'} placement="left">
        <Box
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,193,7,0.5), transparent 70%)',
              animation: open ? 'none' : 'fabPulse 2.2s ease-in-out infinite',
              pointerEvents: 'none',
            },
            '@keyframes fabPulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.9 },
              '50%': { transform: 'scale(1.25)', opacity: 0.3 },
            },
          }}
        >
          <Zoom in>
            <Fab
              onClick={() => setOpen((o) => !o)}
              sx={{
                background: 'linear-gradient(135deg, #87003A, #c1004f)',
                color: '#fff',
                boxShadow: '0 8px 22px rgba(135,0,58,0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c1004f, #87003A)',
                  transform: 'scale(1.06)',
                },
                transition: 'transform 0.2s ease',
              }}
            >
              {open ? <CloseIcon /> : <HelpOutlineIcon />}
            </Fab>
          </Zoom>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default HelpFab;
