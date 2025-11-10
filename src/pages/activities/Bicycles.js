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
  DirectionsRun,
  Speed,
  Terrain,
  Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEventFeed } from '../../hooks/useApi';

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
const defaultDifficulties = ['ყველა'];

const Bicycles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ყველა');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ყველა');
  const [favorites, setFavorites] = useState([]);

  // Fetch all events from the event feed API
  const { data: allEvents, loading: eventsLoading, error: eventsError } = useEventFeed();
  

  // Create dynamic cities and difficulties from API data
  const cities = useMemo(() => {
    if (!allEvents) return defaultCities;
    const uniqueCities = [...new Set(allEvents.map(event => event.city?.name).filter(Boolean))];
    return ['ყველა', ...uniqueCities];
  }, [allEvents]);

  const difficulties = useMemo(() => {
    if (!allEvents) return defaultDifficulties;
    const uniqueDifficulties = [...new Set(allEvents.map(event => event.difficulty).filter(Boolean))];
    return ['ყველა', ...uniqueDifficulties];
  }, [allEvents]);

  const filteredTours = useMemo(() => {
    if (!allEvents) return [];
    
    return allEvents.filter(tour => {
      // Filter for hiking category only
      const isHikingActivity = tour.category && 
        tour.category.name?.toLowerCase() === 'bicycles';
      
      if (!isHikingActivity) return false;
      
      const matchesSearch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tour.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'ყველა' || tour.city?.name === selectedCity;
      const matchesDifficulty = selectedDifficulty === 'ყველა' || tour.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCity && matchesDifficulty;
    });
  }, [allEvents, searchTerm, selectedCity, selectedDifficulty]);

  const handleFavorite = (tourId) => {
    setFavorites(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  const handleBooking = (tour) => {
    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        bookingData: {
          activity: {
            id: tour.id,
            name: tour.name,
            image: getImageUrl(tour.primary_image?.image || tour.images?.[0]?.image),
            base_price: tour.base_price,
            duration: tour.duration,
            location: tour.city?.name || tour.location,
            description: tour.description
          },
          bookingDetails: {
            name: '',
            phone: '',
            date: '',
            time: '',
            participants: 1
          }
        }
      }
    });
  };


  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        ჰიკინგი
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        აღმოაჩინე საუკეთესო ჰიკინგის ტურები საქართველოში
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
              <InputLabel>სირთულე</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                label="სირთულე"
              >
                {difficulties.map(difficulty => (
                  <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
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
            ნაპოვნია {filteredTours.length} ჰიკინგის ტური
          </Typography>
        </Box>
      )}

      {/* Tours Grid */}
      {!eventsLoading && !eventsError && (
        <Grid container spacing={3}>
        {filteredTours.map((tour) => (
          <Grid item xs={12} sm={6} md={4} key={tour.id}>
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
                image={getImageUrl(tour.primary_image?.image || tour.images?.[0]?.image)}
                alt={tour.name}
                sx={{ position: 'relative' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Tooltip title={favorites.includes(tour.id) ? 'ფავორიტებიდან წაშლა' : 'ფავორიტებში დამატება'}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(tour.id);
                    }}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                    }}
                  >
                    {favorites.includes(tour.id) ? (
                      <Favorite sx={{ color: 'error.main' }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <DirectionsRun sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                    {tour.name}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {tour.city?.name || tour.location || 'მდებარეობა არ არის მითითებული'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {tour.description}
                </Typography>

                <Box display="flex" alignItems="center" mb={2}>
                  <Rating value={tour.rating || 4.5} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({tour.reviews || 0})
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {tour.category && (
                    <Chip 
                      label={tour.category.name} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {tour.tags && tour.tags.map(tag => (
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
                      {tour.base_price ? `${tour.base_price}₾` : 'ფასი არ არის მითითებული'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {tour.duration || 'ხანგრძლივობა არ არის მითითებული'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleBooking(tour)}
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: '#570015',
                      '&:hover': { backgroundColor: '#3d000f' }
                    }}
                  >
                    დაჯავშნა
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/activity/${tour.id}`)}
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

      {!eventsLoading && !eventsError && filteredTours.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          არ არის ნაპოვნი ჰიკინგის ტურები მითითებული კრიტერიუმებით.
        </Alert>
      )}

    </Box>
  );
};

export default Bicycles; 