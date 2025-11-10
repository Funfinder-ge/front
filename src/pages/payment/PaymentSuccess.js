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
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Receipt,
  Email,
  Phone,
  CalendarToday,
  People,
  Payment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get payment data from location state or URL params
  const paymentData = location.state?.paymentData || {};
  const orderNumber = paymentData.orderNumber || new URLSearchParams(location.search).get('order');
  const transactionId = paymentData.transactionId || new URLSearchParams(location.search).get('transaction_id');
  const amount = paymentData.amount || new URLSearchParams(location.search).get('amount');
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have order number, we could fetch order details here
    if (orderNumber) {
      // You can add API call to fetch order details here
      console.log('Order number:', orderNumber);
    }
  }, [orderNumber]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBooking = () => {
    navigate('/booking-history');
  };

  const handleNewBooking = () => {
    navigate('/water-activities');
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Card sx={{ maxWidth: 600, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Success Header */}
          <Box textAlign="center" mb={4}>
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h4" fontWeight={600} color="success.main" gutterBottom>
              გადახდა წარმატებით დასრულდა!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              თქვენი შეკვეთა მიღებულია და დამუშავების პროცესშია
            </Typography>
          </Box>

          {/* Success Alert */}
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            <Typography variant="body1" fontWeight={500}>
              გადახდა წარმატებით დასრულდა! თქვენი ბილეთები ელ-ფოსტაზე გამოიგზავნება.
            </Typography>
          </Alert>

          {/* Order Details */}
          {orderNumber && (
            <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2} color="primary">
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
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {orderNumber}
                    </Typography>
                  </Grid>
                  
                  {transactionId && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          ტრანზაქციის ID:
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {transactionId}
                      </Typography>
                    </Grid>
                  )}

                  {amount && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Payment sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          თანხა:
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        ₾{amount}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        გადახდის თარიღი:
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date().toLocaleDateString('ka-GE')}
                    </Typography>
                  </Grid>
                </Grid>
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
              label="გადახდილი"
              color="success"
              icon={<CheckCircle />}
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

          {/* Next Steps */}
          <Box mb={3}>
            <Typography variant="h6" fontWeight={600} mb={2} color="primary">
              შემდეგი ნაბიჯები:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                თქვენი ბილეთები ელ-ფოსტაზე გამოიგზავნება
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                შეკვეთის ისტორია შეგიძლიათ ნახოთ პროფილში
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" mb={1}>
                დამატებითი ინფორმაციისთვის დაგვიკავშირდით
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<People />}
                onClick={handleNewBooking}
                sx={{
                  backgroundColor: '#570015',
                  '&:hover': { backgroundColor: '#3d000f' }
                }}
              >
                ახალი ჯავშანი
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSuccess;
