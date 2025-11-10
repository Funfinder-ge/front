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
  OpenInNew,
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
    returnUrl: `${window.location.origin}/payment/success`,
    cancelUrl: `${window.location.origin}/payment/cancel`,
    notifyUrl: `https://base.funfinder.ge/en/api/v5/payment/bog/notify`
  };

  // Initialize payment
  const initializePayment = async () => {
    if (!orderNumber) {
      setError('Order number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend to initiate BOG payment
      const response = await orderApiService.initiatePayment(orderNumber);
      
      if (response.payment_url) {
        setPaymentUrl(response.payment_url);
        setPaymentData(response);
        setShowPaymentDialog(true);
      } else {
        throw new Error('Payment URL not received from server');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError(error.message || 'Failed to initialize payment');
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle payment redirect
  const handlePaymentRedirect = () => {
    if (paymentUrl) {
      // Open payment gateway in new window
      const paymentWindow = window.open(
        paymentUrl,
        'BOGPayment',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      // Monitor payment window
      const checkPaymentStatus = setInterval(async () => {
        try {
          if (paymentWindow.closed) {
            clearInterval(checkPaymentStatus);
            setShowPaymentDialog(false);
            
            // Check payment status
            await checkPaymentStatus();
          }
        } catch (error) {
          console.error('Error monitoring payment window:', error);
        }
      }, 2000);

      // Cleanup after 30 minutes
      setTimeout(() => {
        clearInterval(checkPaymentStatus);
        if (!paymentWindow.closed) {
          paymentWindow.close();
        }
      }, 30 * 60 * 1000);
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
        if (onPaymentError) {
          onPaymentError(new Error('Payment failed'));
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentStatus('completed');
    setShowPaymentDialog(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentData);
    }
  };

  // Handle payment cancel
  const handlePaymentCancel = () => {
    setPaymentStatus('cancelled');
    setShowPaymentDialog(false);
    if (onPaymentCancel) {
      onPaymentCancel();
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
        უსაფრთხოების ღონისძიებები:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="SSL დაშიფვრა" 
            secondary="ყველა მონაცემი დაცულია SSL-ით"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="PCI DSS შესაბამისობა" 
            secondary="BOG-ის გადახდის სისტემა შეესაბამება PCI DSS სტანდარტებს"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="3D Secure" 
            secondary="ბარათის მფლობელის ვერიფიკაცია"
          />
        </ListItem>
      </List>
    </Box>
  );

  // Payment methods info
  const renderPaymentMethods = () => (
    <Box mb={2}>
      <Typography variant="subtitle2" gutterBottom>
        მხარდაჭერილი გადახდის მეთოდები:
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip label="Visa" size="small" />
        <Chip label="Mastercard" size="small" />
        <Chip label="American Express" size="small" />
        <Chip label="BOG ბარათები" size="small" />
        <Chip label="სხვა ბანკის ბარათები" size="small" />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>გადახდის ინიციალიზაცია...</Typography>
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
            ხელახლა ცდა
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Payment Information */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Payment color="primary" />
            <Typography variant="h6" fontWeight={600}>
              BOG გადახდის სისტემა
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            გადახდა ხდება BOG-ის უსაფრთხო გადახდის სისტემის მეშვეობით
          </Typography>

          {renderSecurityFeatures()}
          {renderPaymentMethods()}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              გადასახდელი თანხა:
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
              backgroundColor: '#570015',
              '&:hover': { backgroundColor: '#3d000f' }
            }}
          >
            გადახდა BOG-ით
          </Button>
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              გადახდის სტატუსი:
            </Typography>
            <Chip
              icon={paymentStatus === 'completed' ? <CheckCircle /> : <ErrorIcon />}
              label={paymentStatus === 'completed' ? 'დასრულებული' : 'მოლოდინში'}
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
          BOG გადახდის სისტემა
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            გადახდის გასაგრძელებლად დააჭირეთ ღილაკს ქვემოთ:
          </Typography>
          
          <Box textAlign="center" py={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNew />}
              onClick={handlePaymentRedirect}
              sx={{ 
                backgroundColor: '#570015',
                '&:hover': { backgroundColor: '#3d000f' }
              }}
            >
              გადახდის გვერდზე გადასვლა
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            გადახდის გვერდი გაიხსნება ახალ ფანჯარაში. გადახდის დასრულების შემდეგ, 
            ფანჯარა ავტომატურად დაიხურება.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentCancel}>
            გაუქმება
          </Button>
          <Button onClick={handlePaymentSuccess} color="success">
            გადახდა დასრულდა
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOGPayment;
