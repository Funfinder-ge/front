import { useState, useEffect, useCallback } from 'react';
import locationService from '../utils/locationService';

/**
 * Custom hook for location access
 * Provides location state and methods for getting user's position
 */
export const useLocation = (options = {}) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check if geolocation is supported
  const isSupported = locationService.isGeolocationSupported();

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async () => {
    try {
      const granted = await locationService.requestLocationPermission();
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Get current position
   */
  const getCurrentPosition = useCallback(async (customOptions = {}) => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const pos = await locationService.getCurrentPosition({
        ...options,
        ...customOptions
      });
      setPosition(pos);
      setPermissionGranted(true);
      return pos;
    } catch (err) {
      setError(err.message);
      setPermissionGranted(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isSupported, options]);

  /**
   * Watch position changes
   */
  const watchPosition = useCallback((callback, customOptions = {}) => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return null;
    }

    try {
      const watchId = locationService.watchPosition(
        (pos) => {
          setPosition(pos);
          if (callback) callback(pos);
        },
        { ...options, ...customOptions }
      );
      return watchId;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [isSupported, options]);

  /**
   * Stop watching position
   */
  const stopWatching = useCallback(() => {
    locationService.stopWatching();
  }, []);

  /**
   * Get nearby locations
   */
  const getNearbyLocations = useCallback((locations, radiusKm = 10) => {
    try {
      return locationService.getNearbyLocations(locations, radiusKm);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  /**
   * Calculate distance to a location
   */
  const calculateDistance = useCallback((lat, lng) => {
    if (!position) return null;
    return locationService.calculateDistance(
      position.latitude,
      position.longitude,
      lat,
      lng
    );
  }, [position]);

  // Auto-activate geolocation when component mounts
  useEffect(() => {
    if (isSupported && !position && !loading) {
      console.log('Auto-activating geolocation in useLocation hook...');
      getCurrentPosition();
    }
  }, [isSupported, position, loading, getCurrentPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      locationService.stopWatching();
    };
  }, []);

  return {
    // State
    position,
    loading,
    error,
    permissionGranted,
    isSupported,
    
    // Methods
    requestPermission,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    getNearbyLocations,
    calculateDistance,
    
    // Utility
    clearError: () => setError(null),
    clearPosition: () => setPosition(null)
  };
};

export default useLocation;
