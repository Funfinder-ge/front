import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  MyLocation,
  Search,
  Place,
  Navigation,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  CheckCircle
} from '@mui/icons-material';
import { getGoogleMapsApiUrl, isApiKeyConfigured } from '../config/googleMaps';

/**
 * Google Map Component
 * Integrates with Google Maps API for real map display and coordinate selection
 */
const GoogleMap = ({ 
  center = { lat: 41.6500, lng: 41.6333 },
  onLocationSelect,
  currentLocation = null,
  height = '400px',
  showSearch = true,
  showControls = true,
  style = {}
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [zoom, setZoom] = useState(13);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (window.google && mapRef.current && !mapLoaded) {
        try {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: mapCenter.lat, lng: mapCenter.lng },
            zoom: zoom,
            mapTypeId: 'satellite', // Satellite view
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
          });

          // Add map click listener
          map.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            const location = {
              lat: lat,
              lng: lng,
              address: `შერჩეული მდებარეობა (${lat.toFixed(6)}, ${lng.toFixed(6)})`
            };
            
            console.log('GoogleMap: Location clicked:', location);
            setSelectedLocation(location);
            
            // Send coordinates to Yandex format
            const yandexCoords = {
              lat: lat,
              lng: lng,
              address: location.address,
              yandexFormat: `${lng},${lat}` // Yandex format: longitude,latitude
            };
            console.log('GoogleMap: Yandex coordinates format:', yandexCoords);
            
            if (onLocationSelect) {
              console.log('GoogleMap: Calling onLocationSelect with:', location);
              onLocationSelect(location);
            } else {
              console.log('GoogleMap: onLocationSelect callback not provided');
            }

            // Add or update marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            
            markerRef.current = new window.google.maps.Marker({
              position: { lat: lat, lng: lng },
              map: map,
              title: 'შერჩეული მდებარეობა',
              animation: window.google.maps.Animation.DROP
            });

            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 10px;">
                  <h3>შერჩეული მდებარეობა</h3>
                  <p><strong>გრძედი:</strong> ${lat.toFixed(6)}</p>
                  <p><strong>განედი:</strong> ${lng.toFixed(6)}</p>
                </div>
              `
            });

            markerRef.current.addListener('click', () => {
              infoWindow.open(map, markerRef.current);
            });
          });

          // Add current location marker if available
          if (currentLocation) {
            new window.google.maps.Marker({
              position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
              map: map,
              title: 'მიმდინარე მდებარეობა',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#1976d2" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24)
              }
            });
          }

          googleMapRef.current = map;
          setMapLoaded(true);
        } catch (err) {
          console.error('Error initializing Google Map:', err);
          setError('რუკის ინიციალიზაცია ვერ მოხერხდა');
        }
      }
    };

    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      console.warn('Google Maps API key not configured');
      setError('Google Maps API key არ არის კონფიგურირებული.');
      return;
    }

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const apiUrl = getGoogleMapsApiUrl();
      console.log('Loading Google Maps API from:', apiUrl);
      
      const script = document.createElement('script');
      script.src = apiUrl;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        initMap();
      };
      script.onerror = (error) => {
        console.error('Google Maps API failed to load:', error);
        setError('Google Maps API ვერ ჩაიტვირთა. შეამოწმეთ API key და ინტერნეტ კავშირი.');
      };
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API already loaded');
      initMap();
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [mapCenter, zoom, currentLocation, mapLoaded]);

  // Update map center when prop changes
  useEffect(() => {
    if (googleMapRef.current && mapLoaded) {
      googleMapRef.current.setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
    }
  }, [mapCenter, mapLoaded]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.google) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const service = new window.google.maps.places.PlacesService(googleMapRef.current);
      const request = {
        query: searchQuery,
        fields: ['name', 'geometry', 'formatted_address']
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const searchResults = results.slice(0, 5).map(result => ({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.name,
            fullAddress: result.formatted_address
          }));
          
          setSearchResults(searchResults);
          
          // Center map on first result
          if (searchResults.length > 0) {
            setMapCenter({ lat: searchResults[0].lat, lng: searchResults[0].lng });
          }
        } else {
          setError('ძიება ვერ მოხერხდა');
        }
        setLoading(false);
      });
    } catch (err) {
      setError('ძიება ვერ მოხერხდა');
      setLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    console.log('GoogleMap: Search result selected:', result);
    
    // Format for Yandex
    const yandexCoords = {
      ...result,
      yandexFormat: `${result.lng},${result.lat}` // Yandex format: longitude,latitude
    };
    console.log('GoogleMap: Yandex coordinates format for search result:', yandexCoords);
    
    setSelectedLocation(result);
    setMapCenter({ lat: result.lat, lng: result.lng });
    if (onLocationSelect) {
      console.log('GoogleMap: Calling onLocationSelect with search result:', result);
      onLocationSelect(result);
    } else {
      console.log('GoogleMap: onLocationSelect callback not provided for search result');
    }
  };

  // Handle current location using Google Maps
  const handleCurrentLocation = () => {
    if (navigator.geolocation && googleMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Use Google Maps geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          const latlng = new window.google.maps.LatLng(lat, lng);
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              const location = {
                lat: lat,
                lng: lng,
                address: address || 'მიმდინარე მდებარეობა'
              };
              console.log('GoogleMap: Current location with geocoding:', location);
              setSelectedLocation(location);
              setMapCenter({ lat: lat, lng: lng });
              if (onLocationSelect) {
                console.log('GoogleMap: Calling onLocationSelect with current location:', location);
                onLocationSelect(location);
              }
            } else {
              // Fallback if geocoding fails
              const location = {
                lat: lat,
                lng: lng,
                address: 'მიმდინარე მდებარეობა'
              };
              console.log('GoogleMap: Current location fallback:', location);
              setSelectedLocation(location);
              setMapCenter({ lat: lat, lng: lng });
              if (onLocationSelect) {
                console.log('GoogleMap: Calling onLocationSelect with fallback location:', location);
                onLocationSelect(location);
              }
            }
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('მიმდინარე მდებარეობის მიღება ვერ მოხერხდა');
        }
      );
    } else if (currentLocation) {
      // Fallback to prop location
      const location = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        address: 'მიმდინარე მდებარეობა'
      };
      console.log('GoogleMap: Using prop current location:', location);
      setSelectedLocation(location);
      setMapCenter({ lat: currentLocation.latitude, lng: currentLocation.longitude });
      if (onLocationSelect) {
        console.log('GoogleMap: Calling onLocationSelect with prop location:', location);
        onLocationSelect(location);
      }
    }
  };

  // Map controls
  const handleZoomIn = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom();
      googleMapRef.current.setZoom(currentZoom + 1);
      setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (googleMapRef.current) {
      const currentZoom = googleMapRef.current.getZoom();
      googleMapRef.current.setZoom(currentZoom - 1);
      setZoom(currentZoom - 1);
    }
  };

  const handleCenterMap = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: center.lat, lng: center.lng });
      setMapCenter({ lat: center.lat, lng: center.lng });
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

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          minWidth: 250,
          bgcolor: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CheckCircle color="success" />
              <Typography variant="subtitle1" fontWeight="bold">
                შერჩეული მდებარეობა
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {selectedLocation.address}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label={`გრძედი: ${selectedLocation.lat.toFixed(6)}`} 
                size="small" 
                color="primary" 
              />
              <Chip 
                label={`განედი: ${selectedLocation.lng.toFixed(6)}`} 
                size="small" 
                color="secondary" 
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ძიების შედეგები
          </Typography>
          {searchResults.map((result, index) => (
            <Card 
              key={index}
              sx={{ 
                p: 2, 
                mb: 1, 
                cursor: 'pointer',
                border: selectedLocation?.lat === result.lat ? '2px solid #570015' : '1px solid #e0e0e0',
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
            </Card>
          ))}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {!mapLoaded && (
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
              Google Maps ჩატვირთვა...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GoogleMap;
