import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import {
  Close,
  Map
} from '@mui/icons-material';
import YandexStaticMap from './YandexStaticMap';

/**
 * Map Picker Component
 * Interactive map for selecting destination coordinates
 */
const MapPicker = ({ 
  open, 
  onClose, 
  onLocationSelect,
  currentLocation = null 
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.6500, lng: 41.6333 }); // Batumi center

  // Initialize map center with current location if available
  useEffect(() => {
    if (currentLocation) {
      setMapCenter({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      });
    }
  }, [currentLocation]);

  const handleLocationSelect = (location) => {
    console.log('MapPicker: Location selected:', location);
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      console.log('MapPicker: Confirming location:', selectedLocation);
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address,
        fullAddress: selectedLocation.fullAddress || selectedLocation.address
      });
      onClose();
    } else {
      console.log('MapPicker: No location selected');
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
            დანიშნულების არჩევა Yandex Static API-ზე
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        <YandexStaticMap
          center={mapCenter}
          onLocationSelect={handleLocationSelect}
          currentLocation={currentLocation}
          height="60vh"
          showSearch={true}
          showControls={true}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        {selectedLocation && (
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant="body2" color="text.secondary">
              არჩეული მდებარეობა: {selectedLocation.address}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ლატ: {selectedLocation.lat.toFixed(6)}, ლონგ: {selectedLocation.lng.toFixed(6)}
            </Typography>
          </Box>
        )}
        <Button onClick={handleClose}>
          გაუქმება
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={!selectedLocation}
          sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
        >
          არჩევა
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapPicker;
