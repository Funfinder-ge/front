import React, { useState } from 'react';
import YandexStaticMap from './YandexStaticMap';
import { Box, Button, Typography, Alert } from '@mui/material';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

const YandexTaxiMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Failed to get location:', err);
          setError('მიმდინარე მდებარეობის მიღება ვერ მოხერხდა');
        }
      );
    } else {
      setError('მდებარეობის სერვისი არ არის მხარდაჭერილი');
    }
  };

  // Send route to Yandex Taxi via deep link
  const handleOrderTaxi = () => {
    if (!selectedLocation || !currentLocation) {
      setError('გთხოვთ აირჩიოთ მიზანი და ჩართოთ მდებარეობა.');
      return;
    }

    const { lat: endLat, lng: endLng } = selectedLocation;
    const { latitude: startLat, longitude: startLng } = currentLocation;

    // Deep link for Yandex Taxi (works on web & mobile)
    const taxiUrl = `https://3.redirect.appmetrica.yandex.com/route?start-lat=${startLat}&start-lon=${startLng}&end-lat=${endLat}&end-lon=${endLng}&appmetrica_tracking_id=1178268795219780156`;

    console.log('Opening Yandex Taxi link:', taxiUrl);
    window.open(taxiUrl, '_blank');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Yandex Taxi Integration Map
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <YandexStaticMap
        center={{ lat: 41.6500, lng: 41.6333 }}
        currentLocation={currentLocation}
        onLocationSelect={(loc) => {
          setSelectedLocation(loc);
          setError(null);
        }}
        height="400px"
        showControls
      />

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={handleGetCurrentLocation}>
          მიმდინარე მდებარეობა
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOrderTaxi}
          disabled={!selectedLocation || !currentLocation}
          startIcon={<LocalTaxiIcon />}
        >
          გამოიძახე ტაქსი
        </Button>
      </Box>

      {selectedLocation && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            📍 არჩეული მისამართი: {selectedLocation.address}
          </Typography>
          <Typography variant="caption">
            ლატ: {selectedLocation.lat.toFixed(6)}, ლონგ: {selectedLocation.lng.toFixed(6)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default YandexTaxiMap;
