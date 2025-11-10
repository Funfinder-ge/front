import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip, 
  Rating,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Slide,
  Zoom,
  Paper,
  CircularProgress,
  Divider,
  Container,
  Stack
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  ArrowBack,
  Person,
  CheckCircle,
  Info,
  LocalTaxi,
  Speed,
  Security,
  SupportAgent,
  Share,
  Favorite,
  FavoriteBorder,
  Group,
  CalendarToday,
  Phone
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../../config/googleMaps';
import { useEventDetails } from '../../hooks/useApi';

// Base URL for images
const IMAGE_BASE_URL = 'https://base.funfinder.ge/uploads/service_images/';

// Default placeholder image
const defaultActivityImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80';

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

// Default values for missing data
const defaultIncluded = [
      'პროფესიონალური ინსტრუქტორი',
      'უსაფრთხოების აღჭურვილობა',
];

const defaultRequirements = [
  'ყველა ასაკისთვის',
      'კარგი ჯანმრთელობა',
      'სათანადო ტანსაცმელი'
];

const defaultSchedule = [
  '10:00 - შეხვედრა',
  '10:30 - ინსტრუქტაჟი',
  '11:00 - აქტივობა',
  '11:30 - დასრულება'
];

const ActivityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch event details from API
  const { data: activity, loading, error } = useEventDetails(id);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>იტვირთება...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">
          <Typography variant="h6" mb={1}>შეცდომა</Typography>
          <Typography>{error}</Typography>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            დაბრუნება
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">
          <Typography variant="h6" mb={1}>აქტივობა არ მოიძებნა</Typography>
          <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            დაბრუნება
          </Button>
        </Alert>
      </Box>
    );
  }

  // Transform API data to component format
  const transformedActivity = {
    id: activity.id,
    name: activity.name,
    description: activity.description,
    longDescription: activity.description || '',
    image: getImageUrl(activity.primary_image?.image || activity.images?.[0]?.image),
    price: `${activity.discounted_price || activity.base_price || 0}₾`,
    city: activity.city?.name || activity.location || '',
    location: activity.location,
    duration: activity.duration || 'N/A',
    difficulty: activity.difficulty || 'N/A',
    rating: 4.5, // Default rating since API doesn't provide this
    reviews: activity.bookings_count || activity.views_count || 0,
    category: activity.category?.name || '',
    available: true,
    tags: [activity.category?.name || '', activity.city?.name || ''].filter(Boolean),
    coordinates: activity.latitude && activity.longitude 
      ? { lat: parseFloat(activity.latitude), lng: parseFloat(activity.longitude) } 
      : null,
    address: activity.location || activity.city?.name || '',
    included: defaultIncluded,
    requirements: defaultRequirements,
    schedule: defaultSchedule,
    // API fields for navigation
    base_price: activity.base_price,
    discounted_price: activity.discounted_price,
    min_people: activity.min_people,
    max_people: activity.max_people
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 4 }}>
      {/* Header Section with Back Button */}
      <Box sx={{ bgcolor: 'white', py: 2, mb: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center">
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                mr: 2,
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
          <ArrowBack />
        </IconButton>
            <Typography variant="h6" color="text.secondary">
              აქტივობის დეტალები
        </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Hero Image with Overlay */}
            <Card 
              sx={{ 
                mb: 4, 
                borderRadius: 4, 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
              }}
            >
              {transformedActivity.image ? (
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src={transformedActivity.image} 
                    alt={transformedActivity.name} 
              style={{ 
                width: '100%', 
                      height: '500px', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      // Replace with default image if API image fails to load
                      e.target.src = defaultActivityImage;
                    }}
                  />
                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                    }}
                  />
                  {/* Action Buttons */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => setIsFavorite(!isFavorite)}
                      sx={{
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#f5f5f5' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isFavorite ? (
                        <Favorite sx={{ color: '#e74c3c' }} />
                      ) : (
                        <FavoriteBorder sx={{ color: '#333' }} />
                      )}
                    </IconButton>
                    <IconButton
                      sx={{
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Share sx={{ color: '#333' }} />
                    </IconButton>
                  </Box>
                  {/* Category Badge */}
                  {transformedActivity.category && (
                    <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                      <Chip
                        label={transformedActivity.category}
                        sx={{
                          bgcolor: '#570015',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          height: '32px'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Box textAlign="center">
                    <LocationOn sx={{ fontSize: 64, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                    <Typography variant="h6" color="rgba(255,255,255,0.8)">ნახატი არ არის</Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {/* Activity Title and Quick Info */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight={700} color="text.primary" mb={2}>
                  {transformedActivity.name}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ color: '#e74c3c', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {transformedActivity.city}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AccessTime sx={{ color: '#3498db', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {transformedActivity.duration}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Group sx={{ color: '#9b59b6', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {transformedActivity.min_people}-{transformedActivity.max_people} ადამიანი
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Rating value={transformedActivity.rating} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" ml={0.5}>
                        ({transformedActivity.reviews})
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
          </Card>

          {/* Description */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#570015', borderRadius: '2px' }} />
                აღწერა
              </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                  {transformedActivity.longDescription}
              </Typography>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 4, height: 24, bgcolor: '#27ae60', borderRadius: '2px' }} />
                    რა შედის ფასში
                  </Typography>
                    <List>
                      {transformedActivity.included.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CheckCircle sx={{ color: '#27ae60', fontSize: 28 }} />
                        </ListItemIcon>
                          <ListItemText 
                            primary={item}
                            primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                      </ListItem>
                    ))}
                  </List>
                  
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        bgcolor: '#fff3cd',
                        border: '1px solid #ffc107'
                      }}
                    >
                    <Typography variant="body2">
                      <strong>შენიშვნა:</strong> ტრანსპორტირება არ შედის ფასში. ტაქსის შეკვეთა შესაძლებელია ქვემოთ.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 4, height: 24, bgcolor: '#3498db', borderRadius: '2px' }} />
                    მოთხოვნები
                  </Typography>
                    <List>
                      {transformedActivity.requirements.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Info sx={{ color: '#3498db', fontSize: 28 }} />
                        </ListItemIcon>
                          <ListItemText 
                            primary={item}
                            primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        </Grid>

        {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Price Card */}
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  mb: 3,
                  boxShadow: '0 4px 20px rgba(87,0,21,0.15)',
                  border: '2px solid #570015'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="baseline" mb={3}>
                    <Typography variant="h3" fontWeight={800} color="#570015">
                      {transformedActivity.price}
              </Typography>
                    <Typography variant="body1" color="text.secondary" ml={1}>
                      / პერსონა
                </Typography>
              </Box>

                  {transformedActivity.discounted_price && transformedActivity.discounted_price !== parseFloat(transformedActivity.base_price) && (
                    <Box mb={2}>
                  <Chip 
                        label={`ეკონომია ${((1 - transformedActivity.discounted_price / transformedActivity.base_price) * 100).toFixed(0)}%`}
                        sx={{
                          bgcolor: '#27ae60',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      />
              </Box>
                  )}

                  <Divider sx={{ mb: 3 }} />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/payment', {
                  state: {
                    bookingData: {
                      activity: {
                            id: transformedActivity.id,
                            name: transformedActivity.name,
                            image: transformedActivity.image,
                            base_price: parseFloat(transformedActivity.base_price || 0),
                            discounted_price: parseFloat(transformedActivity.discounted_price || 0),
                            duration: transformedActivity.duration,
                            location: transformedActivity.location,
                            description: transformedActivity.description,
                            min_people: transformedActivity.min_people,
                            max_people: transformedActivity.max_people
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
                })}
                sx={{ 
                      borderRadius: 3,
                      py: 1.5,
                  backgroundColor: '#570015',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(87,0,21,0.3)',
                      '&:hover': { 
                        backgroundColor: '#3d000f',
                        boxShadow: '0 6px 20px rgba(87,0,21,0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    დაჯავშნა ახლა
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                    startIcon={<Phone />}
                    sx={{ 
                      borderRadius: 3,
                      mt: 2,
                      py: 1.5,
                      borderColor: '#570015',
                      color: '#570015',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { 
                        borderColor: '#3d000f',
                        bgcolor: '#570015',
                        color: 'white'
                      }
                    }}
                  >
                    დაგვიკავშდით
              </Button>
            </CardContent>
          </Card>

              {/* Quick Info Card */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    სწრაფი ინფორმაცია
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: '#e3f2fd',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LocationOn sx={{ color: '#2196f3' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          მდებარეობა
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {transformedActivity.city}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Box
            sx={{ 
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: '#f3e5f5',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <AccessTime sx={{ color: '#9c27b0' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          ხანგრძლივობა
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {transformedActivity.duration}
                        </Typography>
                      </Box>
                    </Box>

                    {transformedActivity.min_people && transformedActivity.max_people && (
                      <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                            p: 1,
                      borderRadius: '50%',
                            bgcolor: '#e8f5e9',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                          <Group sx={{ color: '#4caf50' }} />
                  </Box>
                <Box>
                          <Typography variant="caption" color="text.secondary">
                            ადამიანი
                  </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {transformedActivity.min_people}-{transformedActivity.max_people} პერსონა
                  </Typography>
                        </Box>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: '#fff3e0',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Rating value={transformedActivity.rating} precision={0.5} readOnly size="small" />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          რეიტინგი
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {transformedActivity.rating}/5 ({transformedActivity.reviews} შეფასება)
                    </Typography>
                  </Box>
                </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Taxi Section */}
      <Container maxWidth="lg">
        <Box mt={6}>
          <Fade in={true} timeout={1000}>
            <Card   
              sx={{ 
                borderRadius: 4,
                backgroundColor: 'white',
                color: 'text.primary',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: 'none',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  py: 3,
                  px: 4
                }}
              >
                <Typography variant="h4" fontWeight={700} mb={1}>
                  ტაქსის მომსახურება
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  ტაქსის გამოძახების სერვისი - სურვილის შემთხვევაში
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                  <Slide direction="up" in={true} timeout={2000}>
                    <Paper 
                        elevation={2}
                      sx={{ 
                          p: 3, 
                          backgroundColor: 'white', 
                        borderRadius: 3,
                          border: '2px solid #e8f5e9',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#4caf50',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(76,175,80,0.2)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              bgcolor: '#e8f5e9',
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Speed sx={{ color: '#4caf50', fontSize: 28 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700}>
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
                        elevation={2}
                      sx={{ 
                          p: 3, 
                          backgroundColor: 'white', 
                        borderRadius: 3,
                          border: '2px solid #e3f2fd',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#2196f3',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(33,150,243,0.2)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              bgcolor: '#e3f2fd',
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Security sx={{ color: '#2196f3', fontSize: 28 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700}>
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
                        elevation={2}
                      sx={{ 
                          p: 3, 
                          backgroundColor: 'white', 
                        borderRadius: 3,
                          border: '2px solid #fff3e0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#ff9800',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(255,152,0,0.2)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '50%',
                              bgcolor: '#fff3e0',
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <SupportAgent sx={{ color: '#ff9800', fontSize: 28 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700}>
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

                <Alert 
                  severity="warning" 
                  icon={<LocalTaxi />}
                  sx={{ 
                    bgcolor: '#fff3cd',
                    borderRadius: 3,
                    border: '2px solid #ffc107',
                    '& .MuiAlert-icon': {
                      color: '#f57c00',
                      fontSize: 28
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    მნიშვნელოვანი შეტყობინება
                  </Typography>
                  <Typography variant="body2">
                    ტაქსის ფასი არ შედის ბილეთის ფასში! ტაქსის ღირებულება ცალკე იხდება და დამოკიდებულია მანძილზე, ტრაფიკზე და ტაქსის ტიპზე.
                  </Typography>
                </Alert>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      {/* Google Map Section */}
        {transformedActivity.coordinates && (
          <Box mt={6}>
          <Fade in={true} timeout={1000}>
            <Card   
              sx={{ 
                borderRadius: 4,
                backgroundColor: 'white',
                color: 'text.primary',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: 'none',
                  overflow: 'hidden'
              }}
            >
                  <Box
                    sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    py: 3,
                    px: 4
                  }}
                >
                  <Typography variant="h4" fontWeight={700} mb={1}>
                      მდებარეობა
                    </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      ღონისძიების ზუსტი მდებარეობა რუკაზე
                    </Typography>
                </Box>
                <Box sx={{ p: 2 }}>

                  <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
                  <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_CONFIG.API_KEY}
                    libraries={GOOGLE_MAPS_CONFIG.LIBRARIES}
                  >
                    <GoogleMap
                      mapContainerStyle={{
                        width: '100%',
                          height: '450px',
                        borderRadius: '8px'
                      }}
                        center={transformedActivity.coordinates}
                      zoom={15}
                      options={{
                        ...GOOGLE_MAPS_CONFIG.MAP_OPTIONS,
                          mapTypeId: 'hybrid',
                          styles: [
                            {
                              featureType: 'poi',
                              elementType: 'labels',
                              stylers: [{ visibility: 'off' }]
                            }
                          ]
                      }}
                    >
                      <Marker
                          position={transformedActivity.coordinates}
                          title={transformedActivity.name}
                        animation={window.google?.maps?.Animation?.DROP}
                      />
                        <InfoWindow position={transformedActivity.coordinates}>
                        <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                              {transformedActivity.name}
                          </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {transformedActivity.address || transformedActivity.city}
                          </Typography>
                          <Button
                            size="small"
                              variant="contained"
                            startIcon={<LocationOn />}
                              sx={{ 
                                bgcolor: '#570015',
                                '&:hover': { bgcolor: '#3d000f' }
                              }}
                            onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${transformedActivity.coordinates.lat},${transformedActivity.coordinates.lng}`;
                              window.open(url, '_blank');
                            }}
                          >
                            მარშრუტი
                          </Button>
                        </Box>
                      </InfoWindow>
                    </GoogleMap>
                  </LoadScript>
                </Box>
                </Box>
            </Card>
          </Fade>
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default ActivityDetails; 