/**
 * Location Service for handling geolocation functionality
 * Provides methods to request location access, get current position,
 * and handle location-based features
 */

class LocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.isSupported = 'geolocation' in navigator;
  }

  /**
   * Check if geolocation is supported by the browser
   * @returns {boolean} True if geolocation is supported
   */
  isGeolocationSupported() {
    return this.isSupported;
  }

  /**
   * Request location permission from the user
   * @returns {Promise<boolean>} True if permission is granted
   */
  async requestLocationPermission() {
    if (!this.isSupported) {
      throw new Error('მდებარეობის სერვისები ამ ბრაუზერით არ არის მხარდაჭერილი');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      console.warn('Permission API not supported, will request permission when getting location');
      return true; // Assume permission will be requested when needed
    }
  }

  /**
   * Get current position with options
   * @param {Object} options - Geolocation options
   * @returns {Promise<Object>} Position object with coordinates
   */
  async getCurrentPosition(options = {}) {
    if (!this.isSupported) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds timeout for better accuracy
      maximumAge: 0, // Always get fresh location
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.currentPosition);
        },
        (error) => {
          let errorMessage = 'უცნობი შეცდომა მოხდა';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'მდებარეობის წვდომა უარყოფილია მომხმარებლის მიერ';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'მდებარეობის ინფორმაცია ხელმისაწვდომი არ არის';
              break;
            case error.TIMEOUT:
              errorMessage = 'მდებარეობის მოთხოვნა დრო ამოეწურა';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch position changes
   * @param {Function} callback - Callback function for position updates
   * @param {Object} options - Geolocation options
   * @returns {number} Watch ID for clearing the watch
   */
  watchPosition(callback, options = {}) {
    if (!this.isSupported) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds timeout for better accuracy
      maximumAge: 0, // Always get fresh location
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const positionData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.currentPosition = positionData;
        callback(positionData);
      },
      (error) => {
        console.error('Error watching position:', error);
        callback(null, error);
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching position changes
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees to convert
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get nearby locations within a specified radius
   * @param {Array} locations - Array of location objects with lat/lng
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Array} Filtered locations within radius
   */
  getNearbyLocations(locations, radiusKm = 10) {
    if (!this.currentPosition) {
      throw new Error('No current position available');
    }

    return locations.filter(location => {
      const distance = this.calculateDistance(
        this.currentPosition.latitude,
        this.currentPosition.longitude,
        location.latitude,
        location.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Get current position or return cached position
   * @returns {Object|null} Current position or null
   */
  getCachedPosition() {
    return this.currentPosition;
  }

  /**
   * Clear cached position
   */
  clearCachedPosition() {
    this.currentPosition = null;
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;
