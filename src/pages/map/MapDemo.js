import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  CheckCircle
} from '@mui/icons-material';
import GoogleMap from '../../components/GoogleMap';
import { useLocation } from '../../hooks/useLocation';

/**
 * Map Demo Page
 * Demonstrates Google Maps integration with coordinate selection
 */
const MapDemo = () => {
  const { position: currentLocation } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setCoordinates({
      latitude: location.lat,
      longitude: location.lng
    });
  };

  const handleGetCoordinates = () => {
    if (coordinates) {
      const text = `გრძედი: ${coordinates.latitude}\nგანედი: ${coordinates.longitude}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('კოორდინატები კოპირებულია!');
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Google Maps კოორდინატების მიღება
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        დააჭირეთ რუკაზე სასურველ ადგილას კოორდინატების მისაღებად
      </Typography>

      <Grid container spacing={3}>
        {/* Map */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <GoogleMap
                center={{ lat: 41.6500, lng: 41.6333 }}
                onLocationSelect={handleLocationSelect}
                currentLocation={currentLocation}
                height="500px"
                showSearch={true}
                showControls={true}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Coordinates Display */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                კოორდინატები
              </Typography>

              {selectedLocation ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    მდებარეობა შერჩეულია
                  </Alert>

                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      მისამართი:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedLocation.address}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      კოორდინატები:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                      <Chip 
                        label={`გრძედი: ${coordinates.latitude.toFixed(6)}`} 
                        color="primary" 
                        size="small"
                      />
                      <Chip 
                        label={`განედი: ${coordinates.longitude.toFixed(6)}`} 
                        color="secondary" 
                        size="small"
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleGetCoordinates}
                      startIcon={<MyLocation />}
                      fullWidth
                      sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
                    >
                      კოორდინატების კოპირება
                    </Button>
                  </Paper>

                  <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      JSON ფორმატი:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                      {JSON.stringify(coordinates, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    დააჭირეთ რუკაზე კოორდინატების მისაღებად
                  </Typography>
                </Alert>
              )}

              {/* Current Location Info */}
              {currentLocation && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: '#f0f8ff' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <MyLocation sx={{ mr: 1, verticalAlign: 'middle' }} />
                    მიმდინარე მდებარეობა:
                  </Typography>
                  <Typography variant="body2">
                    გრძედი: {currentLocation.latitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2">
                    განედი: {currentLocation.longitude.toFixed(6)}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ინსტრუქცია:
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" paragraph>
              <strong>რუკაზე დაჭერა:</strong> დააჭირეთ რუკაზე სასურველ ადგილას
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>ძებნა:</strong> გამოიყენეთ ძებნის ღილაკი კონკრეტული ადგილის მოსაძებნად
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>კოორდინატები:</strong> შერჩეული ადგილის კოორდინატები ავტომატურად გამოჩნდება
            </Typography>
            <Typography component="li" variant="body2" paragraph>
              <strong>კოპირება:</strong> დააჭირეთ "კოორდინატების კოპირება" ღილაკს
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MapDemo;
