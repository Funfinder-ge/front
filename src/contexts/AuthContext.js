import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import authApiService from '../services/authApi';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
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

  const register = async (userData) => {
    try {
      console.log('Registration attempt with:', userData);
      const response = await authApiService.register(userData);
      console.log('Registration successful:', response);
      
      // After registration, automatically login
      if (response && (response.id || response.firstname || response.email)) {
        const userInfo = {
          ...response,
          loginMethod: "email",
          lastLogin: new Date().toISOString()
        };
        setUser(userInfo);
        return { success: true, user: userInfo };
      }
      
      return { success: true, message: 'Registration successful. Please login.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const loginWithGoogle = async (googleUserData) => {
    try {
      const response = await authApiService.loginWithGoogle({
        name: googleUserData.name,
        email: googleUserData.email,
        googleId: googleUserData.googleId,
        image: googleUserData.image,
        verified: googleUserData.verified,
        credential: googleUserData.credential,
      });

      if (response && (response.id || response.firstname || response.email)) {
        const userInfo = {
          ...response,
          loginMethod: "google",
          lastLogin: new Date().toISOString(),
        };
        setUser(userInfo);
        return { success: true, user: userInfo };
      }

      return { success: false, error: 'Google login failed - no user data received' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message || 'Google login failed' };
    }
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

  const updateUser = async (userData) => {
    try {
      const payload = {
        firstname: userData.name ?? userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        mobile: userData.phone ?? userData.mobile,
        country: userData.country,
      };
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      const response = await authApiService.updateProfile(payload);
      const updated = response?.user || response || {};

      setUser((prev) => ({
        ...prev,
        ...payload,
        name: userData.name ?? payload.firstname ?? prev.name,
        phone: userData.phone ?? payload.mobile ?? prev.phone,
        ...updated,
      }));
      return { success: true, user: updated };
    } catch (error) {
      console.error('updateUser error:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  };

  const updateImage = async (imageUrl) => {
    try {
      const response = await authApiService.updateProfile({ image: imageUrl });
      const updated = response?.user || response || {};
      setUser((prev) => ({
        ...prev,
        image: imageUrl,
        ...updated,
      }));
      return { success: true };
    } catch (error) {
      console.error('updateImage error:', error);
      setUser((prev) => ({ ...prev, image: imageUrl }));
      return { success: false, error: error.message || 'Image update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login, 
      register,
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
