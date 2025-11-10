const API_BASE_URL = 'https://base.funfinder.ge/api/v3';

// API configuration
const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API service class
class ApiService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.headers = apiConfig.headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.headers,
      credentials: 'include', // Include cookies for session-based auth
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} ${response.statusText} for ${url}`);
        
        // Handle specific error cases
        if (response.status === 404) {
          console.warn(`⚠️ Endpoint not found: ${url}`);
          // Return empty data instead of throwing error for 404s
          return [];
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Success: ${url}`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // For network errors or 404s, return empty array instead of throwing
      if (error.message.includes('404') || error.name === 'TypeError') {
        console.warn('🔄 Returning empty array due to API error');
        return [];
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API service instance
const apiService = new ApiService();

// Check if API server is available
export const checkApiHealth = async () => {
  try {
    console.log('🏥 Checking API health...');
    const response = await fetch(`${API_BASE_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ API server is healthy');
      return true;
    } else {
      console.warn(`⚠️ API server returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ API server is not available:', error);
    return false;
  }
};

// Specific API endpoints
export const cityApi = {
  getAll: () => apiService.get('/city/all/'),
  getById: (id) => apiService.get(`/city/${id}/`),
  create: (data) => apiService.post('/city/', data),
  update: (id, data) => apiService.put(`/city/${id}/`, data),
  delete: (id) => apiService.delete(`/city/${id}/`),
};

export const categoryApi = {
  getAll: () => apiService.get('/category/all/'),
  getById: (id) => apiService.get(`/category/${id}/`),
  create: (data) => apiService.post('/category/', data),
  update: (id, data) => apiService.put(`/category/${id}/`, data),
  delete: (id) => apiService.delete(`/category/${id}/`),
};

export const serviceApi = {
  getAll: () => apiService.get('/service/'),
  getById: (id) => apiService.get(`/service/${id}/`),
  create: (data) => apiService.post('/service/', data),
  update: (id, data) => apiService.put(`/service/${id}/`, data),
  delete: (id) => apiService.delete(`/service/${id}/`),
  // Location-based endpoints
  getNearby: (lat, lng, radius = 10) => apiService.get(`/service/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`),
  getByLocation: (lat, lng) => apiService.get(`/service/location/?lat=${lat}&lng=${lng}`),
};

export const eventsApi = {
  getAll: async () => {
    try {
      const response = await apiService.get('/event/feed');
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.results && Array.isArray(response.results)) {
        return response.results;
      } else if (response?.events && Array.isArray(response.events)) {
        return response.events;
      }
      
      console.warn('Unexpected response structure from /event/feed:', response);
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
  getById: (id) => apiService.get(`/events/${id}/`),
  getByCategory: (category) => apiService.get(`/events/all/?category=${category}`),
  getFeed: async () => {
    try {
      const response = await apiService.get('/event/feed');
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.results && Array.isArray(response.results)) {
        return response.results;
      } else if (response?.events && Array.isArray(response.events)) {
        return response.events;
      }
      
      console.warn('Unexpected response structure from /event/feed:', response);
      return [];
    } catch (error) {
      console.error('Error fetching event feed:', error);
      return [];
    }
  },
  getDetails: (id) => apiService.get(`/event/details/${id}`),
  create: (data) => apiService.post('/events/', data),
  update: (id, data) => apiService.put(`/events/${id}/`, data),
  delete: (id) => apiService.delete(`/events/${id}/`),
  // Location-based endpoints with fallbacks
  getNearby: async (lat, lng, radius = 10) => {
    try {
      // Try primary endpoint
      return await apiService.get(`/events/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    } catch (error) {
      console.warn('Primary nearby events endpoint failed, trying alternatives...');
      
      try {
        // Try alternative endpoint
        return await apiService.get(`/event/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
      } catch (error2) {
        console.warn('Alternative nearby events endpoint failed, trying feed...');
        
        try {
          // Fallback to general feed
          return await apiService.get('/event/feed');
        } catch (error3) {
          console.warn('All nearby events endpoints failed, returning empty array');
          return [];
        }
      }
    }
  },
  getByLocation: async (lat, lng) => {
    try {
      return await apiService.get(`/events/location/?lat=${lat}&lng=${lng}`);
    } catch (error) {
      console.warn('Location-based events endpoint failed, trying nearby...');
      return await eventsApi.getNearby(lat, lng);
    }
  },
  // Popular events from localhost
  getPopular: async () => {
    try {
      const url = 'https://base.funfinder.ge/en/api/v3/event/feed/popular';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Popular events endpoint returned ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data?.events && Array.isArray(data.events)) {
        return data.events;
      }
      
      console.warn('Unexpected response structure from /event/feed/popular:', data);
      return [];
    } catch (error) {
      console.error('Error fetching popular events:', error);
      return [];
    }
  },
  // Featured events from localhost
  getFeatured: async () => {
    try {
      const url = 'https://base.funfinder.ge/en/api/v3/event/feed/featured';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Featured events endpoint returned ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data?.events && Array.isArray(data.events)) {
        return data.events;
      }
      
      console.warn('Unexpected response structure from /event/feed/featured:', data);
      return [];
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }
  },
};

// Slider API endpoints
export const sliderApi = {
  // Get all sliders from v3 feed endpoint
  getAll: async () => {
    try {
      const url = 'https://base.funfinder.ge/en/api/v3/slider/feed';
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Slider feed endpoint returned ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data?.results && Array.isArray(data.results)) {
        return data.results;
      }
      
      console.warn('Unexpected response structure from /slider/feed:', data);
      return [];
    } catch (error) {
      console.error('Error fetching sliders:', error);
      return [];
    }
  },
};

// Export the main API service for custom requests
export default apiService; 