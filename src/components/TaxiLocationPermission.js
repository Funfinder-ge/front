import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  LocationOff,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info
} from '@mui/icons-material';
import { useLocation } from '../hooks/useLocation';

/**
 * Taxi Location Permission Component
 * Specialized location permission component for taxi ordering
 */
const TaxiLocationPermission = ({ 
  onLocationGranted,
  onLocationDenied,
  showDialog = true,
  style = {} 
}) => {
  const {
    position,
    loading,
    error,
    permissionGranted,
    isSupported,
    requestPermission,
    getCurrentPosition,
    clearError
  } = useLocation();

  const [isRequesting, setIsRequesting] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Auto-request permission when component mounts
  useEffect(() => {
    if (isSupported && !permissionGranted && !loading) {
      // Don't auto-show dialog, let user manually request
      console.log('Location permission not granted, waiting for user action');
    }
  }, [isSupported, permissionGranted, loading]);

  // Notify parent when location is granted
  useEffect(() => {
    if (position && onLocationGranted) {
      onLocationGranted(position);
    }
  }, [position, onLocationGranted]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    clearError();
    
    try {
      const granted = await requestPermission();
      if (granted) {
        await getCurrentPosition();
        setShowPermissionDialog(false);
      } else {
        if (onLocationDenied) {
          onLocationDenied('მდებარეობის ნებართვა უარყოფილია');
        }
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      if (onLocationDenied) {
        onLocationDenied(err.message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleGetLocation = async () => {
    setIsRequesting(true);
    clearError();
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Use Google Maps geocoding if available
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              const latlng = new window.google.maps.LatLng(lat, lng);
              
              geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  const locationWithAddress = {
                    latitude: lat,
                    longitude: lng,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                    address: address
                  };
                  
                  if (onLocationGranted) {
                    onLocationGranted(locationWithAddress);
                  }
                  setShowPermissionDialog(false);
                } else {
                  const locationWithoutAddress = {
                    latitude: lat,
                    longitude: lng,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                  };
                  
                  if (onLocationGranted) {
                    onLocationGranted(locationWithoutAddress);
                  }
                  setShowPermissionDialog(false);
                }
                setIsRequesting(false);
              });
            } else {
              const location = {
                latitude: lat,
                longitude: lng,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };
              
              if (onLocationGranted) {
                onLocationGranted(location);
              }
              setShowPermissionDialog(false);
              setIsRequesting(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (onLocationDenied) {
              onLocationDenied('მდებარეობის მიღება ვერ მოხერხდა');
            }
            setIsRequesting(false);
          }
        );
      } else {
        if (onLocationDenied) {
          onLocationDenied('მდებარეობის სერვისები არ არის მხარდაჭერილი');
        }
        setIsRequesting(false);
      }
    } catch (err) {
      console.error('Error getting location:', err);
      if (onLocationDenied) {
        onLocationDenied(err.message);
      }
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    setShowPermissionDialog(false);
    if (onLocationDenied) {
      onLocationDenied('მდებარეობის ნებართვა გამოტოვებულია');
    }
  };

  const getStatusColor = () => {
    if (error) return 'error';
    if (permissionGranted && position) return 'success';
    if (permissionGranted) return 'warning';
    return 'default';
  };

  const getStatusText = () => {
    if (error) return 'მდებარეობის შეცდომა';
    if (permissionGranted && position) return 'მდებარეობა აქტიურია';
    if (permissionGranted) return 'ნებართვა მიღებულია';
    return 'მდებარეობა გამორთულია';
  };

  const getStatusIcon = () => {
    if (error) return <ErrorIcon />;
    if (permissionGranted && position) return <CheckCircle />;
    if (permissionGranted) return <LocationOn />;
    return <LocationOff />;
  };

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ mb: 2, ...style }}>
        <Typography variant="body2">
          მდებარეობის სერვისები ამ ბრაუზერით არ არის მხარდაჭერილი.
        </Typography>
      </Alert>
    );
  }

  // If location is already granted and we have position, don't show dialog
  if (permissionGranted && position) {
    return (
      <Card sx={{ mb: 2, ...style }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckCircle color="success" />
            <Typography variant="body2" color="success.main">
              მდებარეობა ხელმისაწვდომია ტაქსის შეკვეთისთვის
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            გრძედი: {position.latitude.toFixed(6)}, განედი: {position.longitude.toFixed(6)}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Permission dialog
  if (showDialog && showPermissionDialog) {
    return (
      <Dialog open={showPermissionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="h6">მდებარეობის ნებართვა</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              ტაქსის შეკვეთისთვის საჭიროა თქვენი მიმდინარე მდებარეობის ნებართვა.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ეს გვეხმარება:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                ტაქსის მოძებნაში მიმდინარე მდებარეობის გამოყენებაში
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                ზუსტი ფასების გამოთვლაში
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                უახლოესი ტაქსების ჩვენებაში
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {permissionGranted && !position && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ნებართვა მიღებულია, მაგრამ მდებარეობა ჯერ არ არის მიღებული. 
                დააჭირეთ ღილაკს მიმდინარე მდებარეობის მისაღებად.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleSkip} color="inherit">
            გამოტოვება
          </Button>
          {!permissionGranted ? (
            <Button
              variant="contained"
              onClick={handleRequestPermission}
              disabled={loading || isRequesting}
              startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
              sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
            >
              {isRequesting ? 'მოთხოვნა...' : 'ნებართვის მიღება'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleGetLocation}
              disabled={loading || isRequesting}
              startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
              sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
            >
              {isRequesting ? 'მდებარეობის მიღება...' : 'მიმდინარე მდებარეობის მიღება'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  // Compact status display
  return (
    <Card sx={{ mb: 2, ...style }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="body2">მდებარეობის სტატუსი</Typography>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
            />
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="მდებარეობის განახლება">
              <IconButton
                onClick={handleGetLocation}
                disabled={loading || isRequesting}
                size="small"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!permissionGranted && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleRequestPermission}
            disabled={loading || isRequesting}
            startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
            sx={{ mb: 2, bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
          >
            {isRequesting ? 'მოთხოვნა...' : 'მდებარეობის ჩართვა'}
          </Button>
        )}

        {permissionGranted && !position && (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGetLocation}
            disabled={loading || isRequesting}
            startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
            sx={{ mb: 2 }}
          >
            {isRequesting ? 'მდებარეობის მიღება...' : 'მიმდინარე მდებარეობის მიღება'}
          </Button>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={clearError}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxiLocationPermission;
