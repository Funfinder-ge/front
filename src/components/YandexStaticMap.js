import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent
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
 * Yandex Static Map Component
 * Uses Yandex Static API for simple, reliable map display
 */
const YandexStaticMap = ({ 
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(13);
  const [mapUrl, setMapUrl] = useState('');
  const [mapError, setMapError] = useState(false);
  const [usingAlternative, setUsingAlternative] = useState(false);
  const [fallbackAttempts, setFallbackAttempts] = useState(0);

  // Generate Yandex Static API URL
  const generateStaticMapUrl = (center, zoom, markers = []) => {
    const apiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045';
    
    // Generate static map URL
    const staticUrl = `https://static-maps.yandex.ru/1.x/?l=map&ll=${center.lng},${center.lat}&z=${zoom}&size=600,400&lang=en&apikey=${apiKey}`;
    
    console.log('Generated Yandex Static API URL:', staticUrl);
    console.log('Map center:', center);
    console.log('Zoom level:', zoom);
    console.log('API Key being used:', apiKey);
    
    return staticUrl;
  };

  // Generate alternative Yandex Static API URL with different parameters
  const generateAlternativeYandexUrl = (center, zoom, markers = []) => {
    const apiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045';
    
    // Alternative static map URL with different parameters
    const alternativeUrl = `https://static-maps.yandex.ru/1.x/?l=map&ll=${center.lng},${center.lat}&z=${zoom}&size=600,400&lang=ka&apikey=${apiKey}&pt=${center.lng},${center.lat},pm2bluem`;
    
    console.log('Generated Alternative Yandex Static API URL:', alternativeUrl);
    console.log('Alternative map center:', center);
    return alternativeUrl;
  };

  // Alternative map generation without API key (fallback)
  const generateFallbackMapUrl = (center, zoom) => {
    // Use OpenStreetMap as fallback
    const baseUrl = 'https://tile.openstreetmap.org';
    const z = zoom;
    const x = Math.floor((center.lng + 180) / 360 * Math.pow(2, z));
    const y = Math.floor((1 - Math.log(Math.tan(center.lat * Math.PI / 180) + 1 / Math.cos(center.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    
    return `${baseUrl}/${z}/${x}/${y}.png`;
  };

  // Try different Yandex Static API approaches
  const generateYandexWithoutApiKey = (center, zoom) => {
    // Try Yandex Static API without API key (some endpoints work without key)
    const staticUrl = `https://static-maps.yandex.ru/1.x/?l=map&ll=${center.lng},${center.lat}&z=${zoom}&size=600,400&lang=ka`;
    
    console.log('Generated Yandex Static API without API key:', staticUrl);
    return staticUrl;
  };

  // Update map URL when center or zoom changes
  useEffect(() => {
    const markers = [];
    
    // Add current location marker
    if (currentLocation) {
      markers.push({
        lng: currentLocation.longitude,
        lat: currentLocation.latitude,
        type: 'pm2',
        color: 'blue',
        size: 'm'
      });
    }
    
    // Add selected location marker
    if (selectedLocation) {
      markers.push({
        lng: selectedLocation.lng,
        lat: selectedLocation.lat,
        type: 'pm2',
        color: 'red',
        size: 'l'
      });
    }

    const url = generateStaticMapUrl(mapCenter, zoom, markers);
    setMapUrl(url);
    setMapError(false); // Reset error state when generating new URL
    setFallbackAttempts(0); // Reset fallback attempts
  }, [mapCenter, zoom, currentLocation, selectedLocation]);

  // Handle map image load error
  const handleMapImageError = () => {
    console.error('Yandex Static Map failed to load - API may not be accessible');
    setFallbackAttempts(prev => prev + 1);
    
    if (fallbackAttempts === 0) {
      // Try alternative Yandex Static API URL first
      setUsingAlternative(true);
      const alternativeUrl = generateAlternativeYandexUrl(mapCenter, zoom, []);
      console.log('Trying alternative Yandex Static API URL:', alternativeUrl);
      setMapUrl(alternativeUrl);
      setMapError(false); // Reset error to try alternative
    } else if (fallbackAttempts === 1) {
      // Try Yandex Static API without API key
      const noKeyUrl = generateYandexWithoutApiKey(mapCenter, zoom);
      console.log('Trying Yandex Static API without API key:', noKeyUrl);
      setMapUrl(noKeyUrl);
      setMapError(false);
    } else {
      // All Yandex attempts failed, use OpenStreetMap fallback
      setMapError(true);
      setError('Yandex Static Map API ვერ ჩაიტვირთა. გამოიყენება OpenStreetMap ფოლბექი.');
      
      const fallbackUrl = generateFallbackMapUrl(mapCenter, zoom);
      console.log('Using OpenStreetMap fallback:', fallbackUrl);
      setMapUrl(fallbackUrl);
    }
  };

  // Handle map click (approximate coordinates)
  const handleMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to approximate lat/lng
    const lat = mapCenter.lat + (0.5 - y / rect.height) * (180 / Math.pow(2, zoom));
    const lng = mapCenter.lng + (x / rect.width - 0.5) * (360 / Math.pow(2, zoom));
    
    const location = {
      lat: lat,
      lng: lng,
      address: `შერჩეული მდებარეობა (${lat.toFixed(6)}, ${lng.toFixed(6)})`
    };
    
    console.log('YandexStaticMap: Location clicked:', location);
    setSelectedLocation(location);
    onLocationSelect && onLocationSelect(location);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Yandex Geocoder API for search
      const apiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045';
      const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(searchQuery)}&format=json&lang=ka`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (data.response && data.response.GeoObjectCollection && data.response.GeoObjectCollection.featureMember.length > 0) {
        const firstResult = data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const coords = firstResult.Point.pos.split(' ').map(Number);
        const lng = coords[0];
        const lat = coords[1];
        const address = firstResult.metaDataProperty.GeocoderMetaData.text;
        
        const location = {
          lat: lat,
          lng: lng,
          address: address
        };
        
        setSelectedLocation(location);
        setMapCenter({ lat: lat, lng: lng });
        onLocationSelect && onLocationSelect(location);
      } else {
        setError('მდებარეობა ვერ მოიძებნა');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('ძიება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const location = {
            lat: lat,
            lng: lng,
            address: 'მიმდინარე მდებარეობა'
          };
          
          setSelectedLocation(location);
          setMapCenter({ lat: lat, lng: lng });
          onLocationSelect && onLocationSelect(location);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('მიმდინარე მდებარეობის მიღება ვერ მოხერხდა');
        }
      );
    } else {
      setError('მდებარეობის სერვისები არ არის მხარდაჭერილი');
    }
  };

  // Map controls
  const handleZoomIn = () => {
    if (zoom < 20) {
      setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 1) {
      setZoom(zoom - 1);
    }
  };

  const handleCenterMap = () => {
    if (currentLocation) {
      setMapCenter({ lat: currentLocation.latitude, lng: currentLocation.longitude });
    }
  };

  return (
    <Box sx={{ height, ...style }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Bar */}
      {showSearch && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="მოძებნეთ მდებარეობა..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Search />}
          >
            ძიება
          </Button>
        </Box>
      )}

      {/* Map Container */}
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {mapUrl && !mapError ? (
          <img
            src={mapUrl}
            alt="Yandex Static Map"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'crosshair'
            }}
            onClick={handleMapClick}
            onError={handleMapImageError}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: mapError ? '#ffebee' : '#f5f5f5',
              border: '1px solid #ddd',
              p: 2
            }}
            onClick={handleMapClick}
          >
            {mapError ? (
              <>
                <Typography variant="h6" color="error" gutterBottom>
                  Yandex Static Map API ვერ ჩაიტვირთა
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                  Static API-ს ნებართვა არ არის ან API გასაღები არასწორია
                </Typography>
                <Box display="flex" gap={1}>
                  <Button 
                    variant="outlined" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapError(false);
                      setUsingAlternative(false);
                      setFallbackAttempts(0);
                      setMapUrl(generateStaticMapUrl(mapCenter, zoom, []));
                    }}
                  >
                    Yandex Static API კვლავ ცდა
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMapError(false);
                      setUsingAlternative(true);
                      setFallbackAttempts(1);
                      setMapUrl(generateAlternativeYandexUrl(mapCenter, zoom, []));
                    }}
                  >
                    Yandex Static API ალტერნატივა
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const fallbackUrl = generateFallbackMapUrl(mapCenter, zoom);
                      setMapUrl(fallbackUrl);
                      setMapError(false);
                      setUsingAlternative(false);
                      setFallbackAttempts(0);
                    }}
                  >
                    OpenStreetMap
                  </Button>
                </Box>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        )}

        {/* Map Controls */}
        {showControls && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleZoomIn}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <ZoomIn />
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleZoomOut}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <ZoomOut />
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleCurrentLocation}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <MyLocation />
            </Button>
            {currentLocation && (
              <Button
                size="small"
                variant="contained"
                onClick={handleCenterMap}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                <CenterFocusStrong />
              </Button>
            )}
          </Box>
        )}

        {/* Selected Location Info */}
        {selectedLocation && (
          <Card sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, maxWidth: 'calc(100% - 20px)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Place sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  არჩეული მდებარეობა
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {selectedLocation.address}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ლატ: {selectedLocation.lat.toFixed(6)}, ლონგ: {selectedLocation.lng.toFixed(6)}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default YandexStaticMap;
