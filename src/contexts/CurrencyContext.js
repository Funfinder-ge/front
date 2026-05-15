import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('GEL'); // 'GEL' or 'USD'
  const [exchangeRate, setExchangeRate] = useState(2.7); // Default fallback rate
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FreeCurrencyAPI configuration
  const API_KEY = 'fca_live_2YhFKYVpLSNucK916A6VTXrl2fUfKcRpJDGUu7Oc';
  const API_URL = 'https://api.freecurrencyapi.com/v1/latest';

  // Fetch real-time exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch USD to GEL rate
        const response = await fetch(
          `${API_URL}?apikey=${API_KEY}&base_currency=USD&currencies=GEL`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        
        const data = await response.json();
        
        if (data.data && data.data.GEL) {
          setExchangeRate(data.data.GEL);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError(err.message);
        // Keep default rate of 2.7 if API fails
        setExchangeRate(2.7);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
    
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'GEL' ? 'USD' : 'GEL');
  };

  const convertPrice = (priceInGEL) => {
    if (!priceInGEL || isNaN(priceInGEL)) return priceInGEL;
    
    if (currency === 'USD') {
      // Convert from GEL to USD (divide by rate)
      return (parseFloat(priceInGEL) / exchangeRate).toFixed(2);
    }
    // Return as GEL
    return parseFloat(priceInGEL).toFixed(2);
  };

  const getCurrencySymbol = () => {
    return currency === 'USD' ? '$' : '₾';
  };

  const formatPrice = (priceInGEL) => {
    const convertedPrice = convertPrice(priceInGEL);
    return `${getCurrencySymbol()}${convertedPrice}`;
  };

  const value = {
    currency,
    toggleCurrency,
    convertPrice,
    getCurrencySymbol,
    formatPrice,
    exchangeRate,
    loading,
    error
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

