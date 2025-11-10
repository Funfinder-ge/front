/**
 * Yandex Maps Configuration
 * Configuration for Yandex Maps API integration
 */

// Yandex Maps API Configuration
export const YANDEX_MAPS_CONFIG = {
  // Get your API key from: https://developer.tech.yandex.ru/
  API_KEY: process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045',
  
  // API URL
  API_URL: 'https://api-maps.yandex.ru/2.1/',
  
  // Default settings
  DEFAULT_CENTER: {
    lat: 41.6500,
    lng: 41.6333
  },
  
  DEFAULT_ZOOM: 13,
  
  // Language settings
  LANGUAGE: 'ka_GE', // Georgian
  
  // Map types
  MAP_TYPES: {
    SATELLITE: 'yandex#satellite',
    HYBRID: 'yandex#hybrid',
    MAP: 'yandex#map'
  },
  
  // Controls
  CONTROLS: {
    ZOOM: 'zoomControl',
    TYPE_SELECTOR: 'typeSelector',
    FULLSCREEN: 'fullscreenControl',
    SEARCH: 'searchControl',
    ROUTE: 'routeButtonControl'
  }
};

// Helper function to get API URL with key
export const getYandexMapsApiUrl = () => {
  return `${YANDEX_MAPS_CONFIG.API_URL}?apikey=${YANDEX_MAPS_CONFIG.API_KEY}&lang=${YANDEX_MAPS_CONFIG.LANGUAGE}`;
};

// Helper function to check if API key is configured
export const isApiKeyConfigured = () => {
  return YANDEX_MAPS_CONFIG.API_KEY && YANDEX_MAPS_CONFIG.API_KEY !== 'YOUR_YANDEX_MAPS_API_KEY';
};

export default YANDEX_MAPS_CONFIG;
