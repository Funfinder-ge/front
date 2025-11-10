import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  MyLocation,
  Search,
  Place,
  Navigation,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong
} from '@mui/icons-material';
import { getYandexMapsApiUrl, isApiKeyConfigured } from '../config/yandexMaps';

/**
 * Yandex Map Component
 * Integrates with Yandex Maps API for real satellite imagery
 */
const YandexMap = ({ 
  center = { lat: 41.6500, lng: 41.6333 },
  onLocationSelect,
  currentLocation = null,
  height = '400px',
  showSearch = true,
  showControls = true,
  style = {}
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef(null);
  const yandexMapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Yandex Map
  useEffect(() => {
    const initMap = () => {
      if (window.ymaps && mapRef.current && !mapLoaded) {
        try {
          window.ymaps.ready(() => {
            const map = new window.ymaps.Map(mapRef.current, {
              center: [mapCenter.lat, mapCenter.lng],
              zoom: zoom,
              type: 'yandex#satellite' // Satellite view
            });

            // Add map controls
            map.controls.add('zoomControl', { position: { top: 10, right: 10 } });
            map.controls.add('typeSelector', { position: { top: 10, left: 10 } });
            map.controls.add('fullscreenControl', { position: { top: 10, right: 50 } });

            // Handle map click
            map.events.add('click', (event) => {
              const coords = event.get('coords');
              const location = {
                lat: coords[0],
                lng: coords[1],
                address: `შერჩეული მდებარეობა (${coords[0].toFixed(6)}, ${coords[1].toFixed(6)})`
              };
              
              setSelectedLocation(location);
              onLocationSelect && onLocationSelect(location);

              // Add marker
              const marker = new window.ymaps.Placemark([coords[0], coords[1]], {
                balloonContent: 'შერჩეული მდებარეობა'
              }, {
                preset: 'islands#redDotIcon'
              });

              // Remove previous markers
              map.geoObjects.removeAll();
              map.geoObjects.add(marker);
            });

            yandexMapRef.current = map;
            setMapLoaded(true);
          });
        } catch (err) {
          console.error('Error initializing Yandex Map:', err);
          setError('რუკის ინიციალიზაცია ვერ მოხერხდა');
        }
      }
    };

    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      console.warn('Yandex Maps API key not configured, using fallback map');
      setError('Yandex Maps API key არ არის კონფიგურირებული. გამოიყენება ფოლბექ რუკა.');
      return;
    }

    // Load Yandex Maps API if not already loaded
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = getYandexMapsApiUrl();
      script.onload = initMap;
      script.onerror = () => setError('Yandex Maps API ვერ ჩაიტვირთა');
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (yandexMapRef.current) {
        yandexMapRef.current.destroy();
      }
    };
  }, [mapCenter, zoom, mapLoaded]);

  // Update map center when prop changes
  useEffect(() => {
    if (yandexMapRef.current && mapLoaded) {
      yandexMapRef.current.setCenter([mapCenter.lat, mapCenter.lng]);
    }
  }, [mapCenter, mapLoaded]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.ymaps) return;
    
    setLoading(true);
    setError(null);
    
    try {
      window.ymaps.geocode(searchQuery, { results: 5 }).then((res) => {
        const results = res.geoObjects.toArray().map((obj) => {
          const coords = obj.geometry.getCoordinates();
          return {
            lat: coords[0],
            lng: coords[1],
            address: obj.getAddressLine(),
            fullAddress: obj.getAddressLine()
          };
        });
        
        setSearchResults(results);
        
        // Center map on first result
        if (results.length > 0) {
          setMapCenter({ lat: results[0].lat, lng: results[0].lng });
        }
      });
    } catch (err) {
      setError('ძიება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    setSelectedLocation(result);
    setMapCenter({ lat: result.lat, lng: result.lng });
    onLocationSelect && onLocationSelect(result);
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (currentLocation && yandexMapRef.current) {
      const location = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        address: 'მიმდინარე მდებარეობა'
      };
      setSelectedLocation(location);
      setMapCenter({ lat: currentLocation.latitude, lng: currentLocation.longitude });
      onLocationSelect && onLocationSelect(location);
    }
  };

  // Map controls
  const handleZoomIn = () => {
    if (yandexMapRef.current) {
      yandexMapRef.current.setZoom(yandexMapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (yandexMapRef.current) {
      yandexMapRef.current.setZoom(yandexMapRef.current.getZoom() - 1);
    }
  };

  const handleCenterMap = () => {
    if (yandexMapRef.current) {
      yandexMapRef.current.setCenter([center.lat, center.lng]);
    }
  };

  return (
    <Box sx={{ position: 'relative', ...style }}>
      {/* Search Bar */}
      {showSearch && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}>
          <TextField
            fullWidth
            placeholder="ძებნა ადგილის..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Search />}
            sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
          >
            ძებნა
          </Button>
        </Box>
      )}

      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: height,
          borderRadius: 1,
          overflow: 'hidden',
          border: '2px solid #1976d2',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      />

      {/* Map Controls */}
      {showControls && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 16, 
          right: 16, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1
        }}>
          <IconButton
            onClick={handleZoomIn}
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ZoomOut />
          </IconButton>
          <IconButton
            onClick={handleCenterMap}
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <CenterFocusStrong />
          </IconButton>
        </Box>
      )}

      {/* Current Location Button */}
      {currentLocation && (
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            bgcolor: '#570015',
            '&:hover': { bgcolor: '#3d000f' }
          }}
          onClick={handleCurrentLocation}
          startIcon={<MyLocation />}
        >
          მიმდინარე მდებარეობა
        </Button>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ძიების შედეგები
          </Typography>
          {searchResults.map((result, index) => (
            <Box 
              key={index}
              sx={{ 
                p: 2, 
                mb: 1, 
                cursor: 'pointer',
                border: selectedLocation?.lat === result.lat ? '2px solid #570015' : '1px solid #e0e0e0',
                borderRadius: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => handleSearchResultSelect(result)}
            >
              <Box display="flex" alignItems="center">
                <Navigation sx={{ mr: 1, color: 'text.secondary' }} />
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="bold">
                    {result.address}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          border: '2px solid #570015', 
          borderRadius: 1,
          bgcolor: 'white'
        }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Place sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
            შერჩეული მდებარეობა
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedLocation.address}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ლატ: {selectedLocation.lat.toFixed(6)}, ლონგ: {selectedLocation.lng.toFixed(6)}
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {!mapLoaded && !error && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.9)',
          zIndex: 1000
        }}>
          <Box textAlign="center">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Yandex Maps ჩატვირთვა...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Fallback Map when API fails */}
      {error && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#e3f2fd',
          border: '2px dashed #1976d2',
          borderRadius: 1
        }}>
          <Box textAlign="center" sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Yandex Maps
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              დააჭირეთ რუკაზე დანიშნულების არჩევისთვის
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ცენტრი: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ზუმი: {zoom}x
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default YandexMap;
