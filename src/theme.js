import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#87003A',
      dark: '#3d000f',
      light: 'rgba(135, 0, 58, 0.08)',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#555',
    },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
  },
  typography: {
    fontFamily: 'nino-herv, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica Neue, Arial, sans-serif',
    fontWeightBold: 700,
    h1: { fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2 },
    h2: { fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.3 },
    h3: { fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.4 },
    h4: { fontWeight: 700, lineHeight: 1.4 },
    h5: { fontWeight: 700, lineHeight: 1.4 },
    h6: { fontWeight: 700, lineHeight: 1.4 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    'rgba(0,0,0,0.06) 0px 2px 4px',                                                                          // 1 - subtle
    'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',         // 2 - card
    'rgba(0,0,0,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px, rgba(0,0,0,0.12) 0px 8px 16px',       // 3 - hover
    'rgba(0,0,0,0.08) 0px 8px 24px, rgba(0,0,0,0.04) 0px 2px 8px',                                           // 4 - elevated
    'rgba(0,0,0,0.15) 0px 16px 48px',                                                                          // 5 - modal
    // MUI requires 25 shadow entries, fill rest with defaults
    'rgba(0,0,0,0.06) 0px 3px 5px -1px, rgba(0,0,0,0.04) 0px 6px 10px',
    'rgba(0,0,0,0.06) 0px 3px 5px -1px, rgba(0,0,0,0.04) 0px 6px 10px',
    'rgba(0,0,0,0.06) 0px 5px 5px -3px, rgba(0,0,0,0.04) 0px 8px 10px 1px',
    'rgba(0,0,0,0.06) 0px 5px 5px -3px, rgba(0,0,0,0.04) 0px 8px 10px 1px',
    'rgba(0,0,0,0.06) 0px 5px 6px -3px, rgba(0,0,0,0.04) 0px 9px 12px 1px',
    'rgba(0,0,0,0.06) 0px 5px 6px -3px, rgba(0,0,0,0.04) 0px 9px 12px 1px',
    'rgba(0,0,0,0.06) 0px 7px 8px -4px, rgba(0,0,0,0.04) 0px 12px 17px 2px',
    'rgba(0,0,0,0.06) 0px 7px 8px -4px, rgba(0,0,0,0.04) 0px 12px 17px 2px',
    'rgba(0,0,0,0.06) 0px 7px 9px -4px, rgba(0,0,0,0.04) 0px 14px 21px 2px',
    'rgba(0,0,0,0.06) 0px 7px 9px -4px, rgba(0,0,0,0.04) 0px 14px 21px 2px',
    'rgba(0,0,0,0.06) 0px 8px 9px -5px, rgba(0,0,0,0.04) 0px 15px 22px 2px',
    'rgba(0,0,0,0.06) 0px 8px 9px -5px, rgba(0,0,0,0.04) 0px 15px 22px 2px',
    'rgba(0,0,0,0.06) 0px 8px 10px -5px, rgba(0,0,0,0.04) 0px 16px 24px 2px',
    'rgba(0,0,0,0.06) 0px 8px 10px -5px, rgba(0,0,0,0.04) 0px 16px 24px 2px',
    'rgba(0,0,0,0.06) 0px 8px 11px -5px, rgba(0,0,0,0.04) 0px 17px 26px 2px',
    'rgba(0,0,0,0.06) 0px 9px 11px -5px, rgba(0,0,0,0.04) 0px 18px 28px 2px',
    'rgba(0,0,0,0.06) 0px 9px 12px -6px, rgba(0,0,0,0.04) 0px 19px 29px 2px',
    'rgba(0,0,0,0.06) 0px 10px 13px -6px, rgba(0,0,0,0.04) 0px 20px 31px 3px',
    'rgba(0,0,0,0.06) 0px 10px 14px -6px, rgba(0,0,0,0.04) 0px 22px 35px 3px',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          padding: '10px 24px',
          transition: 'background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#3d000f',
          },
        },
        outlinedPrimary: {
          borderColor: '#87003A',
          '&:hover': {
            backgroundColor: 'rgba(135, 0, 58, 0.08)',
            borderColor: '#87003A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'rgba(0,0,0,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px, rgba(0,0,0,0.12) 0px 8px 16px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(135, 0, 58, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
