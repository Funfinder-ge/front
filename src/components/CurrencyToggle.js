import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { CurrencyExchange as CurrencyIcon } from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencyToggle = () => {
  const { currency, toggleCurrency, getCurrencySymbol } = useCurrency();

  return (
    <Box
      data-guide="currency-toggle"
      data-fab-trigger="currency"
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Tooltip title={`Switch to ${currency === 'GEL' ? 'USD' : 'GEL'}`}>
        <IconButton
          onClick={toggleCurrency}
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
          <Box sx={{ textAlign: 'center' }}>
            <CurrencyIcon sx={{ fontSize: 24 }} />
            <Box sx={{ fontSize: '10px', fontWeight: 600, mt: 0.5 }}>
              {getCurrencySymbol()}
            </Box>
          </Box>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CurrencyToggle;

