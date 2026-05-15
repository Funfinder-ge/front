import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Payment,
  Security,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  Receipt
} from '@mui/icons-material';
import orderApiService from '../services/orderApi';

/**
 * BOG Payment Gateway Component
 * Handles BOG payment gateway integration
 */
const BOGPayment = ({ 
  orderNumber, 
  amount, 
  onPaymentSuccess, 
  onPaymentError,
  onPaymentCancel 
}) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // BOG Payment Gateway Configuration
  const BOG_CONFIG = {
    baseUrl: 'https://ipay.ge',
    merchantId: process.env.REACT_APP_BOG_MERCHANT_ID || 'your_merchant_id',
    secretKey: process.env.REACT_APP_BOG_SECRET_KEY || 'your_secret_key',
    returnUrl: `${window.location.origin}/payment/status/${orderNumber}?status=success`,
    cancelUrl: `${window.location.origin}/payment/status/${orderNumber}?status=failed`,
    notifyUrl: `https://base.funfinder.ge/api/v5/payment/bog/notify`
  };

  // Initialize payment
  const initializePayment = async () => {
    if (!orderNumber) {
      const errorMsg = 'Order ID missing - Cannot initialize payment without order number';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('Initializing BOG payment for order:', orderNumber);
    setLoading(true);
    setError(null);

    try {
      // Call backend to initiate BOG payment
      const response = await orderApiService.initiatePayment(orderNumber, 'card');
      
      if (response.payment_url) {
        setPaymentUrl(response.payment_url);
        setPaymentData(response);
        setShowPaymentDialog(true);
      } else {
        throw new Error('Payment URL not received from server');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Provide more detailed error message
      let errorMessage = 'Failed to initialize payment';
      
      if (error.message) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (error.message.includes('HTTP 4')) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else if (error.message.includes('HTTP 5')) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Payment service not available. Please contact support.';
        } else {
          errorMessage = `Payment initialization failed: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      handlePaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment redirect
  const handlePaymentRedirect = () => {
    if (paymentUrl) {
      // Open payment gateway in the same tab
      console.log('Redirecting to payment URL in same tab:', paymentUrl);
      window.location.href = paymentUrl;
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await orderApiService.getPaymentStatus(orderNumber);
      setPaymentStatus(response.status);

      if (response.status === 'completed') {
        if (onPaymentSuccess) {
          onPaymentSuccess(response);
        }
      } else if (response.status === 'failed') {
        handlePaymentError(new Error('Payment failed'));
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log('BOG Payment successful:', paymentData);
    setPaymentStatus('success');
    
    // For BOG payments, the callback endpoint should handle status updates
    // We just notify the parent component of success
    if (onPaymentSuccess) {
      onPaymentSuccess({
        success: true,
        orderNumber: orderNumber,
        paymentData: paymentData,
        message: 'Payment completed successfully'
      });
    }
  };

  // Handle payment cancel
  const handlePaymentCancel = async () => {
    setPaymentStatus('cancelled');
    setShowPaymentDialog(false);
    
    // For BOG payments, the callback endpoint should handle status updates
    // We just notify the parent component of cancellation
    if (onPaymentCancel) {
      onPaymentCancel();
    }
  };

  // Handle payment error
  const handlePaymentError = async (error) => {
    setPaymentStatus('failed');
    setShowPaymentDialog(false);
    
    // For BOG payments, the callback endpoint should handle status updates
    // We just notify the parent component of error
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  // Auto-initialize payment on mount
  useEffect(() => {
    if (orderNumber && !paymentData) {
      initializePayment();
    }
  }, [orderNumber]);

  // Payment security features
  const renderSecurityFeatures = () => (
    <Box mb={2}>
      <Typography variant="subtitle2" gutterBottom>
        Security Measures:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="SSL Encryption" 
            secondary="All data is protected with SSL"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="PCI DSS Compliance" 
            secondary="BOG payment system complies with PCI DSS standards"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="3D Secure" 
            secondary="Cardholder verification"
          />
        </ListItem>
      </List>
    </Box>
  );

  // Payment methods info
  const renderPaymentMethods = () => (
    <Box mb={2}>
      <Typography variant="subtitle2" gutterBottom>
        Supported Payment Methods:
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip label="Visa" size="small" />
        <Chip label="Mastercard" size="small" />
        <Chip label="American Express" size="small" />
        <Chip label="BOG Cards" size="small" />
        <Chip label="Other Bank Cards" size="small" />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Initializing payment...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={initializePayment}>
            <Refresh />
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Debug - Order Number: {orderNumber || 'MISSING'} | 
            Payment Status: {paymentStatus} | 
            Loading: {loading.toString()}
          </Typography>
        </Alert>
      )}

      {/* Detailed Debug Information - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Detailed Debug Information:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
            {JSON.stringify({
              orderNumber,
              amount,
              paymentUrl: paymentUrl ? 'SET' : 'NOT SET',
              paymentData: paymentData ? 'RECEIVED' : 'NOT RECEIVED',
              loading,
              error: error || 'NONE',
              paymentStatus,
              BOG_CONFIG: {
                merchantId: BOG_CONFIG.merchantId,
                baseUrl: BOG_CONFIG.baseUrl
              }
            }, null, 2)}
          </Typography>
        </Box>
      )}

      {/* Payment Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Payment color="primary" />
            <Typography variant="h6" fontWeight={600}>
              BOG Payment System
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Payment is processed through BOG's secure payment system
          </Typography>

          {renderSecurityFeatures()}
          {renderPaymentMethods()}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Amount to Pay:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>
              {amount}₾
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePaymentRedirect}
            startIcon={<Payment />}
            disabled={!paymentUrl}
            sx={{ 
              backgroundColor: '#87003A',
              '&:hover': { backgroundColor: '#3d000f' }
            }}
          >
            Pay with BOG
          </Button>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Payment Status:
            </Typography>
            <Chip
              icon={paymentStatus === 'completed' ? <CheckCircle /> : <ErrorIcon />}
              label={paymentStatus === 'completed' ? 'Completed' : 'Pending'}
              color={paymentStatus === 'completed' ? 'success' : 'warning'}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentDialog}
        onClose={handlePaymentCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          BOG Payment System
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Payment will be processed in BOG payment system.
          </Typography>

          {renderPaymentMethods()}

          <Box my={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePaymentRedirect}
              fullWidth
              size="large"
              startIcon={<Payment />}
              sx={{
                backgroundColor: '#87003A',
                '&:hover': { backgroundColor: '#3d000f' }
              }}
            >
              Proceed to Payment
            </Button>
          </Box>

          {renderSecurityFeatures()}

          <Alert severity="info" sx={{ mt: 2 }}>
            After redirecting to the payment page, upon completion you will be automatically returned to the site.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentCancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOGPayment;
