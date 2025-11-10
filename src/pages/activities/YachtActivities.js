import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  Button, 
  TextField, 
  MenuItem, 
  Chip, 
  Rating,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  AttachMoney, 
  Star, 
  Favorite,
  FavoriteBorder,
  Search,
  FilterList,
  DirectionsBoat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEventFeed } from '../../hooks/useApi';
import PaymentButton from '../../components/PaymentButton';

// Base URL for images
const IMAGE_BASE_URL = 'https://base.funfinder.ge/uploads/service_images/';

// Default image for activities without images
const defaultActivityImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80';

// Helper function to get full image URL
const getImageUrl = (image) => {
  if (!image) return defaultActivityImage;
  
  // Convert to string if it's an object
  const imageStr = typeof image === 'string' ? image : String(image);
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }
  
  // If it starts with '/', use the domain + path
  if (imageStr.startsWith('/')) {
    return 'https://base.funfinder.ge' + imageStr;
  }
  
  // Otherwise, prepend the base URL
  return IMAGE_BASE_URL + imageStr;
};

// These will be populated dynamically from API data
const defaultCities = ['ყველა'];
const defaultTypes = ['ყველა'];

const YachtActivities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ყველა');
  const [selectedType, setSelectedType] = useState('ყველა');
  const [favorites, setFavorites] = useState([]);

  // Fetch all events from the event feed API
  const { data: allEvents, loading: eventsLoading, error: eventsError } = useEventFeed();

  // Create dynamic cities and types from API data
  const cities = useMemo(() => {
    if (!allEvents) return defaultCities;
    const uniqueCities = [...new Set(allEvents.map(event => event.city?.name).filter(Boolean))];
    return ['ყველა', ...uniqueCities];
  }, [allEvents]);

  const types = useMemo(() => {
    if (!allEvents) return defaultTypes;
    const uniqueTypes = [...new Set(allEvents.map(event => event.category?.name).filter(Boolean))];
    return ['ყველა', ...uniqueTypes];
  }, [allEvents]);

  const filteredActivities = useMemo(() => {
    if (!allEvents) return [];
    
    return allEvents.filter(activity => {
      // Filter for yacht category only
      const isYachtCategory = activity.category && 
        activity.category.name?.toLowerCase() === 'yacht';
      
      if (!isYachtCategory) return false;
      
      const matchesSearch = activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'ყველა' || activity.city?.name === selectedCity;
      const matchesType = selectedType === 'ყველა' || activity.category?.name === selectedType;
      
      return matchesSearch && matchesCity && matchesType;
    });
  }, [allEvents, searchTerm, selectedCity, selectedType]);

  const handleFavorite = (activityId) => {
    setFavorites(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleActivityClick = (activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleBooking = (activity) => {
    navigate(`/activity/${activity.id}`, { state: { showBooking: true } });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'VIP':
        return 'error';
      case 'ლუქსური':
        return 'warning';
      case 'სტანდარტული':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        იახტით გასეირნება
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        აღმოაჩინე საუკეთესო იახტით გასეირნების აქტივობები საქართველოში
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center">
          <FilterList sx={{ mr: 1 }} />
          ფილტრები
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ძიება"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>ქალაქი</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                label="ქალაქი"
              >
                {cities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>ტიპი</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="ტიპი"
              >
                {types.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Loading State */}
      {eventsLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {eventsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          ღონისძიებების ჩატვირთვა ვერ მოხერხდა: {eventsError}
        </Alert>
      )}

      {/* Results */}
      {!eventsLoading && !eventsError && (
        <Box mb={3}>
          <Typography variant="h6" color="text.secondary">
            ნაპოვნია {filteredActivities.length} იახტით გასეირნების აქტივობა
          </Typography>
        </Box>
      )}

      {/* Activities Grid */}
      {!eventsLoading && !eventsError && (
        <Grid container spacing={3}>
          {filteredActivities.map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
            <Card 
              sx={{ 
                height: '100%', 
                borderRadius: 3, 
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={getImageUrl(activity.primary_image?.image || activity.images?.[0]?.image)}
                alt={activity.name}
                sx={{ position: 'relative' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Tooltip title={favorites.includes(activity.id) ? 'ფავორიტებიდან წაშლა' : 'ფავორიტებში დამატება'}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(activity.id);
                    }}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                    }}
                  >
                    {favorites.includes(activity.id) ? (
                      <Favorite sx={{ color: 'error.main' }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DirectionsBoat />
                  <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                    {activity.name}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {activity.city?.name || activity.location || 'მდებარეობა არ არის მითითებული'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {activity.description}
                </Typography>

                <Box display="flex" alignItems="center" mb={2}>
                  <Rating value={activity.rating || 4.5} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({activity.reviews || 0})
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {activity.category && (
                    <Chip 
                      label={activity.category.name} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {activity.tags && activity.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <AttachMoney sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      {activity.base_price ? `${activity.base_price}₾` : 'ფასი არ არის მითითებული'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.duration || 'ხანგრძლივობა არ არის მითითებული'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Chip 
                    label={activity.category?.name || 'აქტივობა'} 
                    color="primary"
                    size="small"
                    variant="filled"
                  />
                  <Chip 
                    label={activity.difficulty || 'მარტივი'} 
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Box display="flex" gap={1}>
                  <PaymentButton 
                    tour={activity}
                    variant="contained"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={() => handleActivityClick(activity)}
                    sx={{ borderRadius: 2 }}
                  >
                    დეტალები
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          ))}
        </Grid>
      )}

      {!eventsLoading && !eventsError && filteredActivities.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          არ არის ნაპოვნი იახტით გასეირნების აქტივობები მითითებული კრიტერიუმებით.
        </Alert>
      )}
    </Box>
  );
};

export default YachtActivities; 