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
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  LocationOff,
  Refresh,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useLocation } from '../hooks/useLocation';

/**
 * Location Permission Component
 * Handles location access requests and displays current location status
 */
const LocationPermission = ({ 
  onLocationUpdate, 
  showDetails = true, 
  autoRequest = false,
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

  // Auto-request permission if enabled
  useEffect(() => {
    if (autoRequest && isSupported && !permissionGranted && !loading) {
      handleRequestPermission();
    }
  }, [autoRequest, isSupported, permissionGranted, loading]);

  // Notify parent component of location updates
  useEffect(() => {
    if (onLocationUpdate && position) {
      onLocationUpdate(position);
    }
  }, [position, onLocationUpdate]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    clearError();
    
    try {
      const granted = await requestPermission();
      if (granted) {
        await getCurrentPosition();
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleGetLocation = async () => {
    setIsRequesting(true);
    clearError();
    
    try {
      await getCurrentPosition();
    } catch (err) {
      console.error('Error getting location:', err);
    } finally {
      setIsRequesting(false);
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

  return (
    <Card sx={{ mb: 2, ...style }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="h6">მდებარეობის წვდომა</Typography>
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {showDetails && position && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              მიმდინარე მდებარეობა:
            </Typography>
            <Typography variant="body2" component="div">
              <strong>გრძედი:</strong> {position.latitude.toFixed(6)}
            </Typography>
            <Typography variant="body2" component="div">
              <strong>განედი:</strong> {position.longitude.toFixed(6)}
            </Typography>
            <Typography variant="body2" component="div">
              <strong>სიზუსტე:</strong> ±{Math.round(position.accuracy)}მ
            </Typography>
            <Typography variant="body2" component="div">
              <strong>ბოლო განახლება:</strong> {new Date(position.timestamp).toLocaleString('ka-GE')}
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={1} flexWrap="wrap">
          {!permissionGranted && (
            <Button
              variant="contained"
              onClick={handleRequestPermission}
              disabled={loading || isRequesting}
              startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
            >
              {isRequesting ? 'მოთხოვნა...' : 'მდებარეობის ჩართვა'}
            </Button>
          )}
          
          {permissionGranted && !position && (
            <Button
              variant="outlined"
              onClick={handleGetLocation}
              disabled={loading || isRequesting}
              startIcon={loading || isRequesting ? <CircularProgress size={16} /> : <LocationOn />}
            >
              {isRequesting ? 'მდებარეობის მიღება...' : 'მიმდინარე მდებარეობის მიღება'}
            </Button>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          მდებარეობის წვდომა გვეხმარება პერსონალიზებული კონტენტისა და ახლომდებარე რეკომენდაციების მიწოდებაში.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;
