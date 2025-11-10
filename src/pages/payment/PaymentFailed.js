import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Error as ErrorIcon,
  Home,
  Refresh,
  Support,
  Payment,
  Receipt,
  Email,
  Phone,
  CalendarToday,
  Warning
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get payment data from location state or URL params
  const paymentData = location.state?.paymentData || {};
  const orderNumber = paymentData.orderNumber || new URLSearchParams(location.search).get('order');
  const errorCode = paymentData.errorCode || new URLSearchParams(location.search).get('error_code');
  const errorMessage = paymentData.errorMessage || new URLSearchParams(location.search).get('error_message');
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have order number, we could fetch order details here
    if (orderNumber) {
      // You can add API call to fetch order details here
      console.log('Failed order number:', orderNumber);
    }
  }, [orderNumber]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    if (orderNumber) {
      navigate('/payment', { 
        state: { 
          bookingData: { 
            orderNumber: orderNumber,
            retryPayment: true 
          } 
        } 
      });
    } else {
      navigate('/water-activities');
    }
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  const handleViewBooking = () => {
    navigate('/booking-history');
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Card sx={{ maxWidth: 600, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Error Header */}
          <Box textAlign="center" mb={4}>
            <ErrorIcon 
              sx={{ 
                fontSize: 80, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h4" fontWeight={600} color="error.main" gutterBottom>
              გადახდა ვერ დასრულდა
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ვწუხვართ, მაგრამ თქვენი გადახდა ვერ დასრულდა
            </Typography>
          </Box>

          {/* Error Alert */}
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            icon={<ErrorIcon />}
          >
            <Typography variant="body1" fontWeight={500}>
              გადახდის პროცესი ვერ დასრულდა. გთხოვთ, სცადოთ თავიდან ან დაგვიკავშირდით მხარდაჭერისთვის.
            </Typography>
          </Alert>

          {/* Order Details */}
          {orderNumber && (
            <Card sx={{ mb: 3, backgroundColor: '#fef2f2' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
                  შეკვეთის დეტალები
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Receipt sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        შეკვეთის ნომერი:
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      {orderNumber}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        შეცდომის თარიღი:
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date().toLocaleDateString('ka-GE')}
                    </Typography>
                  </Grid>

                  {errorCode && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Warning sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          შეცდომის კოდი:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500} color="error.main">
                        {errorCode}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Card sx={{ mb: 3, backgroundColor: '#fef2f2' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
                  შეცდომის დეტალები
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {errorMessage}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Customer Info */}
          {user && (
            <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                  მომხმარებლის ინფორმაცია
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        ელ-ფოსტა:
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {user.email}
                    </Typography>
                  </Grid>
                  
                  {user.mobile && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          ტელეფონი:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {user.mobile}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Status Chip */}
          <Box textAlign="center" mb={3}>
            <Chip
              label="გადახდა ვერ დასრულდა"
              color="error"
              icon={<ErrorIcon />}
              sx={{ 
                fontSize: '1rem',
                height: 40,
                '& .MuiChip-icon': {
                  fontSize: '1.2rem'
                }
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Possible Reasons */}
          <Box mb={3}>
            <Typography variant="h6" fontWeight={600} mb={2} color="primary">
              შესაძლო მიზეზები:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="არასაკმარისი თანხა ანგარიშზე"
                  secondary="შეამოწმეთ თქვენი ბანკის ანგარიშის ბალანსი"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="ბანკის ბარათის ვადის გასვლა"
                  secondary="შეამოწმეთ თქვენი ბარათის ვადა"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="ტექნიკური პრობლემები"
                  secondary="ბანკის სისტემაში შეიძლება იყოს ტექნიკური პრობლემები"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="შეცდომა ბარათის მონაცემებში"
                  secondary="შეამოწმეთ ბარათის ნომერი, CVV და ვადა"
                />
              </ListItem>
            </List>
          </Box>

          {/* Next Steps */}
          <Box mb={3}>
            <Typography variant="h6" fontWeight={600} mb={2} color="primary">
              რა უნდა გააკეთოთ:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                სცადეთ გადახდა თავიდან
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                შეამოწმეთ თქვენი ბანკის ანგარიშის ბალანსი
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                დაგვიკავშირდით მხარდაჭერისთვის
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ 
                  borderColor: '#570015',
                  color: '#570015',
                  '&:hover': { 
                    borderColor: '#3d000f',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                მთავარი
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Receipt />}
                onClick={handleViewBooking}
                sx={{ 
                  borderColor: '#570015',
                  color: '#570015',
                  '&:hover': { 
                    borderColor: '#3d000f',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                შეკვეთები
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetryPayment}
                sx={{
                  backgroundColor: '#570015',
                  '&:hover': { backgroundColor: '#3d000f' }
                }}
              >
                თავიდან
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Support />}
                onClick={handleContactSupport}
                sx={{ 
                  borderColor: '#570015',
                  color: '#570015',
                  '&:hover': { 
                    borderColor: '#3d000f',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                მხარდაჭერა
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentFailed;
