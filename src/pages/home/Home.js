import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Button, Container, Paper, Card, CardContent, CardMedia, CardActions, IconButton, Divider, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Chip, Rating, Tooltip } from '@mui/material';
import { DirectionsBoat, SportsMotorsports, BeachAccess, Phone, Email, LocationOn, WhatsApp, Telegram, Instagram, ExpandMore as ExpandMoreIcon, DirectionsRun, AccessTime, AttachMoney, Favorite, FavoriteBorder } from '@mui/icons-material';
import MainSlider from '../../components/MainSlider';
import PartnerCompanySlider from '../../components/PartnerCompanySlider';
import LocationPermission from '../../components/LocationPermission';
import NearbyActivities from '../../components/NearbyActivities';
import TaxiOrder from '../../components/TaxiOrder';
import QuickTaxiButton from '../../components/QuickTaxiButton';
import { useLocation } from '../../hooks/useLocation';
import { eventsApi, checkApiHealth, sliderApi } from '../../services/api';
import { usePopularEvents, useFeaturedEvents, useEventFeed } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  MenuItem, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Slide,
  Zoom,
  Stack
} from '@mui/material';
import { 
  Star, 
  ArrowBack,
  CalendarToday,
  Person,
  CheckCircle,
  Warning,
  Info,
  LocalTaxi,
  DirectionsCar,
  Speed,
  Security,
  SupportAgent,
  Payment
} from '@mui/icons-material';

// Helper function to get full slider image URL
const getSliderImageUrl = (image) => {
  if (!image) return '';
  
  const imageStr = typeof image === 'string' ? image : String(image);
  
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }
  
  if (imageStr.startsWith('/')) {
    return 'https://base.funfinder.ge' + imageStr;
  }
  
  return 'https://base.funfinder.ge/uploads/slider_images/' + imageStr;
};

const partnerCompanies = [
  {
    name: 'ბათუმის პორტი',
    description: 'საზღვაო ტურების მიწარმოებელი',
    logo: require('../../assets/partners/1.png')
  },
  {
    name: 'კვადრო ტურები',
    description: 'საოცარი ტურების განათლება',
    logo: require('../../assets/partners/2.png')
  },
  {
    name: 'VIP Beach',
    description: 'პრემიუმ სერვისები',
    logo: require('../../assets/partners/3.png')
  },
  {
    name: 'საზღვაო ტურები',
    description: 'საზღვაო ადვენტურა',
    logo: require('../../assets/partners/4.png')
  }
];

// Base URL for images
const IMAGE_BASE_URL = 'https://base.funfinder.ge/uploads/service_images/';
const defaultActivityImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80';

// Helper function to get full image URL
const getImageUrl = (image) => {
  if (!image) return defaultActivityImage;
  
  const imageStr = typeof image === 'string' ? image : String(image);
  
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return imageStr;
  }
  
  if (imageStr.startsWith('/')) {
    return 'https://base.funfinder.ge' + imageStr;
  }
  
  return IMAGE_BASE_URL + imageStr;
};

// Helper function to format event for ActivityCard
const formatEventForCard = (event) => {
  // Extract times from event sessions or time slots
  const times = [];
  if (event.sessions && Array.isArray(event.sessions)) {
    event.sessions.forEach(session => {
      if (session.start_time) {
        const time = new Date(session.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (!times.includes(time)) {
          times.push(time);
        }
      }
    });
  } else if (event.time_slots && Array.isArray(event.time_slots)) {
    event.time_slots.forEach(slot => {
      if (slot.time) {
        const time = typeof slot.time === 'string' ? slot.time : new Date(slot.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        if (!times.includes(time)) {
          times.push(time);
        }
      }
    });
  } else if (event.available_times && Array.isArray(event.available_times)) {
    times.push(...event.available_times.slice(0, 3));
  }
  
  // Extract types/labels from event data
  const types = [];
  if (event.category?.name) {
    types.push(event.category.name);
  }
  if (event.duration) {
    types.push(event.duration);
  } else if (event.duration_hours) {
    types.push(`${event.duration_hours} საათი`);
  }
  
  return {
    id: event.id,
    image: getImageUrl(event.primary_image?.image || event.images?.[0]?.image || event.image),
    name: event.name || event.title || 'აქტივობა',
    times: times.length > 0 ? times : ['09:00', '12:00', '15:00'], // Default times if none available
    types: types.length > 0 ? types : ['აქტივობა'],
    event: event // Keep full event data for handlers
  };
};

export const Home = () => {
  const navigate = useNavigate();
  const { position, getCurrentPosition } = useLocation();
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [sliderSlides, setSliderSlides] = useState([]);
  const [loadingSliders, setLoadingSliders] = useState(true);
  
  // Fetch popular and featured events
  const { data: popularEvents, loading: popularLoading } = usePopularEvents();
  const { data: featuredEvents, loading: featuredLoading } = useFeaturedEvents();
  const { data: allEvents, loading: allEventsLoading } = useEventFeed();

  const handleFavorite = (eventId) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Transform events for NearbyActivities component
  const nearbyActivitiesList = React.useMemo(() => {
    if (!allEvents || !Array.isArray(allEvents)) return [];
    
    return allEvents
      .filter(event => {
        // Only include events that have latitude and longitude
        const lat = event.latitude || event.location?.latitude || event.coordinates?.latitude;
        const lng = event.longitude || event.location?.longitude || event.coordinates?.longitude;
        return lat && lng && !isNaN(lat) && !isNaN(lng);
      })
      .map(event => {
        const lat = event.latitude || event.location?.latitude || event.coordinates?.latitude;
        const lng = event.longitude || event.location?.longitude || event.coordinates?.longitude;
        
        return {
          id: event.id,
          name: event.name || event.title || 'აქტივობა',
          description: event.description || '',
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          rating: event.rating || 0,
          duration: event.duration || '',
          category: event.category?.name || event.category || '',
          address: event.city?.name || event.location || '',
          image: getImageUrl(event.primary_image?.image || event.images?.[0]?.image || event.image),
          event: event // Keep full event data
        };
      });
  }, [allEvents]);

  // Fetch slider data on component mount
  useEffect(() => {
    const loadSliders = async () => {
      try {
        setLoadingSliders(true);
        console.log('🖼️ Loading sliders...');
        const sliders = await sliderApi.getAll();
        
        // Transform slider data to match MainSlider component format
        const transformedSliders = sliders.map(slider => ({
          id: slider.id,
          title: slider.title || '',
          description: slider.description || '',
          image: getSliderImageUrl(slider.image),
          link: slider.link || null
        }));
        
        console.log('✅ Loaded sliders:', transformedSliders);
        setSliderSlides(transformedSliders);
      } catch (error) {
        console.error('Error loading sliders:', error);
        // Set empty array on error to prevent UI issues
        setSliderSlides([]);
      } finally {
        setLoadingSliders(false);
      }
    };

    loadSliders();
  }, []);

  // Load nearby events when position is available
  useEffect(() => {
    const loadNearbyEvents = async () => {
      if (position) {
        setLoadingEvents(true);
        try {
          console.log('📍 Loading nearby events for position:', position);
          
          // Check API health first
          const isApiHealthy = await checkApiHealth();
          if (!isApiHealthy) {
            console.warn('⚠️ API server is not available, skipping nearby events');
            setNearbyEvents([]);
            return;
          }
          
          const events = await eventsApi.getNearby(
            position.latitude, 
            position.longitude, 
            10
          );
          console.log('📅 Loaded nearby events:', events);
          setNearbyEvents(events || []);
        } catch (error) {
          console.error('Error loading nearby events:', error);
          // Set empty array on error to prevent UI issues
          setNearbyEvents([]);
        } finally {
          setLoadingEvents(false);
        }
      }
    };

    loadNearbyEvents();
  }, [position]);

  const handleReserve = (event) => {
    // Navigate to payment page with event data
    navigate('/payment', {
      state: {
        bookingData: {
          activity: {
            id: event.id,
            name: event.name || event.title,
            image: getImageUrl(event.primary_image?.image || event.images?.[0]?.image || event.image),
            base_price: event.base_price,
            duration: event.duration,
            location: event.city?.name || event.location,
            description: event.description
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

  const handleInfo = (event) => {
    // Navigate to event details page
    navigate(`/activity/${event.id}`);
  };

  return (
    <Box>


      {/* Main Slider */}
      <Box sx={{ mb: 4 }}>
        {loadingSliders ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : sliderSlides.length > 0 ? (
          <MainSlider slides={sliderSlides} />
        ) : null}
      </Box>

      {/* Hero Section */}


      {/* Partner Companies */}
      {/* <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
          პარტნიორები
        </Typography>
        <PartnerCompanySlider partners={partnerCompanies} />
      </Box> */}



      {/* Nearby Activities */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <NearbyActivities 
          activities={nearbyActivitiesList}
          onActivitySelect={(activity) => {
            if (activity.event) {
              handleInfo(activity.event);
            } else {
              handleInfo(activity);
            }
          }}
          maxResults={10}
        />
      </Container>


      {/* Popular Activities */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
          პოპულარული აქტივობები
        </Typography>
        {popularLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {popularEvents && popularEvents.length > 0 ? (
              popularEvents.slice(0, 3).map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(event.primary_image?.image || event.images?.[0]?.image || event.image)}
                        alt={event.name || event.title}
                      />
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Tooltip title={favorites.includes(event.id) ? 'ფავორიტებიდან წაშლა' : 'ფავორიტებში დამატება'}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(event.id);
                            }}
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            {favorites.includes(event.id) ? (
                              <Favorite sx={{ color: 'error.main' }} />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DirectionsRun sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                          {event.name || event.title || 'აქტივობა'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.city?.name || event.location || 'მდებარეობა არ არის მითითებული'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {event.description || ''}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Rating value={event.rating || 0} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" ml={1}>
                          ({event.reviews || 0})
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {event.category && (
                          <Chip 
                            label={event.category.name} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                        {event.tags && event.tags.map(tag => (
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
                            {event.base_price ? `${event.base_price}₾` : 'ფასი არ არის მითითებული'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.duration || 'ხანგრძლივობა არ არის მითითებული'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleReserve(event)}
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
                          onClick={() => handleInfo(event)}
                          sx={{ borderRadius: 2 }}
                        >
                          დეტალები
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  პოპულარული აქტივობები არ მოიძებნა
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* Featured Activities */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
          რეკომენდებული აქტივობები
        </Typography>
        {featuredLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredEvents && featuredEvents.length > 0 ? (
              featuredEvents.slice(0, 3).map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(event.primary_image?.image || event.images?.[0]?.image || event.image)}
                        alt={event.name || event.title}
                      />
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Tooltip title={favorites.includes(event.id) ? 'ფავორიტებიდან წაშლა' : 'ფავორიტებში დამატება'}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(event.id);
                            }}
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            {favorites.includes(event.id) ? (
                              <Favorite sx={{ color: 'error.main' }} />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DirectionsRun sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                          {event.name || event.title || 'აქტივობა'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.city?.name || event.location || 'მდებარეობა არ არის მითითებული'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {event.description || ''}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Rating value={event.rating || 0} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" ml={1}>
                          ({event.reviews || 0})
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {event.category && (
                          <Chip 
                            label={event.category.name} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                        {event.tags && event.tags.map(tag => (
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
                            {event.base_price ? `${event.base_price}₾` : 'ფასი არ არის მითითებული'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.duration || 'ხანგრძლივობა არ არის მითითებული'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleReserve(event)}
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
                          onClick={() => handleInfo(event)}
                          sx={{ borderRadius: 2 }}
                        >
                          დეტალები
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  რეკომენდებული აქტივობები არ მოიძებნა
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>

      {/* About Section */}
      <Paper sx={{ py: 6, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight={700} color="#570015">
                ჩვენს შესახებ
              </Typography>
              <Typography variant="body1" paragraph>
                Discount არის ბათუმის წამყვანი კომპანია საზღვაო და სახმელეთო გართობის სფეროში. 
                ჩვენ გთავაზობთ უსაფრთხო და საინტერესო აქტივობებს ყველა ასაკის ვიზიტორებისთვის.
              </Typography>
              <Typography variant="body1" paragraph>
                ჩვენი გუნდი შედგება გამოცდილი პროფესიონალებისგან, რომლებიც ზრუნავენ თქვენი 
                უსაფრთხოებისა და კომფორტის შესახებ. ჩვენ გამოვიყენებთ უმაღლეს ხარისხის ეკიპმენტს და 
                უსაფრთხოების სტანდარტებს, რათა თქვენ ამარჯვებით გააცალოთ ჩვენი აქტივობები.
              </Typography>
              <Button variant="contained" size="large" sx={{ bgcolor: '#570015', fontWeight: 700 }}>
                უფრო მეტი
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <Typography variant="h2" fontWeight={700} color="#570015">
                      5000+
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      კმაყოფილი მომხმარებელი
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h2" fontWeight={700} color="#570015">
                      10
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      წლის გამოცდილობა
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Contact Section */}
      <Paper sx={{ py: 6, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
            კონტაქტი
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    ტელეფონი
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <Phone sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    +995 555 123 456
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    <WhatsApp sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    +995 555 123 456
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    ელ.ფოსტა
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <Email sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    info@discount.ge
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    <Telegram sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    @discount_batumi
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    მისამართი
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <LocationOn sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    ბათუმი, კაცაბის ქუჩა 12
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    <Instagram sx={{ fontSize: 24, verticalAlign: 'middle', mr: 1 }} />
                    @discount_batumi
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Testimonials Section */}
      <Paper sx={{ py: 6, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
            მომხმარებლის შეფასება
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#570015">
                კატერინა კ. - ბათუმი
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "საუკეთესო გართობა! იახტით გასეირნება შავ ზღვაში იყო უმაღლესი ხარისხის. გამოცდილი გუნდი და უსაფრთხოება გარანტირებულია."
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#570015">
                გიორგი გ. - თბილისი
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "კვადრო ტური იყო უმაღლესი ხარისხის. საოცარი ლანდშაფტები და უმაღლესი ხარისხის ეკიპმენტი გარანტირებულია უარყოფითი გამოცდილობას."
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#570015">
                ნინო კ. - ქუთაისი
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "VIP Beach იყო უმაღლესი ხარისხის. პრემიუმ სერვისები და კომფორტული შეზლონგები გარანტირებულია შესაძლებლობას გააცალოთ ზღვაში."
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Paper>

      {/* FAQ Section */}
      <Paper sx={{ py: 6, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} sx={{ mb: 4 }}>
            ხშირად დასმული კითხვები
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">1. რამდენი ხანგრძლივობას გაქვთ ტურები?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                ჩვენი ტურები ხანგრძლივობას 2-6 საათის განმავლობაშია. თითოეული ტურის ხანგრძლივობა შემდეგნაირადაა ნიშნული:
                - იახტით გასეირნება: 2-3 საათი
                - კვადრო ტური: 3-4 საათი
                - VIP Beach: მთელი დღე
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">2. რამდენი ადამიანი შეიძლება ნახევარი ტურებში?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                ჩვენი ტურების მაქსიმალური მონაწილეების რაოდენობა შემდეგნაირადაა ნიშნული:
                - იახტით გასეირნება: 8 ადამიანი
                - კვადრო ტური: 4 ადამიანი
                - VIP Beach: უზარმართველი
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">3. რა საჭიროა ტურებში?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                თითოეული ტურისთვის საჭიროა:
                - იახტით გასეირნება: სურვილისამებრივი საჭიროები
                - კვადრო ტური: კვადრო და საჭიროები
                - VIP Beach: სურვილისამებრივი საჭიროები
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">4. რამდენი მინიმუმ ასაკია ტურებში?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                ჩვენი ტურების მინიმალური ასაკი შემდეგნაირადაა ნიშნული:
                - იახტით გასეირნება: 6 წლის
                - კვადრო ტური: 18 წლის
                - VIP Beach: უზარმართველი
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Paper>

      {/* <Box mt={4}>
        <Fade in={true} timeout={1000}>
          <Card   
            sx={{ 
              borderRadius: 4,
              backgroundColor: 'white',
              color: 'text.primary',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Zoom in={true} timeout={1500}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: '#f5f5f5',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <LocalTaxi sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Box>
                </Zoom>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    ტაქსი
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ტაქსის გამოძახების სერვისი - სურვილის შემთხვევაში
                  </Typography>
                  <Box 
                    sx={{ 
                      mt: 1, 
                      p: 1, 
                      backgroundColor: '#570015', 
                      borderRadius: 2,
                      border: '1px solid #ffeaa7'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                      ტაქსის ფასი ცალკე იხდება - არ შედის ბილეთის ფასში!
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                  <Slide direction="up" in={true} timeout={2000}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 3,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Speed sx={{ mr: 1, color: '#4CAF50' }} />
                        <Typography variant="h6" fontWeight={600}>
                          სწრაფი
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        5-10 წუთში ჩამოვა
                      </Typography>
                    </Paper>
                  </Slide>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Slide direction="up" in={true} timeout={2500}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 3,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Security sx={{ mr: 1, color: '#2196F3' }} />
                        <Typography variant="h6" fontWeight={600}>
                          უსაფრთხო
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ვერიფიცირებული მძღოლები
                      </Typography>
                    </Paper>
                  </Slide>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Slide direction="up" in={true} timeout={3000}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 3,
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <SupportAgent sx={{ mr: 1, color: '#FF9800' }} />
                        <Typography variant="h6" fontWeight={600}>
                          24/7
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        მომსახურება
                      </Typography>
                    </Paper>
                  </Slide>
                </Grid>
              </Grid>

              <Box 
                sx={{ 
                  p: 3, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 3,
                  border: '1px solid #e9ecef'
                }}
              >
                <Box textAlign="center" mb={3}>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    ტაქსის მომსახურება
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ტრანსპორტირების მომსახურება ხელმისაწვდომია
                  </Typography>
                </Box>

                <Alert 
                  severity="warning" 
                  sx={{ 
                    backgroundColor: '#570015',
                    color: '#856404',
                    border: '1px solid #ffeaa7',
                    '& .MuiAlert-icon': {
                      color: 'white'
                    }
                  }}
                >
                  <Typography variant="body2" color="white">
                    <strong>მნიშვნელოვანი:</strong> ტაქსის ფასი არ შედის ბილეთის ფასში! ტაქსის ღირებულება ცალკე იხდება და დამოკიდებულია მანძილზე, ტრაფიკზე და ტაქსის ტიპზე.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box> */}
    <Paper 
        sx={{ 
          background: 'linear-gradient(45deg, #570015 30%, #7a1a2a 90%)',
          color: 'white',
          py: 8,
          mb: 4,
          borderRadius: 0
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom align="center" fontWeight={700}>
            Fun Finder
          </Typography>
          <Typography variant="h2" align="center" paragraph style={{ fontFamily: 'Tangerine, cursive' }}>
          Adventures, Discounts, Memories
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            გამოიცადეთ საოცარი საზღვაო და სახმელეთო აქტივობები
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: '#570015', fontWeight: 700 }}>
              ბილეთების შეძენა
            </Button>
            <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white', fontWeight: 700 }}>
              უფრო მეტი
            </Button>
          </Box>
        </Container>
      </Paper>
      {/* Quick Taxi Button */}
      <QuickTaxiButton position="bottom-right" />
    </Box>
  );
};