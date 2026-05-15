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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  keyframes,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Payment, Apple, CalendarToday, Warning as WarningIcon, Security, CreditCard } from '@mui/icons-material';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import googlePayMark from '../../config/GPay_Acceptance_Mark_800.png';
import InputAdornment from '@mui/material/InputAdornment';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import orderApiService from '../../services/orderApi';
import { eventsApi } from '../../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import BOGPayment from '../../components/BOGPayment';
import ApplePayButton from '../../components/ApplePayButton';
import GooglePayButton from '../../components/GooglePayButton';
import { PAYMENT_METHODS, getPaymentMethodLabel } from '../../config/paymentConfig';
import CheckoutAuth from '../../components/CheckoutAuth';
import FunLoader from '../../components/FunLoader';

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4); }
  50% { transform: scale(1.01); box-shadow: 0 0 20px 5px rgba(211, 47, 47, 0.2); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const glowAnimation = keyframes`
  0% { border-color: #d32f2f; }
  50% { border-color: #ff5252; }
  100% { border-color: #d32f2f; }
`;

const PaymentPage = ({ bookingData: propBookingData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

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
    event_date: bookingData?.bookingDetails?.date || '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);

  // Stepper State
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Event Overview', t('payment.rules.title'), 'Order Information'];

  const handleNext = () => {
    window.scrollTo(0, 0);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    window.scrollTo(0, 0);
    setActiveStep((prev) => prev - 1);
  };

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
  
  // Auto-fill form fields when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        customer_name: prev.customer_name || user.firstname || user.name || '',
        customer_email: prev.customer_email || user.email || '',
        customer_phone: prev.customer_phone || user.mobile?.replace(/\D/g, '') || '',
        customer_country: prev.customer_country || user.country || 'GEO'
      }));
    }
  }, [isAuthenticated, user]);

  const handleAuthSuccess = (userData) => {
    console.log('Authentication successful in checkout:', userData);
    // Form fields will be updated by the useEffect above
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Payment handlers
  const handlePaymentSuccess = (paymentResponse) => {
    console.log('Payment successful:', paymentResponse);
    setSuccess(true);
    
    // Prepare order data to pass to status page
    const orderData = {
      order_number: paymentResponse.orderNumber || orderNumber,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      activity_name: eventDetails?.name || eventDetails?.title || bookingData?.activity?.name || 'Activity',
      total_amount: (eventDetails?.discounted_price ?? eventDetails?.base_price ?? bookingData?.activity?.discounted_price ?? bookingData?.activity?.base_price ?? 0) * form.people_count,
      amount: (eventDetails?.discounted_price ?? eventDetails?.base_price ?? bookingData?.activity?.discounted_price ?? bookingData?.activity?.base_price ?? 0) * form.people_count,
      people_count: form.people_count,
      event_date: form.event_date,
      payment_method: selectedPaymentMethod,
      status: 'completed',
      payment_status: 'success'
    };
    
    navigate(`/payment/status/${paymentResponse.orderNumber || orderNumber}?status=success`, {
      state: {
        orderNumber: paymentResponse.orderNumber || orderNumber,
        paymentMethod: selectedPaymentMethod,
        paymentResponse,
        orderData: orderData,
        orderDetails: orderData
      }
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setError(`Payment failed: ${error.message}`);
    setLoading(false);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    setError('Payment was cancelled. You can try again.');
    setLoading(false);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setError(null);
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

  // True when all required customer/booking info has been provided.
  // Payment-method selection is intentionally NOT part of this — the payment
  // method picker is only revealed once this becomes true.
  const isOrderInfoComplete = (
    termsAccepted &&
    isAuthenticated &&
    !!form.event &&
    !!form.customer_name &&
    !!form.customer_email &&
    !!form.customer_phone &&
    !!form.event_date
  );

  // True when the form is fully ready to be turned into an order.
  const isFormReady = isOrderInfoComplete && !!selectedPaymentMethod;

  // Pre-create the order on the server as soon as the form is ready and Google Pay
  // is selected. This is what lets the inline Google Pay button behave like the
  // test page: when the user clicks it, loadPaymentData() runs synchronously inside
  // the click handler (no awaited fetch in between), which is required by Google
  // to keep the user-activation valid and avoid OR_BIBED_11.
  useEffect(() => {
    if (selectedPaymentMethod !== 'google_pay') return;
    if (orderNumber) return;
    if (!isFormReady) return;
    if (loading) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const orderResponse = await orderApiService.createOrder(form);
        const generated = orderResponse.order_number || orderResponse.id;
        if (!generated) throw new Error('Order number not received from server.');
        if (!cancelled) {
          setOrderNumber(generated);
          setShowPaymentOptions(true);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.message && err.message.includes('customer')) {
          setError('Authorization is required to create an order. Please log in to the system.');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setError(err.message || 'An error occurred while creating the order.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedPaymentMethod, isFormReady, orderNumber]);

  const handleSubmit = async () => {
    setError(null);

    // Check terms acceptance
    if (!termsAccepted) {
      setShowTermsWarning(true);
      setError(t('payment.rules.errorAccept'));
      return;
    }

    // Check if event is selected
    if (!form.event || form.event === '') {
      setError('Event is not selected. Please select an event for booking.');
      return;
    }

    // Validate all required fields
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.event_date) {
      setError('Please fill in all required fields: event, customer name, email, phone, country, number of participants, date, and payment method.');
      return;
    }

    // Validate payment method selection
    if (!selectedPaymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    setLoading(true);
    try {
      const orderResponse = await orderApiService.createOrder(form);
      const generatedOrderNumber = orderResponse.order_number || orderResponse.id;
      if (!generatedOrderNumber) {
        throw new Error('Order number not received from server. Response: ' + JSON.stringify(orderResponse));
      }
      setOrderNumber(generatedOrderNumber);
      setShowPaymentOptions(true);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('customer')) {
        setError('Authorization is required to create an order. Please log in to the system.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(err.message || 'An error occurred while creating the order or processing payment.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translate3d(0, 16px, 0); filter: blur(4px); }
          to { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
        }
        .payment-step-anim { animation: stepFadeIn 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 4,
          '& .MuiStepIcon-root': {
            transition: 'transform 300ms ease, color 300ms ease',
            '&.Mui-active': { transform: 'scale(1.25)', color: '#87003A' },
            '&.Mui-completed': { color: '#2e7d32' },
          },
          '& .MuiStepConnector-line': {
            transition: 'border-color 400ms ease',
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Event Overview */}
      {activeStep === 0 && (
        <Card key="step-0" className="payment-step-anim" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 3 }}>
              Step 1: Event Overview
            </Typography>

            {eventLoading ? (
              <FunLoader />
            ) : eventDetails || bookingData?.activity ? (
              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Box sx={{ width: '100%', height: { xs: 200, sm: 300 }, borderRadius: 3, overflow: 'hidden', boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                    <Swiper
                      modules={[Navigation, Pagination, Autoplay]}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      style={{ width: '100%', height: '100%', '--swiper-navigation-size': '20px', '--swiper-theme-color': '#fff' }}
                    >
                      {(() => {
                        const defaultImg = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80";
                        let images = [];
                        
                        // Check if eventDetails has multiple images
                        if (eventDetails?.images && Array.isArray(eventDetails.images) && eventDetails.images.length > 0) {
                          images = eventDetails.images.map(img => img?.image || img);
                        } else {
                          // Fallback to single primary image or booking data image
                          const singleImage = eventDetails?.primary_image?.image || bookingData?.activity?.image;
                          if (singleImage) {
                            images = [singleImage];
                          }
                        }
                        
                        if (images.length === 0) images = [defaultImg];

                        const getFullImageUrl = (img) => {
                          if (!img) return defaultImg;
                          const imgStr = String(img);
                          if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) return imgStr;
                          if (imgStr.startsWith('/')) return 'https://base.funfinder.ge' + imgStr;
                          return 'https://base.funfinder.ge/uploads/service_images/' + imgStr;
                        };

                        return images.map((img, idx) => (
                          <SwiperSlide key={idx}>
                            <Box
                              component="img"
                              src={getFullImageUrl(img)}
                              alt={`${eventDetails?.name || bookingData?.activity?.name || "Activity"} - Image ${idx + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </SwiperSlide>
                        ));
                      })()}
                    </Swiper>
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#87003A' }}>
                    {eventDetails?.name || eventDetails?.title || bookingData?.activity?.name}
                  </Typography>

                  {(bookingData?.activity?.location || eventDetails?.city?.name) && (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Alert severity="info" sx={{ py: 0, '& .MuiAlert-message': { p: 1 } }}>
                        {bookingData?.activity?.location || eventDetails?.city?.name}
                      </Alert>
                    </Box>
                  )}

                  <Typography variant="body1" color="text.secondary" paragraph sx={{ minHeight: '80px', lineHeight: 1.7 }}>
                    {eventDetails?.description || bookingData?.activity?.description || 'Get ready for an amazing adventure! Please review the details below before proceeding.'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" gap={4} flexWrap="wrap">
                    {(eventDetails?.duration || bookingData?.activity?.duration) && (
                      <Box display="flex" flexDirection="column">
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" sx={{ color: '#87003A' }} />
                          <Typography variant="body1" fontWeight={600}>
                            {eventDetails?.duration || bookingData?.activity?.duration}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {(() => {
                      const basePrice = parseFloat(eventDetails?.base_price ?? bookingData?.activity?.base_price ?? 0);
                      const discountedPrice = parseFloat(eventDetails?.discounted_price ?? bookingData?.activity?.discounted_price ?? basePrice);
                      const hasDiscount = discountedPrice > 0 && discountedPrice < basePrice;
                      return (
                        <Box display="flex" flexDirection="column">
                          <Typography variant="caption" color="text.secondary">
                            {hasDiscount ? 'Price per person' : 'Base Price'}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Payment fontSize="small" sx={{ color: '#87003A' }} />
                            {hasDiscount ? (
                              <>
                                <Typography variant="body1" fontWeight={700} sx={{ color: '#2e7d32' }}>
                                  {discountedPrice} GEL
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#d32f2f', textDecoration: 'line-through', opacity: 0.7 }}>
                                  {basePrice} GEL
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body1" fontWeight={600}>
                                {basePrice} GEL
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })()}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="warning">
                Event is not selected. Please go back and select an activity.
              </Alert>
            )}

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={!form.event && !bookingData?.activity?.id}
                sx={{ backgroundColor: '#87003A', '&:hover': { backgroundColor: '#3d000f' }, px: 4, py: 1 }}
              >
                Next Step
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Safety Rules */}
      {activeStep === 1 && (
        <Box key="step-1" className="payment-step-anim">
          {/* Safety Terms & Conditions Warning */}
          <Card
            sx={{
              mb: 3,
          border: '2px solid',
          borderColor: termsAccepted ? '#2e7d32' : '#d32f2f',
          borderRadius: 3,
          overflow: 'hidden',
          animation: !termsAccepted
            ? `${pulseAnimation} 2.5s ease-in-out infinite, ${glowAnimation} 2s ease-in-out infinite`
            : 'none',
          ...(showTermsWarning && !termsAccepted && {
            animation: `${shakeAnimation} 0.6s ease-in-out, ${pulseAnimation} 2.5s ease-in-out infinite, ${glowAnimation} 2s ease-in-out infinite`,
          }),
          transition: 'all 0.4s ease',
        }}
      >
        {/* Red Header Bar */}
        <Box
          sx={{
            background: termsAccepted
              ? 'linear-gradient(135deg, #2e7d32, #43a047)'
              : 'linear-gradient(135deg, #d32f2f, #c62828)',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {termsAccepted ? (
            <CheckCircle sx={{ color: 'white', fontSize: 30 }} />
          ) : (
            <WarningIcon
              sx={{
                color: 'white',
                fontSize: 30,
                animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
              }}
            />
          )}
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            {termsAccepted ? t('payment.rules.accepted') : t('payment.rules.title')}
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Safety Info */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <Security sx={{ color: '#d32f2f', fontSize: 22, mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                {t('payment.rules.p1')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
              <WarningIcon sx={{ color: '#d32f2f', fontSize: 22, mt: 0.3 }} />
              <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                {t('payment.rules.p2')}
              </Typography>
            </Box>
          </Box>

          {/* Checkbox */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: termsAccepted ? 'rgba(46, 125, 50, 0.06)' : 'rgba(211, 47, 47, 0.06)',
              border: '1px solid',
              borderColor: termsAccepted ? '#2e7d32' : '#d32f2f',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setShowTermsWarning(false);
                      setError(null);
                    }
                  }}
                  sx={{
                    color: '#d32f2f',
                    '&.Mui-checked': { color: '#2e7d32' },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {t('payment.rules.agreeContext')}
                  <Link
                    to="/rules"
                    target="_blank"
                    style={{
                      color: '#d32f2f',
                      fontWeight: 700,
                      textDecoration: 'underline',
                    }}
                  >
                    {t('payment.rules.agreeLink')}
                  </Link>
                </Typography>
              }
            />

            {showTermsWarning && !termsAccepted && (
              <Typography
                variant="body2"
                sx={{
                  color: '#d32f2f',
                  fontWeight: 700,
                  mt: 1,
                  ml: 4,
                  animation: `${shakeAnimation} 0.6s ease-in-out`,
                }}
              >
                {t('payment.rules.warningCheck')}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" mt={3} mb={3}>
        <Button variant="outlined" onClick={handleBack}>
          Back to Overview
        </Button>
        <Button 
          variant="contained" 
          onClick={handleNext}
          disabled={!termsAccepted}
          sx={{ backgroundColor: '#87003A', '&:hover': { backgroundColor: '#3d000f' }, px: 4, py: 1 }}
        >
          Confirm & Continue
        </Button>
      </Box>
    </Box>
    )}

    {/* Step 3: Order Information */}
    {activeStep === 2 && (
      <Box key="step-2" className="payment-step-anim">
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 3 }}>
              Step 3: Order Information
            </Typography>

        {orderNumber && (
          <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                Order Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Event:</Typography>
                  {eventLoading ? (
                    <Typography variant="body1" fontWeight={500}>Loading...</Typography>
                  ) : eventDetails ? (
                    <Typography variant="body1" fontWeight={500}>{eventDetails.name || eventDetails.title}</Typography>
                  ) : (
                    <Typography variant="body1" fontWeight={500}>Event is not selected</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Customer:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Country:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.customer_country}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Number of Participants:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.people_count}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Event Date:</Typography>
                  <Typography variant="body1" fontWeight={500}>{form.event_date}</Typography>
                </Grid>
                {form.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Notes:</Typography>
                    <Typography variant="body1" fontWeight={500}>{form.notes}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Order Number:</Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">{orderNumber}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {!isAuthenticated && (
          <Box sx={{ mb: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1">
                Please <strong>Login</strong> or <strong>Register</strong> to complete your booking.
              </Typography>
            </Alert>
            <CheckoutAuth onAuthSuccess={handleAuthSuccess} />
          </Box>
        )}

        

        {error && (
          <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
            Order created successfully! Use the "Proceed to Payment" button to continue with payment.
          </Alert>
        )}

        {orderNumber && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Number: {orderNumber}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Order created successfully. Click the "Proceed to Payment" button to continue with payment.
            </Typography>
            <Button
              variant="contained"
              onClick={handlePaymentInitiation}
              disabled={loading}
              sx={{
                backgroundColor: '#87003A',
                '&:hover': { backgroundColor: '#3d000f' }
              }}
            >
              Proceed to Payment
            </Button>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event"
              value={eventLoading ? "Loading..." : (eventDetails ? (eventDetails.name || eventDetails.title) : "Event is not selected")}
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
              label="Customer Name"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
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
              label="Phone"
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
              label="Country"
              name="customer_country"
              value={form.customer_country}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Number of Participants"
              name="people_count"
              type="number"
              value={form.people_count}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Date & Time"
              name="event_date"
              type="datetime-local"
              value={form.event_date}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{
                // Local-time ISO string (YYYY-MM-DDTHH:mm) — blocks past dates AND past times today.
                min: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Additional information or requirements..."
            />
          </Grid> */}
        </Grid>

        {/* Payment Method Selection — revealed only after all order info is provided */}
        {!isOrderInfoComplete && (
          <Alert severity="info" sx={{ mt: 4 }}>
            Please fill in all the fields above and accept the terms to choose a payment method.
          </Alert>
        )}
        <Box mt={4} sx={{ display: isOrderInfoComplete ? 'block' : 'none' }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Select Payment Method
          </Typography>

          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant={selectedPaymentMethod === 'card' ? 'contained' : 'outlined'}
                  onClick={() => handlePaymentMethodChange('card')}
                  fullWidth
                  sx={{
                    py: 2,
                    backgroundColor: selectedPaymentMethod === 'card' ? '#87003A' : 'transparent',
                    borderColor: '#87003A',
                    color: selectedPaymentMethod === 'card' ? 'white' : '#87003A',
                    '&:hover': {
                      backgroundColor: selectedPaymentMethod === 'card' ? '#3d000f' : 'rgba(87, 0, 21, 0.04)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <CreditCard fontSize="small" />
                    <Typography component="span" sx={{ fontSize: 14 }}>Debit / Credit</Typography>
                    <FaCcVisa size={28} color={selectedPaymentMethod === 'card' ? '#fff' : '#1A1F71'} />
                    <FaCcMastercard size={28} color={selectedPaymentMethod === 'card' ? '#fff' : '#EB001B'} />
                  </Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant={selectedPaymentMethod === 'apple_pay' ? 'contained' : 'outlined'}
                  onClick={() => handlePaymentMethodChange('apple_pay')}
                  fullWidth
                  sx={{
                    py: 2,
                    backgroundColor: selectedPaymentMethod === 'apple_pay' ? '#000' : 'transparent',
                    borderColor: '#000',
                    color: selectedPaymentMethod === 'apple_pay' ? 'white' : '#000',
                    '&:hover': {
                      backgroundColor: selectedPaymentMethod === 'apple_pay' ? '#333' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <Apple sx={{ mr: 1 }} />
                  Apple Pay
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant={selectedPaymentMethod === 'google_pay' ? 'contained' : 'outlined'}
                  onClick={() => handlePaymentMethodChange('google_pay')}
                  fullWidth
                  sx={{
                    py: 2,
                    backgroundColor: selectedPaymentMethod === 'google_pay' ? '#fff' : 'transparent',
                    borderColor: '#000',
                    '&:hover': {
                      backgroundColor: selectedPaymentMethod === 'google_pay' ? '#f5f5f5' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: '#000',
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={googlePayMark}
                    alt="Google Pay"
                    sx={{ height: 28, width: 'auto' }}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Inline Google Pay — same render pattern as GooglePayTest.js so the click handler stays synchronous */}
          {selectedPaymentMethod === 'google_pay' && orderNumber && (
            <Box mb={3}>
              <GooglePayButton
                orderNumber={orderNumber}
                amount={(eventDetails?.discounted_price ?? eventDetails?.price ?? eventDetails?.base_price ?? 0) * (form.people_count || 1)}
                activityName={eventDetails?.name || bookingData?.activity?.name || 'Funfinder Activity'}
                locale={language === 'he' ? 'iw' : language || 'ka'}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onPaymentCancel={handlePaymentCancel}
              />
            </Box>
          )}

          {/* While order is being pre-created, show a placeholder so the user sees progress */}
          {selectedPaymentMethod === 'google_pay' && !orderNumber && isFormReady && loading && (
            <Box mb={3} display="flex" alignItems="center" gap={1.5}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Preparing Google Pay…
              </Typography>
            </Box>
          )}

          {/* Tell the user what's missing before Google Pay can be activated */}
          {selectedPaymentMethod === 'google_pay' && !orderNumber && !isFormReady && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Fill in all the fields above and accept the terms to activate Google Pay.
            </Alert>
          )}
        </Box>

        {/* Payment Options Section */}
        {showPaymentOptions && orderNumber && selectedPaymentMethod !== 'google_pay' && (
          <Box mt={4}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Proceed to Payment
            </Typography>

            {/* Payment Components */}
            {selectedPaymentMethod === 'card' && (
              <BOGPayment
                orderNumber={orderNumber}
                amount={eventDetails?.price || 0}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onPaymentCancel={handlePaymentCancel}
              />
            )}

            {selectedPaymentMethod === 'apple_pay' && (
              <ApplePayButton
                orderNumber={orderNumber}
                amount={eventDetails?.price || 0}
                activityName={eventDetails?.name || bookingData?.activity?.name || 'Funfinder Activity'}
                locale={language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'hi' ? 'hi-IN' : 'ka-GE'}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onPaymentCancel={handlePaymentCancel}
              />
            )}

          </Box>
        )}

        {/* Create Order Button — hidden when Google Pay is selected; the inline GPay button is the action */}
        {!showPaymentOptions && selectedPaymentMethod !== 'google_pay' && (
          <Box display="flex" justifyContent="space-between" mt={5}>
            <Button variant="outlined" onClick={handleBack} disabled={loading}>
              Back to Terms
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
              disabled={loading || !isAuthenticated || !termsAccepted}
              sx={{
                backgroundColor: '#87003A',
                '&:hover': { backgroundColor: '#3d000f' },
                px: 4,
                py: 1
              }}
            >
              {loading ? 'Processing...' : !isAuthenticated ? 'Authorization Required' : 'Create Order & Pay'}
            </Button>
          </Box>
        )}

        {/* For Google Pay: only a Back button — payment is triggered by the inline GPay button above */}
        {!showPaymentOptions && selectedPaymentMethod === 'google_pay' && (
          <Box display="flex" justifyContent="flex-start" mt={3}>
            <Button variant="outlined" onClick={handleBack} disabled={loading}>
              Back to Terms
            </Button>
          </Box>
        )}
        
        {/* Back option for payment method view */}
        {showPaymentOptions && (
          <Box display="flex" justifyContent="flex-start" mt={2}>
            <Button variant="text" onClick={handleBack} disabled={loading}>
              Go back
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
    </Box>
    )}

    </Box>
  );
};

export default PaymentPage;
