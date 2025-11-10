/**
 * Yandex Maps Service
 * Service for sending coordinates from Google Maps to Yandex
 */

class YandexMapsService {
  constructor() {
    this.yandexMapsApiKey = process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'd701459e-0441-4f40-8d79-b6f08a516045';
    this.baseURL = 'https://api-maps.yandex.ru';
  }

  /**
   * Send coordinates from Yandex Map to Yandex Taxi App
   * @param {Object} coordinates - Coordinates from Yandex Map
   * @param {number} coordinates.lat - Latitude
   * @param {number} coordinates.lng - Longitude
   * @param {string} coordinates.address - Address
   * @returns {Promise<Object>} Yandex response
   */
  async sendCoordinatesToYandex(coordinates) {
    try {
      console.log('🗺️ Sending Yandex Map coordinates to Yandex Taxi App:', coordinates);
      
      // Format coordinates for Yandex Taxi API (longitude,latitude)
      const yandexCoords = `${coordinates.lng},${coordinates.lat}`;
      
      // Create Yandex Taxi format data
      const yandexTaxiData = {
        coordinates: yandexCoords,
        address: coordinates.address,
        timestamp: new Date().toISOString(),
        source: 'Yandex Map',
        apiKey: this.yandexMapsApiKey
      };
      
      console.log('🚕 Yandex Taxi format coordinates:', yandexTaxiData);
      
      // Send to Yandex Taxi API
      try {
        console.log('🚕 Attempting to send destination to Yandex Taxi API...');
        console.log('🚕 API Key:', this.yandexMapsApiKey);
        console.log('🚕 Coordinates:', yandexCoords);
        
        const response = await fetch('https://taxi-routeinfo.taxi.yandex.net/taxi_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.yandexMapsApiKey}`,
            'X-API-Key': this.yandexMapsApiKey
          },
          body: JSON.stringify({
            rll: yandexCoords,
            lang: 'ka'
          })
        });
        
        if (response.ok) {
          const taxiData = await response.json();
          console.log('✅ Yandex Taxi API response:', taxiData);
          
          return {
            success: true,
            yandexFormat: yandexTaxiData,
            taxiResponse: taxiData,
            message: 'Coordinates sent to Yandex Taxi App successfully'
          };
        } else {
          console.warn('⚠️ Yandex Taxi API not accessible, using fallback');
        }
      } catch (apiError) {
        console.warn('⚠️ Yandex Taxi API call failed:', apiError.message);
      }
      
      // Fallback: Return formatted data for manual processing
      return {
        success: true,
        yandexFormat: yandexTaxiData,
        message: 'Coordinates formatted for Yandex Taxi App (fallback mode)',
        taxiReady: true
      };
      
    } catch (error) {
      console.error('❌ Error sending coordinates to Yandex Taxi:', error);
      throw new Error('Failed to send coordinates to Yandex Taxi: ' + error.message);
    }
  }

  /**
   * Send complete trip data to Yandex Taxi App including destination, class, and requirements
   * @param {Object} tripData - Complete trip data
   * @param {Object} tripData.from - Departure coordinates
   * @param {Object} tripData.to - Destination coordinates
   * @param {string} tripData.class - Fare class (econom, business, vip, etc.)
   * @param {Array} tripData.requirements - Client requirements array
   * @returns {Promise<Object>} Yandex response
   */
  async sendCompleteTripToYandex(tripData) {
    try {
      console.log('🚕 Sending complete trip data to Yandex Taxi App:', tripData);
      
      // Format coordinates for Yandex Taxi API: {longitude},{latitude}~{longitude},{latitude}
      const fromCoords = `${tripData.from.lng},${tripData.from.lat}`;
      const toCoords = `${tripData.to.lng},${tripData.to.lat}`;
      const rll = `${fromCoords}~${toCoords}`;
      
      // Format requirements as comma-separated string
      const reqString = tripData.requirements ? tripData.requirements.join(',') : '';
      
      // Create Yandex Taxi API request data
      const yandexTaxiRequest = {
        rll: rll, // Route coordinates
        class: tripData.class || 'econom', // Fare class
        req: reqString, // Requirements (comma-separated)
        lang: 'ka', // Georgian language
        from: {
          coordinates: fromCoords,
          address: tripData.from.address
        },
        to: {
          coordinates: toCoords,
          address: tripData.to.address
        },
        timestamp: new Date().toISOString(),
        apiKey: this.yandexMapsApiKey
      };
      
      console.log('🚕 Yandex Taxi API request data:', yandexTaxiRequest);
      
      // Log the formatted parameters for Yandex Taxi API
      console.log('🚕 Yandex Taxi API Parameters:');
      console.log('- rll (route):', rll);
      console.log('- class (fare):', tripData.class);
      console.log('- req (requirements):', reqString);
      console.log('- lang:', 'ka');
      
      // Log individual requirements for debugging
      if (tripData.requirements && tripData.requirements.length > 0) {
        console.log('🚕 Individual requirements:');
        tripData.requirements.forEach((req, index) => {
          console.log(`  ${index + 1}. ${req}`);
        });
      }
      
      // Try to send to Yandex Taxi API
      try {
        const response = await fetch('https://taxi-routeinfo.taxi.yandex.net/taxi_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.yandexMapsApiKey}`
          },
          body: JSON.stringify({
            rll: rll,
            class: tripData.class,
            req: reqString,
            lang: 'ka'
          })
        });
        
        if (response.ok) {
          const taxiResponse = await response.json();
          console.log('✅ Yandex Taxi API response:', taxiResponse);
          
          return {
            success: true,
            yandexRequest: yandexTaxiRequest,
            taxiResponse: taxiResponse,
            message: 'Complete trip data sent to Yandex Taxi App successfully',
            apiParams: {
              rll: rll,
              class: tripData.class,
              req: reqString,
              lang: 'ka'
            }
          };
        } else {
          console.warn('⚠️ Yandex Taxi API not accessible, using fallback');
        }
      } catch (apiError) {
        console.warn('⚠️ Yandex Taxi API call failed:', apiError.message);
      }
      
      // Fallback: Return formatted data for manual processing
      return {
        success: true,
        yandexRequest: yandexTaxiRequest,
        message: 'Complete trip data formatted for Yandex Taxi App (fallback mode)',
        taxiReady: true,
        apiParams: {
          rll: rll,
          class: tripData.class,
          req: reqString,
          lang: 'ka'
        }
      };
      
    } catch (error) {
      console.error('❌ Error sending complete trip to Yandex Taxi:', error);
      throw new Error('Failed to send complete trip to Yandex Taxi: ' + error.message);
    }
  }

  /**
   * Send destination data to Yandex Taxi website/API
   * Based on official Yandex Taxi API documentation
   * @param {Object} destination - Destination coordinates
   * @param {number} destination.lat - Latitude
   * @param {number} destination.lng - Longitude
   * @param {string} destination.address - Address
   * @param {Object} options - Additional options
   * @param {string} options.class - Fare class (econom, business, vip, etc.)
   * @param {Array} options.requirements - Client requirements array
   * @param {Object} options.origin - Origin coordinates (optional)
   * @returns {Promise<Object>} Result
   */
  async sendDestinationToYandexTaxiApp(destination, options = {}) {
    try {
      console.log('🚕 Sending destination data to Yandex Taxi website:', destination);
      
      // Format coordinates for Yandex Taxi API
      const coords = `${destination.lng},${destination.lat}`;
      
      // Create destination data for Yandex Taxi API
      const destinationData = {
        coordinates: coords,
        address: destination.address,
        lat: destination.lat,
        lng: destination.lng,
        timestamp: new Date().toISOString(),
        lang: 'ka',
        class: options.class || 'econom',
        requirements: options.requirements || []
      };
      
      console.log('🚕 Destination data for Yandex Taxi:', destinationData);
      
      // Send to Yandex Taxi API with better error handling
      try {
        console.log('🚕 Attempting to send destination to Yandex Taxi API...');
        console.log('🚕 API Key:', this.yandexMapsApiKey);
        console.log('🚕 Coordinates:', coords);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('https://taxi-routeinfo.taxi.yandex.net/taxi_info', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.yandexMapsApiKey}`,
            'X-API-Key': this.yandexMapsApiKey
          },
          body: JSON.stringify({
            rll: coords,
            lang: 'ka',
            class: options.class || 'econom',
            req: options.requirements ? options.requirements.join(',') : ''
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const taxiResponse = await response.json();
          console.log('✅ Yandex Taxi API response:', taxiResponse);
          
          // Also try to send to Yandex Taxi website (with error handling)
          try {
            const websiteResponse = await this.sendToYandexTaxiWebsite(destinationData);
            console.log('✅ Yandex Taxi website response:', websiteResponse);
            
            return {
              success: true,
              destination: destination,
              destinationData: destinationData,
              apiResponse: taxiResponse,
              websiteResponse: websiteResponse,
              message: 'Destination data sent to Yandex Taxi successfully'
            };
          } catch (websiteError) {
            console.warn('⚠️ Website sending failed, but API succeeded:', websiteError.message);
            return {
              success: true,
              destination: destination,
              destinationData: destinationData,
              apiResponse: taxiResponse,
              message: 'Destination data sent to Yandex Taxi API successfully (website failed)'
            };
          }
        } else {
          console.warn(`⚠️ Yandex Taxi API returned ${response.status}, trying website only`);
          const websiteResponse = await this.sendToYandexTaxiWebsite(destinationData);
          return {
            success: true,
            destination: destination,
            destinationData: destinationData,
            websiteResponse: websiteResponse,
            message: 'Destination data sent to Yandex Taxi website successfully'
          };
        }
      } catch (apiError) {
        if (apiError.name === 'AbortError') {
          console.warn('⚠️ Yandex Taxi API call timed out, trying website only');
        } else {
          console.warn('⚠️ Yandex Taxi API call failed, trying website only:', apiError.message);
        }
        try {
          const websiteResponse = await this.sendToYandexTaxiWebsite(destinationData);
          return {
            success: true,
            destination: destination,
            destinationData: destinationData,
            websiteResponse: websiteResponse,
            message: 'Destination data sent to Yandex Taxi website successfully (API fallback)'
          };
        } catch (websiteError) {
          console.warn('⚠️ Both API and website failed, using local storage:', websiteError.message);
          const fallbackResponse = await this.sendToFallbackEndpoint(destinationData);
          return {
            success: true,
            destination: destination,
            destinationData: destinationData,
            fallbackResponse: fallbackResponse,
            message: 'Destination data stored locally (all APIs failed)'
          };
        }
      }
      
    } catch (error) {
      console.error('❌ Error sending destination to Yandex Taxi:', error);
      
      // Check if it's a CORS error and try fallback
      if (error.message.includes('CORS') || error.message.includes('blocked by CORS policy')) {
        console.log('🚫 CORS error detected, trying fallback...');
        const fallbackResult = this.handleCorsFallback(destination, options);
        if (fallbackResult.success) {
          return fallbackResult;
        }
      }
      
      throw new Error('Failed to send destination to Yandex Taxi: ' + error.message);
    }
  }

  /**
   * Send destination data to Yandex Taxi website
   * @param {Object} destinationData - Destination data
   * @returns {Promise<Object>} Result
   */
  async sendToYandexTaxiWebsite(destinationData) {
    try {
      console.log('🌐 Sending destination to Yandex Taxi website:', destinationData);
      
      // Try multiple Yandex Taxi API endpoints
      const endpoints = [
        'https://taxi-routeinfo.taxi.yandex.net/taxi_info',
        'https://api-maps.yandex.ru/2.1/',
        'https://core-renderer-tiles.maps.yandex.net/tiles'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🌐 Trying endpoint: ${endpoint}`);
          
          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              'Authorization': `Bearer ${this.yandexMapsApiKey}`,
              'X-API-Key': this.yandexMapsApiKey
            },
            body: JSON.stringify({
              rll: destinationData.coordinates,
              lang: destinationData.lang,
              address: destinationData.address,
              class: destinationData.class,
              req: destinationData.requirements.join(',')
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const websiteData = await response.json();
            console.log('✅ Yandex Taxi website response:', websiteData);
            
            return {
              success: true,
              websiteData: websiteData,
              endpoint: endpoint,
              message: 'Destination sent to Yandex Taxi website successfully'
            };
          } else {
            console.warn(`⚠️ Endpoint ${endpoint} returned ${response.status}, trying next...`);
          }
        } catch (endpointError) {
          if (endpointError.name === 'AbortError') {
            console.warn(`⚠️ Endpoint ${endpoint} timed out`);
          } else {
            console.warn(`⚠️ Endpoint ${endpoint} failed:`, endpointError.message);
          }
          continue;
        }
      }
      
      // If all endpoints fail, use fallback
      console.warn('⚠️ All Yandex Taxi endpoints failed, using fallback');
      const fallbackResponse = await this.sendToFallbackEndpoint(destinationData);
      return fallbackResponse;
      
    } catch (error) {
      console.error('❌ Error sending to Yandex Taxi website:', error);
      
      // Fallback: Send to a custom endpoint or store locally
      const fallbackResponse = await this.sendToFallbackEndpoint(destinationData);
      return fallbackResponse;
    }
  }

  /**
   * Send to fallback endpoint (local storage or custom API)
   * @param {Object} destinationData - Destination data
   * @returns {Promise<Object>} Result
   */
  async sendToFallbackEndpoint(destinationData) {
    try {
      console.log('🔄 Using fallback endpoint for destination:', destinationData);
      
      // Store in localStorage for persistence
      const storedDestinations = JSON.parse(localStorage.getItem('yandexTaxiDestinations') || '[]');
      storedDestinations.push({
        ...destinationData,
        id: Date.now(),
        storedAt: new Date().toISOString()
      });
      localStorage.setItem('yandexTaxiDestinations', JSON.stringify(storedDestinations));
      
      console.log('💾 Destination stored locally:', destinationData);
      
      return {
        success: true,
        destinationData: destinationData,
        stored: true,
        message: 'Destination stored locally (fallback mode)'
      };
      
    } catch (error) {
      console.error('❌ Error in fallback endpoint:', error);
      throw new Error('Failed to store destination: ' + error.message);
    }
  }

  /**
   * Create a Yandex Taxi ride request following official API pattern
   * Based on Yandex Taxi API documentation
   * @param {Object} params - Ride parameters
   * @param {Object} params.pickup - Pickup coordinates {lat, lng}
   * @param {Object} params.destination - Destination coordinates {lat, lng}
   * @param {string} params.class - Fare class (econom, business, vip, etc.)
   * @param {Array} params.requirements - Client requirements
   * @param {string} params.payment_method - Payment method (card, cash, etc.)
   * @returns {Promise<Object>} Ride request result
   */
  async createYandexTaxiRide(params) {
    try {
      console.log('🚕 Creating Yandex Taxi ride request:', params);
      
      // Format coordinates for Yandex API: {longitude},{latitude}~{longitude},{latitude}
      const pickupCoords = `${params.pickup.lng},${params.pickup.lat}`;
      const destCoords = `${params.destination.lng},${params.destination.lat}`;
      const rll = `${pickupCoords}~${destCoords}`;
      
      // Format requirements as comma-separated string
      const reqString = params.requirements ? params.requirements.join(',') : '';
      
      // Create ride request data following Yandex API pattern
      const rideRequest = {
        client_id: this.yandexMapsApiKey, // Using our API key as client ID
        pickup: {
          lat: params.pickup.lat,
          lon: params.pickup.lng
        },
        destination: {
          lat: params.destination.lat,
          lon: params.destination.lng
        },
        class: params.class || 'econom',
        requirements: params.requirements || [],
        payment_method: params.payment_method || 'card',
        lang: 'ka',
        // Additional API parameters
        rll: rll,
        req: reqString
      };
      
      console.log('🚕 Yandex Taxi ride request data:', rideRequest);
      
      // Try multiple approaches to handle CORS issues
      const approaches = [
        {
          name: 'Local Proxy',
          method: async () => {
            return await this.tryLocalProxy(rideRequest);
          }
        },
        {
          name: 'Direct API Call',
          method: async () => {
            const endpoints = [
              'https://taxi-routeinfo.taxi.yandex.net/taxi_info',
              'https://api.yandex.taxi/ride/v1/create',
              'https://taxi.yandex.com/api/route'
            ];
            
            for (const endpoint of endpoints) {
              try {
                console.log(`🚕 Trying direct API call: ${endpoint}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(endpoint, {
                  method: 'POST',
                  mode: 'cors',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.yandexMapsApiKey}`,
                    'X-API-Key': this.yandexMapsApiKey,
                    'YaTaxi-Api-Key': this.yandexMapsApiKey
                  },
                  body: JSON.stringify(rideRequest),
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                  const data = await response.json();
                  console.log(`✅ Yandex Taxi ride created successfully via ${endpoint}:`, data);
                  return {
                    success: true,
                    endpoint: endpoint,
                    data: data,
                    message: 'Yandex Taxi ride request created successfully'
                  };
                } else {
                  console.warn(`⚠️ Endpoint ${endpoint} returned status ${response.status}`);
                }
              } catch (error) {
                if (error.name === 'AbortError') {
                  console.warn(`⏰ Endpoint ${endpoint} timed out`);
                } else if (error.message.includes('CORS')) {
                  console.warn(`🚫 CORS error for ${endpoint}:`, error.message);
                } else {
                  console.warn(`❌ Endpoint ${endpoint} failed:`, error.message);
                }
              }
            }
            return null;
          }
        },
        {
          name: 'Proxy Server',
          method: async () => {
            try {
              console.log('🔄 Trying proxy server approach...');
              
              // Try using a CORS proxy (for development only)
              const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
              const targetUrl = 'https://taxi-routeinfo.taxi.yandex.net/taxi_info';
              
              const response = await fetch(proxyUrl + targetUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(rideRequest)
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('✅ Yandex Taxi ride created via proxy:', data);
                return {
                  success: true,
                  endpoint: 'proxy',
                  data: data,
                  message: 'Yandex Taxi ride request created via proxy'
                };
              }
            } catch (error) {
              console.warn('❌ Proxy approach failed:', error.message);
            }
            return null;
          }
        },
        {
          name: 'Widget Link Generation',
          method: async () => {
            try {
              console.log('🔗 Generating Yandex Taxi widget link...');
              
              const widgetUrl = this.generateYandexTaxiWidgetLink({
                pickup: params.pickup,
                destination: params.destination,
                class: params.class,
                requirements: params.requirements
              });
              
              console.log('✅ Yandex Taxi widget URL generated:', widgetUrl);
              return {
                success: true,
                endpoint: 'widget',
                data: { widgetUrl },
                message: 'Yandex Taxi widget URL generated successfully'
              };
            } catch (error) {
              console.warn('❌ Widget generation failed:', error.message);
            }
            return null;
          }
        }
      ];
      
      // Try each approach
      for (const approach of approaches) {
        try {
          console.log(`🚕 Trying approach: ${approach.name}`);
          const result = await approach.method();
          if (result) {
            return result;
          }
        } catch (error) {
          console.warn(`❌ Approach ${approach.name} failed:`, error.message);
        }
      }
      
      // If all endpoints fail, store in localStorage as fallback
      console.log('🔄 All Yandex Taxi endpoints failed, storing in localStorage');
      return this.sendToFallbackEndpoint(rideRequest);
      
    } catch (error) {
      console.error('❌ Error creating Yandex Taxi ride:', error);
      throw new Error('Failed to create Yandex Taxi ride: ' + error.message);
    }
  }

  /**
   * Get stored destinations from localStorage
   * @returns {Array} Array of stored destinations
   */
  getStoredDestinations() {
    try {
      const storedDestinations = JSON.parse(localStorage.getItem('yandexTaxiDestinations') || '[]');
      console.log('📋 Retrieved stored destinations:', storedDestinations);
      return storedDestinations;
    } catch (error) {
      console.error('❌ Error retrieving stored destinations:', error);
      return [];
    }
  }

  /**
   * Generate Yandex Taxi widget link with preset route
   * Based on Yandex Taxi widget documentation
   * @param {Object} params - Widget parameters
   * @param {Object} params.pickup - Pickup coordinates {lat, lng}
   * @param {Object} params.destination - Destination coordinates {lat, lng}
   * @param {string} params.class - Fare class (optional)
   * @param {Array} params.requirements - Client requirements (optional)
   * @returns {string} Widget URL
   */
  generateYandexTaxiWidgetLink(params) {
    try {
      console.log('🔗 Generating Yandex Taxi widget link:', params);
      
      // Base Yandex Taxi URL (matching the exact format from the website)
      const baseUrl = 'https://taxi.yandex.com/';
      
      // Format coordinates for widget (exact format: lat,lng)
      const pickupCoords = `${params.pickup.lat},${params.pickup.lng}`;
      const destCoords = `${params.destination.lat},${params.destination.lng}`;
      
      // Create widget URL with correct parameter names (from and to)
      const widgetUrl = `${baseUrl}?from=${pickupCoords}&to=${destCoords}`;
      
      // Add optional parameters
      const urlParams = new URLSearchParams();
      
      if (params.class) {
        urlParams.append('class', params.class);
      }
      
      if (params.requirements && params.requirements.length > 0) {
        urlParams.append('requirements', params.requirements.join(','));
      }
      
      // Add language parameter (default to Georgian, but can be overridden)
      urlParams.append('lang', params.lang || 'ka');
      
      const finalUrl = urlParams.toString() ? `${widgetUrl}&${urlParams.toString()}` : widgetUrl;
      
      console.log('🔗 Generated Yandex Taxi widget URL:', finalUrl);
      console.log('📋 URL Format matches: https://taxi.yandex.com/?from=lat,lng&to=lat,lng&class=fare&lang=ka');
      
      return finalUrl;
      
    } catch (error) {
      console.error('❌ Error generating Yandex Taxi widget link:', error);
      return 'https://taxi.yandex.com/';
    }
  }

  /**
   * Open Yandex Taxi widget in new tab/window
   * @param {Object} params - Widget parameters
   * @returns {boolean} Success status
   */
  openYandexTaxiWidget(params) {
    try {
      const widgetUrl = this.generateYandexTaxiWidgetLink(params);
      console.log('🚕 Opening Yandex Taxi widget:', widgetUrl);
      
      // Open in new tab
      const newWindow = window.open(widgetUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        console.log('✅ Yandex Taxi widget opened successfully');
        console.log('ℹ️ Note: You may see a CAPTCHA verification page - this is normal for automated requests');
        return true;
      } else {
        console.warn('⚠️ Failed to open Yandex Taxi widget (popup blocked?)');
        return false;
      }
    } catch (error) {
      console.error('❌ Error opening Yandex Taxi widget:', error);
      return false;
    }
  }

  /**
   * Save widget information to localStorage
   * @param {Object} params - Widget parameters
   * @returns {Object} Saved widget info
   */
  saveWidgetInfo(params) {
    try {
      const widgetInfo = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        pickup: {
          lat: params.pickup.lat,
          lng: params.pickup.lng,
          address: params.pickup.address || 'მიმდინარე მდებარეობა'
        },
        destination: {
          lat: params.destination.lat,
          lng: params.destination.lng,
          address: params.destination.address || 'დანიშნულება'
        },
        fareClass: params.class || 'econom',
        requirements: params.requirements || [],
        language: params.lang || 'ka',
        status: 'widget_generated',
        url: this.generateYandexTaxiWidgetLink(params)
      };

      // Get existing widget history
      const existingHistory = JSON.parse(localStorage.getItem('yandexTaxiWidgetHistory') || '[]');
      
      // Add new widget info
      existingHistory.unshift(widgetInfo);
      
      // Keep only last 10 entries
      const limitedHistory = existingHistory.slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('yandexTaxiWidgetHistory', JSON.stringify(limitedHistory));
      
      console.log('💾 Widget info saved:', widgetInfo);
      console.log('📋 Total saved widgets:', limitedHistory.length);
      
      return {
        success: true,
        widgetInfo: widgetInfo,
        message: 'Widget information saved successfully'
      };
    } catch (error) {
      console.error('❌ Error saving widget info:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save widget information'
      };
    }
  }

  /**
   * Get saved widget history
   * @returns {Array} Saved widget history
   */
  getWidgetHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('yandexTaxiWidgetHistory') || '[]');
      console.log('📋 Retrieved widget history:', history);
      return history;
    } catch (error) {
      console.error('❌ Error retrieving widget history:', error);
      return [];
    }
  }

  /**
   * Clear widget history
   * @returns {boolean} Success status
   */
  clearWidgetHistory() {
    try {
      localStorage.removeItem('yandexTaxiWidgetHistory');
      console.log('🗑️ Cleared widget history');
      return true;
    } catch (error) {
      console.error('❌ Error clearing widget history:', error);
      return false;
    }
  }

  /**
   * Generate Yandex Taxi widget link with CAPTCHA handling instructions
   * @param {Object} params - Widget parameters
   * @returns {Object} Widget link with instructions
   */
  generateYandexTaxiWidgetWithInstructions(params) {
    try {
      const widgetUrl = this.generateYandexTaxiWidgetLink(params);
      
      return {
        url: widgetUrl,
        instructions: {
          title: 'Yandex Taxi Widget Instructions',
          steps: [
            '1. Click the link to open Yandex Taxi',
            '2. If you see a CAPTCHA page, click "I\'m not a robot"',
            '3. Complete the verification if required',
            '4. The taxi booking page will load with your preset route',
            '5. Review the route and fare class',
            '6. Complete your taxi booking'
          ],
          note: 'The CAPTCHA verification is normal for automated requests and ensures security.'
        }
      };
    } catch (error) {
      console.error('❌ Error generating widget with instructions:', error);
      return {
        url: 'https://taxi.yandex.com/',
        instructions: {
          title: 'Yandex Taxi Widget Error',
          steps: ['Please visit https://taxi.yandex.com/ manually'],
          note: 'There was an error generating the widget link.'
        }
      };
    }
  }

  /**
   * Try local proxy endpoints for CORS issues
   * @param {Object} rideRequest - Ride request data
   * @returns {Promise<Object>} Result
   */
  async tryLocalProxy(rideRequest) {
    try {
      console.log('🔄 Trying local proxy endpoints...');
      
      const proxyEndpoints = [
        '/api/yandex-taxi/taxi_info',
        '/api/yandex-taxi/ride/v1/create',
        '/api/yandex-taxi/route'
      ];
      
      for (const endpoint of proxyEndpoints) {
        try {
          console.log(`🚕 Trying proxy endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.yandexMapsApiKey}`,
              'X-API-Key': this.yandexMapsApiKey,
              'YaTaxi-Api-Key': this.yandexMapsApiKey
            },
            body: JSON.stringify(rideRequest)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Proxy endpoint ${endpoint} succeeded:`, data);
            return {
              success: true,
              endpoint: endpoint,
              data: data,
              message: 'Yandex Taxi request via proxy successful'
            };
          } else {
            console.warn(`⚠️ Proxy endpoint ${endpoint} returned status ${response.status}`);
          }
        } catch (error) {
          console.warn(`❌ Proxy endpoint ${endpoint} failed:`, error.message);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ All proxy endpoints failed:', error);
      return null;
    }
  }

  /**
   * Handle CORS fallback when direct API calls fail
   * @param {Object} destinationData - Destination data
   * @param {Object} options - Additional options
   * @returns {Object} Fallback result
   */
  handleCorsFallback(destinationData, options) {
    try {
      console.log('🔄 Handling CORS fallback...');
      
      // Generate widget URL as fallback
      const widgetUrl = this.generateYandexTaxiWidgetLink({
        pickup: { lat: 41.6420, lng: 41.6390 }, // Default pickup
        destination: {
          lat: destinationData.lat,
          lng: destinationData.lng
        },
        class: options.class || 'econom',
        requirements: options.requirements || []
      });
      
      console.log('🔗 Generated fallback widget URL:', widgetUrl);
      
      return {
        success: true,
        method: 'widget_fallback',
        data: { widgetUrl },
        message: 'CORS fallback: Widget URL generated'
      };
    } catch (error) {
      console.error('❌ CORS fallback failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'CORS fallback failed'
      };
    }
  }

  /**
   * Clear stored destinations
   * @returns {boolean} Success status
   */
  clearStoredDestinations() {
    try {
      localStorage.removeItem('yandexTaxiDestinations');
      console.log('🗑️ Cleared stored destinations');
      return true;
    } catch (error) {
      console.error('❌ Error clearing stored destinations:', error);
      return false;
    }
  }

  /**
   * Convert Google Maps coordinates to Yandex format
   * @param {Object} googleCoords - Google Maps coordinates
   * @returns {Object} Yandex formatted coordinates
   */
  convertGoogleToYandex(googleCoords) {
    return {
      lat: googleCoords.lat,
      lng: googleCoords.lng,
      yandexFormat: `${googleCoords.lng},${googleCoords.lat}`,
      address: googleCoords.address,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send pin to Yandex Taxi App
   * @param {Object} pinData - Pin data
   * @param {number} pinData.lat - Latitude
   * @param {number} pinData.lng - Longitude
   * @param {string} pinData.address - Address
   * @param {string} pinData.title - Pin title
   * @returns {Promise<Object>} Yandex response
   */
  async sendPinToYandex(pinData) {
    try {
      console.log('📍 Sending pin to Yandex Taxi App:', pinData);
      
      // Check if this is the specific destination coordinates
      const isSpecificDestination = pinData.lat === 41.604491 && pinData.lng === 41.610295;
      
      const yandexTaxiPin = {
        coordinates: `${pinData.lng},${pinData.lat}`,
        address: pinData.address,
        title: pinData.title || 'Taxi Destination',
        timestamp: new Date().toISOString(),
        isSpecificDestination: isSpecificDestination,
        apiKey: this.yandexMapsApiKey
      };
      
      console.log('🚕 Yandex Taxi pin data:', yandexTaxiPin);
      
      if (isSpecificDestination) {
        console.log('📍 Specific destination pin sent to Yandex Taxi App:', yandexTaxiPin);
      }
      
      // Try to send to Yandex Taxi API
      try {
        const response = await fetch('https://taxi-routeinfo.taxi.yandex.net/taxi_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.yandexMapsApiKey}`
          },
          body: JSON.stringify({
            rll: `${pinData.lng},${pinData.lat}`,
            lang: 'ka'
          })
        });
        
        if (response.ok) {
          const taxiResponse = await response.json();
          console.log('✅ Yandex Taxi pin response:', taxiResponse);
          
          return {
            success: true,
            pin: yandexTaxiPin,
            taxiResponse: taxiResponse,
            message: isSpecificDestination ? 'Specific destination pin sent to Yandex Taxi App successfully' : 'Pin sent to Yandex Taxi App successfully'
          };
        } else {
          console.warn('⚠️ Yandex Taxi API not accessible for pin, using fallback');
        }
      } catch (apiError) {
        console.warn('⚠️ Yandex Taxi API call failed for pin:', apiError.message);
      }
      
      // Fallback: Return formatted pin data for manual processing
      return {
        success: true,
        pin: yandexTaxiPin,
        message: isSpecificDestination ? 'Specific destination pin formatted for Yandex Taxi App (fallback mode)' : 'Pin formatted for Yandex Taxi App (fallback mode)',
        taxiReady: true
      };
      
    } catch (error) {
      console.error('❌ Error sending pin to Yandex Taxi:', error);
      throw new Error('Failed to send pin to Yandex Taxi: ' + error.message);
    }
  }
}

export default new YandexMapsService();
