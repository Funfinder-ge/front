import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Payment } from '@mui/icons-material';
import orderApiService from '../../services/orderApi';
import { eventsApi } from '../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PaymentPage = ({ bookingData: propBookingData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Get bookingData from location state or props
  const bookingData = location.state?.bookingData || propBookingData;
  
  // Debug logging
  console.log('PaymentPage - location.state:', location.state);
  console.log('PaymentPage - bookingData:', bookingData);
  console.log('PaymentPage - bookingData.activity:', bookingData?.activity);
  console.log('PaymentPage - bookingData.activity?.id:', bookingData?.activity?.id);
  
  const [form, setForm] = useState({
    event: bookingData?.activity?.id || '',
    customer_name: bookingData?.bookingDetails?.name || user?.firstname || user?.name || '',
    customer_email: user?.email || '',
    customer_phone: bookingData?.bookingDetails?.phone?.replace(/\D/g, '') || user?.mobile || '',
    customer_country: user?.country || 'geo',
    people_count: bookingData?.bookingDetails?.participants || 1,
    event_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Always set to next day (tomorrow)
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);

  // Fetch event details when event ID changes or component mounts
  useEffect(() => {
    console.log('useEffect - form.event:', form.event);
    console.log('useEffect - bookingData?.activity?.id:', bookingData?.activity?.id);
    
    const fetchEventDetails = async () => {
      if (form.event && form.event !== '') {
        console.log('Fetching event details for ID:', form.event);
        setEventLoading(true);
        try {
          const details = await eventsApi.getDetails(form.event);
          console.log('Event details fetched:', details);
          setEventDetails(details);
        } catch (error) {
          console.error('Error fetching event details:', error);
          setEventDetails(null);
        } finally {
          setEventLoading(false);
        }
      } else {
        console.log('No event ID found, setting eventDetails to null');
        setEventDetails(null);
      }
    };

    fetchEventDetails();
  }, [form.event, bookingData?.activity?.id]);

  // Update form when bookingData changes
  useEffect(() => {
    if (bookingData?.activity?.id && bookingData.activity.id !== form.event) {
      console.log('Updating form.event from bookingData:', bookingData.activity.id);
      setForm(prev => ({
        ...prev,
        event: bookingData.activity.id
      }));
    }
  }, [bookingData?.activity?.id, form.event]);

  // Also fetch event details on component mount if event ID is already set
  useEffect(() => {
    if (bookingData?.activity?.id && !eventDetails && !eventLoading) {
      console.log('Fetching initial event details for:', bookingData.activity.id);
      const fetchInitialEventDetails = async () => {
        setEventLoading(true);
        try {
          const details = await eventsApi.getDetails(bookingData.activity.id);
          console.log('Initial event details fetched:', details);
          setEventDetails(details);
        } catch (error) {
          console.error('Error fetching initial event details:', error);
          setEventDetails(null);
        } finally {
          setEventLoading(false);
        }
      };
      fetchInitialEventDetails();
    }
  }, [bookingData?.activity?.id, eventDetails, eventLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInitiation = async () => {
    if (!orderNumber) {
      setError('Order number not found. Please try creating the order again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Manually initiating payment for order:', orderNumber);
      const paymentResponse = await orderApiService.initiatePayment(orderNumber);
      console.log("initiatePayment response:", paymentResponse);
      console.log('Payment response keys:', Object.keys(paymentResponse || {}));
      console.log('Payment URL check:', paymentResponse?.payment_url);
      console.log('Full response structure:', JSON.stringify(paymentResponse, null, 2));

      if (paymentResponse?.payment_url) {
        console.log('Redirecting to payment URL:', paymentResponse.payment_url);
        window.location.href = paymentResponse.payment_url;
      } else {
        console.log('No payment URL found in response:', paymentResponse);
        console.log('Creating fallback payment method...');
        
        // Create fallback payment URL
        const fallbackUrl = orderApiService.createFallbackPaymentUrl(orderNumber);
        console.log('Fallback payment URL:', fallbackUrl);
        
        // Show detailed error with response information
        const errorMessage = `Payment URL not received from server. 
        
Order Number: ${orderNumber}
Response: ${JSON.stringify(paymentResponse, null, 2)}

Please check the console logs for more details and contact support with this information.`;
        
        setError(errorMessage);
        
        // Optionally redirect to fallback payment page
        // window.location.href = fallbackUrl;
      }
    } catch (paymentError) {
      console.error('Payment initiation error:', paymentError);
      setError(`Payment initiation failed: ${paymentError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Check if event is selected
    if (!form.event || form.event === '') {
      setError('ღონისძიება არ არის არჩეული. გთხოვთ, აირჩიოთ ღონისძიება დაჯავშნისთვის.');
      return;
    }

    // Simple validation
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.event_date) {
      setError('გთხოვთ, შეავსოთ ყველა საჭირო ველი.');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await orderApiService.createOrder(form);
      console.log('Order created:', orderResponse);

      const generatedOrderNumber = orderResponse.order_number || orderResponse.id;
      if (!generatedOrderNumber) throw new Error('Order number not received.');
      
      setOrderNumber(generatedOrderNumber);

      // Initiate payment
      try {
        const paymentResponse = await orderApiService.initiatePayment(generatedOrderNumber);
        console.log("initiatePayment response:", paymentResponse);
        console.log('Full response structure:', JSON.stringify(paymentResponse, null, 2));

        if (paymentResponse?.payment_url) {
          // Redirect to BOG payment page
          console.log('Redirecting to payment URL:', paymentResponse.payment_url);
          window.location.href = paymentResponse.payment_url;
        } else {
          console.log('No payment URL received, showing success message');
          console.log('Available keys in response:', Object.keys(paymentResponse || {}));
          setSuccess(true);
        }
      } catch (paymentError) {
        console.error('Payment initiation error:', paymentError);
        setError(`Payment initiation failed: ${paymentError.message}`);
        return;
      }
    } catch (err) {
      console.error(err);
      
      // Check if it's an authentication error
      if (err.message && err.message.includes('customer')) {
        setError('შეკვეთის შესაქმნელად აუცილებელია ავტორიზაცია. გთხოვთ, შეხვიდეთ სისტემაში.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(err.message || 'დაფიქსირდა შეცდომა შეკვეთის ან გადახდისას.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          შეკვეთის ინფორმაცია
        </Typography>

        {eventDetails ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight={500}>
              თქვენ ირჩევთ: <strong>{eventDetails.name || eventDetails.title}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ეს ღონისძიება არის არჩეული და არ შეიძლება შეცვლა
            </Typography>
          </Alert>
        ) : !eventLoading && !form.event ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight={500}>
              ღონისძიება არ არის არჩეული
            </Typography>
            <Typography variant="body2" color="text.secondary">
              გთხოვთ, აირჩიოთ ღონისძიება დაჯავშნისთვის
            </Typography>
          </Alert>
        ) : null}

        {orderNumber && (
          <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                შეკვეთის დეტალები
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ღონისძიება:</Typography>
                  {eventLoading ? (
                    <Typography variant="body1" fontWeight={500}>იტვირთება...</Typography>
                  ) : eventDetails ? (
                    <Typography variant="body1" fontWeight={500}>{eventDetails.name || eventDetails.title}</Typography>
                  ) : (
                    <Typography variant="body1" fontWeight={500}>ღონისძიება არ არის არჩეული</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">მომხმარებელი:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ელ-ფოსტა:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ტელეფონი:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ქვეყანა:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_country}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">მონაწილეთა რაოდენობა:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.people_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ღონისძიების თარიღი:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.event_date}</Typography>
                </Grid>
                {form.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">შენიშვნები:</Typography>
                    <Typography variant="body1" fontWeight={500}>{form.notes}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">შეკვეთის ნომერი:</Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">{orderNumber}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
        
        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            შეკვეთის შესაქმნელად აუცილებელია ავტორიზაცია. 
            <Button 
              variant="text" 
              onClick={() => navigate('/login')}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              შედით სისტემაში
            </Button>
          </Alert>
        )}
        
        {isAuthenticated && (
          <Alert severity="success" sx={{ mb: 2 }}>
            მოგესალმებით, {user?.firstname || user?.name || 'მომხმარებელო'}! შეგიძლიათ შეკვეთის შექმნა.
          </Alert>
        )}

        {error && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
            შეკვეთა წარმატებით შეიქმნა! გადახდის გასაგრძელებლად გამოიყენეთ "გადახდა" ღილაკი.
          </Alert>
        )}

        {orderNumber && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              შეკვეთის ნომერი: {orderNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              შეკვეთა წარმატებით შეიქმნა. გადახდის გასაგრძელებლად დააჭირეთ "გადახდა" ღილაკს.
            </Typography>
            <Button
              variant="contained"
              onClick={handlePaymentInitiation}
              disabled={loading}
              sx={{
                backgroundColor: '#570015',
                '&:hover': { backgroundColor: '#3d000f' }
              }}
            >
              გადახდა
            </Button>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ღონისძიება"
              value={eventLoading ? "იტვირთება..." : (eventDetails ? (eventDetails.name || eventDetails.title) : "ღონისძიება არ არის არჩეული")}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  color: eventDetails ? 'primary.main' : 'text.secondary',
                  fontWeight: eventDetails ? 500 : 400
                }
              }}
            />
            {eventDetails && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ID: {form.event}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="მომხმარებლის სახელი"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ელ-ფოსტა"
              name="customer_email"
              type="email"
              value={form.customer_email}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ტელეფონი"
              name="customer_phone"
              value={form.customer_phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customer_phone: e.target.value.replace(/\D/g, '')
                }))
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ქვეყანა"
              name="customer_country"
              value={form.customer_country}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="მონაწილეთა რაოდენობა"
              name="people_count"
              type="number"
              value={form.people_count}
              onChange={handleChange}
              required
            />
          </Grid>


          {/* <Grid item xs={12}>
            <TextField
              fullWidth
              label="შენიშვნები"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="დამატებითი ინფორმაცია ან მოთხოვნები..."
            />
          </Grid> */}
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            disabled={loading || !isAuthenticated}
            sx={{
              backgroundColor: '#570015',
              '&:hover': { backgroundColor: '#3d000f' }
            }}
          >
            {loading ? 'მუშაობს...' : !isAuthenticated ? 'ავტორიზაცია საჭიროა' : 'გადახდა'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentPage;
