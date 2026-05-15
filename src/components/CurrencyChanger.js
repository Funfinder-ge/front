import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fade,
  Slide,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CurrencyExchange as CurrencyIcon,
  Close as CloseIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import FunLoader from './FunLoader';

const CurrencyChanger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GEL');
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common currencies for Georgia
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  ];

  // Default exchange rates (fallback if API fails)
  const defaultRates = {
    USD: { GEL: 2.7, EUR: 0.92, GBP: 0.79, RUB: 92.5, TRY: 32.1 },
    EUR: { GEL: 2.93, USD: 1.09, GBP: 0.86, RUB: 100.5, TRY: 34.9 },
    GEL: { USD: 0.37, EUR: 0.34, GBP: 0.29, RUB: 34.3, TRY: 11.9 },
    GBP: { GEL: 3.42, USD: 1.27, EUR: 1.16, RUB: 117.1, TRY: 40.6 },
    RUB: { GEL: 0.029, USD: 0.011, EUR: 0.010, GBP: 0.0085, TRY: 0.35 },
    TRY: { GEL: 0.084, USD: 0.031, EUR: 0.029, GBP: 0.025, RUB: 2.86 },
  };

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to fetch from a free API (using exchangerate-api.com or similar)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.rates && data.rates[toCurrency]) {
          setExchangeRate(data.rates[toCurrency]);
          calculateConversion(amount, data.rates[toCurrency]);
        } else {
          throw new Error('Currency not found');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.log('Using default rates:', err);
      // Use default rates if API fails
      if (defaultRates[fromCurrency] && defaultRates[fromCurrency][toCurrency]) {
        const rate = defaultRates[fromCurrency][toCurrency];
        setExchangeRate(rate);
        calculateConversion(amount, rate);
      } else {
        setError('Unable to fetch exchange rate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateConversion = (value, rate) => {
    const numAmount = parseFloat(value) || 0;
    const converted = (numAmount * rate).toFixed(2);
    setConvertedAmount(converted);
  };

  useEffect(() => {
    if (isOpen && amount && fromCurrency && toCurrency) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency, isOpen]);

  useEffect(() => {
    if (exchangeRate && amount) {
      calculateConversion(amount, exchangeRate);
    }
  }, [amount]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount(convertedAmount || '1');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const getCurrencySymbol = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  return (
    <>
      {/* Floating Button */}
      <Fade in={!isOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            display: isOpen ? 'none' : 'block'
          }}
        >
          <IconButton
            onClick={() => setIsOpen(true)}
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
            <CurrencyIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Fade>

      {/* Currency Converter Window */}
      <Slide direction="up" in={isOpen} timeout={300}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 380,
            maxHeight: 600,
            zIndex: 1001,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: '#87003A',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CurrencyIcon />
              <Typography variant="h6" fontWeight={600}>
                Currency Converter
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
            {loading && !exchangeRate ? (
              <FunLoader />
            ) : (
              <>
                {/* From Currency */}
                <Card sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      From
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          label="Currency"
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      fullWidth
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                            {getCurrencySymbol(fromCurrency)}
                          </Typography>
                        ),
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Swap Button */}
                <Box display="flex" justifyContent="center" mb={2}>
                  <IconButton
                    onClick={handleSwap}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        backgroundColor: '#e0e0e0',
                        transform: 'rotate(180deg)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <SwapIcon />
                  </IconButton>
                </Box>

                {/* To Currency */}
                <Card sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      To
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        label="Currency"
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      value={convertedAmount || '0.00'}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <Typography sx={{ mr: 1, color: 'text.secondary' }}>
                            {getCurrencySymbol(toCurrency)}
                          </Typography>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 600,
                          fontSize: '1.2rem',
                          color: '#87003A'
                        }
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Exchange Rate Info */}
                {exchangeRate && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Exchange Rate
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="#87003A">
                      1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </Box>
                )}

                {/* Quick Links */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Popular Conversions
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {[
                    { from: 'USD', to: 'GEL' },
                    { from: 'EUR', to: 'GEL' },
                    { from: 'GBP', to: 'GEL' },
                  ].map((conv, idx) => (
                    <Box
                      key={idx}
                      onClick={() => {
                        setFromCurrency(conv.from);
                        setToCurrency(conv.to);
                        setAmount('1');
                      }}
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: '#f0f0f0',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#e0e0e0',
                        },
                        fontSize: '0.75rem'
                      }}
                    >
                      {conv.from} → {conv.to}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default CurrencyChanger;

