import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Rating,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Slide,
  Zoom,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Star,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  CalendarToday,
  Person,
  Phone,
  Email,
  CheckCircle,
  Warning,
  Info,
  LocalTaxi,
  DirectionsCar,
  Speed,
  Security,
  SupportAgent,
  Payment,
  Close,
  Directions
} from '@mui/icons-material';
import { GOOGLE_MAPS_CONFIG } from '../config/googleMaps';

const EventDetail = ({ 
  event, 
  onClose, 
  onBooking, 
  open = false,
  showMap = true,
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    date: '',
    participants: 1,
    time: ''
  });

  // Initialize map center from event coordinates
  useEffect(() => {
    if (event) {
      // Try to get coordinates from event data
      let coordinates = null;
      
      if (event.coordinates) {
        coordinates = event.coordinates;
      } else if (event.latitude && event.longitude) {
        coordinates = { lat: event.latitude, lng: event.longitude };
      } else if (event.city) {
        // Default coordinates for Georgian cities
        const cityCoordinates = {
          'ბათუმი': { lat: 41.6168, lng: 41.6367 },
          'თბილისი': { lat: 41.7151, lng: 44.8271 },
          'ქუთაისი': { lat: 42.2488, lng: 42.6997 },
          'ქობულეთი': { lat: 41.8006, lng: 41.7758 },
          'ზუგდიდი': { lat: 42.5088, lng: 41.8708 },
          'გორი': { lat: 41.9842, lng: 44.1158 }
        };
        coordinates = cityCoordinates[event.city] || GOOGLE_MAPS_CONFIG.DEFAULT_CENTER;
      } else {
        coordinates = GOOGLE_MAPS_CONFIG.DEFAULT_CENTER;
      }
      
      setMapCenter(coordinates);
      setSelectedLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        address: event.location || event.city || 'ღონისძიების მდებარეობა'
      });
    }
  }, [event]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (onBooking) {
      onBooking({
        event,
        bookingDetails: bookingForm
      });
    }
  };

  const handleFavorite = () => {
    setFavorite(!favorite);
  };

  const mapContainerStyle = {
    width: '100%',
    height: height,
    borderRadius: '8px'
  };

  const mapOptions = {
    ...GOOGLE_MAPS_CONFIG.MAP_OPTIONS,
    mapTypeId: 'hybrid'
  };

  if (!event) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700} color="primary">
            {event.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleFavorite} color="primary">
              {favorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Event Image */}
            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              <img 
                src={event.primary_image?.image || event.images?.[0]?.image || '/api/placeholder/600/300'} 
                alt={event.name} 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover' 
                }} 
              />
            </Card>

            {/* Event Description */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  აღწერა
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {event.description || event.longDescription || 'აღწერა არ არის ხელმისაწვდომი.'}
                </Typography>
              </CardContent>
            </Card>

            {/* Event Details Grid */}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      რა შედის ფასში
                    </Typography>
                    <List dense>
                      {(event.included || [
                        'ღონისძიების მონაწილეობა',
                        'პროფესიონალური ინსტრუქტორი',
                        'უსაფრთხოების აღჭურვილობა',
                        'სადაზღვევო პოლისი'
                      ]).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      მოთხოვნები
                    </Typography>
                    <List dense>
                      {(event.requirements || [
                        'ყველა ასაკისთვის',
                        'კარგი ჯანმრთელობა',
                        'სათანადო ტანსაცმელი'
                      ]).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Info color="info" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Google Map */}
            {showMap && mapCenter && (
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    მდებარეობა
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <LoadScript
                      googleMapsApiKey={GOOGLE_MAPS_CONFIG.API_KEY}
                      libraries={GOOGLE_MAPS_CONFIG.LIBRARIES}
                    >
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={15}
                        options={mapOptions}
                      >
                        <Marker
                          position={mapCenter}
                          title={event.name}
                          animation={window.google?.maps?.Animation?.DROP}
                        />
                        <InfoWindow position={mapCenter}>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {event.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.location || event.city || 'ღონისძიების მდებარეობა'}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Directions />}
                              sx={{ mt: 1 }}
                              onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${mapCenter.lat},${mapCenter.lng}`;
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
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h5" fontWeight={600} mb={2}>
                  {event.base_price ? `${event.base_price}₾` : 'ფასი ხელმისაწვდომი არ არის'}
                </Typography>
                
                {event.rating && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating value={event.rating} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary" ml={1}>
                      ({event.reviews || 0} შეფასება)
                    </Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {event.city || 'მდებარეობა ხელმისაწვდომი არ არის'}
                  </Typography>
                </Box>

                {event.duration && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.duration}
                    </Typography>
                  </Box>
                )}

                {event.difficulty && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <Warning sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      სირთულე: {event.difficulty}
                    </Typography>
                  </Box>
                )}

                {event.tags && event.tags.length > 0 && (
                  <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                    {event.tags.map(tag => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                {/* Booking Form */}
                <Box component="form" onSubmit={handleBookingSubmit}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    დაჯავშნა
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="სახელი"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                    required
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="ტელეფონი"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    required
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="თარიღი"
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="დრო"
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>მონაწილეების რაოდენობა</InputLabel>
                    <Select
                      value={bookingForm.participants}
                      onChange={(e) => setBookingForm({...bookingForm, participants: e.target.value})}
                      label="მონაწილეების რაოდენობა"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: '#570015',
                      '&:hover': { backgroundColor: '#3d000f' },
                      mb: 2
                    }}
                  >
                    დაჯავშნა
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  sx={{ borderRadius: 2 }}
                  startIcon={<Phone />}
                >
                  კონტაქტი
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetail;
