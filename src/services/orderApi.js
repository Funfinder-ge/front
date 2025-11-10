/**
 * Order API Service
 * Handles order creation, management, and payment processing
 * Integrates with backend Order API endpoints
 */
class OrderApiService {
  constructor() {
    this.baseURL = 'https://base.funfinder.ge';
  }

  /**
   * Get authentication token from cookies
   * @returns {string|null} Authentication token
   */
  getAuthToken() {
    // Try to get token from cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'customer_session_token') {
        return value;
      }
    }
    return null;
  }

  /**
   * Get all relevant session cookies
   * @returns {Object} Session cookies
   */
  getSessionCookies() {
    const cookies = document.cookie.split(';');
    const sessionCookies = {};
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'customer_session_token' || 
          name === 'admin_session_token' || 
          name === 'staff_session_token' ||
          name === 'sessionid') {
        sessionCookies[name] = value;
      }
    }
    
    return sessionCookies;
  }

  /**
   * Make HTTP request using fetch API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get authentication token and session cookies
    const authToken = this.getAuthToken();
    const sessionCookies = this.getSessionCookies();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
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

    console.log(`Order API Request: ${requestOptions.method || 'GET'} ${url}`);
    console.log('Auth token present:', !!authToken);
    console.log('Session cookies:', sessionCookies);
    console.log('All cookies:', document.cookie);

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status} Error`);
      }

      const data = await response.json();
      console.log(`Order API Response: ${response.status} ${url}`);
      return { data };
    } catch (error) {
      console.error('Order API Request Error:', error);
      throw error;
    }
  }

  /**
   * Generate a unique order number
   * @returns {string} Unique order number
   */
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @param {number} orderData.event - Event ID
   * @param {string} orderData.customer_name - Customer name
   * @param {string} orderData.customer_email - Customer email
   * @param {number} orderData.customer_phone - Customer phone
   * @param {string} orderData.customer_country - Customer country code
   * @param {number} orderData.people_count - Number of people
   * @param {string} orderData.event_date - Event date (YYYY-MM-DD)
   * @param {string} orderData.notes - Order notes
   * @returns {Promise<Object>} Created order data
   */
  async createOrder(orderData) {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();
      
      // Prepare order data with order number
      const orderPayload = {
        ...orderData,
        order_number: orderNumber,
        created_at: new Date().toISOString()
      };

      console.log('Sending order data:', orderPayload);
      console.log('Current cookies:', document.cookie);
      
      // Try to create order
      const response = await this.makeRequest(`/en/api/v5/order/create`, {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });
      
      console.log('Order creation response:', response);
      
      // Ensure order number is returned
      const result = response.data;
      if (!result.order_number) {
        result.order_number = orderNumber;
      }
      
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('customer')) {
        throw new Error('Authentication required. Please log in to create an order.');
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Get order feed (list of orders)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Order feed data
   */
  async getOrderFeed(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/v5/order/feed`;
      const response = await this.makeRequest(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching order feed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get order details by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const response = await this.makeRequest(`/api/v5/order/details/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Initiate payment for an order
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object>} Payment initiation response
   */
  async initiatePayment(orderNumber) {
    try {
      console.log('Initiating payment for order:', orderNumber);
      console.log('Calling endpoint: /en/api/v5/payment/bog/initiate');
      console.log('Request payload:', { order_number: orderNumber });
      
      const response = await this.makeRequest(`/en/api/v5/payment/bog/initiate`, {
        method: 'POST',
        body: JSON.stringify({ order_number: orderNumber }),
      });
      
      console.log('HTTP Status:', response.status || 'No status');
      console.log('Response headers:', response.headers || 'No headers');
      console.log('Payment initiation response:', response);
      console.log('Response data:', response.data);
      console.log('Payment URL:', response.data?.payment_url);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      // Check for common response structure issues
      let paymentData = response.data;
      
      // Log the specific BOG payment structure
      if (paymentData?._links?.redirect?.href) {
        console.log('Found BOG payment redirect URL:', paymentData._links.redirect.href);
      }
      
      // Check if response is nested (e.g., { data: { data: {...} } })
      if (response.data && response.data.data) {
        console.log('Found nested data structure, using response.data.data');
        paymentData = response.data.data;
      }
      
      // Check for different payment URL field names
      const paymentUrl = paymentData?.payment_url || 
                        paymentData?.paymentUrl || 
                        paymentData?.url ||
                        paymentData?._links?.redirect?.href ||
                        paymentData?.redirect_url;
      console.log('Final payment URL found:', paymentUrl);
      
      // Return the payment data with standardized payment_url
      if (paymentUrl) {
        return { ...paymentData, payment_url: paymentUrl };
      }
      
      return paymentData || response;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get payment status
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(orderNumber) {
    try {
      const response = await this.makeRequest(`/api/v5/payment/status/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a fallback payment URL for manual payment
   * @param {string} orderNumber - Order number
   * @returns {string} Fallback payment URL
   */
  createFallbackPaymentUrl(orderNumber) {
    // Create a fallback payment URL that shows order details
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment-fallback?order=${orderNumber}`;
  }

  /**
   * Cancel an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelOrder(orderId) {
    try {
      const response = await this.makeRequest(`/api/v5/order/cancel/${orderId}`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user's order history
   * @param {string} customerEmail - Customer email
   * @returns {Promise<Object>} Order history
   */
  async getOrderHistory(customerEmail) {
    try {
      const queryString = new URLSearchParams({ customer_email: customerEmail }).toString();
      const url = `/api/v5/order/history?${queryString}`;
      const response = await this.makeRequest(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - Fetch error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.message.includes('HTTP')) {
      // Server responded with error status
      return new Error(error.message);
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Other error
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Validate order data before submission
   * @param {Object} orderData - Order data to validate
   * @returns {Object} Validation result
   */
  validateOrderData(orderData) {
    const errors = [];

    // Log the data being validated for debugging
    console.log('Validating order data:', orderData);

    if (!orderData.Event || typeof orderData.Event !== 'number' || orderData.Event <= 0) {
      errors.push('Event ID is required and must be a positive number');
    }

    if (!orderData['Customer name'] || typeof orderData['Customer name'] !== 'string' || orderData['Customer name'].trim().length === 0) {
      errors.push('Customer name is required and cannot be empty');
    }

    if (!orderData['Customer email'] || typeof orderData['Customer email'] !== 'string' || orderData['Customer email'].trim().length === 0) {
      errors.push('Customer email is required and cannot be empty');
    } else if (!this.isValidEmail(orderData['Customer email'])) {
      errors.push('Customer email must be a valid email address');
    }

    if (!orderData['Customer phone'] || typeof orderData['Customer phone'] !== 'number' || orderData['Customer phone'] <= 0) {
      errors.push('Customer phone is required and must be a positive number');
    }

    if (!orderData['Customer country'] || typeof orderData['Customer country'] !== 'string' || orderData['Customer country'].trim().length === 0) {
      errors.push('Customer country is required and cannot be empty');
    }

    if (!orderData['People count'] || typeof orderData['People count'] !== 'number' || orderData['People count'] < 1) {
      errors.push('People count is required and must be at least 1');
    }

    if (!orderData['Event date'] || typeof orderData['Event date'] !== 'string' || orderData['event_date'].trim().length === 0) {
      errors.push('Event date is required and cannot be empty');
    } else if (!this.isValidDate(orderData['event_date'])) {
      errors.push('Event date must be in YYYY-MM-DD format');
    }

    // Notes field is optional, so no validation needed

    console.log('Validation errors:', errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - Date to validate
   * @returns {boolean} Is valid date
   */
  isValidDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
  }
}

// Create and export singleton instance
const orderApiService = new OrderApiService();
export default orderApiService;
