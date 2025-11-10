import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LocationOn,
  Directions,
  Schedule,
  Star
} from '@mui/icons-material';
import { useLocation } from '../hooks/useLocation';

/**
 * Nearby Activities Component
 * Shows activities and events near the user's current location
 */
const NearbyActivities = ({ 
  activities = [], 
  onActivitySelect,
  maxResults = 10,
  style = {} 
}) => {
  const {
    position,
    loading,
    error,
    getCurrentPosition,
    getNearbyLocations,
    calculateDistance
  } = useLocation();

  const [nearbyActivities, setNearbyActivities] = useState([]);
  const [radius, setRadius] = useState(10); // km
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, name
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort nearby activities
  useEffect(() => {
    if (position && activities.length > 0) {
      setIsLoading(true);
      
      try {
        // Get activities within radius
        const nearby = getNearbyLocations(activities, radius);
        
        // Sort activities
        const sorted = nearby.sort((a, b) => {
          switch (sortBy) {
            case 'distance':
              const distA = calculateDistance(a.latitude, a.longitude);
              const distB = calculateDistance(b.latitude, b.longitude);
              return distA - distB;
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });

        setNearbyActivities(sorted.slice(0, maxResults));
      } catch (err) {
        console.error('Error filtering nearby activities:', err);
        setNearbyActivities([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setNearbyActivities([]);
    }
  }, [position, activities, radius, sortBy, maxResults, getNearbyLocations, calculateDistance]);

  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
    } catch (err) {
      console.error('Error getting location:', err);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getActivityIcon = (category) => {
    // You can customize icons based on activity category
    return <LocationOn />;
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, ...style }}>
        <Typography variant="body2">{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={handleGetLocation}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Card sx={{ ...style }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            Nearby Activities
          </Typography>
          {loading && <CircularProgress size={24} />}
        </Box>

        {!position ? (
          <Box textAlign="center" py={3}>
            <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Enable location access to find nearby activities
            </Typography>
            <Button
              variant="contained"
              onClick={handleGetLocation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <LocationOn />}
            >
              {loading ? 'Getting Location...' : 'Enable Location'}
            </Button>
          </Box>
        ) : (
          <>
            {/* Controls */}
            <Box mb={3}>
              <Box display="flex" gap={2} alignItems="center" mb={2}>
                <Typography variant="body2" sx={{ minWidth: 80 }}>
                  Radius: {radius}km
                </Typography>
                <Slider
                  value={radius}
                  onChange={(e, value) => setRadius(value)}
                  min={1}
                  max={50}
                  step={1}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="distance">Distance</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Results */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : nearbyActivities.length > 0 ? (
              <List>
                {nearbyActivities.map((activity, index) => (
                  <React.Fragment key={activity.id || index}>
                    <ListItem
                      button
                      onClick={() => onActivitySelect && onActivitySelect(activity)}
                      sx={{ borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        {getActivityIcon(activity.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={500}>
                            {activity.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {activity.description || activity.address}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Chip
                                label={formatDistance(calculateDistance(activity.latitude, activity.longitude))}
                                size="small"
                                sx={{
                                  backgroundColor: '#570015',
                                  color: 'white',
                                  fontWeight: 500,
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < nearbyActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body1" color="text.secondary">
                  No activities found within {radius}km radius
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try increasing the search radius
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyActivities;
