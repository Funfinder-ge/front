import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
  Rating,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  DirectionsBoat,
  SportsMotorsports,
  BeachAccess,
  Phone,
  Email,
  LocationOn,
  WhatsApp,
  Telegram,
  Instagram,
  ExpandMore as ExpandMoreIcon,
  DirectionsRun,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import MainSlider from "../../components/MainSlider";
import FunLoader from "../../components/FunLoader";
import CommonPhrasesDialog from "../../components/CommonPhrasesDialog";
import PartnerCompanySlider from "../../components/PartnerCompanySlider";
import RevealOnScroll from "../../components/RevealOnScroll";
import LocationPermission from "../../components/LocationPermission";
import NearbyActivities from "../../components/NearbyActivities";
import PriceDisplay from "../../components/PriceDisplay";
import FirstTimeGuide from "../../components/FirstTimeGuide";
import { useGuide } from "../../contexts/GuideContext";
import { useLocation } from "../../hooks/useLocation";
import { eventsApi, checkApiHealth, sliderApi } from "../../services/api";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  usePopularEvents,
  useFeaturedEvents,
  useEventFeed,
  useCategoryList,
} from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
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
  Stack,
} from "@mui/material";
import {
  Star,
  ArrowBack,
  CalendarToday,
  Person,
  CheckCircle,
  Warning,
  Info,
  DirectionsCar,
  Speed,
  Security,
  SupportAgent,
  Payment,
  Language,
  WbSunny,
  Emergency,
  Public,
  Hotel,
  Restaurant,
  DirectionsBus,
  FlightTakeoff,
  LocalHospital,
  PhoneInTalk,
  ShoppingBag,
  CameraAlt,
  Wifi,
  AccessTimeFilled,
  LocalDining,
  Museum,
  Terrain,
  PhotoCamera,
  TipsAndUpdates,
  Celebration,
  Train,
  DirectionsWalk,
} from "@mui/icons-material";
import { FaArrowRight } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";

import headerImages from "../../assets/images.jpg";
import { useLanguage } from "../../contexts/LanguageContext";

// Helper function to get full slider image URL
const getSliderImageUrl = (image) => {
  if (!image) return "";

  const imageStr = typeof image === "string" ? image : String(image);

  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    return imageStr;
  }

  if (imageStr.startsWith("/")) {
    return "https://base.funfinder.ge" + imageStr;
  }

  return "https://base.funfinder.ge/uploads/slider_images/" + imageStr;
};

const partnerCompanies = [
  {
    name: "Batumi Port",
    description: "Sea tour operator",
    logo: require("../../assets/partners/1.png"),
  },
  {
    name: "Quad Tours",
    description: "Amazing tour experiences",
    logo: require("../../assets/partners/2.png"),
  },
  {
    name: "VIP Beach",
    description: "Premium services",
    logo: require("../../assets/partners/3.png"),
  },
  {
    name: "Sea Tours",
    description: "Marine adventure",
    logo: require("../../assets/partners/4.png"),
  },
];

// Base URL for images
const IMAGE_BASE_URL = "https://base.funfinder.ge/uploads/service_images/";
const defaultActivityImage =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80";

// Helper function to get full image URL
const getImageUrl = (image) => {
  if (!image) return defaultActivityImage;

  const imageStr = typeof image === "string" ? image : String(image);

  if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
    return imageStr;
  }

  if (imageStr.startsWith("/")) {
    return "https://base.funfinder.ge" + imageStr;
  }

  return IMAGE_BASE_URL + imageStr;
};

// Helper function to format event for ActivityCard
const formatEventForCard = (event) => {
  // Extract times from event sessions or time slots
  const times = [];
  if (event.sessions && Array.isArray(event.sessions)) {
    event.sessions.forEach((session) => {
      if (session.start_time) {
        const time = new Date(session.start_time).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!times.includes(time)) {
          times.push(time);
        }
      }
    });
  } else if (event.time_slots && Array.isArray(event.time_slots)) {
    event.time_slots.forEach((slot) => {
      if (slot.time) {
        const time =
          typeof slot.time === "string"
            ? slot.time
            : new Date(slot.time).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
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
    types.push(`${event.duration_hours} hours`);
  }

  return {
    id: event.id,
    image: getImageUrl(
      event.primary_image?.image || event.images?.[0]?.image || event.image
    ),
    name: event.name || event.title || "Activity",
    times: times.length > 0 ? times : ["09:00", "12:00", "15:00"], // Default times if none available
    types: types.length > 0 ? types : ["Activity"],
    event: event, // Keep full event data for handlers
  };
};

export const Home = () => {
  const navigate = useNavigate();
  const { position, getCurrentPosition } = useLocation();
  const { exchangeRate, loading: rateLoading } = useCurrency();
  const { showGuide, markGuideAsSeen, setShowGuide } = useGuide();
  const { t } = useLanguage();

  // Helper function to translate category names
  const translateCategoryName = (categoryName) => {
    if (!categoryName) return "";
    const normalized = categoryName.toLowerCase().trim();
    
    // Map common category names to translation keys
    if (normalized.includes("parachute")) return t("category.parachute");
    if (normalized.includes("yacht")) return t("category.yacht");
    if (normalized.includes("rafting")) return t("category.rafting");
    if (normalized.includes("seamoto") || normalized.includes("sea moto") || normalized.includes("sea-moto")) return t("category.seaMoto");
    if (normalized.includes("quad") || normalized.includes("quadro")) return t("category.quadTours");
    if (normalized.includes("moto tour") || normalized.includes("mototour")) return t("category.motoTours");
    if (normalized.includes("jeep")) return t("category.jeepTours");
    if (normalized.includes("hiking")) return t("category.hiking");
    if (normalized.includes("bicycle") || normalized.includes("vip car")) return t("category.bicycles");
    if (normalized.includes("zipline")) return t("category.zipline");
    if (normalized.includes("paragliding")) return t("category.paragliding");
    if (normalized.includes("karting")) return t("category.karting");
    if (normalized.includes("airsoft")) return t("category.airsoft");
    if (normalized.includes("buran")) return t("category.buran");
    if (normalized.includes("jetcar")) return t("category.jetcar");
    if (normalized.includes("cutter")) return t("category.cutter");
    if (normalized.includes("hydrocycle")) return t("category.hydrocycle");
    if (normalized.includes("other")) return t("category.other");
    
    // If no translation found, return original name
    return categoryName;
  };
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [sliderSlides, setSliderSlides] = useState([]);
  const [loadingSliders, setLoadingSliders] = useState(true);
  const [phrasesOpen, setPhrasesOpen] = useState(false);

  // Fetch popular and featured events
  const { data: popularEvents, loading: popularLoading } = usePopularEvents();
  const { data: featuredEvents, loading: featuredLoading } =
    useFeaturedEvents();
  const { data: allEvents, loading: allEventsLoading } = useEventFeed();
  const { data: categories, loading: categoriesLoading } = useCategoryList();

  // Memoize categories with events to prevent infinite loops
  const allCategories = React.useMemo(() => {
    if (!categories && !popularEvents) return [];
    
    let categoriesList = [];
    
    if (categories && categories.length > 0) {
      // Use categories from API
      categoriesList = categories.map((category) => {
        // Find first event in this category from popularEvents or allEvents
        const categoryEvent = (popularEvents || allEvents || []).find(
          (event) => event.category?.id === category.id || 
                    event.category?.name?.toLowerCase() === category.name?.toLowerCase()
        );
        
        return {
          id: category.id,
          name: category.name,
          event: categoryEvent || null,
          route: `/category/${category.id}`,
        };
      });
    } else if (popularEvents && popularEvents.length > 0) {
      // Fallback: Get categories from events if API categories not available
      const categoryMap = {};
      popularEvents.forEach((event) => {
        const categoryId = event.category?.id;
        const categoryName = event.category?.name;
        if (categoryId && categoryName && !categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            id: categoryId,
            name: categoryName,
            event: event,
            route: `/category/${categoryId}`,
          };
        }
      });
      categoriesList = Object.values(categoryMap);
    }
    
    return categoriesList;
  }, [categories, popularEvents, allEvents]);

  const handleFavorite = (eventId) => {
    setFavorites((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Transform events for NearbyActivities component
  const nearbyActivitiesList = React.useMemo(() => {
    if (!allEvents || !Array.isArray(allEvents)) return [];

    return allEvents
      .filter((event) => {
        // Only include events that have latitude and longitude
        const lat =
          event.latitude ||
          event.location?.latitude ||
          event.coordinates?.latitude;
        const lng =
          event.longitude ||
          event.location?.longitude ||
          event.coordinates?.longitude;
        return lat && lng && !isNaN(lat) && !isNaN(lng);
      })
      .map((event) => {
        const lat =
          event.latitude ||
          event.location?.latitude ||
          event.coordinates?.latitude;
        const lng =
          event.longitude ||
          event.location?.longitude ||
          event.coordinates?.longitude;

        return {
          id: event.id,
          name: event.name || event.title || "Activity",
          description: event.description || "",
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          rating: event.rating || 0,
          duration: event.duration || "",
          category: event.category?.name || event.category || "",
          address: event.city?.name || event.location || "",
          image: getImageUrl(
            event.primary_image?.image ||
              event.images?.[0]?.image ||
              event.image
          ),
          event: event, // Keep full event data,
        };
      });
  }, [allEvents]);

  // Fetch slider data on component mount
  useEffect(() => {
    const loadSliders = async () => {
      try {
        setLoadingSliders(true);
        console.log("🖼️ Loading sliders...");
        const sliders = await sliderApi.getAll();

        // Transform slider data to match MainSlider component format
        const transformedSliders = sliders.map((slider) => ({
          id: slider.id,
          title: slider.title || "",
          description: slider.description || "",
          image: getSliderImageUrl(slider.image),
          link: slider.link || null,
        }));

        console.log("✅ Loaded sliders:", transformedSliders);
        setSliderSlides(transformedSliders);
      } catch (error) {
        console.error("Error loading sliders:", error);
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
          console.log("📍 Loading nearby events for position:", position);

          // Check API health first
          const isApiHealthy = await checkApiHealth();
          if (!isApiHealthy) {
            console.warn(
              "⚠️ API server is not available, skipping nearby events"
            );
            setNearbyEvents([]);
            return;
          }

          const events = await eventsApi.getNearby(
            position.latitude,
            position.longitude,
            10
          );
          console.log("📅 Loaded nearby events:", events);
          setNearbyEvents(events || []);
        } catch (error) {
          console.error("Error loading nearby events:", error);
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
    navigate("/payment", {
      state: {
        bookingData: {
          activity: {
            id: event.id,
            name: event.name || event.title,
            image: getImageUrl(
              event.primary_image?.image ||
                event.images?.[0]?.image ||
                event.image
            ),
            base_price: event.base_price,
            duration: event.duration,
            location: event.city?.name || event.location,
            description: event.description,
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

  const handleInfo = (event) => {
    // Navigate to event details page
    navigate(`/activity/${event.id}`);
  };

  // Guide steps configuration
  const guideSteps = [
    {
      target: '[data-guide="test-mode-banner"]',
      title: "Test Mode",
      content: "Please note that the site is currently in test mode.",
      position: "bottom",
    },
    {
      target: '[data-guide="header-slider"]',
      title: "Welcome to Funfinder! 🎉",
      content: "Welcome to Funfinder! Your gateway to amazing water and land activities in Georgia. This guide will help you navigate and use our website effectively.",
      position: "bottom",
    },
    {
      target: '[data-guide="register-button"]',
      title: "Step 1: Register - Create Your Account",
      content: "Click the 'Register' button (the purple button) to create a new account. You'll need to provide your name, email, password, country, and mobile number. Having an account allows you to book activities, manage your tickets, and save your favorite activities.",
      position: "right",
    },
    {
      target: '[data-guide="login-button"]',
      title: "Step 2: Login - Sign In to Your Account",
      content: "If you already have an account, click the 'Log in' button (the white button) to sign in. Enter your email and password to access your account and view your booking history.",
      position: "right",
    },
    {
      target: '[data-guide="sidebar-navigation"]',
      title: "Step 3: Navigate Activities",
      content: "Use the sidebar menu to explore activities. You'll find Water Activities (parachute, yacht, rafting, sea moto) and Land Activities (quad tours, moto tours, jeep tours, hiking). Click any category to see available activities and book your adventure!",
      position: "right",
    },
    {
      target: '[data-guide="categories"]',
      title: "Step 4: Browse Activity Categories",
      content: "Here you can see all activity categories at a glance. Click on any category card to explore activities in that category. Each card shows a preview image and category name.",
      position: "bottom",
    },
    {
      target: '[data-guide="featured-activities"]',
      title: "Step 5: View Popular Activities",
      content: "Scroll down to see popular activities organized by category. Each activity card shows the price, duration, and a 'Book Now' button. Click 'Book Now' to reserve your spot, or click the arrow button to see more details about the activity.",
      position: "top",
    },
    {
      target: '[data-guide="currency-toggle"]',
      title: "Step 6: Change Currency",
      content: "You can switch between GEL (Georgian Lari) and USD (US Dollar) to see prices in your preferred currency. Click the currency button in the bottom right corner anytime to toggle between currencies.",
      position: "left",
    },
  ];

  return (
    <Box sx={{ pt: { xs: '56px', sm: '60px' } }}>
      {/* Test Mode Banner */}
      <Box
        data-guide="test-mode-banner"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1500,
          backgroundColor: '#ff9800',
          color: '#fff',
          textAlign: 'center',
          py: 1.5,
          px: 2,
          fontWeight: 700,
          fontSize: { xs: '0.9rem', sm: '1.1rem' },
          letterSpacing: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
          Site is in test mode
        </Typography>
      </Box>

      {/* First Time Guide */}
      <FirstTimeGuide
        open={showGuide}
        onClose={() => markGuideAsSeen()}
        steps={guideSteps}
        onComplete={() => markGuideAsSeen()}
      />
      
      {/* Help Button - Show Guide (positioned near currency toggle) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          zIndex: 999,
        }}
      >
        <Tooltip title="Take a tour of the website">
          <IconButton
            onClick={() => setShowGuide(true)}
            sx={{
              backgroundColor: '#87003A',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 4px 20px rgba(135, 0, 58, 0.3)',
              '&:hover': {
                backgroundColor: '#6a002c',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <TipsAndUpdates sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Who We Are Section - Extremal and VIP Entertainment Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: "100%", overflow: "hidden" }}>
        {popularLoading ? (
          <Box sx={{ width: "100%", mb: 4 }}>
            <Skeleton
              variant="rectangular"
              sx={{
                width: "100%",
                height: { xs: 200, sm: 260, md: 320 },
                borderRadius: 2,
              }}
            />
            <Container maxWidth="lg" sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Grid item xs={3} sm={2} md={1.5} key={index}>
                    <Skeleton
                      variant="rectangular"
                      sx={{ width: "100%", height: 120, borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        ) : allCategories && allCategories.length > 0 ? (
          (() => {
            if (allCategories.length === 0) return null;

            // Get first category image for header background
            const headerImage =
              allCategories[0]?.event?.primary_image?.image ||
              allCategories[0]?.event?.images?.[0]?.image ||
              allCategories[0]?.event?.image ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80";

            return (
              <Box>
                {/* Header Slider Section */}
                <Box
                  data-guide="header-slider"
                  sx={{
                    width: "100%",
                    mb: 4,
                    position: "relative",
                    aspectRatio: "16/9",
                  }}
                >
                  {/* Static Background Image */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${headerImages})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center center",
                      backgroundRepeat: "no-repeat",
                      opacity: 1,
                      zIndex: 0,
                    }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.6)",
                      zIndex: 0,
                    }}
                  />

                  {/* Text Slider - Only titles change */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      zIndex: 1,
                    }}
                  >
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      slidesPerView={1}
                      spaceBetween={0}
                      autoplay={{
                        delay: 8000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      pagination={{ clickable: true }}
                      style={{
                        borderRadius: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* Slide 2: Security Standards */}
                      <SwiperSlide>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: { xs: 2, md: 4 },
                          }}
                        >
                          <Typography
                            variant="h2"
                            component="h2"
                            fontWeight={800}
                            sx={{
                              color: "white",
                              textAlign: "center",
                              mb: 2,
                              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.5rem" },
                              textShadow: "2px 2px 8px rgba(0,0,0,0.9), 0px 0px 20px rgba(0,0,0,0.8)",
                              px: { xs: 2, md: 2 },
                              lineHeight: { xs: 1.3, md: 1.2 },
                              display: "block",
                            }}
                          >
                            {t("home.hero.bestPrices")}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "white",
                              textAlign: "center",
                              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                              textShadow: "2px 2px 6px rgba(0,0,0,0.9), 0px 0px 15px rgba(0,0,0,0.8)",
                              maxWidth: "800px",
                              px: { xs: 2, md: 2 },
                              lineHeight: { xs: 1.4, md: 1.3 },
                              display: "block",
                            }}
                          >
                            {t("home.hero.localPrice")}
                          </Typography>
                        </Box>
                      </SwiperSlide>

                      {/* Slide 1: Extremal and VIP Entertainment */}
                      <SwiperSlide>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h2"
                            component="h2"
                            fontWeight={800}
                            sx={{
                              color: "white",
                              textAlign: "center",
                              mb: 2,
                              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.5rem" },
                              textShadow: "2px 2px 8px rgba(0,0,0,0.9), 0px 0px 20px rgba(0,0,0,0.8)",
                              px: { xs: 2, md: 2 },
                              lineHeight: { xs: 1.3, md: 1.2 },
                              display: "block",
                            }}
                          >
                            {t("home.hero.extremalTitle")}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "white",
                              textAlign: "center",
                              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                              textShadow: "2px 2px 6px rgba(0,0,0,0.9), 0px 0px 15px rgba(0,0,0,0.8)",
                              maxWidth: "800px",
                              px: { xs: 2, md: 2 },
                              lineHeight: { xs: 1.4, md: 1.3 },
                              display: "block",
                            }}
                          >
                            {t("home.hero.extremalSub")}
                          </Typography>
                        </Box>
                      </SwiperSlide>

                      {/* Slide 2: Security Standards */}
                      <SwiperSlide>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: { xs: 2, md: 4 },
                          }}
                        >
                          <Typography
                            variant="h2"
                            component="h2"
                            fontWeight={800}
                            sx={{
                              color: "white",
                              textAlign: "center",
                              mb: 2,
                              fontSize: { xs: "1.25rem", md: "2.5rem" },
                              textShadow: "0px 0px 10px rgba(0,0,0,1)",
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {t("home.hero.securityTitle")}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "white",
                              textAlign: "center",
                              fontSize: { xs: "0.875rem", md: "1.25rem" },
                              textShadow: "0px 0px 10px rgba(0,0,0,1)",
                              maxWidth: "800px",
                              px: { xs: 1, md: 2 },
                            }}
                          >
                            {t("home.hero.securitySub")}
                          </Typography>
                        </Box>
                      </SwiperSlide>
                    </Swiper>
                  </Box>
                </Box>

                {/* All Categories Slider - Clickable */}
                <Container maxWidth="lg">
                  <Box
                    data-guide="categories"
                    sx={{
                      position: "relative",
                      "& .swiper-button-next, & .swiper-button-prev": {
                        color: "#87003A",
                        "&::after": {
                          fontSize: "24px",
                        },
                      },
                      "& .swiper-button-next": {
                        right: "-10px",
                        "@media (max-width: 1200px)": {
                          right: "-5px",
                        },
                      },
                      "& .swiper-button-prev": {
                        left: "-10px",
                        "@media (max-width: 1200px)": {
                          left: "-5px",
                        },
                      },
                    }}
                  >
                    {(() => {
                      // Categories that should be wider like Zipline
                      const wideCategories = [
                        'Jeep Tours', 'jeep tours', 'Jeep tours',
                        'Buran', 'snowmobile',
                        'Jetcar', 'jetcar',
                        'Cutter', 'cutter',
                        'Airsoft', 'airsoft',
                        'Rafting', 'rafting',
                        'Hydrocycle', 'hydrocycle',
                        'Moto Tour', 'moto tour', 'Moto tour', 'mototour',
                        'Karting', 'karting',
                        'Yacht', 'yacht',
                        'Zipline', 'zipline'
                      ];
                      
                      // Check if any categories are wide categories
                      const hasWideCategories = allCategories.some(category =>
                        wideCategories.some(wideCat => 
                          category.name.toLowerCase().includes(wideCat.toLowerCase())
                        )
                      );
                      
                      // Adjust slidesPerView if we have wide categories
                      const getSlidesPerView = (defaultValue) => {
                        if (hasWideCategories) {
                          // Reduce slidesPerView to accommodate wider cards (220px vs ~150px)
                          return Math.max(1, Math.floor(defaultValue * 0.65));
                        }
                        return defaultValue;
                      };
                      
                      return (
                        <Swiper
                          modules={[Navigation, Autoplay]}
                          spaceBetween={15}
                          slidesPerView={8}
                          navigation={{ enabled: true }}
                          autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                          }}
                          breakpoints={{
                            320: {
                              slidesPerView: 3,
                              spaceBetween: 10,
                              navigation: { enabled: false },
                            },
                            600: {
                              slidesPerView: 5,
                              spaceBetween: 15,
                              navigation: { enabled: false },
                            },
                            900: {
                              slidesPerView: 7,
                              spaceBetween: 15,
                              navigation: { enabled: true },
                            },
                            1200: {
                              slidesPerView: 9,
                              spaceBetween: 20,
                              navigation: { enabled: true },
                            },
                          }}
                          style={{
                            paddingBottom: "40px",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                          }}
                        >
                          {allCategories.map((category) => {
                            // Get image from category's event, or use default
                            const imageUrl = category.event 
                              ? getImageUrl(
                                  category.event.primary_image?.image ||
                                  category.event.images?.[0]?.image ||
                                  category.event.image
                                )
                              : defaultActivityImage;
                            
                            const isWideCategory = wideCategories.some(wideCat => 
                              category.name.toLowerCase().includes(wideCat.toLowerCase())
                            );

                      return (
                        <SwiperSlide 
                          key={category.id || category.name}
                          style={{ 
                            width: '100px',
                            flexShrink: 0
                          }}
                        >
                          <Card
                            sx={{
                              position: "relative",
                              height: "150px",
                              width: "100px",
                              borderRadius: 2,
                              overflow: "hidden",
                              cursor: "pointer",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: 6,
                              },
                            }}
                            onClick={() => navigate(category.route)}
                          >
                            <CardMedia
                              component="img"
                              height="100%"
                              image={imageUrl}
                              alt={category.name}
                              sx={{ objectFit: "cover" }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background:
                                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                p: 1.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "white",
                                  fontWeight: 600,
                                  textAlign: "center",
                                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                                  fontSize: { xs: "0.75rem", md: "0.875rem" },
                                }}
                              >
                                {category.name}
                              </Typography>
                            </Box>
                          </Card>
                        </SwiperSlide>
                      );
                          })}
                        </Swiper>
                      );
                    })()}
                  </Box>
                </Container>
              </Box>
            );
          })()
        ) : null}
      </Box>

      <Typography
        variant="h3"
        component="h2"
        gutterBottom
        fontWeight={800}
        sx={{
          mb: 2,
          background: "linear-gradient(135deg, #87003A 0%, #d32f2f 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          textAlign: { xs: "center", md: "left" },
          px: { xs: 2, md: 0 },
          display: "block",
        }}
      >
        {t("home.chooseActivity")}
      </Typography>
      {/* Main Slider */}
      <Box sx={{ mb: { xs: 2, sm: 4 }, width: "100%", overflow: "hidden" }}>
        {loadingSliders ? (
          <FunLoader size={88} label="Loading" />
        ) : sliderSlides.length > 0 ? (
          <MainSlider slides={sliderSlides} />
        ) : null}
      </Box>

      {/* Tourist Features Section */}
      <RevealOnScroll>
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={800}
            sx={{
              mb: 2,
              background: "linear-gradient(135deg, #87003A 0%, #d32f2f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
              textAlign: "center",
              px: { xs: 2, md: 0 },
              display: "block",
            }}
          >
            {t("home.touristEssentials")}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "600px", mx: "auto", fontSize: "1.1rem" }}
          >
            {t("home.touristEssentials.sub")}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 6, justifyContent: "center" }}>
          {/* Currency Converter */}
          <Grid
            item
            xs={6}
            sm={6}
            sx={{ 
              display: "flex", 
              justifyContent: "center"
            }}
          >
            <Card
              sx={{
                width: { xs: "150px", sm: "200px" },
                maxWidth: { xs: "150px", sm: "200px" },
                height: "100%",
                borderRadius: 4,
                background: "#fff",
                boxShadow: "0 4px 20px rgba(135, 0, 58, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(135, 0, 58, 0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "#87003A",
                },
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 12px 40px rgba(135, 0, 58, 0.2)",
                },
                cursor: "pointer",
              }}
              onClick={() => {
                window.open(
                  "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=GEL",
                  "_blank"
                );
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 1.5, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 50, sm: 80 },
                    height: { xs: 50, sm: 80 },
                    borderRadius: "50%",
                    background: "#87003A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: { xs: 1, sm: 2 },
                    boxShadow: "0 4px 15px rgba(135, 0, 58, 0.3)",
                  }}
                >
                  <AttachMoney
                    sx={{
                      fontSize: { xs: 25, sm: 40 },
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#87003A", fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  {t("home.card.currency.title")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{
                    color: "#87003A",
                    mb: 1,
                    fontSize: { xs: "0.75rem", sm: "1.5rem" },
                  }}
                >
                  {rateLoading
                    ? "Loading..."
                    : `1 USD ≈ ${exchangeRate.toFixed(2)} GEL`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {t("home.card.currency.subtitle")}
                </Typography>
                <Chip
                  label={t("home.card.currency.cta")}
                  sx={{
                    mt: "auto",
                    background: "#87003A",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    height: { xs: 24, sm: 32 },
                    "&:hover": {
                      background: "#a0004a",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Weather Info */}
          <Grid
            item
            xs={6}
            sm={6}
            sx={{ 
              display: "flex", 
              justifyContent: "center"
            }}
          >
            <Card
              sx={{
                width: { xs: "150px", sm: "200px" },
                maxWidth: { xs: "150px", sm: "200px" },
                height: "100%",
                borderRadius: 4,
                background: "#fff",
                boxShadow: "0 4px 20px rgba(135, 0, 58, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(135, 0, 58, 0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "#87003A",
                },
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 12px 40px rgba(135, 0, 58, 0.2)",
                },
                cursor: "pointer",
              }}
              onClick={() => {
                window.open(
                  "https://www.accuweather.com/en/ge/batumi/13/weather-forecast/13",
                  "_blank"
                );
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 1.5, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 50, sm: 80 },
                    height: { xs: 50, sm: 80 },
                    borderRadius: "50%",
                    background: "#87003A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: { xs: 1, sm: 2 },
                    boxShadow: "0 4px 15px rgba(135, 0, 58, 0.3)",
                  }}
                >
                  <WbSunny
                    sx={{
                      fontSize: { xs: 25, sm: 40 },
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#87003A", fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  {t("home.card.weather.title")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {t("home.card.weather.subtitle")}
                </Typography>
                <Chip
                  label={t("home.card.weather.cta")}
                  sx={{
                    mt: "auto",
                    background: "#87003A",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    height: { xs: 24, sm: 32 },
                    "&:hover": {
                      background: "#a0004a",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Language Guide */}
          <Grid
            item
            xs={6}
            sm={6}
            sx={{ 
              display: "flex", 
              justifyContent: "center"
            }}
          >
            <Card
              sx={{
                width: { xs: "150px", sm: "200px" },
                maxWidth: { xs: "150px", sm: "200px" },
                height: "100%",
                borderRadius: 4,
                background: "#fff",
                boxShadow: "0 4px 20px rgba(135, 0, 58, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(135, 0, 58, 0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "#87003A",
                },
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 12px 40px rgba(135, 0, 58, 0.2)",
                },
                cursor: "pointer",
              }}
              onClick={() => setPhrasesOpen(true)}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 1.5, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 50, sm: 80 },
                    height: { xs: 50, sm: 80 },
                    borderRadius: "50%",
                    background: "#87003A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: { xs: 1, sm: 2 },
                    boxShadow: "0 4px 15px rgba(135, 0, 58, 0.3)",
                  }}
                >
                  <Language
                    sx={{
                      fontSize: { xs: 25, sm: 40 },
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#87003A", fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  {t("home.card.language.title")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {t("home.card.language.subtitle")}
                </Typography>
                <Chip
                  label={t("home.card.language.cta")}
                  sx={{
                    mt: "auto",
                    background: "#87003A",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    height: { xs: 24, sm: 32 },
                    "&:hover": {
                      background: "#a0004a",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Contacts */}
          <Grid
            item
            xs={6}
            sm={6}
            sx={{ 
              display: "flex", 
              justifyContent: "center"
            }}
          >
            <Card
              sx={{
                width: { xs: "150px", sm: "200px" },
                maxWidth: { xs: "150px", sm: "200px" },
                height: "100%",
                borderRadius: 4,
                background: "#fff",
                boxShadow: "0 4px 20px rgba(135, 0, 58, 0.1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(135, 0, 58, 0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "#87003A",
                },
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 12px 40px rgba(135, 0, 58, 0.2)",
                },
                cursor: "pointer",
              }}
              onClick={() => {
                window.open("tel:112");
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  p: { xs: 1.5, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 50, sm: 80 },
                    height: { xs: 50, sm: 80 },
                    borderRadius: "50%",
                    background: "#87003A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: { xs: 1, sm: 2 },
                    boxShadow: "0 4px 15px rgba(135, 0, 58, 0.3)",
                  }}
                >
                  <Emergency
                    sx={{
                      fontSize: { xs: 25, sm: 40 },
                      color: "#fff",
                    }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: "#87003A", fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  {t("home.card.emergency.title")}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: "#87003A", mb: 1, fontSize: { xs: "1rem", sm: "1.5rem" } }}
                >
                  {t("home.card.emergency.number")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {t("home.card.emergency.subtitle")}
                </Typography>
                <Chip
                  label={t("home.card.emergency.cta")}
                  sx={{
                    mt: "auto",
                    background: "#87003A",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: { xs: "0.65rem", sm: "0.875rem" },
                    height: { xs: 24, sm: 32 },
                    "&:hover": {
                      background: "#a0004a",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      </RevealOnScroll>

      <CommonPhrasesDialog open={phrasesOpen} onClose={() => setPhrasesOpen(false)} />

      {/* Popular Activities */}
      <RevealOnScroll delay={80}>
      <Container maxWidth="lg" sx={{ mb: 6 }} data-guide="featured-activities">
        {popularLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: 3                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: "400px", height: 200 }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={60}
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        sx={{ flex: 1, borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        sx={{ width: 60, borderRadius: 2 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : popularEvents && popularEvents.length > 0 ? (
          (() => {
            // Helper function to get effective price for sorting
            const getEffectivePrice = (event) => {
              const price = event.price_per_person || event.discounted_price || event.base_price || 0;
              return parseFloat(price) || 0;
            };

            // Group activities by category
            const categoriesMap = {};
            popularEvents.forEach((event) => {
              const categoryName =
                event.category?.name || event.category_name || "Other";
              if (!categoriesMap[categoryName]) {
                categoriesMap[categoryName] = [];
              }
              categoriesMap[categoryName].push(event);
            });

            // Get unique categories, sort activities by price, and limit to first 5 activities per category
            const categories = Object.keys(categoriesMap).map(
              (categoryName) => {
                // Sort activities by price (ascending - from less to more)
                const sortedActivities = [...categoriesMap[categoryName]].sort((a, b) => {
                  return getEffectivePrice(a) - getEffectivePrice(b);
                });
                return {
                  name: categoryName,
                  activities: sortedActivities.slice(0, 5),
                };
              }
            );

            // Sort categories: Land activities first, then water activities
            const isLandActivity = (categoryName) => {
              if (!categoryName) return false;
              const normalizedName = categoryName.toLowerCase().trim();
              return (
                normalizedName.includes("quad") ||
                normalizedName.includes("quadro") ||
                normalizedName.includes("moto tour") ||
                normalizedName.includes("mototour") ||
                normalizedName.includes("jeep") ||
                normalizedName.includes("hiking") ||
                normalizedName.includes("vip car") ||
                normalizedName.includes("bicycle")
              );
            };

            categories.sort((a, b) => {
              const aIsLand = isLandActivity(a.name);
              const bIsLand = isLandActivity(b.name);
              if (aIsLand && !bIsLand) return -1; // Land activities first
              if (!aIsLand && bIsLand) return 1;  // Water activities after
              return 0; // Keep original order within same group
            });

            // Function to map category names to routes (case-insensitive)
            const getCategoryRoute = (categoryName) => {
              if (!categoryName) return "/water-activities";

              const normalizedName = categoryName.toLowerCase().trim();

              // Water activities
              if (normalizedName.includes("parachute")) return "/parachute";
              if (normalizedName.includes("yacht")) return "/yacht";
              if (normalizedName.includes("rafting")) return "/rafting";
              if (
                normalizedName.includes("seamoto") ||
                normalizedName.includes("sea moto") ||
                normalizedName.includes("sea-moto")
              )
                return "/sea-moto";
              if (normalizedName.includes("other"))
                return "/sea-other";

              // Land activities
              if (
                normalizedName.includes("quad") ||
                normalizedName.includes("quadro")
              )
                return "/quad-tours";
              if (
                normalizedName.includes("moto tour") ||
                normalizedName.includes("mototour")
              )
                return "/moto-tours";
              if (normalizedName.includes("jeep")) return "/jeep-tours";
              if (normalizedName.includes("hiking")) return "/hiking";
              if (
                normalizedName.includes("vip car") ||
                normalizedName.includes("bicycle")
              )
                return "/bicycles";

              // Default fallback
              return "/water-activities";
            };

            // Function to determine if category is land or water activity
            const getCategoryGroupRoute = (categoryName) => {
              if (!categoryName) return "/water-activities";

              const normalizedName = categoryName.toLowerCase().trim();

              // Check for water activities
              if (
                normalizedName.includes("parachute") ||
                normalizedName.includes("yacht") ||
                normalizedName.includes("rafting") ||
                normalizedName.includes("seamoto") ||
                normalizedName.includes("sea moto") ||
                normalizedName.includes("sea-moto") ||
                normalizedName.includes("other") ||
                normalizedName.includes("other")
              ) {
                return "/water-activities";
              }

              // Check for land activities
              if (
                normalizedName.includes("quad") ||
                normalizedName.includes("quadro") ||
                normalizedName.includes("moto tour") ||
                normalizedName.includes("mototour") ||
                normalizedName.includes("jeep") ||
                normalizedName.includes("hiking") ||
                normalizedName.includes("vip car") ||
                normalizedName.includes("bicycle")
              ) {
                return "/land-activities";
              }

              // Default fallback
              return "/water-activities";
            };

            return (
              <>
                {categories.map((category) => {
                  const isLand = isLandActivity(category.name);
                  const isParagliding = category.name.toLowerCase().includes('paragliding');
                  
                  // Categories that should have wider cards (like Zipline)
                  const wideCardCategories = [
                    'Jeep Tours', 'jeep tours', 'Jeep tours',
                    'Buran', 'buran',
                    'Jetcar', 'jetcar',
                    'Cutter', 'cutter',
                    'Airsoft', 'airsoft',
                    'Rafting', 'rafting',
                    'Hydrocycle', 'hydrocycle',
                    'Moto Tour', 'moto tour', 'Moto tour', 'mototour',
                    'Karting', 'karting',
                    'Yacht', 'yacht',
                    'Zipline', 'zipline'
                  ];
                  
                  const hasWideCards = wideCardCategories.some(wideCat => 
                    category.name.toLowerCase().includes(wideCat.toLowerCase())
                  );
                  
                  // Adjust slidesPerView for wider cards (show fewer cards = wider cards)
                  const getSlidesPerView = (defaultValue) => {
                    if (hasWideCards) {
                      // Show fewer cards to make them wider
                      return Math.max(1, Math.floor(defaultValue * 0.7));
                    }
                    return defaultValue;
                  };
                  
                  return (
                    <Box key={category.name} sx={{ mb: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: isLand ? "center" : "space-between",
                          alignItems: "center",
                          mb: 3,
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="h2"
                          fontWeight={700}
                          sx={{ 
                            color: "#87003A",
                            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                            px: { xs: 1, md: 0 },
                            textAlign: isLand ? "center" : "left",
                            width: isLand ? "100%" : "auto",
                          }}
                        >
                          {translateCategoryName(category.name)}
                        </Typography>
                        {!isLand && (
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(getCategoryGroupRoute(category.name))
                            }
                            sx={{
                              color: "#87003A",
                              fontWeight: 600,
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "rgba(135, 0, 58, 0.04)",
                              },
                            }}
                          >
                            See More →
                          </Button>
                        )}
                        {isLand && (
                          <Button
                            variant="text"
                            onClick={() =>
                              navigate(getCategoryGroupRoute(category.name))
                            }
                            sx={{
                              color: "#87003A",
                              fontWeight: 600,
                              textTransform: "none",
                              position: "absolute",
                              right: 0,
                              "&:hover": {
                                backgroundColor: "rgba(135, 0, 58, 0.04)",
                              },
                            }}
                          >
                            See More →
                          </Button>
                        )}
                      </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: isLand ? "center" : "flex-start",
                        width: "100%",
                      }}
                    >
                    <Swiper
                      modules={[Navigation, Autoplay]}
                      spaceBetween={20}
                      slidesPerView={1.15}
                      centeredSlides={category.activities.length > 4}
                      loop={category.activities.length > 4}
                      navigation={{
                        enabled: true,
                      }}
                      autoplay={category.activities.length > 4 ? {
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      } : false}
                      breakpoints={{
                        320: {
                          slidesPerView: Math.min(1.15, category.activities.length),
                          centeredSlides: category.activities.length > 1,
                          navigation: {
                            enabled: false,
                          },
                        },
                        600: {
                          slidesPerView: Math.min(2.15, category.activities.length),
                          centeredSlides: category.activities.length > 2,
                          navigation: {
                            enabled: false,
                          },
                        },
                        900: {
                          slidesPerView: Math.min(3, category.activities.length),
                          centeredSlides: false,
                          navigation: {
                            enabled: true,
                          },
                        },
                        1200: {
                          slidesPerView: Math.min(4, category.activities.length),
                          centeredSlides: false,
                          navigation: {
                            enabled: true,
                          },
                        },
                      }}
                      style={{
                        paddingBottom: "40px",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        ...(isLand ? {
                          maxWidth: "1200px",
                          margin: "0 auto",
                        } : {}),
                      }}
                    >
                      {category.activities.map((event) => (
                        <SwiperSlide 
                          key={event.id}
                        >
                          <Card
                            onClick={() => handleInfo(event)}
                            sx={{
                              height: "100%",
                              borderRadius: 3,
                              boxShadow: 3,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              display: "flex",
                              flexDirection: "column",
                              cursor: "pointer",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: 6,
                              },
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <CardMedia
                                component="img"
                                height="200"
                                image={getImageUrl(
                                  event.primary_image?.image ||
                                    event.images?.[0]?.image ||
                                    event.image
                                )}
                                alt={event.name || event.title}
                                sx={{ objectFit: "cover" }}
                              />
                            </Box>

                            <CardContent
                              sx={{
                                p: 3,
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Typography
                                variant="h6"
                                fontWeight={600}
                                mb={1}
                                noWrap
                                sx={{
                                  color: "#333",
                                  fontSize: { xs: "1rem", sm: "1.25rem" },
                                }}
                              >
                                {event.name || event.title || t("home.activity")}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                                noWrap
                              >
                                {event.city?.name ||
                                  event.location ||
                                  t("home.locationNotSpecified")}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={2}
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  minHeight: "40px",
                                }}
                              >
                                {event.description || ""}
                              </Typography>

                              <Box display="flex" alignItems="center" mb={2}>
                                <Rating
                                  value={event.rating || 0}
                                  precision={0.1}
                                  size="small"
                                  readOnly
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  ml={1}
                                >
                                  ({event.reviews || 0})
                                </Typography>
                              </Box>

                              <Box
                                display="flex"
                                gap={1}
                                mb={2}
                                flexWrap="wrap"
                              >
                                {event.tags &&
                                  event.tags.slice(0, 2).map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: "0.75rem",
                                        borderColor: "#e0e0e0",
                                      }}
                                    />
                                  ))}
                              </Box>

                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={2}
                                flexWrap="wrap"
                                gap={1}
                              >
                                <PriceDisplay
                                  basePrice={event.base_price}
                                  pricePerPerson={
                                    event.price_per_person ||
                                    event.discounted_price
                                  }
                                  variant="h6"
                                />
                                {event.duration && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {event.duration}
                                  </Typography>
                                )}
                              </Box>

                              <Box display="flex" gap={1} mt="auto">
                                <Button
                                  variant="contained"
                                  fullWidth
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReserve(event);
                                  }}
                                  sx={{
                                    borderRadius: 2,
                                    backgroundColor: "#87003A",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    py: 1.2,
                                    "&:hover": { backgroundColor: "#3d000f" },
                                  }}
                                >
                                  {t("home.bookNow")}
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInfo(event);
                                  }}
                                  sx={{
                                    borderRadius: 2,
                                    borderColor: "#87003A",
                                    color: "#87003A",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    py: 1.2,
                                    minWidth: "48px",
                                    "&:hover": {
                                      borderColor: "#87003A",
                                      backgroundColor: "rgba(135, 0, 58, 0.04)",
                                    },
                                  }}
                                >
                                  →
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    </Box>
                    </Box>
                  );
                })}
              </>
            );
          })()
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t("home.popular.notFound")}
            </Typography>
          </Box>
        )}
      </Container>
      </RevealOnScroll>

      {/* Featured Activities */}
      <RevealOnScroll delay={80}>
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          fontWeight={700}
          sx={{ mb: 4 }}
        >
          {t("home.featured.title")}
        </Typography>
        {featuredLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: 3,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: "100%", height: 200 }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="60%" height={26} />
                    <Skeleton variant="text" width="40%" height={18} />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={50}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={40}
                      sx={{ mt: 2, borderRadius: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {featuredEvents && featuredEvents.length > 0 ? (
              // Sort featured events by price (ascending - from less to more)
              [...featuredEvents]
                .sort((a, b) => {
                  const getEffectivePrice = (event) => {
                    const price = event.price_per_person || event.discounted_price || event.base_price || 0;
                    return parseFloat(price) || 0;
                  };
                  return getEffectivePrice(a) - getEffectivePrice(b);
                })
                .slice(0, 3)
                .map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Card
                    onClick={() => handleInfo(event)}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: 3,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(
                          event.primary_image?.image ||
                            event.images?.[0]?.image ||
                            event.image
                        )}
                        alt={event.name || event.title}
                      />
                      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                        <Tooltip
                          title={
                            favorites.includes(event.id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(event.id);
                            }}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.9)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            {favorites.includes(event.id) ? (
                              <Favorite sx={{ color: "error.main" }} />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DirectionsRun sx={{ color: "primary.main" }} />
                        <Typography variant="h6" fontWeight={600} ml={1} noWrap>
                          {event.name || event.title || "Activity"}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn
                          sx={{
                            fontSize: 16,
                            color: "text.secondary",
                            mr: 0.5,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.city?.name ||
                            event.location ||
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
                        {event.description || ""}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Rating
                          value={event.rating || 0}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          ml={1}
                        >
                          ({event.reviews || 0})
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {event.category && (
                          <Chip
                            label={event.category.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                        {event.tags &&
                          event.tags.map((tag) => (
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
                          basePrice={event.base_price}
                          pricePerPerson={
                            event.price_per_person || event.discounted_price
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
                            {event.duration || " "}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReserve(event);
                          }}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: "#87003A",
                            "&:hover": { backgroundColor: "#3d000f" },
                          }}
                        >
                          {t("home.bookNow")}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInfo(event);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          <FaArrowRight /> &nbsp;
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                >
                  {t("home.featured.notFound")}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      </RevealOnScroll>

      {/* About Section */}
      <RevealOnScroll delay={60}>
      <Paper sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Paper sx={{ p: 4, mb: 6, bgcolor: "#f8f9fa" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            fontWeight={700}
            color="#87003A"
            sx={{ mb: 3 }}
          >
            {t("home.about.title")}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                {t("home.about.quote")}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                {t("home.about.p1")}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                {t("home.about.p2")}
              </Typography>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "rgba(135, 0, 58, 0.05)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    fontWeight: 600,
                    color: "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  {t("home.about.missionTitle")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    color: "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  {t("home.about.missionText")}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  mt: 2,
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                {t("home.about.p3")}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  fontWeight: 600,
                  color: "#87003A",
                  fontStyle: "italic",
                }}
              >
                {t("home.about.final")}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
      </RevealOnScroll>

      {/* Contact Section */}
      <RevealOnScroll delay={60}>
      <Paper sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            fontWeight={700}
            sx={{ mb: 4 }}
          >
            {t("home.contacts.title")}
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {t("home.contacts.phone")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <Phone
                      sx={{ fontSize: 24, verticalAlign: "middle", mr: 1 }}
                    />
                    +995 593 76 27 27
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    <WhatsApp
                      sx={{ fontSize: 24, verticalAlign: "middle", mr: 1 }}
                    />
                    +995 571 92 50 05
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {t("home.contacts.email")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <Email
                      sx={{ fontSize: 24, verticalAlign: "middle", mr: 1 }}
                    />
                    info@funfinder.ge
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {t("home.contacts.address")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <LocationOn
                      sx={{ fontSize: 24, verticalAlign: "middle", mr: 1 }}
                    />
                    {t("home.contacts.addressText")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Paper>
      </RevealOnScroll>

      {/* Testimonials Section */}
      <Paper sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            fontWeight={700}
            sx={{ mb: 4 }}
          >
            {t("home.testimonials.title")}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#87003A">
                {t("home.testimonials.review1.name")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "{t("home.testimonials.review1.text")}"
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#87003A">
                {t("home.testimonials.review2.name")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "{t("home.testimonials.review2.text")}"
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="#87003A">
                {t("home.testimonials.review3.name")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                "{t("home.testimonials.review3.text")}"
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Paper>

      {/* FAQ Section */}
      <Paper sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            fontWeight={700}
            sx={{ mb: 4 }}
          >
            {t("home.faq.title")}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("home.faq.q1")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {t("home.faq.a1")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t("home.faq.q2")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {t("home.faq.a2")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t("home.faq.q3")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {t("home.faq.a3")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {t("home.faq.q4")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {t("home.faq.a4")}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Paper>

    </Box>
  );
};
