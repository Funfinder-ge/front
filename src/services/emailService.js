/**
 * Email Service
 * Handles sending email notifications for ticket purchases
 */
class EmailService {
  constructor() {
    this.baseURL = 'https://base.funfinder.ge';
  }

  /**
   * Get authentication token from cookies
   * @returns {string|null} Authentication token
   */
  getAuthToken() {
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
   * Make HTTP request using fetch API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const authToken = this.getAuthToken();

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      credentials: 'include',
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} Error`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Email Service Request Error:', error);
      throw error;
    }
  }

  /**
   * Send ticket confirmation emails to multiple recipients
   * @param {Object} orderData - Order data with ticket information
   * @param {string} orderData.orderNumber - Order number
   * @param {string} orderData.customerName - Customer name
   * @param {string} orderData.customerEmail - Customer email
   * @param {string} orderData.customerPhone - Customer phone
   * @param {string} orderData.activityName - Activity/Event name
   * @param {number} orderData.amount - Total amount
   * @param {number} orderData.peopleCount - Number of participants
   * @param {string} orderData.eventDate - Event date
   * @param {string} orderData.paymentMethod - Payment method
   * @param {Object} orderData.eventDetails - Additional event details
   * @returns {Promise<Object>} Email sending response
   */
  async sendTicketConfirmationEmails(orderData) {
    try {
      // Validate required fields
      if (!orderData || !orderData.orderNumber) {
        throw new Error('Order data or order number is missing');
      }

      // Validate customer email
      const customerEmail = orderData.customerEmail || '';
      if (!customerEmail || !customerEmail.includes('@')) {
        console.warn('Invalid customer email, skipping customer email recipient:', customerEmail);
      }

      // Build recipients list - always include info@funfinder.ge
      const recipients = ['info@funfinder.ge'];
      
      // Add customer email if valid
      if (customerEmail && customerEmail.includes('@') && customerEmail.trim() !== '') {
        recipients.push(customerEmail.trim());
      }

      const emailData = {
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName || 'Customer',
        customer_email: customerEmail || '',
        customer_phone: orderData.customerPhone || '',
        activity_name: orderData.activityName || 'Activity',
        amount: orderData.amount || 0,
        people_count: orderData.peopleCount || 1,
        event_date: orderData.eventDate || new Date().toISOString().split('T')[0],
        payment_method: orderData.paymentMethod || 'BOG',
        event_details: orderData.eventDetails || {},
        // Recipient emails - send to info@funfinder.ge and customer's email
        recipients: recipients
      };

      console.log('Sending ticket confirmation emails to:', recipients);
      console.log('Email data:', emailData);

      const response = await this.makeRequest('/api/v5/email/send-ticket-confirmation', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });

      console.log('Email sending response:', response);
      return response.data || response;
    } catch (error) {
      console.error('Error sending ticket confirmation emails:', error);
      // Return error object instead of throwing to prevent unhandled rejections
      return {
        success: false,
        error: error.message || 'Failed to send emails'
      };
    }
  }

  /**
   * Format order data for email template
   * @param {Object} orderDetails - Order details from API
   * @returns {Object} Formatted order data for email
   */
  formatOrderDataForEmail(orderDetails) {
    return {
      orderNumber: orderDetails.order_number || orderDetails.number || orderDetails.id,
      customerName: orderDetails.customer_name || orderDetails.name || 'Customer',
      customerEmail: orderDetails.customer_email || orderDetails.email || '',
      customerPhone: orderDetails.customer_phone || orderDetails.phone || '',
      activityName: orderDetails.activity_name || orderDetails.event_name || orderDetails.service_name || 'Activity',
      amount: orderDetails.total_amount || orderDetails.amount || orderDetails.price || 0,
      peopleCount: orderDetails.people_count || orderDetails.quantity || orderDetails.participants || 1,
      eventDate: orderDetails.event_date || orderDetails.date || new Date().toISOString().split('T')[0],
      paymentMethod: orderDetails.payment_method || 'BOG',
      eventDetails: {
        description: orderDetails.description || orderDetails.event_description || '',
        location: orderDetails.location || orderDetails.event_location || '',
        city: orderDetails.city || orderDetails.event_city || '',
        address: orderDetails.address || orderDetails.event_address || '',
        time: orderDetails.time || orderDetails.event_time || '',
        image: orderDetails.image || orderDetails.event_image || '',
      }
    };
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService;

