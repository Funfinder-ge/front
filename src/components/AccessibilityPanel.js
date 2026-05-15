import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Close as CloseIcon,
  Brightness4,
  Brightness7,
  Visibility,
  ColorLens,
} from '@mui/icons-material';

const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [colorblindMode, setColorblindMode] = useState('none');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('accessibility_darkMode') === 'true';
    const savedDyslexiaMode = localStorage.getItem('accessibility_dyslexiaMode') === 'true';
    const savedColorblindMode = localStorage.getItem('accessibility_colorblindMode') || 'none';
    const savedHighContrast = localStorage.getItem('accessibility_highContrast') === 'true';

    setDarkMode(savedDarkMode);
    setDyslexiaMode(savedDyslexiaMode);
    setColorblindMode(savedColorblindMode);
    setHighContrast(savedHighContrast);

    // Apply initial styles
    applyAccessibilityStyles(savedDarkMode, savedDyslexiaMode, savedColorblindMode, savedHighContrast);
  }, []);

  const applyAccessibilityStyles = (dark, dyslexia, colorblind, contrast) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Dark mode
    if (dark) {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--card-bg', '#2d2d2d');
      root.style.setProperty('--sidebar-bg', '#1a1a1a');
      root.style.setProperty('--main-bg', '#121212');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--sidebar-bg', '#87003A');
      root.style.setProperty('--main-bg', '#ffffff');
    }

    // Dyslexia mode
    if (dyslexia) {
      root.classList.add('dyslexia-mode');
      root.style.setProperty('--font-family', 'Comic Sans MS, Arial, sans-serif');
      root.style.setProperty('--letter-spacing', '0.1em');
      root.style.setProperty('--word-spacing', '0.2em');
    } else {
      root.classList.remove('dyslexia-mode');
      root.style.setProperty('--font-family', '');
      root.style.setProperty('--letter-spacing', '');
      root.style.setProperty('--word-spacing', '');
    }

    // Colorblind mode
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    if (colorblind !== 'none') {
      root.classList.add(`colorblind-${colorblind}`);
    }

    // High contrast
    if (contrast) {
      root.classList.add('high-contrast');
      root.style.setProperty('--contrast-bg', dark ? '#000000' : '#ffffff');
      root.style.setProperty('--contrast-text', dark ? '#ffffff' : '#000000');
      root.style.setProperty('--contrast-border', '#000000');
    } else {
      root.classList.remove('high-contrast');
      root.style.removeProperty('--contrast-bg');
      root.style.removeProperty('--contrast-text');
      root.style.removeProperty('--contrast-border');
    }
  };

  const handleDarkModeChange = (event) => {
    const newValue = event.target.checked;
    setDarkMode(newValue);
    localStorage.setItem('accessibility_darkMode', newValue);
    applyAccessibilityStyles(newValue, dyslexiaMode, colorblindMode, highContrast);
  };

  const handleDyslexiaModeChange = (event) => {
    const newValue = event.target.checked;
    setDyslexiaMode(newValue);
    localStorage.setItem('accessibility_dyslexiaMode', newValue);
    applyAccessibilityStyles(darkMode, newValue, colorblindMode, highContrast);
  };

  const handleColorblindModeChange = (event) => {
    const newValue = event.target.value;
    setColorblindMode(newValue);
    localStorage.setItem('accessibility_colorblindMode', newValue);
    applyAccessibilityStyles(darkMode, dyslexiaMode, newValue, highContrast);
  };

  const handleHighContrastChange = (event) => {
    const newValue = event.target.checked;
    setHighContrast(newValue);
    localStorage.setItem('accessibility_highContrast', newValue);
    applyAccessibilityStyles(darkMode, dyslexiaMode, colorblindMode, newValue);
  };

  return (
    <>
      {/* Toggle Button */}
      <Box
        data-fab-trigger="accessibility"
        sx={{
          position: 'fixed',
          bottom: 160,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Accessibility Settings">
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: '#87003A',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 4px 20px rgba(135, 0, 58, 0.3)',
              '&:hover': {
                backgroundColor: '#6a002c',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <AccessibilityIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Accessibility Panel Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: '#87003A' }}>
            Accessibility Settings
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Dark/Light Theme */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {darkMode ? <Brightness4 sx={{ mr: 1, color: '#87003A' }} /> : <Brightness7 sx={{ mr: 1, color: '#87003A' }} />}
            <Typography variant="h6" fontWeight={600}>
              Theme
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleDarkModeChange}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#87003A',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#87003A',
                  },
                }}
              />
            }
            label={darkMode ? 'Dark Mode' : 'Light Mode'}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Dyslexia Mode */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Visibility sx={{ mr: 1, color: '#87003A' }} />
            <Typography variant="h6" fontWeight={600}>
              Dyslexia-Friendly Font
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={dyslexiaMode}
                onChange={handleDyslexiaModeChange}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#87003A',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#87003A',
                  },
                }}
              />
            }
            label="Enable dyslexia-friendly font"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Changes font to Comic Sans MS with increased letter and word spacing for better readability.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Colorblind Mode */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ColorLens sx={{ mr: 1, color: '#87003A' }} />
            <Typography variant="h6" fontWeight={600}>
              Colorblind Mode
            </Typography>
          </Box>
          <FormControl fullWidth>
            <Select
              value={colorblindMode}
              onChange={handleColorblindModeChange}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#87003A',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#87003A',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#87003A',
                },
              }}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="protanopia">Protanopia (Red-Blind)</MenuItem>
              <MenuItem value="deuteranopia">Deuteranopia (Green-Blind)</MenuItem>
              <MenuItem value="tritanopia">Tritanopia (Blue-Blind)</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Adjusts colors to help with color vision deficiencies.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* High Contrast */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Visibility sx={{ mr: 1, color: '#87003A' }} />
            <Typography variant="h6" fontWeight={600}>
              High Contrast
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={highContrast}
                onChange={handleHighContrastChange}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#87003A',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#87003A',
                  },
                }}
              />
            }
            label="Enable high contrast mode"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Increases contrast between text and background for better visibility.
          </Typography>
        </Box>
      </Drawer>

      {/* Global Styles */}
      <style>
        {`
          /* Dark Theme */
          .dark-theme {
            background-color: #1a1a1a !important;
            color: #ffffff !important;
          }
          
          .dark-theme .MuiPaper-root {
            background-color: #2d2d2d !important;
            color: #ffffff !important;
          }
          
          .dark-theme .MuiCard-root {
            background-color: #2d2d2d !important;
            color: #ffffff !important;
          }
          
          /* Dyslexia Mode */
          .dyslexia-mode * {
            font-family: 'Comic Sans MS', Arial, sans-serif !important;
            letter-spacing: 0.1em !important;
            word-spacing: 0.2em !important;
          }
          
          /* Colorblind Filters */
          .colorblind-protanopia {
            filter: url('#protanopia-filter');
          }
          
          .colorblind-deuteranopia {
            filter: url('#deuteranopia-filter');
          }
          
          .colorblind-tritanopia {
            filter: url('#tritanopia-filter');
          }
          
          /* High Contrast */
          .high-contrast {
            filter: contrast(1.5) brightness(1.1);
          }
          
          .high-contrast * {
            border-color: #000000 !important;
          }
        `}
      </style>

      {/* SVG Filters for Colorblind Modes */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
              type="matrix"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
              type="matrix"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
              type="matrix"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default AccessibilityPanel;

