import React from 'react';
import { Box, Typography } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';

const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

const PriceDisplay = ({
  basePrice,
  discountedPrice,
  pricePerPerson,
  variant = 'h6',
  showIcon = true,
  align = 'left',
}) => {
  const { formatPrice } = useCurrency();

  const base = toNumber(basePrice);
  const discounted = toNumber(discountedPrice ?? pricePerPerson);
  const hasDiscount = base != null && discounted != null && discounted < base;

  if (base == null && discounted == null) {
    return (
      <Box display="flex" alignItems="center" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}>
        {showIcon && <AttachMoney sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />}
        <Typography variant={variant} color="text.secondary">
          Price not specified
        </Typography>
      </Box>
    );
  }

  const justify = align === 'right' ? 'flex-end' : 'flex-start';

  if (hasDiscount) {
    return (
      <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap" justifyContent={justify}>
        <Typography
          variant={variant}
          sx={{ color: '#2e7d32', fontWeight: 700 }}
        >
          {formatPrice(discounted)}
        </Typography>
        <Typography
          sx={{
            color: '#d32f2f',
            textDecoration: 'line-through',
            opacity: 0.7,
            fontSize: '0.875rem',
            fontWeight: 400,
          }}
        >
          {formatPrice(base)}
        </Typography>
      </Box>
    );
  }

  const single = base != null ? base : discounted;
  return (
    <Box display="flex" alignItems="center" justifyContent={justify}>
      <Typography
        variant={variant}
        sx={{ color: 'primary.main', fontWeight: 600 }}
      >
        {formatPrice(single)}
      </Typography>
    </Box>
  );
};

export default PriceDisplay;
