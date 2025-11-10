/**
 * Yandex Taxi API Service
 * Integration with Yandex Taxi API for trip information and ordering
 * Based on: https://yandex.com/support/taxi-distr/en/api/trip-info
 */

const YANDEX_TAXI_API_BASE_URL = 'https://taxi-routeinfo.taxi.yandex.net';

class YandexTaxiService {
  constructor() {
    this.baseURL = YANDEX_TAXI_API_BASE_URL;
    this.clid = process.env.REACT_APP_YANDEX_TAXI_CLID || 'd701459e-0441-4f40-8d79-b6f08a516045';
    this.apikey = process.env.REACT_APP_YANDEX_TAXI_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045';
    this.lang = 'ka'; // Georgian language
  }

  /**
   * Get trip information from Yandex Taxi API
   * @param {Object} params - Trip parameters
   * @param {Object} params.from - Departure coordinates {lat, lng}
   * @param {Object} params.to - Destination coordinates {lat, lng}
   * @param {Array} params.classes - Fare classes ['econom', 'business', 'vip']
   * @param {Array} params.requirements - Car requirements ['nosmoking', 'childchair']
   * @returns {Promise<Object>} Trip information
   */
  async getTripInfo({ from, to, classes = ['econom'], requirements = [] }) {
    if (!from || !to) {
      throw new Error('Both departure and destination coordinates are required');
    }

    // Validate credentials according to official API documentation
    if (!this.validateCredentials()) {
      console.warn('Yandex Taxi API credentials not properly configured, using mock data');
      return this.getMockTripInfo({ from, to, classes, requirements });
    }

    // Format coordinates: {longitude},{latitude}~{longitude},{latitude}
    const rll = `${from.lng},${from.lat}~${to.lng},${to.lat}`;
    
    // Format classes and requirements according to official API specification
    const formattedClasses = this.formatClassesForAPI(classes);
    const formattedRequirements = this.formatRequirementsForAPI(requirements);

    // Build query parameters according to official Yandex Taxi API documentation
    const params = new URLSearchParams({
      clid: this.clid,
      apikey: this.apikey,
      rll: rll,
      class: formattedClasses,
      lang: this.lang
    });

    // Add requirements if specified (using official API format)
    if (formattedRequirements) {
      params.append('req', formattedRequirements);
    }

    const url = `${this.baseURL}/taxi_info?${params.toString()}`;

    // Log API request details according to official documentation
    console.log('🚕 Yandex Taxi API Request:');
    console.log('- URL:', url);
    console.log('- Method: GET');
    console.log('- Headers:', {
      'Accept': 'application/json',
      'YaTaxi-Api-Key': this.apikey
    });
    console.log('- Parameters:');
    console.log('  * clid:', this.clid);
    console.log('  * apikey:', this.apikey);
    console.log('  * rll:', rll);
    console.log('  * class:', formattedClasses);
    console.log('  * req:', formattedRequirements);
    console.log('  * lang:', this.lang);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'YaTaxi-Api-Key': this.apikey
        }
      });

      if (!response.ok) {
        // Handle official Yandex Taxi API response codes
        switch (response.status) {
          case 200:
            // Request completed successfully
            break;
          case 204:
            throw new Error('Requested region is not supported by the service');
          case 400:
            throw new Error('Request parameters were omitted or incorrect');
          case 403:
            throw new Error('Authorization error. Invalid API key or client ID values');
          case 500:
            throw new Error('Internal server error');
          default:
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Log API response details
      console.log('🚕 Yandex Taxi API Response:');
      console.log('- Status:', response.status);
      console.log('- Data:', data);
      
      return this.formatTripInfo(data);
    } catch (error) {
      console.error('Yandex Taxi API error, using mock data:', error);
      return this.getMockTripInfo({ from, to, classes, requirements });
    }
  }

  /**
   * Get pickup fee for current location only
   * @param {Object} location - Current location coordinates {lat, lng}
   * @param {Array} classes - Fare classes
   * @returns {Promise<Object>} Pickup fee information
   */
  async getPickupFee(location, classes = ['econom']) {
    if (!location) {
      throw new Error('Location coordinates are required');
    }

    // Validate credentials according to official API documentation
    if (!this.validateCredentials()) {
      console.warn('Yandex Taxi API credentials not properly configured, using mock data');
      return this.getMockPickupFee(location, classes);
    }

    // Format coordinates: {longitude},{latitude}
    const rll = `${location.lng},${location.lat}`;
    
    // Format classes according to official API specification
    const formattedClasses = this.formatClassesForAPI(classes);

    const params = new URLSearchParams({
      clid: this.clid,
      apikey: this.apikey,
      rll: rll,
      class: formattedClasses,
      lang: this.lang
    });

    const url = `${this.baseURL}/taxi_info?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'YaTaxi-Api-Key': this.apikey
        }
      });

      if (!response.ok) {
        // Handle official Yandex Taxi API response codes
        switch (response.status) {
          case 200:
            // Request completed successfully
            break;
          case 204:
            throw new Error('Requested region is not supported by the service');
          case 400:
            throw new Error('Request parameters were omitted or incorrect');
          case 403:
            throw new Error('Authorization error. Invalid API key or client ID values');
          case 500:
            throw new Error('Internal server error');
          default:
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Log API response details
      console.log('🚕 Yandex Taxi API Response:');
      console.log('- Status:', response.status);
      console.log('- Data:', data);
      
      return this.formatTripInfo(data);
    } catch (error) {
      console.error('Yandex Taxi API error, using mock data:', error);
      return this.getMockPickupFee(location, classes);
    }
  }

  /**
   * Generate mock trip information for testing
   * @param {Object} params - Trip parameters
   * @returns {Object} Mock trip information
   */
  getMockTripInfo({ from, to, classes, requirements }) {
    // Calculate approximate distance
    const distance = this.calculateDistance(from, to);
    const basePrice = Math.max(5, Math.round(distance * 0.8)); // Base price per km
    
    const mockOptions = classes.map(className => {
      let multiplier = 1;
      let classNameText = 'Economy';
      
      switch (className) {
        case 'econom':
          multiplier = 1;
          classNameText = 'Economy';
          break;
        case 'business':
          multiplier = 1.5;
          classNameText = 'Comfort';
          break;
        case 'comfortplus':
          multiplier = 1.8;
          classNameText = 'Comfort+';
          break;
        case 'minivan':
          multiplier = 2.2;
          classNameText = 'Minivan';
          break;
        case 'vip':
          multiplier = 2.5;
          classNameText = 'Business';
          break;
      }
      
      const price = Math.round(basePrice * multiplier);
      const waitingTime = Math.floor(Math.random() * 5) + 2; // 2-6 minutes
      
      return {
        className: className,
        classText: classNameText,
        classLevel: multiplier,
        minPrice: price,
        price: price,
        priceText: `${price} ₾`,
        waitingTime: waitingTime
      };
    });

    return {
      currency: 'GEL',
      distance: Math.round(distance * 1000), // in meters
      time: Math.round(distance * 2), // approximate time in minutes
      options: mockOptions
    };
  }

  /**
   * Generate mock pickup fee information
   * @param {Object} location - Location coordinates
   * @param {Array} classes - Fare classes
   * @returns {Object} Mock pickup fee information
   */
  getMockPickupFee(location, classes) {
    const mockOptions = classes.map(className => {
      let basePrice = 3;
      let classNameText = 'Economy';
      
      switch (className) {
        case 'econom':
          basePrice = 3;
          classNameText = 'Economy';
          break;
        case 'business':
          basePrice = 5;
          classNameText = 'Comfort';
          break;
        case 'comfortplus':
          basePrice = 6;
          classNameText = 'Comfort+';
          break;
        case 'minivan':
          basePrice = 8;
          classNameText = 'Minivan';
          break;
        case 'vip':
          basePrice = 10;
          classNameText = 'Business';
          break;
      }
      
      return {
        className: className,
        classText: classNameText,
        classLevel: 1,
        minPrice: basePrice,
        price: basePrice,
        priceText: `${basePrice} ₾`,
        waitingTime: Math.floor(Math.random() * 3) + 1
      };
    });

    return {
      currency: 'GEL',
      distance: 0,
      time: 0,
      options: mockOptions
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {Object} from - From coordinates {lat, lng}
   * @param {Object} to - To coordinates {lat, lng}
   * @returns {number} Distance in kilometers
   */
  calculateDistance(from, to) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format trip information for easier use
   * @param {Object} data - Raw API response
   * @returns {Object} Formatted trip information
   */
  formatTripInfo(data) {
    if (!data || !data.options) {
      return {
        currency: 'GEL',
        distance: 0,
        time: 0,
        options: []
      };
    }

    return {
      currency: data.currency || 'GEL',
      distance: data.distance || 0,
      time: data.time || 0,
      options: data.options.map(option => ({
        className: option.class_name,
        classText: option.class_text,
        classLevel: option.class_level,
        minPrice: option.min_price,
        price: option.price,
        priceText: option.price_text,
        waitingTime: option.waiting_time
      }))
    };
  }

  /**
   * Get available fare classes
   * @returns {Array} Available fare classes
   */
  getAvailableClasses() {
    return [
      { id: 'econom', name: 'Economy', description: 'ყველაზე იაფი ტარიფი' },
      { id: 'business', name: 'Comfort', description: 'კომფორტული მოგზაურობა' },
      { id: 'comfortplus', name: 'Comfort+', description: 'გაუმჯობესებული კომფორტი' },
      { id: 'minivan', name: 'Minivan', description: 'მინივენი 6-8 ადამიანისთვის' },
      { id: 'vip', name: 'Business', description: 'VIP სერვისი' }
    ];
  }

  /**
   * Get available car requirements
   * Based on official Yandex Taxi API documentation
   * @returns {Array} Available requirements
   */
  getAvailableRequirements() {
    return [
      // Official Yandex Taxi API requirements
      { id: 'yellowcarnumber', name: 'ყვითელი ნომრები', description: 'მხოლოდ ყვითელი ნომრების მანქანები' },
      { id: 'nosmoking', name: 'არ მწევს', description: 'მძღოლი არ მწევს' },
      { id: 'childchair', name: 'ბავშვის სკამი', description: 'ბავშვის სკამი მანქანაში' },
      { id: 'bicycle', name: 'ველოსიპედი', description: 'ველოსიპედის ტრანსპორტირება' },
      { id: 'conditioner', name: 'კონდიციონერი', description: 'კონდიციონერი მანქანაში' },
      { id: 'animaltransport', name: 'ცხოველები', description: 'ცხოველების ტრანსპორტირება' },
      { id: 'universal', name: 'უნივერსალი', description: 'უნივერსალური მანქანა' },
      { id: 'check', name: 'ქვითარი', description: 'გადახდის ქვითარი' },
      { id: 'ski', name: 'თხილამურები', description: 'თხილამურების ტრანსპორტირება' },
      { id: 'waiting_in_transit', name: 'შეჩერება', description: 'მოგზაურობის დროს შეჩერება' },
      { id: 'meeting_arriving', name: 'შეხვედრა', description: 'შეხვედრა ნიშნით' },
      { id: 'luggage', name: 'ბარგი', description: 'ბარგის ტრანსპორტირება' },
      // Additional accessibility and communication requirements
      { id: 'pet_transport', name: 'ცხოველების ტრანსპორტირება', description: 'შინაური ცხოველების ტრანსპორტირება' },
      { id: 'ski_snowboard', name: 'თხილამურები/სნოუბორდი', description: 'თხილამურების ან სნოუბორდის ტრანსპორტირება' },
      { id: 'text_only', name: 'მხოლოდ ტექსტი', description: 'მხოლოდ ტექსტური კომუნიკაცია' },
      { id: 'help_finding', name: 'მანქანის ძებნაში დახმარება', description: 'მანქანის პოვნაში დახმარება' },
      { id: 'wheelchair', name: 'ინვალიდის სკამი', description: 'ინვალიდის სკამის მხარდაჭერა' },
      { id: 'mute_hearing', name: 'მუნჯი, მაგრამ მესმის', description: 'მუნჯი, მაგრამ მესმის' }
    ];
  }

  /**
   * Format requirements for Yandex Taxi API
   * Maps custom requirements to official API values
   * @param {Array} requirements - Custom requirements
   * @returns {string} Comma-separated API requirements
   */
  formatRequirementsForAPI(requirements) {
    const requirementMap = {
      'pet_transport': 'animaltransport',
      'ski_snowboard': 'ski',
      'text_only': 'nosmoking', // Map to closest available
      'help_finding': 'meeting_arriving',
      'wheelchair': 'universal',
      'mute_hearing': 'nosmoking' // Map to closest available
    };

    return requirements
      .map(req => requirementMap[req] || req)
      .filter((req, index, arr) => arr.indexOf(req) === index) // Remove duplicates
      .join(',');
  }

  /**
   * Format fare classes for Yandex Taxi API
   * Ensures only valid API classes are used
   * @param {Array} classes - Fare classes
   * @returns {string} Comma-separated API classes
   */
  formatClassesForAPI(classes) {
    const validClasses = ['econom', 'business', 'comfortplus', 'minivan', 'vip'];
    return classes
      .filter(cls => validClasses.includes(cls))
      .join(',');
  }

  /**
   * Validate API credentials according to official documentation
   * @returns {boolean} True if credentials are valid
   */
  validateCredentials() {
    if (!this.clid || !this.apikey) {
      console.warn('Yandex Taxi API credentials not configured');
      return false;
    }

    if (this.clid === this.apikey) {
      console.warn('Yandex Taxi API credentials appear to be the same (using fallback)');
      return false;
    }

    return true;
  }

  /**
   * Get region information using zone-info API
   * Based on: https://yandex.com/support/taxi-distr/en/api/zone-info
   * @param {Object} location - Location coordinates {lat, lng}
   * @returns {Promise<Object>} Region information
   */
  async getRegionInfo(location) {
    if (!this.validateCredentials()) {
      throw new Error('Yandex Taxi API credentials not properly configured');
    }

    console.log('🌍 Getting region info for coordinates:', location);
    
    // Use the correct zone-info API endpoint
    const ll = `${location.lng},${location.lat}`;
    const url = `https://taxi-routeinfo.taxi.yandex.net/zone_info?clid=${this.clid}&apikey=${this.apikey}&ll=${ll}`;
    
    console.log('🔗 Zone info API URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'YaTaxi-Api-Key': this.apikey
        }
      });

      console.log('📡 Zone info API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Zone info API error:', errorText);
        throw new Error(`Region info request failed: ${response.status}, message: ${errorText}`);
      }

      const regionInfo = await response.json();
      console.log('✅ Zone info received:', regionInfo);
      
      return regionInfo;
    } catch (error) {
      console.error('❌ Error getting region info:', error);
      throw error;
    }
  }

  /**
   * Generate Yandex Taxi order URL
   * @param {Object} params - Order parameters
   * @param {Object} params.from - Departure coordinates
   * @param {Object} params.to - Destination coordinates
   * @param {string} params.class - Selected fare class
   * @param {Array} params.requirements - Selected requirements
   * @returns {string} Order URL
   */
  generateOrderUrl({ from, to, class: selectedClass = 'econom', requirements = [], ref = 'discountapp', lang = 'ka' }) {
    try {
      console.log('🔗 Generating Yandex Taxi deeplink:', { from, to, selectedClass, requirements, ref, lang });
      
      // Official Yandex Taxi deeplink format
      // Based on: https://yandex.com/support/taxi-distr/en/api/deeplinks
      const baseUrl = 'https://3.redirect.appmetrica.yandex.com/route';
      const params = new URLSearchParams();
      
      // Required parameters
      params.append('app_code', '3'); // Yandex Go app code
      params.append('appmetrica_tracking_id', '25395763362139037'); // Redirect to website
      params.append('ref', ref); // Source identifier
      params.append('lang', lang); // Language (Georgian)
      
      // Optional location parameters
      if (from && from.lat && from.lng) {
        params.append('start-lat', from.lat.toString());
        params.append('start-lon', from.lng.toString());
      }
      
      if (to && to.lat && to.lng) {
        params.append('end-lat', to.lat.toString());
        params.append('end-lon', to.lng.toString());
      }
      
      // Optional fare class parameter
      if (selectedClass) {
        params.append('tariffClass', selectedClass);
      }
      
      const deeplinkUrl = `${baseUrl}?${params.toString()}`;
      
      console.log('🔗 Generated Yandex Taxi deeplink:', deeplinkUrl);
      console.log('📋 Deeplink format: https://3.redirect.appmetrica.yandex.com/route?start-lat=lat&start-lon=lng&end-lat=lat&end-lon=lng&tariffClass=class&ref=source&appmetrica_tracking_id=id&lang=ka');
      
      return deeplinkUrl;
      
    } catch (error) {
      console.error('❌ Error generating Yandex Taxi deeplink:', error);
      
      // Fallback to simple taxi.yandex.com format
      const fallbackUrl = 'https://taxi.yandex.com/';
      console.log('🔄 Using fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
  }
}

// Create and export singleton instance
const yandexTaxiService = new YandexTaxiService();
export default yandexTaxiService;
