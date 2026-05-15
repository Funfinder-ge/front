import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Phone,
  Public
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import GoogleLogin from './GoogleLogin';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CheckoutAuth = ({ onAuthSuccess }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Register Form
  const [registerForm, setRegisterForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    country: 'GEO',
    password: '',
    confirmPassword: ''
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(loginForm);
      if (result.success) {
        if (onAuthSuccess) onAuthSuccess(result.user);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const result = await register(registerForm);
      if (result.success) {
        if (onAuthSuccess) onAuthSuccess(result.user);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (userData) => {
    const result = await loginWithGoogle(userData);
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
    } else {
      setError(result.error || 'Google login failed');
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="auth tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#87003A' },
            '& .Mui-selected': { color: '#87003A !important' }
          }}
        >
          <Tab label="Login" id="auth-tab-0" />
          <Tab label="Register" id="auth-tab-1" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Login Panel */}
      <TabPanel value={tabValue} index={0}>
        <form onSubmit={handleLoginSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            required
            value={loginForm.email}
            onChange={handleLoginChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={loginForm.password}
            onChange={handleLoginChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              backgroundColor: '#87003A',
              '&:hover': { backgroundColor: '#3d000f' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login & Continue'}
          </Button>
        </form>
      </TabPanel>

      {/* Register Panel */}
      <TabPanel value={tabValue} index={1}>
        <form onSubmit={handleRegisterSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstname"
                required
                value={registerForm.firstname}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastname"
                required
                value={registerForm.lastname}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                required
                value={registerForm.email}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="mobile"
                required
                value={registerForm.mobile}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                required
                value={registerForm.country}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                required
                value={registerForm.password}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={registerForm.confirmPassword}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.5,
              backgroundColor: '#87003A',
              '&:hover': { backgroundColor: '#3d000f' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register & Continue'}
          </Button>
        </form>
      </TabPanel>

      <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
        <Typography variant="body2" sx={{ px: 2, color: "text.secondary" }}>
          OR
        </Typography>
        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: 'divider' }} />
      </Box>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={(err) => setError('Google login failed.')}
      />
    </Box>
  );
};

export default CheckoutAuth;
