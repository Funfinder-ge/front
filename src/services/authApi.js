/**
 * Authentication API Service
 * Handles customer authentication, registration, and session management
 */
class AuthApiService {
  constructor() {
    this.baseURL = 'https://base.funfinder.ge/en/api/v3';
  }

  /**
   * Make HTTP request using fetch API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET', // Explicitly set default method
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Include cookies for session-based auth
      timeout: 30000,
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    console.log(`Auth API Request: ${requestOptions.method} ${url}`);

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Auth API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status} Error`);
      }

      const data = await response.json();
      console.log(`Auth API Response: ${response.status} ${url}`);
      return data;
    } catch (error) {
      console.error('Auth API Request Error:', error);
      throw error;
    }
  }

  /**
   * Login customer
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Customer email
   * @param {string} credentials.password - Customer password
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      console.log('Attempting customer login:', credentials);
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('Login successful:', response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new customer
   * @param {Object} userData - Customer registration data
   * @param {string} userData.email - Customer email
   * @param {string} userData.password - Customer password
   * @param {string} userData.firstname - Customer first name
   * @param {string} userData.lastname - Customer last name
   * @param {string} userData.country - Customer country code
   * @param {string} userData.mobile - Customer mobile phone
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      console.log('Attempting customer registration:', userData);
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('Registration successful:', response);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Get customer profile
   * @returns {Promise<Object>} Customer profile data
   */
  async getProfile() {
    try {
      console.log('Fetching customer profile...');
      const response = await this.makeRequest('/auth/profile');
      
      console.log('Profile fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  /**
   * Logout customer
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      console.log('Attempting customer logout...');
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
      
      console.log('Logout successful:', response);
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if customer is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  async isAuthenticated() {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      console.log('Customer not authenticated:', error.message);
      return false;
    }
  }

  /**
   * Get customer session token from cookies
   * @returns {string|null} Session token
   */
  getSessionToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'customer_session_token') {
        return value;
      }
    }
    return null;
  }
}

// Create and export singleton instance
const authApiService = new AuthApiService();
export default authApiService;
