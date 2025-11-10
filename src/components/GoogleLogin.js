import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { GOOGLE_CLIENT_ID } from '../config/googleAuth';

const GoogleLogin = ({ onSuccess, onError, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Google OAuth script
  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Handle Google OAuth callback
  const handleCredentialResponse = (response) => {
    setLoading(true);
    setError('');

    try {
      // Decode the JWT token (simplified - in production, verify on server)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData = {
        name: payload.name,
        email: payload.email,
        image: payload.picture,
        googleId: payload.sub,
        verified: payload.email_verified,
        loginMethod: 'google'
      };

      onSuccess(userData);
    } catch (err) {
      setError('შეცდომა Google ავტორიზაციის დროს');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google OAuth
  const initializeGoogleAuth = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      setError('Google Client ID არ არის კონფიგურირებული');
      return;
    }

    loadGoogleScript().then(() => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }).catch(err => {
      setError('Google OAuth ვერ ჩაიტვირთა');
      onError && onError(err);
    });
  };

  // Handle login button click
  const handleGoogleLogin = () => {
    if (loading || disabled) return;
    
    setError('');
    setLoading(true);

    if (!window.google) {
      initializeGoogleAuth();
      return;
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: (response) => {
              if (response.access_token) {
                // Fetch user info with access token
                fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                  .then(res => res.json())
                  .then(userInfo => {
                    const userData = {
                      name: userInfo.name,
                      email: userInfo.email,
                      image: userInfo.picture,
                      googleId: userInfo.id,
                      verified: userInfo.verified_email,
                      loginMethod: 'google'
                    };
                    onSuccess(userData);
                  })
                  .catch(err => {
                    setError('მომხმარებლის ინფორმაციის მიღება ვერ მოხერხდა');
                    onError && onError(err);
                  })
                  .finally(() => setLoading(false));
              }
            }
          }).requestAccessToken();
        } else {
          setLoading(false);
        }
      });
    } catch (err) {
      setError('Google ავტორიზაცია ვერ დაიწყო');
      onError && onError(err);
      setLoading(false);
    }
  };

  // Initialize on component mount
  React.useEffect(() => {
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
      initializeGoogleAuth();
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleLogin}
        disabled={loading || disabled}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.5,
          borderColor: '#4285f4',
          color: '#4285f4',
          '&:hover': {
            borderColor: '#3367d6',
            backgroundColor: 'rgba(66, 133, 244, 0.04)',
          },
          '&:disabled': {
            borderColor: '#dadce0',
            color: '#dadce0',
          }
        }}
      >
        {loading ? (
          <Typography variant="body2">იტვირთება...</Typography>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Google-ით შესვლა
          </Typography>
        )}
      </Button>
    </Box>
  );
};

export default GoogleLogin;
