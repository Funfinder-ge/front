import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import {
  Security,
  CheckCircle
} from '@mui/icons-material';
import orderApiService from '../services/orderApi';
import { getPaymentConfig } from '../config/paymentConfig';
import googlePayMark from '../config/GPay_Acceptance_Mark_800.png';

/**
 * Google Pay Payment Component
 * Handles Google Pay integration for web payments
 */
const GooglePayButton = ({ 
  orderNumber, 
  amount, 
  activityName = 'Funfinder Activity',
  locale = 'ka',
  onPaymentSuccess, 
  onPaymentError,
  onPaymentCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState(null);
  const [paymentDataRequest, setPaymentDataRequest] = useState(null);
  // Tokenization spec fetched from the backend's /google-pay/config endpoint
  // (authoritative source). Falls back to the hardcoded config on failure.
  const [tokenizationSpec, setTokenizationSpec] = useState(null);
  const buttonContainerRef = useRef(null);
  const buttonRenderedRef = useRef(false);

  // Fetch the tokenization spec from the backend on mount, then check Google Pay availability.
  useEffect(() => {
    fetchTokenizationSpec();
    checkGooglePayAvailability();
  }, []);

  // Update payment data request whenever amount, activityName, or the spec changes
  useEffect(() => {
    if (paymentsClient && tokenizationSpec) {
      preparePaymentDataRequest();
    }
  }, [amount, activityName, paymentsClient, tokenizationSpec]);

  // Render official Google Pay button only when client AND payment data request are ready
  useEffect(() => {
    if (isGooglePayAvailable && paymentsClient && paymentDataRequest && buttonContainerRef.current && !buttonRenderedRef.current) {
      renderGooglePayButton();
    }
  }, [isGooglePayAvailable, paymentsClient, paymentDataRequest]);

  const fetchTokenizationSpec = async () => {
    const config = getPaymentConfig('googlePay');
    try {
      const r = await fetch(config.configUrl, { credentials: 'include' });
      if (!r.ok) throw new Error(`config endpoint returned ${r.status}`);
      const data = await r.json();
      const spec = data?.tokenization_specification;
      if (spec?.type && spec?.parameters?.gateway && spec?.parameters?.gatewayMerchantId) {
        setTokenizationSpec(spec);
        return;
      }
      throw new Error('invalid tokenization_specification in response');
    } catch (e) {
      // Fall back to the hardcoded spec from paymentConfig so the flow keeps working
      // if the backend's /config endpoint isn't ready yet.
      console.warn('Falling back to hardcoded Google Pay tokenization spec:', e?.message);
      const fallback = config?.allowedPaymentMethods?.[0]?.tokenizationSpecification;
      if (fallback) setTokenizationSpec(fallback);
    }
  };

  const checkGooglePayAvailability = async () => {
    try {
      const config = getPaymentConfig('googlePay');
      
      // Load Google Pay script if not already loaded
      if (!window.google?.payments) {
        await loadGooglePayScript();
      }

      if (window.google && window.google.payments) {
        const client = new window.google.payments.api.PaymentsClient({
          environment: config.environment
        });

        const isReadyToPayRequest = {
          apiVersion: config.apiVersion,
          apiVersionMinor: config.apiVersionMinor,
          allowedPaymentMethods: config.allowedPaymentMethods,
          existingPaymentMethodRequired: false
        };

        const isReadyToPay = await new Promise((resolve) => {
          client.isReadyToPay(isReadyToPayRequest)
            .then(response => resolve(response.result))
            .catch(() => resolve(false));
        });

        // Initialize client
        setPaymentsClient(client);

        if (isReadyToPay) {
          setIsGooglePayAvailable(true);
        } else {
          setIsGooglePayAvailable(false);
          console.log('Google Pay availability check returned false');
        }
      } else {
        setIsGooglePayAvailable(false);
      }
    } catch (error) {
      console.error('Error checking Google Pay availability:', error);
      setIsGooglePayAvailable(false);
    }
  };

  const loadGooglePayScript = () => {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="pay.google.com/gp/p/js/pay.js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const preparePaymentDataRequest = () => {
    const config = getPaymentConfig('googlePay');
    if (!config || !tokenizationSpec) return;

    // Swap in the spec fetched from /bog/google-pay/config (authoritative).
    const allowedPaymentMethods = config.allowedPaymentMethods.map((m) => ({
      ...m,
      tokenizationSpecification: tokenizationSpec,
    }));

    setPaymentDataRequest({
      apiVersion: config.apiVersion,
      apiVersionMinor: config.apiVersionMinor,
      merchantInfo: {
        merchantId: config.merchantInfo.merchantId,
        merchantName: config.merchantInfo.merchantName,
      },
      allowedPaymentMethods,
      transactionInfo: {
        countryCode: 'GE',
        currencyCode: 'GEL',
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toString(),
        totalPriceLabel: 'Total',
      },
    });
  };


  const renderGooglePayButton = () => {
    if (!paymentsClient || !buttonContainerRef.current) return;

    // Clear existing content
    buttonContainerRef.current.innerHTML = '';
    
    const button = paymentsClient.createButton({
      buttonColor: 'black',
      buttonType: 'buy',
      buttonSizeMode: 'fill',
      onClick: initializeGooglePayPayment,
      allowedPaymentMethods: getPaymentConfig('googlePay').allowedPaymentMethods
    });

    buttonContainerRef.current.appendChild(button);
    buttonRenderedRef.current = true;
  };

  const initializeGooglePayPayment = async () => {
    if (!paymentsClient || !paymentDataRequest || !orderNumber) {
      setError(!orderNumber ? 'Order number is required' : 'Google Pay is not properly initialized');
      return;
    }

    let paymentData;
    try {
      paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    } catch (error) {
      if (error.statusCode === 'CANCELED') {
        if (onPaymentCancel) onPaymentCancel();
      } else {
        console.error('Google Pay sheet error:', error);
        setError(`Google Pay payment failed: ${error.message || error.description || 'Unknown error'}`);
        if (onPaymentError) onPaymentError(error);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {

      // Process the payment
      const paymentResponse = await processGooglePayPayment(paymentData, orderNumber);
      
      if (paymentResponse.success) {
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentResponse);
        }
      } else {
        setError(paymentResponse.error || 'Payment failed');
        
        // Update payment status in the system
        try {
          await orderApiService.updatePaymentStatus(orderNumber, 'Failed', {
            method: 'google_pay',
            error: paymentResponse.error || 'Payment failed'
          });
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
        }
        
        if (onPaymentError) {
          onPaymentError(new Error(paymentResponse.error));
        }
      }
    } catch (error) {
      console.error('Google Pay payment failed:', error);
      
      // Handle user cancellation
      if (error.statusCode === 'CANCELED') {
        if (onPaymentCancel) {
          onPaymentCancel();
        }
      } else {
        setError(`Google Pay payment failed: ${error.message || error.description || 'Unknown error'}`);
        
        // Update payment status in the system
        try {
          await orderApiService.updatePaymentStatus(orderNumber, 'Failed', {
            method: 'google_pay',
            error: error.message || error.description || 'Unknown error'
          });
        } catch (updateError) {
          console.error('Error updating payment status:', updateError);
        }
        
        if (onPaymentError) {
          onPaymentError(error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const processGooglePayPayment = async (paymentData, orderNumber) => {
    const config = getPaymentConfig('googlePay');

    if (config.environment === 'TEST') {
      const testTxnId = `TEST-GPAY-${Date.now()}`;
      try {
        await orderApiService.updatePaymentStatus(orderNumber, 'Paid', {
          method: 'google_pay',
          transactionId: testTxnId
        });
      } catch (e) {
        console.warn('TEST mode: skipping order status update', e);
      }
      return { success: true, transactionId: testTxnId, orderNumber };
    }

    try {
      // Google Pay returns the encrypted token at this exact path.
      // Per BoG spec we MUST forward the string verbatim, no parsing/edits.
      const googlePayToken = paymentData.paymentMethodData.tokenizationData.token;

      // Backend's POST /payment/bog/google-pay/initiate expects exactly
      // { order_number, google_pay_token } — it builds the full BoG body server-side.
      const response = await fetch(config.processUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          google_pay_token: googlePayToken
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text();
        throw new Error(
          `Payment backend returned non-JSON (${response.status}): ${text.slice(0, 200)}`
        );
      }

      const result = await response.json();

      // Backend responded with JSON but a non-2xx status — surface its own error message.
      if (!response.ok) {
        const backendMsg =
          result?.details?.message ||
          result?.details?.error ||
          result?.error ||
          result?.message ||
          `HTTP ${response.status}`;
        console.error('Backend /initiate error payload:', result);
        throw new Error(backendMsg);
      }

      // BoG response shape:
      //   { id, status, order_details, _links: { details, redirect } }
      // — `redirect` is present iff 3DS authentication is required.
      const transactionId = result.id || result.transactionId;
      const redirectUrl = result?._links?.redirect?.href;
      const status = (result.status || '').toLowerCase();

      if (redirectUrl) {
        // 3DS challenge — hand control to BoG and stop here.
        try {
          await orderApiService.updatePaymentStatus(orderNumber, 'Processing', {
            method: 'google_pay',
            transactionId,
            requires3ds: true
          });
        } catch (e) {
          console.warn('Could not mark order as Processing for 3DS:', e);
        }
        window.location.href = redirectUrl;
        return { success: true, redirected: true, transactionId, orderNumber };
      }

      const isSuccess =
        result.success === true ||
        status === 'completed' ||
        status === 'succeeded' ||
        status === 'paid';

      if (isSuccess) {
        await orderApiService.updatePaymentStatus(orderNumber, 'Paid', {
          method: 'google_pay',
          transactionId
        });
        return { success: true, transactionId, orderNumber };
      }

      return {
        success: false,
        error:
          result.error ||
          result.message ||
          (status ? `Payment status: ${status}` : 'Payment failed')
      };
    } catch (error) {
      console.error('Google Pay processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2.5}>
          <Box
            component="img"
            src={googlePayMark}
            alt="Google Pay"
            sx={{ height: 40, width: 'auto' }}
          />
        </Box>

        {!isGooglePayAvailable && !loading && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
            <Typography variant="body2">
              Google Pay ხელმისაწვდომია Android მოწყობილობებზე ან Chrome ბრაუზერში
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Security fontSize="small" sx={{ color: '#2e7d32' }} />
            <Typography variant="body2" color="text.secondary">
              უსაფრთხო და ენკრიპტირებული ტრანზაქციები
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle fontSize="small" sx={{ color: '#2e7d32' }} />
            <Typography variant="body2" color="text.secondary">
              ბიომეტრიული ავთენტიფიკაცია
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box 
          ref={buttonContainerRef} 
          sx={{ 
            height: 56, 
            width: '100%',
            display: isGooglePayAvailable ? 'block' : 'none',
            '& > div': { width: '100% !important' } 
          }} 
        />

        {loading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 2 }}>
          თქვენ გადაიხდით: <strong>{amount} GEL</strong>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GooglePayButton;

