import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../../components/QRScanner';
import LocationPermission from '../../components/LocationPermission';
import TaxiOrder from '../../components/TaxiOrder';
import QuickTaxiButton from '../../components/QuickTaxiButton';
import { useLocation } from '../../hooks/useLocation';
import orderApiService from '../../services/orderApi';
import { QRCodeCanvas } from 'qrcode.react';
import LocalTaxi from '@mui/icons-material/LocalTaxi';

const ProfileContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  scrollBehavior: 'smooth',
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: 16,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  '& h4': {
    marginLeft: theme.spacing(2),
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#570015',
  '&:hover': {
    backgroundColor: '#3d000f',
  },
  borderRadius: 30,
  padding: theme.spacing(1, 3),
  minWidth: 120,
  textTransform: 'none',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout, updateUser, updateImage } = useAuth();
  const { position, getCurrentPosition } = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrData, setQRData] = useState('');
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [qrOrder, setQrOrder] = useState(null);
  const [taxiOpen, setTaxiOpen] = useState(false);
  const [taxiTo, setTaxiTo] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });
  const [preferences, setPreferences] = useState({
    language: 'ka',
    theme: 'light',
    currency: 'GEL'
  });
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      activity: 'იახტით გასეირნება',
      image: require('../../assets/movies/1.jpg'),
      price: 150,
      location: 'ბათუმის პორტი'
    },
    {
      id: 2,
      activity: 'კვადრო ტური',
      image: require('../../assets/movies/2.jpg'),
      price: 200,
      location: 'მთიანი რეგიონი'
    }
  ]);
  // Removed scroll trigger since we're not using Slide animation

  // Mock booking history data
  const bookingHistory = [
    {
      id: 1,
      activity: 'იახტით გასეირნება',
      date: '2024-01-15',
      time: '14:00',
      status: 'completed',
      price: 150,
      rating: 5,
      image: require('../../assets/movies/1.jpg'),
      location: 'ბათუმის პორტი',
      participants: 4
    },
    {
      id: 2,
      activity: 'კვადრო ტური',
      date: '2024-01-10',
      time: '10:00',
      status: 'completed',
      price: 200,
      rating: 4,
      image: require('../../assets/movies/2.jpg'),
      location: 'მთიანი რეგიონი',
      participants: 2
    },
    {
      id: 3,
      activity: 'VIP Beach',
      date: '2024-01-20',
      time: '09:00',
      status: 'upcoming',
      price: 300,
      rating: null,
      image: require('../../assets/movies/3.jpg'),
      location: 'VIP Beach ზონა',
      participants: 6
    }
  ];

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.firstname || user.lastname || '',
        email: user.email || '',
        phone: user.phone || user.mobile || ''
      });
      setImagePreview(user.image || '');
    }
  }, [user]);

  // Load order feed and filter for current user when Orders tab is active
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email || activeTab !== 1) return;
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const feed = await orderApiService.getOrderFeed();
        const list = Array.isArray(feed)
          ? feed
          : Array.isArray(feed?.orders)
            ? feed.orders
            : Array.isArray(feed?.data)
              ? feed.data
              : [];
        // Filter only this user's orders
        const myOrders = list.filter((o) => {
          const emails = [o.customer_email, o.email, o.customer?.email, o.user?.email]
            .filter(Boolean)
            .map((e) => (typeof e === 'string' ? e.toLowerCase() : e));
          return emails.includes(user.email.toLowerCase());
        });
        setOrders(myOrders);
      } catch (e) {
        setOrdersError(e.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა');
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [activeTab, user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('გთხოვთ, შეავსეთ ყველა ველი');
      return;
    }

    setIsLoading(true);
    updateUser(formData);
    if (imageFile) {
      updateImage(imagePreview);
    }
    
    setSuccessMessage('პროფილი წარმატებით განახლდა');
    setEditMode(false);
    setIsLoading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    setImagePreview(user.image);
    setImageFile(null);
    setEditMode(false);
  };

  const handleAvatarClick = () => {
    setAvatarDialogOpen(true);
  };

  const handleCloseAvatarDialog = () => {
    setAvatarDialogOpen(false);
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
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const scrollToProfile = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'upcoming': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'დასრულებული';
      case 'upcoming': return 'მომავალი';
      case 'cancelled': return 'გაუქმებული';
      default: return 'უცნობი';
    }
  };

  const getActivityIcon = (activity) => {
    if (activity.includes('იახტ')) return <DirectionsBoat />;
    if (activity.includes('კვადრო')) return <SportsMotorsports />;
    if (activity.includes('Beach')) return <BeachAccess />;
    return <CalendarToday />;
  };

  const mapOrderToTicket = (order) => {
    const statusRaw = (order.status || '').toString().toLowerCase();
    let status = 'pending';
    if (/(paid|approved|confirmed|active)/.test(statusRaw)) status = 'active';
    else if (/(completed|used|done)/.test(statusRaw)) status = 'used';
    else if (/(cancel)/.test(statusRaw)) status = 'cancelled';

    return {
      id: order.order_number || order.number || order.id,
      activity: order.event_title || order.title || order.event?.title || 'ივენთი',
      description: order.event_description || order.description || order.event?.description || '',
      date: order.event_date || order.date || order.event?.date || '',
      time: order.event_time || order.time || order.event?.time || '',
      location: order.location || order.event?.location || '',
      latitude: order.latitude || order.lat || order.event?.latitude || order.event?.lat || null,
      longitude: order.longitude || order.lng || order.lon || order.event?.longitude || order.event?.lng || order.event?.lon || null,
      price: order.total_price || order.price || order.amount || '',
      peopleCount: order.people_count || order.quantity || order.tickets_count || null,
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
                თარიღი: <b>{ticket.date}</b> | დრო: <b>{ticket.time}</b>
              </Typography>
            )}
            {(ticket.latitude != null && ticket.longitude != null) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                განედი: <b>{ticket.latitude}</b>, გრძედი: <b>{ticket.longitude}</b>
              </Typography>
            )}
            {(ticket.price !== '' || ticket.peopleCount != null) && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {ticket.price !== '' && (<>
                  ფასი: <b>{ticket.price} ₾</b>
                </>)}
                {(ticket.price !== '' && ticket.peopleCount != null) && ' • '}
                {ticket.peopleCount != null && (<>
                  პირების რაოდენობა: <b>{ticket.peopleCount}</b>
                </>)}
              </Typography>
            )}
            <Chip
              label={getStatusText(ticket.status)}
              color={getStatusColor(ticket.status)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              {ticket.qr ? (
                <Button variant="contained" color="secondary" sx={{ borderRadius: 2 }} onClick={() => setQrOrder(ticket._raw)}>
                  QR კოდი
                </Button>
              ) : (
                <Typography variant="caption" color="text.disabled">QR მიუწვდომელია</Typography>
              )}
              {(ticket.latitude != null && ticket.longitude != null) && (
                <Button
                  variant="outlined"
                  startIcon={<LocalTaxi />}
                  onClick={() => {
                    setTaxiTo({
                      lat: Number(ticket.latitude),
                      lng: Number(ticket.longitude),
                      address: `${ticket.activity} (${ticket.latitude}, ${ticket.longitude})`
                    });
                    setTaxiOpen(true);
                  }}
                >
                  ტაქსის შეკვეთა
                </Button>
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
        ჩემი შეკვეთები
      </Typography>
      {ordersLoading && (
        <Typography color="text.secondary">იტვირთება...</Typography>
      )}
      {ordersError && (
        <Alert severity="error" sx={{ mb: 2 }}>{ordersError}</Alert>
      )}
      {!ordersLoading && !ordersError && orders.length === 0 && (
        <Typography color="text.secondary">შეკვეთები ვერ მოიძებნა</Typography>
      )}
      <Box sx={{ mt: 2 }}>
        {orders.map((o) => (
          <TicketCard key={(o.order_number || o.number || o.id || Math.random()).toString()} ticket={mapOrderToTicket(o)} />
        ))}
      </Box>
      <Dialog open={!!qrOrder} onClose={() => setQrOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle>ბილეთის QR კოდი</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          {qrOrder && (
            <QRCodeCanvas
              value={JSON.stringify({
                order_number: qrOrder.order_number || qrOrder.number || qrOrder.id,
                event: {
                  id: qrOrder.event_id || qrOrder.event?.id,
                  title: qrOrder.event_title || qrOrder.title || qrOrder.event?.title,
                  date: qrOrder.event_date || qrOrder.event?.date,
                  time: qrOrder.event_time || qrOrder.event?.time,
                  location: qrOrder.location || qrOrder.event?.location
                },
                customer: {
                  name: user?.name || user?.firstname || user?.lastname,
                  email: user?.email,
                  phone: user?.phone
                },
                people_count: qrOrder.people_count || qrOrder.quantity,
                price: qrOrder.total_price || qrOrder.price || qrOrder.amount
              })}
              size={220}
              includeMargin
              level="M"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOrder(null)}>დახურვა</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={taxiOpen} onClose={() => setTaxiOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>ტაქსის შეკვეთა</DialogTitle>
        <DialogContent>
          <TaxiOrder 
            initialTo={taxiTo}
            onOrderComplete={() => setTaxiOpen(false)}
            style={{ boxShadow: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaxiOpen(false)}>დახურვა</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        პარამეტრები
      </Typography>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            შეტყობინებები
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  color="primary"
                />
              }
              label="ელ-ფოსტის შეტყობინებები"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                  color="primary"
                />
              }
              label="SMS შეტყობინებები"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  color="primary"
                />
              }
              label="Push შეტყობინებები"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.marketing}
                  onChange={() => handleNotificationChange('marketing')}
                  color="primary"
                />
              }
              label="მარკეტინგული შეტყობინებები"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            გამოყენების პარამეტრები
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="ენა"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              fullWidth
            >
              <MenuItem value="ka">ქართული</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
            </TextField>
            <TextField
              select
              label="ვალუტა"
              value={preferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value)}
              fullWidth
            >
              <MenuItem value="GEL">ლარი (₾)</MenuItem>
              <MenuItem value="USD">დოლარი ($)</MenuItem>
              <MenuItem value="EUR">ევრო (€)</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightMode />
              <Switch
                checked={preferences.theme === 'dark'}
                onChange={(e) => handlePreferenceChange('theme', e.target.checked ? 'dark' : 'light')}
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
            <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
            უსაფრთხოება
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" fullWidth>
              პაროლის შეცვლა
            </Button>
            <Button variant="outlined" fullWidth>
              ორ ფაქტორიანი ავტენტიფიკაცია
            </Button>
            <Button variant="outlined" fullWidth>
              აქტივობის ისტორია
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const renderTimeline = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        აქტივობის ისტორია
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {bookingHistory.map((booking, index) => (
          <Card key={booking.id} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: getStatusColor(booking.status) === 'success' ? '#4caf50' : 
                             getStatusColor(booking.status) === 'primary' ? '#2196f3' : 
                             getStatusColor(booking.status) === 'error' ? '#f44336' : '#757575',
              borderRadius: '2px 0 0 2px'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar sx={{ 
                bgcolor: getStatusColor(booking.status) === 'success' ? '#4caf50' : 
                        getStatusColor(booking.status) === 'primary' ? '#2196f3' : 
                        getStatusColor(booking.status) === 'error' ? '#f44336' : '#757575',
                mr: 2,
                width: 40,
                height: 40
              }}>
                {getActivityIcon(booking.activity)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="span">
                  {booking.activity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getStatusText(booking.status)} • {booking.date} {booking.time}
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

  const renderFavorites = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        ჩემი ფავორიტები
      </Typography>
      {favorites.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ფავორიტები არ არის
          </Typography>
          <Typography variant="body2" color="text.secondary">
            დაამატეთ აქტივობები ფავორიტებში
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((favorite) => (
            <Grid item xs={12} md={6} lg={4} key={favorite.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={favorite.image}
                  alt={favorite.activity}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                  onClick={() => {
                    setFavorites(prev => prev.filter(f => f.id !== favorite.id));
                    setSuccessMessage('ფავორიტებიდან წაშლილია');
                  }}
                >
                  <Favorite sx={{ color: '#e91e63' }} />
                </IconButton>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {favorite.activity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {favorite.location}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {favorite.price} ₾
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" fullWidth>
                    დაჯავშნა
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <ProfileContainer>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 4,
          py: 2,
          borderBottom: `1px solid ${alpha('#570015', 0.1)}`,
        }}
      >
        <Typography variant="h6" color="#570015">
          შესვლა წარმატებულია!
        </Typography>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            backgroundColor: alpha('#570015', 0.1),
            '&:hover': {
              backgroundColor: alpha('#570015', 0.2),
            },
          }}
        >
          <MoreIcon />
        </IconButton>
      </Box>

             <Box sx={{ pt: 8 }}> {/* Add top padding to account for fixed header */}
        <ProfilePaper>
           {/* Profile Image and Statistics Section - Stacked Vertically */}
           <Box sx={{ mb: 4 }}>
             {/* Profile Image Section */}
              <Box 
                sx={{ 
                  textAlign: 'center',
                  mb: 4,
                  position: 'relative',
                  '&:hover': {
                    cursor: 'pointer',
                  }
                }}
                onClick={handleAvatarClick}
              >
                <Avatar
                  src={imagePreview}
                  sx={{
                    width: isMobile ? 150 : 200,
                    height: isMobile ? 150 : 200,
                    mb: 2,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.3s ease',
                    }
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{
                      mt: 2,
                      borderRadius: 30,
                      textTransform: 'none',
                      minWidth: 150,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    სურათის შეცვლა
                  </Button>
                </label>
              </Box>

             {/* Statistics Section */}
             <Box sx={{ p: 3, borderRadius: 2, backgroundColor: alpha('#570015', 0.05) }}>
                <Typography variant="h6" gutterBottom>
                  სტატისტიკა
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                     <Avatar sx={{ bgcolor: '#ff9800' }}>
                       <StarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="რეიტინგი"
                      secondary={user.rating || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                     <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <ReceiptIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="გაკეთებული შეკვეთები"
                      secondary={user.orders || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                     <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <HistoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ბოლო შესვლა"
                      secondary={user.lastLogin || 'არასამართლიანი'}
                    />
                  </ListItem>
                </List>
              </Box>
           </Box>

                       {/* Main Content Section */}
            <Box sx={{ mt: 4 }}>
              <ProfileHeader>
                <Typography variant="h4" gutterBottom>
                  {editMode ? 'პროფილის რედაქტირება' : 'პროფილი'}
                </Typography>
              </ProfileHeader>

              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {user.role}
              </Typography>

               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                 👆 აირჩიეთ ჩანართი ქვემოთ მოცემული ვარიანტებიდან
               </Typography>

                             <Box sx={{ 
                 borderBottom: 2, 
                 borderColor: '#570015', 
                 mb: 3,
                 backgroundColor: alpha('#570015', 0.05),
                 borderRadius: 2,
                 p: 1
               }}>
                 <Tabs 
                   value={activeTab} 
                   onChange={handleTabChange} 
                   aria-label="profile tabs"
                   sx={{
                     '& .MuiTab-root': {
                       color: '#570015',
                       fontWeight: 'bold',
                       '&.Mui-selected': {
                         color: '#570015',
                         backgroundColor: 'white',
                         borderRadius: 1,
                       }
                     },
                     '& .MuiTabs-indicator': {
                       backgroundColor: '#570015',
                       height: 3
                     }
                   }}
                 >
                   <Tab label="პირადი ინფორმაცია" />
                   <Tab label="შეკვეთები" />
                   <Tab label="ფავორიტები" />
                   <Tab label="პარამეტრები" />
                   <Tab label="ისტორია" />
                 </Tabs>
               </Box>

              {activeTab === 0 && (
                <>
                  <Box sx={{ mb: 4, p: 3, borderRadius: 2, backgroundColor: alpha('#570015', 0.05) }}>
                <Typography variant="h6" gutterBottom>
                  პირადი ინფორმაცია
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="სახელი"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: alpha('#570015', 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: '#570015',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#570015',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="ელ-ფოსტა"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: alpha('#570015', 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: '#570015',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#570015',
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="ტელეფონი"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          +995
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: alpha('#570015', 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: '#570015',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#570015',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

                  <Box sx={{ mb: 4, p: 3, borderRadius: 2, backgroundColor: alpha('#570015', 0.05) }}>
                <Typography variant="h6" gutterBottom>
                  საკონტაქტო ინფორმაცია
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<Email />}
                    label={user.email}
                    variant="outlined"
                    sx={{
                      borderRadius: 30,
                      textTransform: 'none',
                      minWidth: 150,
                    }}
                  />
                  <Chip
                    icon={<Phone />}
                    label={user.phone}
                    variant="outlined"
                    sx={{
                      borderRadius: 30,
                      textTransform: 'none',
                      minWidth: 150,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {editMode ? (
                  <>
                    <EditButton
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      შენახვა
                    </EditButton>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      გაუქმება
                    </Button>
                  </>
                ) : (
                  <EditButton
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    რედაქტირება
                  </EditButton>
                )}

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                      startIcon={<Logout />}
                  sx={{
                    ml: 'auto',
                    borderRadius: 30,
                    textTransform: 'none',
                    minWidth: 120,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  გამოსვლა
                </Button>
              </Box>
                </>
              )}

              {activeTab === 1 && renderBookingHistory()}
              {activeTab === 2 && renderFavorites()}
              {activeTab === 3 && renderPreferences()}
              {activeTab === 4 && renderTimeline()}
            </Box>

          {/* Location Permission Section */}


          {/* Taxi Order Section */}
          <Box sx={{ mb: 4, mt: 4, p: 3, borderRadius: 2, backgroundColor: alpha('#570015', 0.05) }}>
            <Typography variant="h6" gutterBottom>
              ტაქსის შეკვეთა
            </Typography>
            <TaxiOrder 
              onOrderComplete={() => {
                setSuccessMessage('ტაქსის შეკვეთა წარმატებით გაგზავნილია');
              }}
            />
          </Box>

          <Box sx={{ mb: 4, mt: 4, p: 3, borderRadius: 2, backgroundColor: alpha('#570015', 0.05) }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowQRScanner(true)}
              sx={{
                backgroundColor: '#570015',
                '&:hover': {
                  backgroundColor: '#3d000f',
                },
              }}
            >
              QR კოდის სკანირება
            </Button>
            {showQRScanner && <QRScanner onScan={handleQRScan} />}
            <Dialog
              open={qrDialogOpen}
              onClose={handleCloseQRDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>სკანირებული მონაცემები</DialogTitle>
              <DialogContent>
                <Typography>{qrData}</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseQRDialog}>დახურვა</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </ProfilePaper>
        </Box>

      <Dialog
        open={avatarDialogOpen}
        onClose={handleCloseAvatarDialog}
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            backgroundColor: 'white',
            minWidth: 400,
            maxWidth: 500,
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: 'white',
          borderRadius: 0,
          borderBottom: '1px solid #f0f0f0',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: '#570015',
        }}>
          პროფილის სურათი
        </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'white', p: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center', 
            mb: 3,
            minHeight: '300px'
          }}>
            <Avatar
              src={imagePreview}
              sx={{
                width: 180,
                height: 180,
                mb: 3,
                border: '4px solid #f0f0f0',
                borderRadius: 0,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                display: 'block',
                margin: '0 auto',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
                }
              }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="dialog-profile-image"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="dialog-profile-image">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
                sx={{
                  mt: 3,
                  borderRadius: 30,
                  textTransform: 'none',
                  borderColor: '#570015',
                  color: '#570015',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(109, 33, 79, 0.2)',
                  display: 'block',
                  margin: '0 auto',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(109, 33, 79, 0.3)',
                    borderColor: '#3d000f',
                    backgroundColor: 'rgba(109, 33, 79, 0.05)',
                  },
                }}
              >
                სურათის შეცვლა
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: 'white', 
          borderRadius: 0,
          borderTop: '1px solid #f0f0f0',
          p: 3,
          gap: 2
        }}>
          <Button
            onClick={handleCloseAvatarDialog}
            sx={{
              borderRadius: 30,
              textTransform: 'none',
              borderColor: '#ccc',
              color: '#666',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#999',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            გაუქმება
          </Button>
          <Button
            onClick={() => {
              handleSave();
              handleCloseAvatarDialog();
            }}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 30,
              textTransform: 'none',
              backgroundColor: '#570015',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(109, 33, 79, 0.3)',
              '&:hover': {
                backgroundColor: '#3d000f',
                boxShadow: '0 8px 20px rgba(109, 33, 79, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            შენახვა
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setShowQRScanner(true)}>
          <ListItemIcon>
            <PhotoCamera />
          </ListItemIcon>
          <ListItemText>QR კოდის სკანირება</ListItemText>
        </MenuItem>
                  
         <MenuItem onClick={() => setActiveTab(2)}>
          <ListItemIcon>
             <Favorite />
          </ListItemIcon>
           <ListItemText>ფავორიტები</ListItemText>
        </MenuItem>
         <MenuItem onClick={() => setActiveTab(3)}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>პარამეტრები</ListItemText>
        </MenuItem>
         <Divider />
         <MenuItem onClick={() => setActiveTab(3)}>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText>შეტყობინებები</ListItemText>
        </MenuItem>
         <Divider />
         <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
           <ListItemIcon>
             <Logout sx={{ color: 'error.main' }} />
           </ListItemIcon>
           <ListItemText>გამოსვლა</ListItemText>
         </MenuItem>
      </Menu>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          <CheckIcon sx={{ mr: 1 }} />
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
      >
        <Alert
          onClose={() => setErrorMessage('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          <ErrorIcon sx={{ mr: 1 }} />
          {errorMessage}
        </Alert>
      </Snackbar>

       {/* Scroll to Top Button */}
       <Tooltip title="პროფილზე დაბრუნება" placement="left">
         <IconButton
           onClick={scrollToProfile}
           sx={{
             position: 'fixed',
             bottom: 20,
             right: 20,
             backgroundColor: '#570015',
             color: 'white',
             '&:hover': {
               backgroundColor: '#3d000f',
             },
             zIndex: 1000,
           }}
         >
           <KeyboardArrowUp />
         </IconButton>
       </Tooltip>

       {/* Quick Taxi Button */}
       <QuickTaxiButton position="bottom-right" />
    </ProfileContainer>
  );
};

export default Profile;