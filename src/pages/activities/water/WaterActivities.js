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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from "@mui/icons-material";
import PriceDisplay from "../../../components/PriceDisplay";
import FunLoader from "../../../components/FunLoader";
import { useNavigate } from "react-router-dom";
import { useEventFeed, useEventDetails } from "../../../hooks/useApi";
import PaymentButton from "../../../components/PaymentButton";
import RecentEventsSlider from "../../../components/RecentEventsSlider";

import { getImageUrl } from "../../../utils/imageUtils";

// These will be populated dynamically from API data
const defaultCities = ["All"];
const defaultCategories = ["All"];
const defaultDifficulties = ['All'];

const WaterActivities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [bookingDialog, setBookingDialog] = useState({
    open: false,
    activity: null,
  });
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    date: "",
    participants: 1,
    time: "",
  });

  // Fetch all events from the event feed API
  const {
    data: allEvents,
    loading: eventsLoading,
    error: eventsError,
  } = useEventFeed();

  // Fetch event details when an activity is selected for booking
  const {
    data: eventDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useEventDetails(bookingDialog.activity?.id);

  // Create dynamic cities and categories from API data
  const cities = useMemo(() => {
    if (!allEvents) return defaultCities;
    const uniqueCities = [
      ...new Set(allEvents.map((event) => event.city?.name).filter(Boolean)),
    ];
    return ["All", ...uniqueCities];
  }, [allEvents]);

  const categories = useMemo(() => {
    if (!allEvents) return defaultCategories;
    const uniqueCategories = [
      ...new Set(
        allEvents.map((event) => event.category?.name).filter(Boolean)
      ),
    ];
    return ["All", ...uniqueCategories];
  }, [allEvents]);

  // Filter events by activity type = 'water'
  const allWaterEvents = useMemo(() => {
    if (!allEvents) return [];

    // Filter events where category.activity is 'water'
    return allEvents.filter((event) => {
      const activityType = event.category?.activity?.toLowerCase();
      return activityType === "water";
    });
  }, [allEvents]);

  const filteredActivities = useMemo(() => {
    return allWaterEvents.filter((activity) => {
      const matchesSearch =
        activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity =
        selectedCity === "All" || activity.city?.name === selectedCity;
      const matchesCategory =
        selectedCategory === "All" ||
        activity.category?.name === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [allWaterEvents, searchTerm, selectedCity, selectedCategory]);

  const handleFavorite = (activityId) => {
    setFavorites((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleActivityClick = (activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleBooking = (activity) => {
    setBookingDialog({ open: true, activity });
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Handle booking submission here
    console.log("Booking submitted:", bookingForm);
    setBookingDialog({ open: false, activity: null });
    setBookingForm({
      name: "",
      phone: "",
      date: "",
      participants: 1,
      time: "",
    });
  };

  return (
    <Box sx={{margin:"65px 0 50px 0px" }}>
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: "100%", overflow: "hidden" }}>
        <RecentEventsSlider />
      </Box>
      <Typography variant="h4" fontWeight={700} mb={3} color="primary">
        All Activities
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Discover the best activities in Georgia
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3 }}>
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
        <>
          <Box mb={3}>
            <Typography variant="h6" color="text.secondary" style={{padding: "10px 30px" }}>
              Found {filteredActivities.length} Event
            </Typography>
          </Box>

          {/* Activities Grid */}
          <Grid container spacing={3}>
            {filteredActivities.map((activity) => (
              <Grid item xs={12} sm={6} md={4} key={activity.id} sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 30px" }}>
                <Card
                  sx={{
                    width: "250px",
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
                      activity.primary_image?.image ||
                        activity.images?.[0]?.image ||
                        activity.image
                    )}
                    alt={activity.name}
                    sx={{ position: "relative" }}
                  />
                  <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                    <Tooltip
                      title={
                        favorites.includes(activity.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(activity.id);
                        }}
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.9)",
                          "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                        }}
                      >
                        {favorites.includes(activity.id) ? (
                          <Favorite sx={{ color: "error.main" }} />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={1} noWrap>
                      {activity.name}
                    </Typography>

                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn
                        sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {activity.city?.name ||
                          activity.location ||
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
                      {activity.description || "Description not available"}
                    </Typography>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Rating
                        value={activity.average_rating || 0}
                        precision={0.1}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" color="text.secondary" ml={1}>
                        ({activity.rating_count || 0})
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      {activity.category && (
                        <Chip
                          label={activity.category.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                      )}
                      {activity.tags &&
                        activity.tags.map((tag) => (
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
                        basePrice={activity.base_price}
                        pricePerPerson={
                          activity.price_per_person || activity.discounted_price
                        }
                        variant="h6"
                      />
                      <Box display="flex" alignItems="center">
                        <AccessTime
                          sx={{
                            fontSize: 16,
                            color: "text.secondary",
                            mr: 0.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {activity.duration || " "}
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
              </Grid>
            ))}
          </Grid>

          {!eventsLoading &&
            !eventsError &&
            filteredActivities.length === 0 && (
              <Alert severity="info" sx={{ mt: 3 }}>
                No activities found matching the specified criteria.
              </Alert>
            )}
        </>
      )}

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialog.open}
        onClose={() => setBookingDialog({ open: false, activity: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Now - {bookingDialog.activity?.name}</DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <FunLoader />
          ) : detailsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load event details: {detailsError}
            </Alert>
          ) : eventDetails ? (
            <Box sx={{ mb: 2 }}>
              <img
                src={getImageUrl(
                  eventDetails.primary_image?.image ||
                    eventDetails.images?.[0]?.image ||
                    eventDetails.image
                )}
                alt={eventDetails.name}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <Typography variant="h6" color="primary" fontWeight={700}>
                {eventDetails.name}
              </Typography>
              {eventDetails.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {eventDetails.description}
                </Typography>
              )}
              {eventDetails.base_price && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Price: <strong>{eventDetails.base_price}₾</strong>
                </Typography>
              )}
              {eventDetails.location && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Location: {eventDetails.location}
                </Typography>
              )}
              {eventDetails.city && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  City: {eventDetails.city.name}
                </Typography>
              )}
            </Box>
          ) : null}

          <Box component="form" onSubmit={handleBookingSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={bookingForm.name}
              onChange={handleBookingChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={bookingForm.phone}
              onChange={handleBookingChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={bookingForm.date}
              onChange={handleBookingChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Time"
              name="time"
              type="time"
              value={bookingForm.time}
              onChange={handleBookingChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Number of Participants"
              name="participants"
              type="number"
              value={bookingForm.participants}
              onChange={handleBookingChange}
              margin="normal"
              inputProps={{ min: 1, max: 10 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBookingDialog({ open: false, activity: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#87003A",
              "&:hover": { backgroundColor: "#3d000f" },
            }}
          >
            Book Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WaterActivities;
