import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Receipt,
  Home,
  Refresh,
  Warning,
  Print as PrintIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderApiService from '../../services/orderApi';
import emailService from '../../services/emailService';
import Confetti from '../../components/Confetti';
import FunLoader from '../../components/FunLoader';
import logo from '../../assets/logo.jpg';
import headerImage from '../../assets/header.jpg';

const PaymentStatus = () => {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get status from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const status = urlParams.get('status') || 'unknown';
  
  // Check if order data was passed via location state (from payment page)
  const orderDataFromState = location.state?.orderData || location.state?.orderDetails;
  
  const [orderDetails, setOrderDetails] = useState(orderDataFromState || null);
  const [loading, setLoading] = useState(!orderDataFromState); // Don't load if we already have data
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    // Skip fetching if we already have order data from location state
    if (orderDataFromState) {
      console.log('Using order data from location state:', orderDataFromState);
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      if (!orderNumber) {
        setError('Order number not found');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order details for:', orderNumber);
        const response = await orderApiService.getOrderDetailsByNumber(orderNumber);
        
        // Handle different response structures
        const orderData = response?.data || response || null;
        
        if (orderData) {
          setOrderDetails(orderData);
        } else {
          // If no order data but no error, create a basic order object from URL params
          console.warn('No order data returned, creating basic order object');
          setOrderDetails({
            order_number: orderNumber,
            status: status === 'success' ? 'completed' : status,
            payment_status: status
          });
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        
        // Don't show error if payment was successful - create basic order object instead
        if (status === 'success') {
          console.log('Payment successful but order details unavailable, using basic order info');
          setOrderDetails({
            order_number: orderNumber,
            status: 'completed',
            payment_status: 'success'
          });
          setError(null); // Clear error for successful payments
        } else {
          setError('Failed to fetch order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber, status, orderDataFromState]);

  // Send confirmation emails when payment is successful
  useEffect(() => {
    const sendConfirmationEmails = async () => {
      // Only send emails if:
      // 1. Payment status is success
      // 2. Order details are loaded
      // 3. Emails haven't been sent yet
      // 4. Not currently sending emails
      if (
        status === 'success' &&
        orderDetails &&
        !emailSent &&
        !emailSending
      ) {
        setEmailSending(true);
        try {
          // Format order data for email
          const emailData = emailService.formatOrderDataForEmail(orderDetails);
          
          console.log('Sending ticket confirmation emails for order:', orderNumber);
          
          // Send emails to info@funfinder.ge and customer's email
          const emailResult = await emailService.sendTicketConfirmationEmails(emailData);
          
          if (emailResult && emailResult.success === false) {
            console.warn('Email sending returned error but continuing:', emailResult.error);
          } else {
            console.log('Ticket confirmation emails sent successfully');
          }
          
          setEmailSent(true);
        } catch (emailError) {
          console.error('Error sending confirmation emails:', emailError);
          // Don't show error to user - email sending failure shouldn't block the success page
          // Emails will be sent by backend callback if frontend fails
          // Mark as sent to prevent retry loops
          setEmailSent(true);
        } finally {
          setEmailSending(false);
        }
      }
    };

    // Wrap in try-catch to prevent unhandled promise rejections
    try {
      sendConfirmationEmails();
    } catch (error) {
      console.error('Error in sendConfirmationEmails effect:', error);
      setEmailSending(false);
    }
  }, [status, orderDetails, emailSent, emailSending, orderNumber]);

  const handleRetryPayment = () => {
    navigate('/payment');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 64, color: '#4caf50' }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 64, color: '#f44336' }} />;
      case 'pending':
        return <Warning sx={{ fontSize: 64, color: '#ff9800' }} />;
      default:
        return <ErrorIcon sx={{ fontSize: 64, color: '#9e9e9e' }} />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Completed Successfully';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your payment has been completed successfully. Order details have been sent to your email.';
      case 'failed':
        return 'An error occurred during the payment process. Please try again or contact support.';
      case 'pending':
        return 'Your payment is being processed. You will receive status information via email.';
      default:
        return 'Unable to determine payment status. Please contact support.';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <FunLoader label="Checking payment status" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={handleRetryPayment}>
            Retry
          </Button>
          <Button variant="outlined" onClick={handleGoHome}>
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  const isSuccess = status === 'success';
  const ticketPayload = JSON.stringify({
    order: orderNumber,
    activity: orderDetails?.activity_name || '',
    date: orderDetails?.event_date || '',
    people: orderDetails?.people_count || 1,
    issued: new Date().toISOString(),
  });

  const handlePrint = () => window.print();

  const customerName =
    orderDetails?.customer_name || orderDetails?.name || user?.name || 'Guest';
  const activityName =
    orderDetails?.activity_name ||
    orderDetails?.event_name ||
    orderDetails?.service_name ||
    'Funfinder Activity';
  const eventDate = orderDetails?.event_date || orderDetails?.date || '';
  const eventTime = orderDetails?.event_time || orderDetails?.time || '';
  const peopleCount =
    orderDetails?.people_count ||
    orderDetails?.quantity ||
    orderDetails?.participants ||
    1;
  const ticketAmount =
    orderDetails?.total_amount || orderDetails?.amount || orderDetails?.price || null;
  const ticketLocation =
    orderDetails?.location ||
    orderDetails?.event_location ||
    orderDetails?.venue ||
    'Georgia';
  const ticketAddress =
    orderDetails?.address ||
    orderDetails?.event_address ||
    orderDetails?.venue_address ||
    '';
  const ticketType =
    orderDetails?.ticket_type ||
    orderDetails?.type ||
    'General Admission';
  const ticketShortId = orderNumber
    ? `#${String(orderNumber).slice(-10).toUpperCase()}`
    : '#FF000000';

  if (isSuccess) {
    return (
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, #fdf6f9 0%, #fff8f0 100%)',
          display: 'flex',
          alignItems: 'stretch',
          py: { xs: 2, md: 4 },
          px: { xs: 1.5, md: 4 },
        }}
      >
        <Confetti active />
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .ticket-print, .ticket-print * { visibility: visible; }
            .ticket-print { position: absolute !important; top: 0; left: 0; width: 100%; box-shadow: none !important; }
            .no-print { display: none !important; }
          }
        `}</style>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
            gap: { xs: 3, md: 4 },
            width: '100%',
            maxWidth: 1280,
            mx: 'auto',
          }}
        >
          {/* Left panel: content + ticket */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: '#87003A',
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                Funfinder
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Montserrat", system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '1.9rem', md: '2.6rem' },
                  background: 'linear-gradient(135deg, #87003A 0%, #c1004f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Order confirmation
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
                Thank you for your purchase! Please download, save, or print your ticket
                before the event.
              </Typography>
            </Box>

            {/* Ticket Card */}
            <Box
              className="ticket-print"
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                background: '#fff',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(135, 0, 58, 0.18)',
              }}
            >
              {/* Main ticket section */}
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 2.5, md: 3.5 },
                  position: 'relative',
                  background:
                    'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #fdf6f9 100%)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                    pb: 2.5,
                    borderBottom: '1px solid rgba(135,0,58,0.08)',
                    gap: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="Funfinder"
                    sx={{
                      height: { xs: 40, md: 52 },
                      width: 'auto',
                      borderRadius: 1,
                    }}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", system-ui, sans-serif',
                        fontWeight: 800,
                        fontSize: { xs: '1.05rem', md: '1.4rem' },
                        color: '#87003A',
                        lineHeight: 1.1,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {activityName}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: { xs: 2, sm: 3 },
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      Location
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#87003A',
                        fontSize: '1.05rem',
                        mt: 0.25,
                      }}
                    >
                      {ticketLocation}
                    </Typography>
                    {ticketAddress && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.25, lineHeight: 1.4 }}
                      >
                        {ticketAddress}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      Date / Time
                    </Typography>
                    <Typography sx={{ fontWeight: 600, mt: 0.25, lineHeight: 1.4 }}>
                      {eventDate || '—'}
                      {eventTime && (
                        <>
                          <br />
                          {eventTime}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>

                {/* Ticket info table */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  >
                    Ticket info
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid rgba(135,0,58,0.08)',
                    }}
                  >
                    {[
                      { label: 'Name', value: customerName },
                      { label: 'Type', value: ticketType },
                      { label: 'Quantity', value: peopleCount },
                      {
                        label: 'Price',
                        value: ticketAmount != null ? `${ticketAmount} ₾` : '—',
                      },
                    ].map((row, i) => (
                      <Box
                        key={row.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 2,
                          py: 1.25,
                          background: i % 2 === 0 ? '#fff' : '#fdf6f9',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', fontWeight: 500 }}
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: '#222', textAlign: 'right' }}
                        >
                          {row.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Stub section */}
              <Box
                sx={{
                  width: { xs: '100%', md: 280 },
                  flexShrink: 0,
                  p: { xs: 2.5, md: 3 },
                  background: 'linear-gradient(180deg, #87003A 0%, #3d000f 100%)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  // Perforation
                  borderLeft: { xs: 'none', md: '2px dashed rgba(255,255,255,0.4)' },
                  borderTop: { xs: '2px dashed rgba(255,255,255,0.4)', md: 'none' },
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#fdf6f9',
                  },
                  // Desktop: dots on top/bottom of left edge
                  '&::before': {
                    top: { xs: -12, md: -12 },
                    left: { xs: -12, md: -12 },
                  },
                  '&::after': {
                    bottom: { xs: 'auto', md: -12 },
                    top: { xs: -12, md: 'auto' },
                    right: { xs: -12, md: 'auto' },
                    left: { xs: 'auto', md: -12 },
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}
                  >
                    Funfinder Ticket
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Montserrat", system-ui, sans-serif',
                      fontWeight: 800,
                      mt: 0.5,
                      lineHeight: 1.2,
                      fontSize: '1.1rem',
                    }}
                  >
                    {activityName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                    {ticketType}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1.5,
                      opacity: 0.7,
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                    }}
                  >
                    Ticket: {ticketShortId}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    background: '#fff',
                    p: 1.25,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 2,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                  }}
                >
                  <QRCodeSVG
                    value={ticketPayload}
                    size={150}
                    level="M"
                    includeMargin={false}
                    fgColor="#87003A"
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1.5,
                    textAlign: 'center',
                    opacity: 0.85,
                    fontSize: '0.7rem',
                  }}
                >
                  Scan at venue
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              className="no-print"
              sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                mt: 1,
              }}
            >
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  backgroundColor: '#87003A',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#3d000f' },
                }}
              >
                Print Ticket
              </Button>
              <Button
                variant="outlined"
                startIcon={<Receipt />}
                onClick={() => navigate('/booking-history')}
                sx={{
                  borderColor: '#87003A',
                  color: '#87003A',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#3d000f',
                    backgroundColor: 'rgba(135,0,58,0.04)',
                  },
                }}
              >
                Booking History
              </Button>
              <Button
                variant="text"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ color: 'text.secondary', px: 3, py: 1.2 }}
              >
                Return to Home
              </Button>
            </Box>
          </Box>

          {/* Right panel: image + brand */}
          <Box
            className="no-print"
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              minHeight: 500,
              backgroundImage: `url(${headerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 24px 60px rgba(135,0,58,0.2)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(135,0,58,0.35) 0%, rgba(61,0,15,0.85) 100%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#fff',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  alignSelf: 'flex-start',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  px: 2,
                  py: 0.75,
                  borderRadius: 999,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CheckCircle sx={{ fontSize: 18 }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: 1 }}
                >
                  PAYMENT CONFIRMED
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Montserrat", system-ui, sans-serif',
                    fontWeight: 800,
                    fontSize: '2.4rem',
                    lineHeight: 1.1,
                    mb: 1.5,
                  }}
                >
                  Your adventure
                  <br /> awaits.
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
                  Show the QR code at the venue. Have an amazing experience!
                </Typography>

                <Box
                  component="img"
                  src={logo}
                  alt="Funfinder"
                  sx={{
                    height: 56,
                    width: 'auto',
                    borderRadius: 1,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Failure / pending / unknown states
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <style>{`
        @keyframes successPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46,125,50,0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(46,125,50,0); }
        }
      `}</style>
      <Card sx={{ overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Box sx={{ display: 'inline-flex', borderRadius: '50%' }}>
              {getStatusIcon()}
            </Box>
            <Typography variant="h4" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
              {getStatusTitle()}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getStatusMessage()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order Number
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {orderNumber}
                </Typography>
              </Box>
              {orderDetails && (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {orderDetails.total_amount || orderDetails.amount || 'N/A'}₾
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {orderDetails.payment_method || 'BOG'}
                    </Typography>
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Payment Status
              </Typography>
              <Chip
                label={status.toUpperCase()}
                color={getStatusColor()}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date().toLocaleDateString('ka-GE')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            {status === 'failed' && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetryPayment}
                sx={{
                  backgroundColor: '#87003A',
                  '&:hover': { backgroundColor: '#3d000f' },
                }}
              >
                Retry Payment
              </Button>
            )}
            <Button variant="outlined" startIcon={<Home />} onClick={handleGoHome}>
              Return to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentStatus;
