/**
 * Google Maps Configuration
 * Configuration for Google Maps API integration
 */

// Google Maps API Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Get your API key from: https://console.cloud.google.com/
  API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDKQvLYHEywVvYX913V223qVoHTqk_2tJA',
  
  // API URL
  API_URL: 'https://maps.googleapis.com/maps/api/js',
  
  // Default settings
  DEFAULT_CENTER: {
    lat: 41.6500,
    lng: 41.6333
  },
  
  DEFAULT_ZOOM: 13,
  
  // Language settings
  LANGUAGE: 'ka', // Georgian
  
  // Map types
  MAP_TYPES: {
    ROADMAP: 'roadmap',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain'
  },
  
  // Libraries to load
  LIBRARIES: ['places', 'geometry'],
  
  // Map options
  MAP_OPTIONS: {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'cooperative'
  }
};

// Helper function to get API URL with key
export const getGoogleMapsApiUrl = () => {
  const libraries = GOOGLE_MAPS_CONFIG.LIBRARIES.join(',');
  return `${GOOGLE_MAPS_CONFIG.API_URL}?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=${libraries}&language=${GOOGLE_MAPS_CONFIG.LANGUAGE}`;
};

// Helper function to check if API key is configured
export const isApiKeyConfigured = () => {
  const isConfigured = GOOGLE_MAPS_CONFIG.API_KEY && GOOGLE_MAPS_CONFIG.API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
  console.log('Google Maps API Key configured:', isConfigured);
  console.log('API Key:', GOOGLE_MAPS_CONFIG.API_KEY);
  return isConfigured;
};

export default GOOGLE_MAPS_CONFIG;
