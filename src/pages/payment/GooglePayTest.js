import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Container,
  Paper,
  Divider,
  Chip,
  Alert,
  Fade,
  IconButton,
  Tooltip,
  keyframes,
  styled,
  alpha
} from '@mui/material';
import {
  Google as GoogleIcon,
  Security,
  Done as DoneIcon,
  Info as InfoIcon,
  Payment as PaymentIcon,
  Terminal as TerminalIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Shield as ShieldIcon,
  LocalActivity as ActivityIcon
} from '@mui/icons-material';
import GooglePayButton from '../../components/GooglePayButton';
import ApplePayButton from '../../components/ApplePayButton';
import { useLanguage } from '../../contexts/LanguageContext';
import verifyPaymentIntegration from '../../utils/verifyPaymentIntegration';

// Animations
const animateGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(66, 133, 244, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.15)',
  }
}));

const TerminalBox = styled(Box)(({ theme }) => ({
  background: '#1a1a1a',
  color: '#00ff41',
  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #333',
  minHeight: '200px',
  maxHeight: '300px',
  overflowY: 'auto',
  fontSize: '0.85rem',
  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#333',
    borderRadius: '10px',
  }
}));

const PremiumTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderWidth: '2px',
    }
  }
}));

/**
 * Enhanced Google Pay Test Page
 * A premium sandbox environment with modern design aesthetics
 */
const GooglePayTest = () => {
  const { language } = useLanguage();
  const [testData, setTestData] = useState({
    amount: '1.00',
    activityName: 'Luxury Yacht Cruise',
    orderNumber: `TEST-${Math.floor(Math.random() * 1000000)}`
  });

  const gpayEnv = process.env.REACT_APP_GOOGLE_PAY_ENV || 'TEST';
  const [logs, setLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), message: 'System initialized. Ready for test payment.' },
    { timestamp: new Date().toLocaleTimeString(), message: `Environment: ${gpayEnv}` }
  ]);

  const [paymentResult, setPaymentResult] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message }]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSuccess = (response) => {
    addLog('Payment authorized successfully.');
    addLog(`Transaction ID: ${response.transactionId || 'SANDBOX-' + Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setPaymentResult({ success: true, data: response });
  };

  const handlePaymentError = (error) => {
    addLog(`Payment error: ${error.message || 'Unknown error'}`);
    setPaymentResult({ success: false, error: error.message || 'Payment failed' });
  };

  const handlePaymentCancel = () => {
    addLog('User cancelled the payment process.');
    setPaymentResult({ success: false, error: 'Payment cancelled' });
  };

  const generateNewOrder = () => {
    const newOrder = `TEST-${Math.floor(Math.random() * 1000000)}`;
    setTestData(prev => ({ ...prev, orderNumber: newOrder }));
    addLog(`New order generated: ${newOrder}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #EEF2FF, #F5F3FF, #FFF7ED, #F0FDF4)',
        backgroundSize: '400% 400%',
        animation: `${animateGradient} 15s ease infinite`,
        py: { xs: 4, md: 8 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          borderRadius: '50%',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '2%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(234, 67, 53, 0.05) 0%, transparent 70%)',
          filter: 'blur(30px)',
          borderRadius: '50%',
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box textAlign="center" mb={8} sx={{ animation: `${slideIn} 0.8s ease-out` }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '4px',
              color: 'primary.main',
              display: 'block',
              mb: 1
            }}
          >
            DEVELOPER CONSOLE
          </Typography>
          <Typography
            variant="h2"
            fontWeight={900}
            gutterBottom
            sx={{
              background: 'linear-gradient(90deg, #1e293b, #475569)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              letterSpacing: '-1px'
            }}
          >
            Google Pay Sandbox
          </Typography>
          
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
            <Tooltip title="Secure Testing Environment">
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '18px !important', color: '#059669 !important' }} />}
                label="VERIFIED TEST NODE"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#065F46',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid #A7F3D0'
                }}
              />
            </Tooltip>
            <Chip
              label="v2.0 STABLE"
              sx={{
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #bfdbfe'
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <GlassCard sx={{ height: '100%', mb: { xs: 4, lg: 0 } }}>
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 1.5,
                        borderRadius: '14px',
                        display: 'flex'
                      }}
                    >
                      <ActivityIcon />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight={800}>Configuration</Typography>
                      <Typography variant="body2" color="text.secondary">Set your transaction parameters</Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Reset Form">
                    <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <PremiumTextField
                      fullWidth
                      label="Amount (GEL)"
                      name="amount"
                      value={testData.amount}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <PaymentIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <PremiumTextField
                      fullWidth
                      label="Order Number"
                      name="orderNumber"
                      value={testData.orderNumber}
                      onChange={handleInputChange}
                      InputProps={{
                        endAdornment: (
                          <IconButton size="small" onClick={generateNewOrder}>
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PremiumTextField
                      fullWidth
                      label="Activity Description"
                      name="activityName"
                      value={testData.activityName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>

                <Box mt={6}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <TerminalIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      REAL-TIME TRANSACTION MONITOR
                    </Typography>
                  </Box>
                  <TerminalBox>
                    {logs.map((log, i) => (
                      <Box key={i} sx={{ mb: 1, opacity: 0.9 }}>
                        <Typography component="span" sx={{ color: '#555', mr: 1 }}>[{log.timestamp}]</Typography>
                        <Typography component="span" sx={{ color: log.message.includes('error') ? '#ff4d4d' : log.message.includes('success') ? '#00ff41' : '#fff' }}>
                          $ {log.message}
                        </Typography>
                      </Box>
                    ))}
                    <div ref={logEndRef} />
                  </TerminalBox>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Box display="flex" flexDirection="column" gap={4}>
              <GlassCard
                sx={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box textAlign="center" mb={4}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ opacity: 0.9, letterSpacing: '1px', mb: 1 }}
                    >
                      INTERACTIVE COMPONENT PREVIEW
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '0.75rem' }}>
                      Click the button below to trigger the official Google Pay selection sheet
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      p: 3,
                      borderRadius: '16px',
                      mb: 4,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography color="rgba(255,255,255,0.5)">Service</Typography>
                      <Typography fontWeight={600}>{testData.activityName}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={3}>
                      <Typography color="rgba(255,255,255,0.5)">Reference</Typography>
                      <Typography variant="body2">{testData.orderNumber}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
                      <Typography variant="h4" fontWeight={900} sx={{ color: '#60a5fa' }}>
                        {testData.amount} GEL
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                    <GooglePayButton
                      amount={testData.amount}
                      orderNumber={testData.orderNumber}
                      activityName={testData.activityName}
                      locale={language === 'he' ? 'iw' : language || 'ka'}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      onPaymentCancel={handlePaymentCancel}
                    />
                    
                    <Box sx={{ mt: 3 }}>
                      <ApplePayButton
                        amount={testData.amount}
                        orderNumber={testData.orderNumber}
                        activityName={testData.activityName}
                        locale={language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'hi' ? 'hi-IN' : 'ka-GE'}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                        onPaymentCancel={handlePaymentCancel}
                      />
                    </Box>
                  </Box>

                  <Box mt={4} textAlign="center">
                    <Box display="flex" justifyContent="center" gap={3} opacity={0.6}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" height="15" style={{ filter: 'brightness(0) invert(1)' }} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" height="20" style={{ filter: 'brightness(0) invert(1)' }} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" height="15" style={{ filter: 'brightness(0) invert(1)' }} />
                    </Box>
                  </Box>
                </CardContent>
              </GlassCard>

              {paymentResult && (
                <Fade in={true} timeout={600}>
                  <Box>
                    {paymentResult.success ? (
                      <Alert
                        icon={<DoneIcon sx={{ color: '#059669' }} />}
                        sx={{
                          borderRadius: '16px',
                          bgcolor: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0',
                          '& .MuiAlert-icon': { pt: 1.5 }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Payment Verified</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            The sandbox transaction was processed successfully. Transaction reference logged in console.
                          </Typography>
                        </Box>
                      </Alert>
                    ) : (
                      <Alert
                        severity="error"
                        sx={{
                          borderRadius: '16px',
                          bgcolor: '#FEF2F2',
                          color: '#991B1B',
                          border: '1px solid #FECACA',
                          '& .MuiAlert-icon': { pt: 1.5 }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>Process Interrupted</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {paymentResult.error || 'The transaction could not be completed at this time.'}
                          </Typography>
                        </Box>
                      </Alert>
                    )}
                  </Box>
                </Fade>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GooglePayTest;
