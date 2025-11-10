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
  Select
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
  Movie,
  MusicNote,
  SportsEsports,
  Celebration,
  Restaurant,
  Casino
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PaymentButton from '../../components/PaymentButton';

const entertainmentActivities = [
  {
    id: 1,
    name: 'კინო IMAX ბათუმში',
    city: 'ბათუმი',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
    description: 'IMAX კინოთეატრში ფილმების ყურება. უმაღლესი ხარისხი და გამოცდილება.',
    price: '25₾',
    duration: '2 საათი',
    difficulty: 'მარტივი',
    rating: 4.9,
    reviews: 234,
    category: 'კინო',
    available: true,
    tags: ['IMAX', 'კინო', 'გართობა']
  },
  {
    id: 2,
    name: 'კონცერტი თბილისში',
    city: 'თბილისი',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    description: 'ცოცხალი მუსიკის კონცერტი თბილისში. დაუვიწყარი ემოციები.',
    price: '80₾',
    duration: '3 საათი',
    difficulty: 'მარტივი',
    rating: 4.8,
    reviews: 189,
    category: 'მუსიკა',
    available: true,
    tags: ['კონცერტი', 'მუსიკა', 'ცოცხალი']
  },
  {
    id: 3,
    name: 'სათამაშო ცენტრი ქობულეთში',
    city: 'ქობულეთი',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa1?auto=format&fit=crop&w=400&q=80',
    description: 'სათამაშო ცენტრი ქობულეთში. ოჯახური გართობა და თამაშები.',
    price: '15₾',
    duration: '1 საათი',
    difficulty: 'მარტივი',
    rating: 4.6,
    reviews: 145,
    category: 'თამაშები',
    available: true,
    tags: ['თამაშები', 'ოჯახური', 'გართობა']
  },
  {
    id: 4,
    name: 'ფესტივალი ბათუმში',
    city: 'ბათუმი',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    description: 'ზაფხულის ფესტივალი ბათუმში. მუსიკა, ხელოვნება და გართობა.',
    price: '50₾',
    duration: '6 საათი',
    difficulty: 'მარტივი',
    rating: 4.7,
    reviews: 312,
    category: 'ფესტივალი',
    available: true,
    tags: ['ფესტივალი', 'მუსიკა', 'ხელოვნება']
  },
  {
    id: 5,
    name: 'რესტორანი ქუთაისში',
    city: 'ქუთაისი',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=400&q=80',
    description: 'ტრადიციული ქართული სამზარეულო ქუთაისში. გემოვნება და კულტურა.',
    price: '60₾',
    duration: '2 საათი',
    difficulty: 'მარტივი',
    rating: 4.5,
    reviews: 98,
    category: 'რესტორანი',
    available: true,
    tags: ['რესტორანი', 'სამზარეულო', 'ტრადიცია']
  },
  {
    id: 6,
    name: 'კაზინო ბათუმში',
    city: 'ბათუმი',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa1?auto=format&fit=crop&w=400&q=80',
    description: 'ლუქსური კაზინო ბათუმში. თამაშები და გართობა.',
    price: '100₾',
    duration: '4 საათი',
    difficulty: 'მარტივი',
    rating: 4.4,
    reviews: 167,
    category: 'კაზინო',
    available: true,
    tags: ['კაზინო', 'თამაშები', 'ლუქსი']
  }
];

const cities = ['ყველა', 'ბათუმი', 'თბილისი', 'ქობულეთი', 'ქუთაისი'];
const categories = ['ყველა', 'კინო', 'მუსიკა', 'თამაშები', 'ფესტივალი', 'რესტორანი', 'კაზინო'];

const EntertainmentActivities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ყველა');
  const [selectedCategory, setSelectedCategory] = useState('ყველა');
  const [favorites, setFavorites] = useState([]);

  const filteredActivities = useMemo(() => {
    return entertainmentActivities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'ყველა' || activity.city === selectedCity;
      const matchesCategory = selectedCategory === 'ყველა' || activity.category === selectedCategory;
      
      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [searchTerm, selectedCity, selectedCategory]);

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'კინო':
        return <Movie />;
      case 'მუსიკა':
        return <MusicNote />;
      case 'თამაშები':
        return <SportsEsports />;
      case 'ფესტივალი':
        return <Celebration />;
      case 'რესტორანი':
        return <Restaurant />;
      case 'კაზინო':
        return <Casino />;
      default:
        return <Celebration />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        გართობის აქტივობები
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        აღმოაჩინე საუკეთესო გართობის აქტივობები საქართველოში
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
              <InputLabel>კატეგორია</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="კატეგორია"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Results */}
      <Box mb={3}>
        <Typography variant="h6" color="text.secondary">
          ნაპოვნია {filteredActivities.length} აქტივობა
        </Typography>
      </Box>

      {/* Activities Grid */}
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
                image={activity.image}
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
                  {getCategoryIcon(activity.category)}
                  <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                    {activity.name}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {activity.city}
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
                  <Rating value={activity.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    ({activity.reviews})
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {activity.tags.map(tag => (
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
                      {activity.price}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {activity.duration}
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
                    დეტალები
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredActivities.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          არ არის ნაპოვნი აქტივობები მითითებული კრიტერიუმებით.
        </Alert>
      )}
    </Box>
  );
};

export default EntertainmentActivities; 