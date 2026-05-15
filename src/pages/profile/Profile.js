import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  useTheme,
  useMediaQuery,
  alpha,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Tooltip,
} from "@mui/material";
import {
  PhotoCamera,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  MoreVert as MoreIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Email,
  Phone,
  ExpandMore as ExpandMoreIcon,
  DirectionsBoat,
  SportsMotorsports,
  BeachAccess,
  CalendarToday,
  LocationOn,
  Payment,
  Security,
  DarkMode,
  LightMode,
  Favorite,
  FavoriteBorder,
  Share,
  Download,
  Logout,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import QRScanner from "../../components/QRScanner";
import LocationPermission from "../../components/LocationPermission";
import { useLocation } from "../../hooks/useLocation";
import orderApiService from "../../services/orderApi";
import { QRCodeCanvas } from "qrcode.react";

const formatLastLogin = (raw) => {
  if (!raw) return "Never";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);

  const weekDayName = d.toLocaleString(undefined, { weekday: "short" });
  const monthName = d.toLocaleString(undefined, { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${weekDayName}, ${monthName} ${day}, ${year} · ${hour}:${minute}`;
};

const ProfileContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  position: "relative",
  scrollBehavior: "smooth",
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: 16,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  "& h4": {
    marginLeft: theme.spacing(2),
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#87003A",
  "&:hover": {
    backgroundColor: "#3d000f",
  },
  borderRadius: 30,
  padding: theme.spacing(1, 3),
  minWidth: 120,
  textTransform: "none",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { position, getCurrentPosition } = useLocation();
  const [editMode, setEditMode] = useState(false);
  // The backend's CustomerUpdateSerializer only accepts these four — email
  // is set at registration and isn't user-editable here.
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    country: "",
    mobile: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrData, setQRData] = useState("");
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [qrOrder, setQrOrder] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });
  const [preferences, setPreferences] = useState({
    language: "ka",
    theme: "light",
    currency: "GEL",
  });
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      activity: "Yacht Tour",
      image: require("../../assets/movies/1.jpg"),
      price: 150,
      location: "Batumi Port",
    },
    {
      id: 2,
      activity: "Quad Tour",
      image: require("../../assets/movies/2.jpg"),
      price: 200,
      location: "Mountain Region",
    },
  ]);
  // Removed scroll trigger since we're not using Slide animation

  // Mock booking history data
  const bookingHistory = [
    {
      id: 1,
      activity: "Yacht Tour",
      date: "2024-01-15",
      time: "14:00",
      status: "completed",
      price: 150,
      rating: 5,
      image: require("../../assets/movies/1.jpg"),
      location: "Batumi Port",
      participants: 4,
    },
    {
      id: 2,
      activity: "Quad Tour",
      date: "2024-01-10",
      time: "10:00",
      status: "completed",
      price: 200,
      rating: 4,
      image: require("../../assets/movies/2.jpg"),
      location: "Mountain Region",
      participants: 2,
    },
    {
      id: 3,
      activity: "VIP Beach",
      date: "2024-01-20",
      time: "09:00",
      status: "upcoming",
      price: 300,
      rating: null,
      image: require("../../assets/movies/3.jpg"),
      location: "VIP Beach Zone",
      participants: 6,
    },
  ];

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        country: user.country || "",
        mobile: user.mobile || user.phone || "",
      });
      setImagePreview(user.image || "");
    }
  }, [user]);

  // Load order feed and filter for current user. Runs as soon as the user
  // is known so the Statistics panel can show an accurate paid-orders count
  // without having to switch to the Orders tab first.
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) return;
      try {
        setOrdersLoading(true);
        setOrdersError("");
        const feed = await orderApiService.getOrderFeed();
        const list = Array.isArray(feed)
          ? feed
          : Array.isArray(feed?.orders)
            ? feed.orders
            : Array.isArray(feed?.data)
              ? feed.data
              : [];
        // Filter only this user's orders, exclude failed
        const failedStatuses = [
          "failed",
          "cancelled",
          "canceled",
          "rejected",
          "expired",
        ];
        const myOrders = list.filter((o) => {
          const status = (o.status || o.payment_status || "").toLowerCase();
          if (failedStatuses.includes(status)) return false;
          const emails = [
            o.customer_email,
            o.email,
            o.customer?.email,
            o.user?.email,
          ]
            .filter(Boolean)
            .map((e) => (typeof e === "string" ? e.toLowerCase() : e));
          return emails.includes(user.email.toLowerCase());
        });
        setOrders(myOrders);
      } catch (e) {
        setOrdersError(e.message || "Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  // Count of successfully paid orders for this customer (drives the
  // "Orders Made" statistic).
  const paidOrdersCount = orders.filter((o) => {
    const status = (o.status || o.payment_status || "")
      .toString()
      .toLowerCase();
    return status === "paid";
  }).length;

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login even if logout fails
      navigate("/login");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.mobile.trim()
    ) {
      setErrorMessage("First name, last name and phone are required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUser(formData);
      if (!result?.success) {
        setErrorMessage(result?.error || "Failed to update profile");
        return;
      }

      setSuccessMessage("Profile updated successfully");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      country: user.country || "",
      mobile: user.mobile || user.phone || "",
    });
    setEditMode(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleQRScan = (data) => {
    setQRData(data);
    setQRDialogOpen(true);
  };

  const handleCloseQRDialog = () => {
    setQRDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNotificationChange = (setting) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const scrollToProfile = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "upcoming":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "upcoming":
        return "Upcoming";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getActivityIcon = (activity) => {
    if (activity.includes("Yacht") || activity.includes("yacht"))
      return <DirectionsBoat />;
    if (activity.includes("Quad") || activity.includes("quad"))
      return <SportsMotorsports />;
    if (activity.includes("Beach")) return <BeachAccess />;
    return <CalendarToday />;
  };

  const mapOrderToTicket = (order) => {
    const statusRaw = (order.status || "").toString().toLowerCase();
    let status = "pending";
    if (/(paid|approved|confirmed|active)/.test(statusRaw)) status = "active";
    else if (/(completed|used|done)/.test(statusRaw)) status = "used";
    else if (/(cancel)/.test(statusRaw)) status = "cancelled";

    return {
      id: order.order_number || order.number || order.id,
      activity:
        order.event_title || order.title || order.event?.title || "Event",
      description:
        order.event_description ||
        order.description ||
        order.event?.description ||
        "",
      date: order.event_date || order.date || order.event?.date || "",
      time: order.event_time || order.time || order.event?.time || "",
      location: order.location || order.event?.location || "",
      latitude:
        order.latitude ||
        order.lat ||
        order.event?.latitude ||
        order.event?.lat ||
        null,
      longitude:
        order.longitude ||
        order.lng ||
        order.lon ||
        order.event?.longitude ||
        order.event?.lng ||
        order.event?.lon ||
        null,
      price: order.total_price || order.price || order.amount || "",
      peopleCount:
        order.people_count || order.quantity || order.tickets_count || null,
      qr: true,
      status,
      _raw: order,
    };
  };

  const TicketCard = ({ ticket }) => (
    <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {ticket.activity}
            </Typography>
            {ticket.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {ticket.description}
              </Typography>
            )}
            {ticket.location && (
              <Typography variant="body2" color="text.secondary">
                {ticket.location}
              </Typography>
            )}
            {(ticket.date || ticket.time) && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Date: <b>{ticket.date}</b> | Time: <b>{ticket.time}</b>
              </Typography>
            )}
            {ticket.latitude != null && ticket.longitude != null && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Latitude: <b>{ticket.latitude}</b>, Longitude:{" "}
                <b>{ticket.longitude}</b>
              </Typography>
            )}
            {(ticket.price !== "" || ticket.peopleCount != null) && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {ticket.price !== "" && (
                  <>
                    Price: <b>{ticket.price} ₾</b>
                  </>
                )}
                {ticket.price !== "" && ticket.peopleCount != null && " • "}
                {ticket.peopleCount != null && (
                  <>
                    Number of People: <b>{ticket.peopleCount}</b>
                  </>
                )}
              </Typography>
            )}
            <Chip
              label={getStatusText(ticket.status)}
              color={getStatusColor(ticket.status)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4} textAlign={{ xs: "left", md: "right" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "flex-start", md: "flex-end" },
              }}
            >
              {ticket.qr ? (
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                  onClick={() => setQrOrder(ticket._raw)}
                >
                  QR Code
                </Button>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  QR Unavailable
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderBookingHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        My Orders
      </Typography>
      {ordersLoading && (
        <Typography color="text.secondary">Loading...</Typography>
      )}
      {ordersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {ordersError}
        </Alert>
      )}
      {!ordersLoading && !ordersError && orders.length === 0 && (
        <Typography color="text.secondary">No orders found</Typography>
      )}
      <Box sx={{ mt: 2 }}>
        {orders.map((o) => (
          <TicketCard
            key={(
              o.order_number ||
              o.number ||
              o.id ||
              Math.random()
            ).toString()}
            ticket={mapOrderToTicket(o)}
          />
        ))}
      </Box>
      <Dialog
        open={!!qrOrder}
        onClose={() => setQrOrder(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ticket QR Code</DialogTitle>
        <DialogContent
          sx={{ display: "flex", justifyContent: "center", py: 3 }}
        >
          {qrOrder && (
            <QRCodeCanvas
              value={JSON.stringify({
                order_number:
                  qrOrder.order_number || qrOrder.number || qrOrder.id,
                event: {
                  id: qrOrder.event_id || qrOrder.event?.id,
                  title:
                    qrOrder.event_title ||
                    qrOrder.title ||
                    qrOrder.event?.title,
                  date: qrOrder.event_date || qrOrder.event?.date,
                  time: qrOrder.event_time || qrOrder.event?.time,
                  location: qrOrder.location || qrOrder.event?.location,
                },
                customer: {
                  name: user?.name || user?.firstname || user?.lastname,
                  email: user?.email,
                  phone: user?.phone,
                },
                people_count: qrOrder.people_count || qrOrder.quantity,
                price: qrOrder.total_price || qrOrder.price || qrOrder.amount,
              })}
              size={220}
              includeMargin
              level="M"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            <NotificationsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Notifications
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={() => handleNotificationChange("email")}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange("sms")}
                  color="primary"
                />
              }
              label="SMS Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.push}
                  onChange={() => handleNotificationChange("push")}
                  color="primary"
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.marketing}
                  onChange={() => handleNotificationChange("marketing")}
                  color="primary"
                />
              }
              label="Marketing Notifications"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Usage Settings
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Language"
              value={preferences.language}
              onChange={(e) =>
                handlePreferenceChange("language", e.target.value)
              }
              fullWidth
            >
              <MenuItem value="ka">ქართული</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
            </TextField>
            <TextField
              select
              label="Currency"
              value={preferences.currency}
              onChange={(e) =>
                handlePreferenceChange("currency", e.target.value)
              }
              fullWidth
            >
              <MenuItem value="GEL">ლარი (₾)</MenuItem>
              <MenuItem value="USD">დოლარი ($)</MenuItem>
              <MenuItem value="EUR">ევრო (€)</MenuItem>
            </TextField>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LightMode />
              <Switch
                checked={preferences.theme === "dark"}
                onChange={(e) =>
                  handlePreferenceChange(
                    "theme",
                    e.target.checked ? "dark" : "light",
                  )
                }
                color="primary"
              />
              <DarkMode />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            <Security sx={{ mr: 1, verticalAlign: "middle" }} />
            Security
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button variant="outlined" fullWidth>
              Change Password
            </Button>
            <Button variant="outlined" fullWidth>
              Two-Factor Authentication
            </Button>
            <Button variant="outlined" fullWidth>
              Activity History
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderTimeline = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Activity History
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {bookingHistory.map((booking, index) => (
          <Card
            key={booking.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor:
                  getStatusColor(booking.status) === "success"
                    ? "#4caf50"
                    : getStatusColor(booking.status) === "primary"
                      ? "#2196f3"
                      : getStatusColor(booking.status) === "error"
                        ? "#f44336"
                        : "#757575",
                borderRadius: "2px 0 0 2px",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <Avatar
                sx={{
                  bgcolor:
                    getStatusColor(booking.status) === "success"
                      ? "#4caf50"
                      : getStatusColor(booking.status) === "primary"
                        ? "#2196f3"
                        : getStatusColor(booking.status) === "error"
                          ? "#f44336"
                          : "#757575",
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                {getActivityIcon(booking.activity)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="span">
                  {booking.activity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getStatusText(booking.status)} • {booking.date}{" "}
                  {booking.time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.location} • {booking.price} ₾
                </Typography>
              </Box>
            </Box>
            <Chip
              label={getStatusText(booking.status)}
              color={getStatusColor(booking.status)}
              size="small"
              sx={{ ml: 2 }}
            />
          </Card>
        ))}
      </Box>
    </Box>
  );

  return (
    <ProfileContainer>
      <Box sx={{ pt: 8 }}>
        {" "}
        {/* Add top padding to account for fixed header */}
        <ProfilePaper>
          {/* Profile Image and Statistics Section - Stacked Vertically */}
          <Box sx={{ mb: 4 }}>
            {/* Profile Image (display only — backend has no avatar field) */}
            <Box
              sx={{
                textAlign: "center",
                mb: 4,
                position: "relative",
              }}
            >
              <Avatar
                src={imagePreview}
                sx={{
                  width: isMobile ? 150 : 200,
                  height: isMobile ? 150 : 200,
                  mb: 2,
                  mx: "auto",
                }}
              />
            </Box>

            {/* Statistics Section */}
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha("#87003A", 0.05),
              }}
            >
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#ff9800" }}>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Rating" secondary={user.rating || 0} />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#2196f3" }}>
                      <ReceiptIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Orders Made"
                    secondary={
                      ordersLoading && orders.length === 0
                        ? "Loading…"
                        : paidOrdersCount
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#4caf50" }}>
                      <HistoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Last Login"
                    secondary={formatLastLogin(
                      user.last_login || user.lastLogin
                    )}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Main Content Section */}
          <Box sx={{ mt: 4 }}>
            <ProfileHeader>
              <Typography variant="h4" gutterBottom>
                {editMode ? "Edit Profile" : "Profile"}
              </Typography>
            </ProfileHeader>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {user.role}
            </Typography>

            <Box
              sx={{
                borderBottom: 2,
                borderColor: "#87003A",
                mb: 3,
                backgroundColor: alpha("#87003A", 0.05),
                borderRadius: 2,
                p: 1,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="profile tabs"
                sx={{
                  "& .MuiTab-root": {
                    color: "#87003A",
                    fontWeight: "bold",
                    "&.Mui-selected": {
                      color: "#87003A",
                      backgroundColor: "white",
                      borderRadius: 1,
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#87003A",
                    height: 3,
                  },
                }}
              >
                <Tab label="Personal Information" />
                <Tab label="Orders" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <>
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha("#87003A", 0.05),
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First name"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last name"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email || ""}
                      disabled
                      helperText="Email is set at registration and cannot be changed."
                    />

                    <TextField
                      fullWidth
                      label="Phone"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">+995</InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Box>
                </Box>


                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {editMode ? (
                    <>
                      <EditButton
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        Save
                      </EditButton>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <EditButton
                      variant="outlined"
                      sx={{
                        color: "#fff",
                        "&:hover": { backgroundColor: "green" },
                      }}
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </EditButton>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    startIcon={<Logout />}
                    sx={{
                      ml: "auto",
                      borderRadius: 30,
                      textTransform: "none",
                      minWidth: 120,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            )}

            {activeTab === 1 && renderBookingHistory()}
            {activeTab === 3 && renderPreferences()}
            {activeTab === 4 && renderTimeline()}
          </Box>

        </ProfilePaper>
      </Box>


      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          <CheckIcon sx={{ mr: 1 }} />
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
      >
        <Alert
          onClose={() => setErrorMessage("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          <ErrorIcon sx={{ mr: 1 }} />
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Scroll to Top Button */}
      <Tooltip title="Return to Profile" placement="left">
        <IconButton
          onClick={scrollToProfile}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#87003A",
            color: "white",
            "&:hover": {
              backgroundColor: "#3d000f",
            },
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      </Tooltip>
    </ProfileContainer>
  );
};

export default Profile;
