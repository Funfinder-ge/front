import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import authApiService from '../services/authApi';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  updateUser: () => {},
  updateImage: () => {},
  loading: true
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      // Try to get user profile to check if session is valid
      const response = await authApiService.getProfile();
      console.log('Profile check response:', response);
      
      if (response && (response.user || response.firstname || response.email)) {
        // Handle different response structures
        const userData = response.user || response;
        const userInfo = {
          ...userData,
          loginMethod: "email",
          lastLogin: new Date().toISOString()
        };
        setUser(userInfo);
        console.log('User authenticated successfully:', userInfo);
      } else {
        console.log('No user data found in response');
        setUser(null);
      }
    } catch (error) {
      console.log('No valid session found:', error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Login attempt with:', credentials);
      const response = await authApiService.login(credentials);
      console.log('Login response:', response);
      
      // Check if login was successful by looking for user data
      if (response && (response.id || response.firstname || response.email)) {
        console.log('Login successful, user data received:', response);
        
        // Set user data directly from login response
        const userData = {
          ...response,
          loginMethod: "email",
          lastLogin: new Date().toISOString()
        };
        
        setUser(userData);
        console.log('User authenticated successfully:', userData);
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Login failed - no user data received' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const loginWithGoogle = (googleUserData) => {
    setUser({
      name: googleUserData.name,
      email: googleUserData.email,
      phone: "+995 000 000 000", // Default phone
      role: "User",
      rating: 5,
      orders: 0,
      lastLogin: new Date().toISOString(),
      image: googleUserData.image,
      googleId: googleUserData.googleId,
      verified: googleUserData.verified,
      loginMethod: "google"
    });
    return true;
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      // Call logout endpoint to invalidate session
      const response = await authApiService.logout();
      console.log('Logout response:', response);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      console.log('User logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  const updateImage = (imageUrl) => {
    setUser(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login, 
      loginWithGoogle, 
      logout, 
      updateUser, 
      updateImage,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
