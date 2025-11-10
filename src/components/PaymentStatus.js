import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Button,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Payment,
  Receipt,
  Refresh,
  Schedule
} from '@mui/icons-material';
import orderApiService from '../services/orderApi';

/**
 * Payment Status Component
 * Tracks payment status for an order
 */
const PaymentStatus = ({ orderNumber, onPaymentComplete, onPaymentError }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  // Payment status steps
  const paymentSteps = [
    { label: 'შეკვეთა შექმნილი', status: 'created' },
    { label: 'გადახდა ინიცირებული', status: 'initiated' },
    { label: 'გადახდა მოლოდინში', status: 'pending' },
    { label: 'გადახდა დასრულებული', status: 'completed' }
  ];

  // Load payment status
  const loadPaymentStatus = async () => {
    if (!orderNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderApiService.getPaymentStatus(orderNumber);
      setPaymentStatus(response);
      
      // Call completion callback if payment is successful
      if (response.status === 'completed' && onPaymentComplete) {
        onPaymentComplete(response);
      }
      
      // Call error callback if payment failed
      if (response.status === 'failed' && onPaymentError) {
        onPaymentError(response);
      }
    } catch (error) {
      console.error('Error loading payment status:', error);
      setError(error.message || 'Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  // Start polling for payment status
  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await orderApiService.getPaymentStatus(orderNumber);
        setPaymentStatus(response);
        
        // Stop polling if payment is completed or failed
        if (response.status === 'completed' || response.status === 'failed') {
          setPolling(false);
          clearInterval(interval);
          
          if (response.status === 'completed' && onPaymentComplete) {
            onPaymentComplete(response);
          } else if (response.status === 'failed' && onPaymentError) {
            onPaymentError(response);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        setPolling(false);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds
    
    // Store interval ID for cleanup
    setPolling(interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (polling) {
      clearInterval(polling);
      setPolling(false);
    }
  };

  // Load status on mount
  useEffect(() => {
    loadPaymentStatus();
  }, [orderNumber]);

  // Start polling if payment is pending
  useEffect(() => {
    if (paymentStatus && (paymentStatus.status === 'pending' || paymentStatus.status === 'initiated')) {
      startPolling();
    } else {
      stopPolling();
    }
    
    // Cleanup on unmount
    return () => stopPolling();
  }, [paymentStatus]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'initiated': return 'info';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Pending />;
      case 'failed': return <ErrorIcon />;
      case 'initiated': return <Payment />;
      default: return <Schedule />;
    }
  };

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!paymentStatus) return 0;
    
    switch (paymentStatus.status) {
      case 'created': return 0;
      case 'initiated': return 1;
      case 'pending': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>გადახდის სტატუსის ჩატვირთვა...</Typography>
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
          <Button color="inherit" size="small" onClick={loadPaymentStatus}>
            <Refresh />
            ხელახლა ცდა
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!paymentStatus) {
    return (
      <Alert severity="warning">
        გადახდის სტატუსი ვერ ჩაიტვირთა
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            გადახდის სტატუსი
          </Typography>
          <Chip
            icon={getStatusIcon(paymentStatus.status)}
            label={paymentStatus.status}
            color={getStatusColor(paymentStatus.status)}
            variant="outlined"
          />
        </Box>

        {/* Payment Progress */}
        <Stepper activeStep={getCurrentStepIndex()} orientation="vertical">
          {paymentSteps.map((step, index) => (
            <Step key={step.status}>
              <StepLabel>
                {step.label}
              </StepLabel>
              <StepContent>
                {index === getCurrentStepIndex() && (
                  <Box>
                    {paymentStatus.status === 'pending' && (
                      <Box>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          გადახდა მოლოდინშია. გთხოვთ, დაელოდოთ...
                        </Typography>
                      </Box>
                    )}
                    {paymentStatus.status === 'completed' && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        გადახდა წარმატებით დასრულდა!
                      </Alert>
                    )}
                    {paymentStatus.status === 'failed' && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        გადახდა ვერ დასრულდა. გთხოვთ, სცადოთ ხელახლა.
                      </Alert>
                    )}
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Payment Details */}
        {paymentStatus.details && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              გადახდის დეტალები:
            </Typography>
            <List dense>
              {paymentStatus.details.transaction_id && (
                <ListItem>
                  <ListItemText 
                    primary="ტრანზაქციის ID" 
                    secondary={paymentStatus.details.transaction_id}
                  />
                </ListItem>
              )}
              {paymentStatus.details.amount && (
                <ListItem>
                  <ListItemText 
                    primary="თანხა" 
                    secondary={`${paymentStatus.details.amount}₾`}
                  />
                </ListItem>
              )}
              {paymentStatus.details.payment_method && (
                <ListItem>
                  <ListItemText 
                    primary="გადახდის მეთოდი" 
                    secondary={paymentStatus.details.payment_method}
                  />
                </ListItem>
              )}
              {paymentStatus.details.payment_url && (
                <ListItem>
                  <ListItemText 
                    primary="გადახდის ლინკი" 
                    secondary={
                      <Button 
                        size="small" 
                        onClick={() => window.open(paymentStatus.details.payment_url, '_blank')}
                      >
                        გადახდის გვერდზე გადასვლა
                      </Button>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Actions */}
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadPaymentStatus}
            disabled={loading}
          >
            განახლება
          </Button>
          {paymentStatus.status === 'completed' && (
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={() => {
                // Generate receipt
                console.log('Generate receipt for order:', orderNumber);
              }}
            >
              ქვითარი
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
