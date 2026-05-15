import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Apple as AppleIcon,
  Security,
  CheckCircle,
} from '@mui/icons-material';
import orderApiService from '../services/orderApi';
import { getPaymentConfig, validatePaymentConfig } from '../config/paymentConfig';

const SUPPORTED_VERSIONS = [14, 12, 10, 8, 6, 5, 4, 3];

const detectEnvironment = () => {
  if (typeof window === 'undefined') return { kind: 'ssr' };
  const ua = window.navigator.userAgent || '';
  const isApplePlatform = /Mac|iPhone|iPad|iPod/.test(ua);
  const isSafari = /^((?!chrome|crios|fxios|edgios|opios).)*safari/i.test(ua);
  return { kind: 'browser', isApplePlatform, isSafari };
};

const pickSessionVersion = () => {
  if (
    !window.ApplePaySession ||
    typeof window.ApplePaySession.supportsVersion !== 'function'
  ) {
    return null;
  }
  return SUPPORTED_VERSIONS.find((v) => window.ApplePaySession.supportsVersion(v)) || null;
};

const formatAmount = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
};

const ApplePayButton = ({
  orderNumber,
  amount,
  activityName = 'Funfinder Activity',
  locale = 'ka-GE',
  buttonStyle = 'black',
  buttonType = 'buy',
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({
    available: false,
    reason: 'checking',
  });

  const sessionRef = useRef(null);

  const config = getPaymentConfig('applePay');
  const isConfigured = validatePaymentConfig('applePay');
  const supportedVersion = pickSessionVersion();

  useEffect(() => {
    let cancelled = false;
    const env = detectEnvironment();

    const check = async () => {
      if (!window.ApplePaySession) {
        if (!cancelled) {
          setAvailability({
            available: false,
            reason: env.isApplePlatform ? 'use-safari' : 'unsupported-platform',
          });
        }
        return;
      }

      if (!supportedVersion) {
        if (!cancelled) setAvailability({ available: false, reason: 'version' });
        return;
      }

      try {
        const canMake = window.ApplePaySession.canMakePayments();
        if (!canMake) {
          if (!cancelled) setAvailability({ available: false, reason: 'no-device' });
          return;
        }

        if (
          isConfigured &&
          typeof window.ApplePaySession.canMakePaymentsWithActiveCard === 'function'
        ) {
          try {
            const hasCard = await window.ApplePaySession.canMakePaymentsWithActiveCard(
              config.merchantId,
            );
            if (!cancelled) {
              setAvailability({
                available: true,
                reason: hasCard ? 'ready' : 'add-card',
              });
            }
            return;
          } catch (cardErr) {
            console.warn('canMakePaymentsWithActiveCard failed:', cardErr);
          }
        }

        if (!cancelled) setAvailability({ available: true, reason: 'ready' });
      } catch (err) {
        console.error('Apple Pay availability check failed:', err);
        if (!cancelled) setAvailability({ available: false, reason: 'error' });
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [config.merchantId, isConfigured, supportedVersion]);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
          sessionRef.current.abort();
        } catch (e) {
          /* no-op */
        }
        sessionRef.current = null;
      }
    };
  }, []);

  const buildPaymentRequest = useCallback(() => {
    const totalString = formatAmount(amount);
    return {
      countryCode: config.countryCode,
      currencyCode: config.currencyCode,
      merchantCapabilities: config.merchantCapabilities,
      supportedNetworks: config.supportedNetworks,
      lineItems: [
        {
          label: activityName.length > 64 ? `${activityName.slice(0, 61)}...` : activityName,
          amount: totalString,
          type: 'final',
        },
      ],
      total: {
        label: config.displayName,
        amount: totalString,
        type: 'final',
      },
    };
  }, [activityName, amount, config]);

  const validateMerchant = useCallback(
    async (validationURL) => {
      const response = await fetch(config.validateMerchantUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationURL,
          merchantIdentifier: config.merchantId,
          displayName: config.displayName,
          domainName: config.domain,
          orderNumber,
          amount: formatAmount(amount),
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Merchant validation failed (${response.status}): ${text}`);
      }

      const data = await response.json();
      // BoG/backend may return either the raw merchantSession or a wrapper.
      return data.merchantSession || data;
    },
    [amount, config, orderNumber],
  );

  const callAcceptLink = useCallback(async (acceptUrl) => {
    if (!acceptUrl) return null;
    const response = await fetch(acceptUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Apple Pay confirmation failed (${response.status}): ${text}`);
    }
    return response.json().catch(() => ({}));
  }, []);

  const processPayment = useCallback(
    async (payment) => {
      // Body the backend forwards to BoG order/create as documented:
      //   payment_method: ["apple_pay"]
      //   config.apple_pay.external: true
      // The Apple Pay payment token must be forwarded byte-for-byte.
      const response = await fetch(config.processUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          amount: formatAmount(amount),
          payment_method: ['apple_pay'],
          config: {
            apple_pay: {
              external: true,
            },
          },
          paymentToken: payment.token,
          billingContact: payment.billingContact,
          shippingContact: payment.shippingContact,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || `BoG order/create failed (${response.status})`,
        };
      }

      // BoG returns: { id, result, _links: { accept: { href } } }
      const transactionId = result.id || result.transactionId;
      const acceptUrl = result?._links?.accept?.href;

      if (acceptUrl) {
        try {
          await callAcceptLink(acceptUrl);
        } catch (acceptErr) {
          return { success: false, error: acceptErr.message };
        }
      }

      try {
        await orderApiService.updatePaymentStatus(orderNumber, 'Paid', {
          method: 'apple_pay',
          transactionId,
          provider: 'bog',
        });
      } catch (statusErr) {
        console.error('Failed to update order status:', statusErr);
      }

      return { success: true, transactionId, orderNumber };
    },
    [amount, callAcceptLink, config, orderNumber],
  );

  const handleClick = useCallback(() => {
    setError(null);

    if (!window.ApplePaySession) {
      setError('Apple Pay is not supported on this browser');
      return;
    }

    if (!isConfigured) {
      setError('Apple Pay merchant is not configured yet');
      return;
    }

    if (!orderNumber) {
      setError('Order number is required');
      return;
    }

    const totalString = formatAmount(amount);
    if (!totalString) {
      setError('Invalid payment amount');
      return;
    }

    setLoading(true);

    let session;
    try {
      session = new window.ApplePaySession(supportedVersion, buildPaymentRequest());
    } catch (initErr) {
      console.error('Apple Pay init failed:', initErr);
      setError(`Apple Pay could not be started: ${initErr.message}`);
      setLoading(false);
      return;
    }

    sessionRef.current = session;

    session.onvalidatemerchant = async (event) => {
      try {
        const merchantSession = await validateMerchant(event.validationURL);
        session.completeMerchantValidation(merchantSession);
      } catch (err) {
        console.error('Merchant validation failed:', err);
        setError('Merchant validation failed — verify the BoG certificate and domain.');
        try {
          session.abort();
        } catch (e) {
          /* no-op */
        }
        if (onPaymentError) onPaymentError(err);
        setLoading(false);
      }
    };

    session.onpaymentmethodselected = () => {
      const totalForUpdate = formatAmount(amount);
      session.completePaymentMethodSelection({
        newTotal: { label: config.displayName, amount: totalForUpdate, type: 'final' },
        newLineItems: [{ label: activityName, amount: totalForUpdate, type: 'final' }],
      });
    };

    session.onpaymentauthorized = async (event) => {
      try {
        const result = await processPayment(event.payment);
        if (result.success) {
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          if (onPaymentSuccess) onPaymentSuccess(result);
        } else {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          setError(result.error);
          try {
            await orderApiService.updatePaymentStatus(orderNumber, 'Failed', {
              method: 'apple_pay',
              error: result.error,
              provider: 'bog',
            });
          } catch (e) {
            console.error('Failed to mark order as failed:', e);
          }
          if (onPaymentError) onPaymentError(new Error(result.error));
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        setError('Payment processing failed');
        if (onPaymentError) onPaymentError(err);
      } finally {
        sessionRef.current = null;
        setLoading(false);
      }
    };

    session.oncancel = () => {
      sessionRef.current = null;
      setLoading(false);
      if (onPaymentCancel) onPaymentCancel();
    };

    try {
      session.begin();
    } catch (beginErr) {
      console.error('session.begin failed:', beginErr);
      setError(`Apple Pay could not be opened: ${beginErr.message}`);
      sessionRef.current = null;
      setLoading(false);
    }
  }, [
    activityName,
    amount,
    buildPaymentRequest,
    config,
    isConfigured,
    onPaymentCancel,
    onPaymentError,
    onPaymentSuccess,
    orderNumber,
    processPayment,
    supportedVersion,
    validateMerchant,
  ]);

  const renderUnavailableNotice = () => {
    if (availability.reason === 'checking') return null;

    const messages = {
      'use-safari':
        'Apple Pay-ის გამოსაყენებლად გახსენით ვებსაიტი Safari-ში Mac, iPhone ან iPad-ზე.',
      'unsupported-platform':
        'Apple Pay ხელმისაწვდომია მხოლოდ Apple მოწყობილობებზე Safari ბრაუზერში.',
      'no-device': 'თქვენი მოწყობილობა არ უჭერს მხარს Apple Pay-ს.',
      'add-card': 'დაამატეთ ბარათი Apple Wallet-ში გადასახდელად.',
      version: 'თქვენი Safari-ის ვერსია არ უჭერს მხარს ამ Apple Pay ფუნქციონალს.',
      error: 'Apple Pay-ის შემოწმებისას მოხდა შეცდომა.',
    };

    return (
      <Alert
        severity={availability.reason === 'add-card' ? 'warning' : 'info'}
        sx={{ mb: 2.5, borderRadius: 2 }}
      >
        <Typography variant="body2">{messages[availability.reason]}</Typography>
      </Alert>
    );
  };

  const showButton = availability.available && isConfigured;

  return (
    <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
          <Box
            sx={{
              bgcolor: '#000',
              borderRadius: '50%',
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppleIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Apple Pay
          </Typography>
          <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
            powered by Bank of Georgia
          </Typography>
        </Box>

        {!isConfigured && (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
            <Typography variant="body2">
              Apple Pay merchant ID არ არის კონფიგურირებული. შეავსეთ{' '}
              <code>REACT_APP_APPLE_PAY_MERCHANT_ID</code>.
            </Typography>
          </Alert>
        )}

        {!availability.available && renderUnavailableNotice()}

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
              Face ID / Touch ID ავთენტიფიკაცია
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {showButton && (
          <Box
            component="button"
            type="button"
            onClick={handleClick}
            disabled={loading || availability.reason === 'add-card'}
            className={`apple-pay-button apple-pay-button-${buttonStyle}`}
            lang={locale.split('-')[0]}
            aria-label="Pay with Apple Pay"
            sx={{
              border: 'none',
              cursor: loading ? 'progress' : 'pointer',
              opacity: loading || availability.reason === 'add-card' ? 0.6 : 1,
              height: 'var(--apple-pay-button-height)',
              width: 'var(--apple-pay-button-width)',
              borderRadius: 'var(--apple-pay-button-border-radius)',
              transition: 'transform 0.1s ease, opacity 0.2s ease',
              '&:active': { transform: loading ? 'none' : 'scale(0.98)' },
              '&:focus-visible': {
                outline: '2px solid #87003A',
                outlineOffset: 2,
              },
              '--apple-pay-button-type': buttonType,
            }}
          />
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} py={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              იხსნება Apple Pay...
            </Typography>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          display="block"
          sx={{ mt: 2 }}
        >
          თქვენ გადაიხდით:{' '}
          <strong>
            {formatAmount(amount) || '—'} {config.currencyCode}
          </strong>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ApplePayButton;
