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
  DirectionsBike,
  Hiking,
  SportsMotorsports,
  Park
} from '@mui/icons-material';
import PriceDisplay from '../../../components/PriceDisplay';
import FunLoader from '../../../components/FunLoader';
import { useNavigate } from 'react-router-dom';
import PaymentButton from '../../../components/PaymentButton';
import { useEventFeed } from '../../../hooks/useApi';
import RecentEventsSlider from '../../../components/RecentEventsSlider';


import img1 from '../../../assets/l.jpg';
import { getImageUrl } from "../../../utils/imageUtils";

// Default values
const defaultCities = ['All'];
const defaultCategories = ['All'];

const LandActivities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);

  // Fetch all events from the event feed API
  const { data: allEvents, loading: eventsLoading, error: eventsError } = useEventFeed();

  // Create dynamic cities and categories from API data
  const cities = useMemo(() => {
    if (!allEvents) return defaultCities;
    const uniqueCities = [...new Set(allEvents.map(event => event.city?.name).filter(Boolean))];
    return ['All', ...uniqueCities];
  }, [allEvents]);

  const categories = useMemo(() => {
    if (!allEvents) return defaultCategories;
    const uniqueCategories = [...new Set(allEvents.map(event => event.category?.name).filter(Boolean))];
    return ['All', ...uniqueCategories];
  }, [allEvents]);

  // Filter events by activity type = 'land'
  const allLandEvents = useMemo(() => {
    if (!allEvents) return [];
    
    // Filter events where category.activity is 'land'
    return allEvents.filter(event => {
      const activityType = event.category?.activity?.toLowerCase();
      return activityType === 'land';
    });
  }, [allEvents]);

  const filteredActivities = useMemo(() => {
    return allLandEvents.filter(activity => {
      const matchesSearch = activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'All' || activity.city?.name === selectedCity;
      const matchesCategory = selectedCategory === 'All' || activity.category?.name === selectedCategory;
      
      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [allLandEvents, searchTerm, selectedCity, selectedCategory]);

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

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <Park />;
    const cat = categoryName.toLowerCase();
    switch (cat) {
      case 'bicycle':
      case 'ბაიკი':
        return <DirectionsBike />;
      case 'tour':
        return <Park />;
      case 'quad':
        return <SportsMotorsports />;
      case 'hiking':
        return <Hiking />;
      default:
        return <Park />;
    }
  };

  return (
    <Box sx={{margin:"65px 0 50px 0px" }}>
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: "100%", overflow: "hidden" }}>
        <RecentEventsSlider />
      </Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        Land Activities
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Discover the best land activities in Georgia
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center">
          <FilterList sx={{ mr: 1 }} />
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl sx={{ width: '250px' }}>
              <InputLabel>Cities</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                label="City"
              >
                {cities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl sx={{ width: '250px' }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Loading State */}
      {eventsLoading && <FunLoader />}

      {/* Error State */}
      {eventsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load events: {eventsError}
        </Alert>
      )}

      {/* Results */}
      {!eventsLoading && !eventsError && (
        <Box mb={3}>
          <Typography variant="h6" color="text.secondary">
            Found {filteredActivities.length} Event
          </Typography>
        </Box>
      )}

      {/* Activities Grid */}
      {!eventsLoading && !eventsError && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: { xs: 'center', sm: 'center', md: 'center' }
        }}>
          {filteredActivities.map((activity) => (
          <Box key={activity.id} sx={{
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
            maxWidth: { xs: '100%', sm: 'none', md: '250px' },
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Card 
              sx={{ 
                width: '100%',
                maxWidth: { xs: '100%', md: '250px' },
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
                image={getImageUrl(activity.primary_image?.image || activity.images?.[0]?.image || activity.image)}
                alt={activity.name}
                sx={{ position: 'relative' }}
              />
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Tooltip title={favorites.includes(activity.id) ? 'Remove from favorites' : 'Add to favorites'}>
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
                    <img src={img1} style={{width: '20px', height: '20px'}} />
                  <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                    {activity.name}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {activity.city?.name || activity.location || 'Location not specified'}
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
                  <Rating value={activity.average_rating || 0} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({activity.rating_count || 0})
                  </Typography>
                </Box>

                {activity.category && (
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                      label={activity.category.name} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                )}

                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <PriceDisplay
                    basePrice={activity.base_price}
                    pricePerPerson={activity.price_per_person || activity.discounted_price}
                    variant="h6"
                  />
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.duration || ' '}
                    </Typography>
                  </Box>
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
                    More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          ))}
        </Box>
      )}

      {!eventsLoading && !eventsError && filteredActivities.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No activities found matching the specified criteria.
        </Alert>
      )}
    </Box>
  );
};

export default LandActivities; 