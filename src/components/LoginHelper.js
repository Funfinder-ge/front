import React from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const LoginHelper = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    try {
      const res = await axios.post('https://base.funfinder.ge/en/api/v3/auth/google/login', 
        { 
          token: googleToken 
        }, 
        {
          withCredentials: true, 
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('Login Success:', res.data);
      alert(`Welcome back, ${res.data.firstname || 'User'}!`);
      // Navigate to profile or home after successful registration
      navigate('/profile');
      
    } catch (error) {
      console.error('Login Failed:', error.response ? error.response.data : error.message);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Login Error:', error);
    if (error?.error === 'popup_closed_by_user') {
      // User closed the popup, don't show error
      return;
    }
    alert('Google registration failed. Please make sure your domain is authorized in Google Cloud Console.');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Login with Google</h3>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        text="signup_with"
      />
    </div>
  );
};

export default LoginHelper;

