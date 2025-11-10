import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  Person,
  AttachMoney,
  CheckCircle,
  Pending,
  Cancel,
  Refresh,
  Search,
  FilterList,
  Visibility,
  Download,
  Email,
  Phone,
  Event as EventIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import orderApiService from '../../services/orderApi';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  // Status options
  const statusOptions = [
    { value: 'all', label: 'ყველა' },
    { value: 'pending', label: 'მოლოდინში' },
    { value: 'paid', label: 'გადახდილი' },
    { value: 'cancelled', label: 'გაუქმებული' },
    { value: 'refunded', label: 'დაბრუნებული' }
  ];

  // Status colors and icons
  const getStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return { color: 'success', icon: <CheckCircle />, label: 'გადახდილი' };
      case 'pending':
        return { color: 'warning', icon: <Pending />, label: 'მოლოდინში' };
      case 'cancelled':
        return { color: 'error', icon: <Cancel />, label: 'გაუქმებული' };
      case 'refunded':
        return { color: 'info', icon: <Refresh />, label: 'დაბრუნებული' };
      default:
        return { color: 'default', icon: <Pending />, label: status };
    }
  };

  // Load customer email from localStorage or prompt user
  useEffect(() => {
    const savedEmail = localStorage.getItem('customerEmail');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
    } else {
      // Prompt user for email to view their orders
      const email = prompt('გთხოვთ, შეიყვანოთ თქვენი ელ-ფოსტა შეკვეთების სანახავად:');
      if (email) {
        setCustomerEmail(email);
        localStorage.setItem('customerEmail', email);
      }
    }
  }, []);

  // Load orders when email is available
  useEffect(() => {
    if (customerEmail) {
      loadOrders();
    }
  }, [customerEmail]);

  // Load orders
  const loadOrders = async () => {
    if (!customerEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApiService.getOrderHistory(customerEmail);
      setOrders(response.orders || response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  // Load order details
  const loadOrderDetails = async (orderId) => {
    try {
      const orderDetails = await orderApiService.getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      setError(error.message || 'Failed to load order details');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.event?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Change customer email
  const handleEmailChange = () => {
    const newEmail = prompt('შეიყვანეთ ახალი ელ-ფოსტა:');
    if (newEmail) {
      setCustomerEmail(newEmail);
      localStorage.setItem('customerEmail', newEmail);
      setOrders([]);
      loadOrders();
    }
  };

  const renderOrderCard = (order) => {
    const statusInfo = getStatusInfo(order.status);
    
    return (
      <Card key={order.id} sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={600} sx={{ mr: 2 }}>
                  შეკვეთა #{order.order_number || order.id}
                </Typography>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                />
              </Box>
              
              <List dense>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ღონისძიება" 
                    secondary={`ID: ${order.event}`}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CalendarToday fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="თარიღი" 
                    secondary={new Date(order.event_date).toLocaleDateString('ka-GE')}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="მონაწილეები" 
                    secondary={order.people_count}
                  />
                </ListItem>
                <ListItem sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AttachMoney fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ჯამი" 
                    secondary={`${order.total_amount || 0}₾`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => loadOrderDetails(order.id)}
                  fullWidth
                >
                  დეტალები
                </Button>
                {order.status === 'paid' && (
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={() => {
                      // Generate receipt or redirect to receipt page
                      console.log('Generate receipt for order:', order.id);
                    }}
                    fullWidth
                  >
                    ქვითარი
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const statusInfo = getStatusInfo(selectedOrder.status);

    return (
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          შეკვეთის დეტალები - #{selectedOrder.order_number || selectedOrder.id}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                მომხმარებლის ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText 
                    primary="სახელი" 
                    secondary={selectedOrder.customer_name} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText 
                    primary="ელ-ფოსტა" 
                    secondary={selectedOrder.customer_email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Phone /></ListItemIcon>
                  <ListItemText 
                    primary="ტელეფონი" 
                    secondary={selectedOrder.customer_phone} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationOn /></ListItemIcon>
                  <ListItemText 
                    primary="ქვეყანა" 
                    secondary={selectedOrder.customer_country} 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                შეკვეთის ინფორმაცია
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><EventIcon /></ListItemIcon>
                  <ListItemText 
                    primary="ღონისძიების ID" 
                    secondary={selectedOrder.event} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarToday /></ListItemIcon>
                  <ListItemText 
                    primary="ღონისძიების თარიღი" 
                    secondary={new Date(selectedOrder.event_date).toLocaleDateString('ka-GE')} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText 
                    primary="მონაწილეთა რაოდენობა" 
                    secondary={selectedOrder.people_count} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AttachMoney /></ListItemIcon>
                  <ListItemText 
                    primary="ჯამი" 
                    secondary={`${selectedOrder.total_amount || 0}₾`} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              variant="outlined"
            />
            <Chip
              label={`შექმნილი: ${new Date(selectedOrder.created_at).toLocaleDateString('ka-GE')}`}
              variant="outlined"
            />
            {selectedOrder.updated_at && (
              <Chip
                label={`განახლებული: ${new Date(selectedOrder.updated_at).toLocaleDateString('ka-GE')}`}
                variant="outlined"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            დახურვა
          </Button>
          {selectedOrder.status === 'paid' && (
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={() => {
                // Generate receipt
                console.log('Generate receipt for order:', selectedOrder.id);
              }}
            >
              ქვითარი
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  if (!customerEmail) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} color="primary" mb={3}>
          შეკვეთების ისტორია
        </Typography>
        <Alert severity="info">
          გთხოვთ, შეიყვანოთ თქვენი ელ-ფოსტა შეკვეთების სანახავად.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary">
          შეკვეთების ისტორია
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleEmailChange}
          >
            ელ-ფოსტის შეცვლა
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadOrders}
            disabled={loading}
          >
            განახლება
          </Button>
        </Box>
      </Box>

      {/* Customer Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            მომხმარებელი: {customerEmail}
          </Typography>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="ძებნა შეკვეთის ნომრით..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>სტატუსი</InputLabel>
                <Select
                  value={statusFilter}
                  label="სტატუსი"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Orders List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" mb={2}>
                შეკვეთები არ მოიძებნა
              </Typography>
              <Typography variant="body2" color="text.secondary">
                თქვენ არ გაქვთ შეკვეთები ან ფილტრები ძალიან შეზღუდულია
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredOrders.map(renderOrderCard)}
        </Box>
      )}

      {/* Order Details Dialog */}
      {renderOrderDetails()}
    </Box>
  );
};

export default BookingHistory;