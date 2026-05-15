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
  Dialog,
  DialogContent,
  Alert,
  Fade,
  CircularProgress,
  Divider,
  Container,
  Stack
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  CheckCircle,
  Info,
  Share,
  Favorite,
  FavoriteBorder,
  Group,
  CalendarToday,
  Phone,
  WhatsApp,
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Visibility,
  ContentCopy,
  TrendingUp,
  ConfirmationNumber,
  EventAvailable,
  LocalOffer
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../../config/googleMaps';
import { useEventDetails } from '../../hooks/useApi';
import PriceDisplay from '../../components/PriceDisplay';
import EventCalendar from '../../components/EventCalendar';
import FunLoader from '../../components/FunLoader';
import EventReviews from '../../components/EventReviews';

import { getImageUrl, DEFAULT_ACTIVITY_IMAGE } from '../../utils/imageUtils';

const WHATSAPP_NUMBER = '+995555346132';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '').replace(/\s/g, '')}`;

const defaultIncluded = [
  'Professional instructor',
  'Safety equipment',
];

const defaultRequirements = [
  'All ages',
  'Good health',
  'Appropriate clothing'
];

const extractImages = (activityData) => {
  if (!activityData) return [DEFAULT_ACTIVITY_IMAGE];
  const images = [];
  const seen = new Set();

  const pushUrl = (raw) => {
    if (!raw || raw === "undefined" || raw === "null") return;
    const full = getImageUrl(raw);
    if (!seen.has(full)) {
      seen.add(full);
      images.push(full);
    }
  };

  if (Array.isArray(activityData.images) && activityData.images.length > 0) {
    [...activityData.images]
      .sort((a, b) => {
        if (a?.is_primary && !b?.is_primary) return -1;
        if (!a?.is_primary && b?.is_primary) return 1;
        return (a?.order || 0) - (b?.order || 0);
      })
      .forEach((img) => {
        if (typeof img === 'string') pushUrl(img);
        else pushUrl(img?.image || img?.url);
      });
  }

  if (activityData.primary_image?.image) pushUrl(activityData.primary_image.image);
  if (activityData.image) pushUrl(activityData.image);

  console.log('[ActivityDetails] extractImages →', { raw: activityData?.images, resolved: images });

  return images.length > 0 ? images : [DEFAULT_ACTIVITY_IMAGE];
};

const transformActivity = (activity, allImages) => ({
  id: activity.id,
  name: activity.name,
  description: activity.description || '',
  image: allImages[0] || DEFAULT_ACTIVITY_IMAGE,
  images: allImages,
  city: activity.city?.name || activity.location || '',
  location: activity.location,
  duration: activity.duration || 'N/A',
  difficulty: activity.difficulty || null,
  rating: activity.average_rating ?? activity.rating ?? 0,
  reviews: activity.rating_count ?? activity.reviews ?? 0,
  bookings_count: activity.bookings_count || 0,
  views_count: activity.views_count || 0,
  category: activity.category?.name || '',
  tags: activity.tags || [],
  coordinates: activity.latitude && activity.longitude
    ? { lat: parseFloat(activity.latitude), lng: parseFloat(activity.longitude) }
    : null,
  address: activity.location || activity.city?.name || '',
  base_price: activity.base_price,
  discounted_price: activity.discounted_price,
  price_per_person: activity.price_per_person,
  min_people: activity.min_people,
  max_people: activity.max_people,
});

// --- Sub-components ---

const SectionTitle = ({ color = '#87003A', children }) => (
  <Typography variant="subtitle1" fontWeight={700} mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 3, height: 18, bgcolor: color, borderRadius: '2px' }} />
    {children}
  </Typography>
);

const HeroImage = ({ activity, allImages, onImageClick, isFavorite, onToggleFavorite }) => (
  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box
      sx={{ cursor: allImages.length > 0 ? 'pointer' : 'default' }}
      onClick={() => allImages.length > 0 && onImageClick(0)}
    >
      <img
        src={activity.image}
        alt={activity.name}
        style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.src = DEFAULT_ACTIVITY_IMAGE; }}
      />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)' }} />

      {/* Title + meta overlay */}
      <Box sx={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
        <Typography variant="h5" fontWeight={700} color="white" mb={0.5}>
          {activity.name}
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
          {activity.category && (
            <Chip label={activity.category} size="small" sx={{ bgcolor: '#87003A', color: 'white', fontWeight: 600, height: 24, fontSize: '0.75rem' }} />
          )}
          {activity.difficulty && (
            <Chip label={activity.difficulty} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, height: 24, fontSize: '0.75rem', backdropFilter: 'blur(4px)' }} />
          )}
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationOn sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }} />
            <Typography variant="caption" color="rgba(255,255,255,0.9)">{activity.city}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTime sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }} />
            <Typography variant="caption" color="rgba(255,255,255,0.9)">{activity.duration}</Typography>
          </Box>
          {activity.min_people && activity.max_people && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Group sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }} />
              <Typography variant="caption" color="rgba(255,255,255,0.9)">{activity.min_people}-{activity.max_people}</Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" gap={0.5}>
            <Rating value={activity.rating} precision={0.5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#ffc107' }, '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' } }} />
            <Typography variant="caption" color="rgba(255,255,255,0.8)">({activity.reviews})</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Social proof badge */}
      {(activity.bookings_count > 0 || activity.views_count > 0) && (
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.5 }}>
          {activity.bookings_count > 0 && (
            <Chip
              icon={<ConfirmationNumber sx={{ fontSize: 14, color: 'white !important' }} />}
              label={`${activity.bookings_count} booked`}
              size="small"
              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', height: 26, backdropFilter: 'blur(4px)' }}
            />
          )}
          {activity.views_count > 0 && (
            <Chip
              icon={<Visibility sx={{ fontSize: 14, color: 'white !important' }} />}
              label={`${activity.views_count} views`}
              size="small"
              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.7rem', height: 26, backdropFilter: 'blur(4px)' }}
            />
          )}
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, width: 34, height: 34 }}
        >
          {isFavorite ? <Favorite sx={{ color: '#e74c3c', fontSize: 18 }} /> : <FavoriteBorder sx={{ color: '#333', fontSize: 18 }} />}
        </IconButton>
        <IconButton
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, width: 34, height: 34 }}
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({ title: activity.name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share sx={{ color: '#333', fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  </Box>
);

const ImageGallery = ({ allImages, activityName, onImageClick }) => {
  if (!allImages?.length) return null;

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <SectionTitle>Gallery ({allImages.length})</SectionTitle>
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)'
            }
          }}
        >
          {allImages.map((img, index) => (
            <Box
              key={index}
              onClick={() => onImageClick(index)}
              sx={{
                height: 140,
                borderRadius: 1.5,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  border: '2px solid #87003A',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(135,0,58,0.2)'
                }
              }}
            >
              <img
                src={img}
                alt={`${activityName} ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.src = DEFAULT_ACTIVITY_IMAGE; }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const PriceSidebar = ({ activity, calendarSelectedDate, navigate }) => (
  <Box sx={{ position: 'sticky', top: 16 }}>
    <Card sx={{ borderRadius: 2, mb: 2, boxShadow: '0 2px 12px rgba(87,0,21,0.12)', border: '1px solid #87003A', overflow: 'hidden' }}>
      {/* Popular banner */}
      {activity.bookings_count > 5 && (
        <Box sx={{ bgcolor: '#87003A', color: 'white', py: 0.5, px: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp sx={{ fontSize: 14 }} />
          <Typography variant="caption" fontWeight={600}>Popular - {activity.bookings_count} people booked this</Typography>
        </Box>
      )}
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <PriceDisplay
            basePrice={activity.base_price}
            pricePerPerson={activity.price_per_person || activity.discounted_price}
            variant="h4"
            showIcon={false}
          />
          <Typography variant="body2" color="text.secondary">/ person</Typography>
        </Box>

        {activity.discounted_price && activity.discounted_price !== parseFloat(activity.base_price) && (
          <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 1, p: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`-${((1 - activity.discounted_price / activity.base_price) * 100).toFixed(0)}%`}
              size="small"
              sx={{ bgcolor: '#27ae60', color: 'white', fontWeight: 700 }}
            />
            <Typography variant="caption" color="#2e7d32" fontWeight={500}>
              You save {(activity.base_price - activity.discounted_price).toFixed(0)}₾ per person
            </Typography>
          </Box>
        )}

        {/* Group price hint */}
        {activity.min_people > 1 && activity.discounted_price && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Group of {activity.min_people}: from {(activity.discounted_price * activity.min_people).toFixed(0)}₾ total
          </Typography>
        )}

        <Divider sx={{ mb: 1.5 }} />

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/payment', {
            state: {
              bookingData: {
                activity: {
                  id: activity.id,
                  name: activity.name,
                  image: activity.image,
                  base_price: parseFloat(activity.base_price || 0),
                  discounted_price: parseFloat(activity.discounted_price || 0),
                  duration: activity.duration,
                  location: activity.location,
                  description: activity.description,
                  min_people: activity.min_people,
                  max_people: activity.max_people
                },
                bookingDetails: { name: '', phone: '', date: calendarSelectedDate || '', time: '', participants: 1 }
              }
            }
          })}
          sx={{
            borderRadius: 2, py: 1.2,
            backgroundColor: '#87003A', fontWeight: 700, fontSize: '1rem', textTransform: 'none',
            boxShadow: '0 3px 10px rgba(87,0,21,0.3)',
            '&:hover': { backgroundColor: '#3d000f', transform: 'translateY(-1px)' },
            transition: 'all 0.2s'
          }}
        >
          Book Now
        </Button>

        {calendarSelectedDate && (
          <Box sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: 'rgba(87,0,21,0.05)', border: '1px solid rgba(87,0,21,0.15)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 14, color: '#87003A' }} />
            <Typography variant="caption" color="#87003A" fontWeight={600}>{calendarSelectedDate}</Typography>
          </Box>
        )}

        <Stack direction="row" spacing={1} mt={1.5}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<Phone sx={{ fontSize: 16 }} />}
            href={`tel:${WHATSAPP_NUMBER}`}
            sx={{
              borderRadius: 2, py: 0.8,
              borderColor: '#87003A', color: '#87003A', fontWeight: 600, textTransform: 'none',
              '&:hover': { borderColor: '#3d000f', bgcolor: 'rgba(135,0,58,0.04)' }
            }}
          >
            Call
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<WhatsApp sx={{ fontSize: 16 }} />}
            href={WHATSAPP_LINK}
            target="_blank"
            sx={{
              borderRadius: 2, py: 0.8,
              borderColor: '#25D366', color: '#25D366', fontWeight: 600, textTransform: 'none',
              '&:hover': { borderColor: '#128C7E', bgcolor: 'rgba(37,211,102,0.04)' }
            }}
          >
            WhatsApp
          </Button>
        </Stack>
      </CardContent>
    </Card>

    {/* Quick Info */}
    <Card sx={{ borderRadius: 2, mb: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1}>Quick Info</Typography>
        <Stack spacing={1}>
          {[
            { icon: <LocationOn sx={{ fontSize: 16, color: '#2196f3' }} />, label: activity.city },
            { icon: <AccessTime sx={{ fontSize: 16, color: '#9c27b0' }} />, label: activity.duration },
            ...(activity.min_people && activity.max_people
              ? [{ icon: <Group sx={{ fontSize: 16, color: '#4caf50' }} />, label: `${activity.min_people}-${activity.max_people} persons` }]
              : []),
            ...(activity.difficulty
              ? [{ icon: <TrendingUp sx={{ fontSize: 16, color: '#e67e22' }} />, label: activity.difficulty }]
              : []),
          ].map((item, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              {item.icon}
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
            </Box>
          ))}
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={activity.rating} precision={0.5} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">{activity.rating}/5</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>

    {/* Address with copy */}
    {activity.address && (
      <Card sx={{ borderRadius: 2, mb: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Address</Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="flex-start" gap={1} flex={1}>
              <LocationOn sx={{ fontSize: 16, color: '#e74c3c', mt: 0.3 }} />
              <Typography variant="body2" color="text.secondary">{activity.address}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => navigator.clipboard.writeText(activity.address)}
              sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: '#87003A' } }}
            >
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    )}

    {/* Tags */}
    {activity.tags?.length > 0 && (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>Tags</Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {activity.tags.map((tag, i) => (
              <Chip
                key={i}
                icon={<LocalOffer sx={{ fontSize: 14 }} />}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ borderColor: '#87003A', color: '#87003A', fontSize: '0.75rem', height: 26 }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);

const MapSection = ({ activity }) => {
  if (!activity.coordinates) return null;

  return (
    <Container maxWidth="lg">
      <Box mt={3}>
        <Fade in timeout={800}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', py: 1.5, px: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>Location</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_CONFIG.API_KEY} libraries={GOOGLE_MAPS_CONFIG.LIBRARIES}>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '6px' }}
                  center={activity.coordinates}
                  zoom={15}
                  options={{
                    ...GOOGLE_MAPS_CONFIG.MAP_OPTIONS,
                    mapTypeId: 'hybrid',
                    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
                  }}
                >
                  <Marker position={activity.coordinates} title={activity.name} animation={window.google?.maps?.Animation?.DROP} />
                  <InfoWindow position={activity.coordinates}>
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="caption" fontWeight="bold">{activity.name}</Typography>
                      <br />
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<LocationOn sx={{ fontSize: 14 }} />}
                        sx={{ bgcolor: '#87003A', '&:hover': { bgcolor: '#3d000f' }, mt: 0.5, fontSize: '0.7rem', py: 0.3 }}
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activity.coordinates.lat},${activity.coordinates.lng}`, '_blank')}
                      >
                        Get Route
                      </Button>
                    </Box>
                  </InfoWindow>
                </GoogleMap>
              </LoadScript>
            </Box>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
};

const ImageLightbox = ({ open, onClose, images, selectedIndex, onIndexChange, activityName }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', color: 'white' } }}>
    <DialogContent sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
        <CloseIcon />
      </IconButton>
      {selectedIndex > 0 && (
        <IconButton onClick={() => onIndexChange(selectedIndex - 1)} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
          <NavigateBeforeIcon />
        </IconButton>
      )}
      {selectedIndex < images.length - 1 && (
        <IconButton onClick={() => onIndexChange(selectedIndex + 1)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'white', bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' } }}>
          <NavigateNextIcon />
        </IconButton>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 2 }}>
        <img src={images[selectedIndex]} alt={`${activityName} ${selectedIndex + 1}`} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} onError={(e) => { e.target.src = DEFAULT_ACTIVITY_IMAGE; }} />
      </Box>
      <Box sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', bgcolor: 'rgba(0,0,0,0.5)', px: 1.5, py: 0.5, borderRadius: 1 }}>
        <Typography variant="caption" color="white">{selectedIndex + 1} / {images.length}</Typography>
      </Box>
    </DialogContent>
  </Dialog>
);

const WhatsAppContact = () => (
  <Card sx={{ mb: 2, borderRadius: 2, bgcolor: '#e8f5e9', border: '1px solid #2e7d32', boxShadow: '0 2px 10px rgba(46,125,50,0.1)' }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <WhatsApp sx={{ color: '#25D366', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} color="#1b5e20">
              write for assistnce contact on whatsapp
            </Typography>
          </Box>
          <Typography variant="body2" color="#2e7d32">
            Have questions? Message us directly for 24/7 support and quick booking assistance.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<WhatsApp />}
            href={WHATSAPP_LINK}
            target="_blank"
            sx={{
              bgcolor: '#25D366',
              color: 'white',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              '&:hover': { bgcolor: '#128C7E' },
              textTransform: 'none'
            }}
          >
            Message Now
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// --- Main Component ---

const ActivityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('');

  const { data: activity, loading, error } = useEventDetails(id);

  if (loading) {
    return <FunLoader />;
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Alert severity="error">
          <Typography variant="body1" mb={1}>{error}</Typography>
          <Button size="small" onClick={() => navigate(-1)}>Back</Button>
        </Alert>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Alert severity="warning">
          <Typography variant="body1" mb={1}>Activity not found</Typography>
          <Button size="small" onClick={() => navigate(-1)}>Back</Button>
        </Alert>
      </Box>
    );
  }

  const allImages = extractImages(activity);
  const data = transformActivity(activity, allImages);

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setImageDialogOpen(true);
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: 3 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Grid container spacing={2.5}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <HeroImage
              activity={data}
              allImages={allImages}
              onImageClick={openLightbox}
              isFavorite={isFavorite}
              onToggleFavorite={() => setIsFavorite(!isFavorite)}
            />

            <ImageGallery allImages={allImages} activityName={data.name} onImageClick={openLightbox} />

            {/* Description */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <SectionTitle>Description</SectionTitle>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {data.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Key Details strip */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={1}>
                  {[
                    { icon: <AccessTime sx={{ fontSize: 20, color: '#9c27b0' }} />, label: 'Duration', value: data.duration },
                    { icon: <Group sx={{ fontSize: 20, color: '#4caf50' }} />, label: 'Group Size', value: data.min_people && data.max_people ? `${data.min_people}-${data.max_people}` : 'Flexible' },
                    ...(data.difficulty ? [{ icon: <TrendingUp sx={{ fontSize: 20, color: '#e67e22' }} />, label: 'Difficulty', value: data.difficulty }] : []),
                    { icon: <EventAvailable sx={{ fontSize: 20, color: '#2196f3' }} />, label: 'Bookings', value: data.bookings_count > 0 ? `${data.bookings_count} completed` : 'Available' },
                  ].map((item, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        {item.icon}
                        <Typography variant="caption" display="block" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <SectionTitle>Availability</SectionTitle>
                <EventCalendar eventId={data.id} onDateSelect={(date) => setCalendarSelectedDate(date)} />
              </CardContent>
            </Card>

            {/* Included & Requirements - side by side compact */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: 2, height: '100%', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <SectionTitle color="#27ae60">What's Included</SectionTitle>
                    <Stack spacing={0.5}>
                      {defaultIncluded.map((item, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1}>
                          <CheckCircle sx={{ color: '#27ae60', fontSize: 18 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: 2, height: '100%', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <SectionTitle color="#3498db">Requirements</SectionTitle>
                    <Stack spacing={0.5}>
                      {defaultRequirements.map((item, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1}>
                          <Info sx={{ color: '#3498db', fontSize: 18 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Reviews */}
            <EventReviews eventId={data.id} />

            {/* WhatsApp Contact Section */}
            <WhatsAppContact />
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <PriceSidebar activity={data} calendarSelectedDate={calendarSelectedDate} navigate={navigate} />
          </Grid>
        </Grid>
      </Container>

      <MapSection activity={data} />

      <ImageLightbox
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        images={allImages}
        selectedIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
        activityName={data.name}
      />
    </Box>
  );
};

export default ActivityDetails;
