import React, { useState, useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
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
  Group,
} from "@mui/icons-material";
import PriceDisplay from "../../../components/PriceDisplay";
import FunLoader from "../../../components/FunLoader";
import { useNavigate } from "react-router-dom";
import { useEventFeed } from "../../../hooks/useApi";
import RecentEventsSlider from "../../../components/RecentEventsSlider";
import FirstTimeGuide from "../../../components/FirstTimeGuide";
import { useGuide } from "../../../contexts/GuideContext";

import { getImageUrl } from "../../../utils/imageUtils";

// These will be populated dynamically from API data
const defaultCities = ["All"];
const defaultCategories = ["All"];
const defaultDifficulties = ['All'];

const QuadTours = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: allEvents, loading: eventsLoading, error: eventsError } = useEventFeed();
  const { showGuide, markGuideAsSeen, setShowGuide } = useGuide();

  const categories = useMemo(() => {
    if (!allEvents) return defaultCategories;
    const uniqueCategories = [
      ...new Set(
        allEvents.map((event) => event.category?.name).filter(Boolean)
      ),
    ];
    return ["All", ...uniqueCategories];
  }, [allEvents]);
  // Fetch all events from the event feed API


  // Create dynamic cities and difficulties from API data
  const cities = useMemo(() => {
    if (!allEvents) return defaultCities;
    const uniqueCities = [
      ...new Set(allEvents.map((event) => event.city?.name).filter(Boolean)),
    ];
    return ["All", ...uniqueCities];
  }, [allEvents]);

  const difficulties = useMemo(() => {
    if (!allEvents) return defaultDifficulties;
    const uniqueDifficulties = [
      ...new Set(allEvents.map((event) => event.difficulty).filter(Boolean)),
    ];
    return ["All", ...uniqueDifficulties];
  }, [allEvents]);

  const filteredTours = useMemo(() => {
    if (!allEvents) return [];

    return allEvents.filter((tour) => {
      // Filter for hiking category only
      const isHikingActivity =
        tour.category.name ==="Jeep tours";

      if (!isHikingActivity) return false;

      const matchesSearch =
        tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity =
        selectedCity === "All" || tour.city?.name === selectedCity;
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        tour.difficulty === selectedDifficulty;

      return matchesSearch && matchesCity && matchesDifficulty;
    });
  }, [allEvents, searchTerm, selectedCity, selectedDifficulty]);

  const handleFavorite = (tourId) => {
    setFavorites((prev) =>
      prev.includes(tourId)
        ? prev.filter((id) => id !== tourId)
        : [...prev, tourId]
    );
  };

  const handleBooking = (tour) => {
    // Navigate to payment page with booking data
    navigate("/payment", {
      state: {
        bookingData: {
          activity: {
            id: tour.id,
            name: tour.name,
            image: getImageUrl(
              tour.primary_image?.image || tour.images?.[0]?.image || tour.image
            ),
            base_price: tour.base_price,
            duration: tour.duration,
            location: tour.city?.name || tour.location,
            description: tour.description,
          },
          bookingDetails: {
            name: "",
            phone: "",
            date: "",
            time: "",
            participants: 1,
          },
        },
      },
    });
  };

  // Guide steps configuration
  const guideSteps = [
    {
      target: '[data-guide="jeep-tours-slider"]',
      title: "Explore Jeep Tours 🚙",
      content: "Browse through featured Jeep Tours at the top. These are popular and recommended tours you can book right away.",
      position: "bottom",
    },
    {
      target: '[data-guide="jeep-tours-filters"]',
      title: "Filter Your Search",
      content: "Use the search bar to find specific tours by name or description. Filter by city or category to narrow down your options and find the perfect Jeep Tour for you.",
      position: "bottom",
    },
    {
      target: '[data-guide="jeep-tours-results"]',
      title: "View Available Tours",
      content: "Here you'll see all available Jeep Tours matching your filters. Each card shows the tour name, location, price, duration, and rating. Click 'Book Now' to reserve your spot or 'More' to see detailed information.",
      position: "top",
    },
  ];

  return (
    <Box sx={{ margin: "65px 0 50px 0px" }}>
      {/* First Time Guide */}
      <FirstTimeGuide
        open={showGuide}
        onClose={() => markGuideAsSeen()}
        steps={guideSteps}
        onComplete={() => markGuideAsSeen()}
      />
      
      <box sx={{ margin: "0 0 0 20px" }}>
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: "100%", overflow: "hidden" }} data-guide="jeep-tours-slider">
        <RecentEventsSlider categoryName="Jeep Tours" />
      </Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        Jeep Tours
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}></Typography>


      {/* Filters */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3 }} data-guide="jeep-tours-filters">
        <Typography
          variant="h6"
          fontWeight={600}
          mb={2}
          display="flex"
          alignItems="center"
        >
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
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
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
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
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
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
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
            Found {filteredTours.length} Event{" "}
          </Typography>
        </Box>
      )}
      {/* Tours Grid */}
      {!eventsLoading && !eventsError && (
        <Grid
          container
          spacing={3}
          sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
          data-guide="jeep-tours-results"
        >
          {filteredTours.map((tour) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={tour.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                sx={{
                  width: { xs: "100%", sm: "100%", md: "380px", lg: "380px" },
                  maxWidth: { xs: "100%", md: "380px" },
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={getImageUrl(
                    tour.primary_image?.image || tour.images?.[0]?.image || tour.image
                  )}
                  alt={tour.name}
                  sx={{ position: "relative" }}
                />
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  <Tooltip
                    title={
                      favorites.includes(tour.id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(tour.id);
                      }}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                      }}
                    >
                      {favorites.includes(tour.id) ? (
                        <Favorite sx={{ color: "error.main" }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DirectionsRun sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                      {tour.name}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn
                      sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {tour.city?.name ||
                        tour.location ||
                        "Location not specified"}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {tour.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating
                      value={tour.rating || 4.5}
                      precision={0.1}
                      size="small"
                      readOnly
                    />
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
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                    {tour.tags &&
                      tour.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                      ))}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <PriceDisplay
                      basePrice={tour.base_price}
                      pricePerPerson={
                        tour.price_per_person || tour.discounted_price
                      }
                      variant="h6"
                    />
                    <Box display="flex" alignItems="center">
                      <AccessTime
                        sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {tour.duration || " "}
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
                        backgroundColor: "#87003A",
                        "&:hover": { backgroundColor: "#3d000f" },
                      }}
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/activity/${tour.id}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      More
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
          No Event Found
        </Alert>
      )}

</box>
    </Box>
  );
};

export default QuadTours;
