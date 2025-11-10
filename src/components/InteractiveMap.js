import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
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

/**
 * Interactive Map Component
 * A map interface that can be easily integrated with Google Maps, OpenStreetMap, or other mapping services
 */
const InteractiveMap = ({ 
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

  // Update map center when prop changes
  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  // Handle map click
  const handleMapClick = (event) => {
    try {
      // Ensure map center is valid
      if (!mapCenter || isNaN(mapCenter.lat) || isNaN(mapCenter.lng)) {
        throw new Error('Map center not properly initialized');
      }
      
      // Get click position relative to the map container
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert click position to approximate coordinates
      // This is a simplified conversion - in a real map, you'd use the map's projection
      const latOffset = ((y - rect.height / 2) / rect.height) * 0.01;
      const lngOffset = ((x - rect.width / 2) / rect.width) * 0.01;
      
      const lat = mapCenter.lat - latOffset;
      const lng = mapCenter.lng + lngOffset;
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid coordinates');
      }
      
      const location = {
        lat: lat,
        lng: lng,
        address: `შერჩეული მდებარეობა (${lat.toFixed(6)}, ${lng.toFixed(6)})`
      };
      
      setSelectedLocation(location);
      onLocationSelect && onLocationSelect(location);
    } catch (error) {
      console.error('Error handling map click:', error);
      setError('მდებარეობის არჩევა ვერ მოხერხდა');
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate geocoding - in real app, use Google Maps Geocoding API or similar
      const mockResults = [
        {
          lat: mapCenter.lat + (Math.random() - 0.5) * 0.01,
          lng: mapCenter.lng + (Math.random() - 0.5) * 0.01,
          address: searchQuery,
          fullAddress: `${searchQuery}, ბათუმი, საქართველო`
        }
      ];
      
      setSearchResults(mockResults);
      
      // Center map on first result
      if (mockResults.length > 0) {
        setMapCenter({
          lat: mockResults[0].lat,
          lng: mockResults[0].lng
        });
      }
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
    if (currentLocation) {
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
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));
  const handleCenterMap = () => setMapCenter(center);

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
          background: 'linear-gradient(135deg, #4caf50 0%, #81c784 50%, #a5d6a7 100%)',
          position: 'relative',
          cursor: 'crosshair',
          borderRadius: 1,
          overflow: 'hidden',
          border: '2px solid #1976d2',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '&:hover': { 
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            transform: 'scale(1.01)',
            transition: 'all 0.3s ease'
          }
        }}
        onClick={handleMapClick}
      >
        {/* Map Grid Lines */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.4
        }} />

        {/* Map Texture Overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 100px 100px',
          opacity: 0.3
        }} />

        {/* Simulated Roads */}
        <Box sx={{
          position: 'absolute',
          top: '30%',
          left: 0,
          right: 0,
          height: '4px',
          bgcolor: '#444',
          opacity: 0.8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '70%',
          left: 0,
          right: 0,
          height: '4px',
          bgcolor: '#444',
          opacity: 0.8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '30%',
          width: '4px',
          bgcolor: '#444',
          opacity: 0.8,
          boxShadow: '1px 0 2px rgba(0,0,0,0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '70%',
          width: '4px',
          bgcolor: '#444',
          opacity: 0.8,
          boxShadow: '1px 0 2px rgba(0,0,0,0.3)'
        }} />

        {/* Additional Road Lines */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '2px',
          bgcolor: '#666',
          opacity: 0.6
        }} />
        <Box sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '2px',
          bgcolor: '#666',
          opacity: 0.6
        }} />

        {/* Simulated Buildings/Landmarks */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '10px',
          height: '10px',
          bgcolor: '#2c2c2c',
          borderRadius: '2px',
          opacity: 0.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: '14px',
          height: '14px',
          bgcolor: '#2c2c2c',
          borderRadius: '2px',
          opacity: 0.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '80%',
          width: '8px',
          height: '8px',
          bgcolor: '#2c2c2c',
          borderRadius: '2px',
          opacity: 0.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '75%',
          left: '25%',
          width: '6px',
          height: '6px',
          bgcolor: '#2c2c2c',
          borderRadius: '2px',
          opacity: 0.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '15%',
          left: '75%',
          width: '12px',
          height: '12px',
          bgcolor: '#2c2c2c',
          borderRadius: '2px',
          opacity: 0.8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
        }} />

        {/* Simulated Water Area */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '25%',
          height: '30%',
          bgcolor: '#1976d3',
          borderRadius: '50%',
          opacity: 0.7,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '15%',
          height: '15%',
          bgcolor: '#1565c0',
          borderRadius: '50%',
          opacity: 0.6,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />
        <Box sx={{
          position: 'absolute',
          top: '80%',
          left: '10%',
          width: '20%',
          height: '15%',
          bgcolor: '#1976d3',
          borderRadius: '50%',
          opacity: 0.6,
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />

        {/* Map Center Marker */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 12,
          height: 12,
          bgcolor: '#f44336',
          borderRadius: '50%',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10
        }} />

        {/* Map Labels */}
        <Box sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: 1,
          p: 1,
          backdropFilter: 'blur(4px)'
        }}>
          <Typography variant="caption" color="text.secondary" display="block">
            ცენტრი: {mapCenter.lat.toFixed(6)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ლონგ: {mapCenter.lng.toFixed(6)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ზუმი: {zoom}x
          </Typography>
        </Box>

        {/* Map Labels */}
        <Box sx={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          bgcolor: 'rgba(255,255,255,0.8)',
          borderRadius: 0.5,
          p: 0.5,
          fontSize: '10px'
        }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            ცენტრი
          </Typography>
        </Box>
        <Box sx={{
          position: 'absolute',
          top: '65%',
          left: '65%',
          bgcolor: 'rgba(255,255,255,0.8)',
          borderRadius: 0.5,
          p: 0.5,
          fontSize: '10px'
        }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            ბათუმი
          </Typography>
        </Box>
        <Box sx={{
          position: 'absolute',
          top: '15%',
          right: '20%',
          bgcolor: 'rgba(33, 150, 243, 0.8)',
          color: 'white',
          borderRadius: 0.5,
          p: 0.5,
          fontSize: '10px'
        }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
            ზღვა
          </Typography>
        </Box>

        {/* Click Instructions */}
        <Box sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: 1,
          p: 2,
          textAlign: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <Typography variant="body2" color="text.secondary">
            დააჭირეთ რუკაზე დანიშნულების არჩევისთვის
          </Typography>
        </Box>

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

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#570015',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}>
            <Place />
          </Box>
        )}
      </Box>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ძიების შედეგები
          </Typography>
          {searchResults.map((result, index) => (
            <Paper 
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
            </Paper>
          ))}
        </Paper>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <Paper sx={{ mt: 2, p: 2, border: '2px solid #570015' }}>
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
        </Paper>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default InteractiveMap;
