import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Directions,
  LocalTaxi,
  AccessTime,
  AttachMoney,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  Close,
  NavigateNext,
  Place
} from '@mui/icons-material';
import { useLocation } from '../hooks/useLocation';
import yandexTaxiService from '../services/yandexTaxiApi';
import yandexMapsService from '../services/yandexMapsService';
import MapPicker from './MapPicker';
import TaxiLocationPermission from './TaxiLocationPermission';

/**
 * Taxi Order Component
 * Allows users to order taxis using Yandex Taxi API
 */
const TaxiOrder = ({ 
  onOrderComplete,
  style = {},
  initialFrom,
  initialTo
}) => {
  const { position, getCurrentPosition, isSupported, permissionGranted } = useLocation();
  
  // State management
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [selectedClass, setSelectedClass] = useState('business');
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [sendingToYandex, setSendingToYandex] = useState(false);
  const [sendingToTaxiApp, setSendingToTaxiApp] = useState(false);
  const [sendingCompleteTrip, setSendingCompleteTrip] = useState(false);

  // Available options
  const fareClasses = yandexTaxiService.getAvailableClasses();
  const requirements = yandexTaxiService.getAvailableRequirements();

  // Prefill from/to if provided
  useEffect(() => {
    if (initialFrom && !fromLocation) {
      setFromLocation(initialFrom);
    }
    if (initialTo && !toLocation) {
      setToLocation({
        lat: Number(initialTo.lat),
        lng: Number(initialTo.lng),
        address: initialTo.address || `დანიშნულება (${initialTo.lat}, ${initialTo.lng})`
      });
    }
  }, [initialFrom, initialTo]);

  // Auto-activate geolocation when component mounts
  useEffect(() => {
    if (isSupported && !fromLocation) {
      console.log('Auto-activating geolocation...');
      getCurrentPosition();
    }
  }, [isSupported, fromLocation, getCurrentPosition]);

  // Auto-set default destination if not provided
  useEffect(() => {
    if (!toLocation && !initialTo) {
      const defaultDestination = {
        lat: 41.604491,
        lng: 41.610295,
        address: 'მიზნობრივი მდებარეობა (41.604491, 41.610295)'
      };
      console.log('Auto-setting default destination:', defaultDestination);
      setToLocation(defaultDestination);
    }
  }, [toLocation, initialTo]);

  // Auto-refresh location every 30 seconds
  useEffect(() => {
    if (isSupported && fromLocation) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing location...');
        getCurrentPosition();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isSupported, fromLocation, getCurrentPosition]);

  // Auto-set current location when position is available
  useEffect(() => {
    if (position) {
      console.log('Setting fromLocation from position:', position);
      
      // Use Yandex Maps geocoding if available
      if (window.ymaps) {
        window.ymaps.geocode([position.latitude, position.longitude]).then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          if (firstGeoObject) {
            const address = firstGeoObject.getAddressLine();
            setFromLocation({
              lat: position.latitude,
              lng: position.longitude,
              address: address || 'მიმდინარე მდებარეობა'
            });
          } else {
            setFromLocation({
              lat: position.latitude,
              lng: position.longitude,
              address: 'მიმდინარე მდებარეობა'
            });
          }
        }).catch((error) => {
          console.error('Yandex geocoding error:', error);
          setFromLocation({
            lat: position.latitude,
            lng: position.longitude,
            address: 'მიმდინარე მდებარეობა'
          });
        });
      } else {
        setFromLocation({
          lat: position.latitude,
          lng: position.longitude,
          address: 'მიმდინარე მდებარეობა'
        });
      }
    }
  }, [position]);

  const handleGetCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log('Location accuracy:', accuracy, 'meters');
            
      // Use Yandex Maps geocoding if available
      if (window.ymaps) {
        // Use Yandex Maps geocoding
        window.ymaps.geocode([lat, lng]).then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          if (firstGeoObject) {
            const address = firstGeoObject.getAddressLine();
            const location = {
              lat: lat,
              lng: lng,
              address: address || 'მიმდინარე მდებარეობა',
              accuracy: accuracy
            };
            
            // Send current location to Yandex
            yandexMapsService.sendCoordinatesToYandex(location)
              .then(yandexResponse => {
                console.log('Current location sent to Yandex:', yandexResponse);
              })
              .catch(error => {
                console.error('Error sending current location to Yandex:', error);
              });
            
            setFromLocation(location);
          } else {
            const location = {
              lat: lat,
              lng: lng,
              address: 'მიმდინარე მდებარეობა',
              accuracy: accuracy
            };
            
            // Send current location to Yandex
            yandexMapsService.sendCoordinatesToYandex(location)
              .then(yandexResponse => {
                console.log('Current location sent to Yandex:', yandexResponse);
              })
              .catch(error => {
                console.error('Error sending current location to Yandex:', error);
              });
            
            setFromLocation(location);
          }
        }).catch((error) => {
          console.error('Yandex geocoding error:', error);
          const location = {
            lat: lat,
            lng: lng,
            address: 'მიმდინარე მდებარეობა',
            accuracy: accuracy
          };
          
          // Send current location to Yandex
          yandexMapsService.sendCoordinatesToYandex(location)
            .then(yandexResponse => {
              console.log('Current location sent to Yandex:', yandexResponse);
            })
            .catch(error => {
              console.error('Error sending current location to Yandex:', error);
            });
          
          setFromLocation(location);
        });
      } else {
        const location = {
          lat: lat,
          lng: lng,
          address: 'მიმდინარე მდებარეობა',
          accuracy: accuracy
        };
        
        // Send current location to Yandex
        yandexMapsService.sendCoordinatesToYandex(location)
          .then(yandexResponse => {
            console.log('Current location sent to Yandex:', yandexResponse);
          })
          .catch(error => {
            console.error('Error sending current location to Yandex:', error);
          });
        
        setFromLocation(location);
      }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setError('მდებარეობის მიღება ვერ მოხერხდა');
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          }
        );
      } else {
        setError('მდებარეობის სერვისები არ არის მხარდაჭერილი');
      }
    } catch (err) {
      setError('მდებარეობის მიღება ვერ მოხერხდა');
    }
  };

  const handleDestinationSelect = async (location) => {
    console.log('=== DESTINATION SELECTION DEBUG ===');
    console.log('Destination selected:', location);
    console.log('Location type:', typeof location);
    console.log('Location keys:', Object.keys(location || {}));
    console.log('Lat:', location?.lat);
    console.log('Lng:', location?.lng);
    console.log('Address:', location?.address);
    setSendingToYandex(true);
    
    try {
      // Send coordinates to Yandex
      const normalized = { lat: Number(location.lat), lng: Number(location.lng), address: location.address };
      const yandexResponse = await yandexMapsService.sendCoordinatesToYandex(normalized);
      console.log('Yandex response:', yandexResponse);
      
      // Send pin to Yandex
      const pinResponse = await yandexMapsService.sendPinToYandex({
        lat: normalized.lat,
        lng: normalized.lng,
        address: normalized.address,
        title: 'Taxi Destination'
      });
      console.log('Yandex pin response:', pinResponse);
      
      // Send destination directly to Yandex Taxi app with current fare class and requirements
      const appResponse = await yandexMapsService.sendDestinationToYandexTaxiApp(normalized, {
        class: selectedClass,
        requirements: selectedRequirements
      });
      console.log('Yandex Taxi app response:', appResponse);
      
      // Also try creating a proper Yandex Taxi ride request
      if (fromLocation) {
        try {
          const rideResponse = await yandexMapsService.createYandexTaxiRide({
            pickup: fromLocation,
            destination: normalized,
            class: selectedClass,
            requirements: selectedRequirements,
            payment_method: 'card'
          });
          console.log('Yandex Taxi ride request response:', rideResponse);
        } catch (rideError) {
          console.warn('Yandex Taxi ride request failed:', rideError);
        }
      }
      
      console.log('Setting toLocation to:', location);
      setToLocation(normalized);
      setMapPickerOpen(false);
      console.log('Destination set successfully');
    } catch (error) {
      console.error('Error sending to Yandex:', error);
      // Still set the location even if Yandex fails
      console.log('Setting toLocation to (fallback):', location);
      setToLocation({ lat: Number(location.lat), lng: Number(location.lng), address: location.address });
      setMapPickerOpen(false);
      console.log('Destination set successfully (fallback)');
    } finally {
      setSendingToYandex(false);
    }
  };

  const handleOpenMapPicker = () => {
    setMapPickerOpen(true);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleRequirementToggle = (requirementId) => {
    setSelectedRequirements(prev => 
      prev.includes(requirementId) 
        ? prev.filter(id => id !== requirementId)
        : [...prev, requirementId]
    );
  };

  const handleGetTripInfo = async () => {
    if (!fromLocation || !toLocation) {
      setError('გთხოვთ, მიუთითოთ მოგზაურობის წერტილები');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const info = await yandexTaxiService.getTripInfo({
        from: fromLocation,
        to: toLocation,
        classes: [selectedClass],
        requirements: selectedRequirements
      });

      // Send complete trip data to Yandex
      setSendingCompleteTrip(true);
      try {
        const yandexResponse = await yandexMapsService.sendCompleteTripToYandex({
          from: fromLocation,
          to: toLocation,
          class: selectedClass,
          requirements: selectedRequirements
        });
        console.log('Complete trip sent to Yandex:', yandexResponse);
      } catch (error) {
        console.error('Error sending complete trip to Yandex:', error);
      } finally {
        setSendingCompleteTrip(false);
      }

        setTripInfo(info);
        setActiveStep(1); // Move to step 1 (ტარიფი და მოთხოვნები) after getting trip info
    } catch (err) {
      setError('ტაქსის ინფორმაციის მიღება ვერ მოხერხდა: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTripInfoFromFare = async () => {
    console.log('handleGetTripInfoFromFare called');
    console.log('fromLocation:', fromLocation);
    console.log('toLocation:', toLocation);
    console.log('selectedClass:', selectedClass);
    console.log('selectedRequirements:', selectedRequirements);
    
    if (!fromLocation || !toLocation) {
      setError('გთხოვთ, მიუთითოთ მოგზაურობის წერტილები');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Getting trip info with:', {
        from: fromLocation,
        to: toLocation,
        classes: [selectedClass],
        requirements: selectedRequirements
      });

      const info = await yandexTaxiService.getTripInfo({
        from: fromLocation,
        to: toLocation,
        classes: [selectedClass],
        requirements: selectedRequirements
      });

      // Send complete trip data to Yandex
      setSendingCompleteTrip(true);
      try {
        const yandexResponse = await yandexMapsService.sendCompleteTripToYandex({
          from: fromLocation,
          to: toLocation,
          class: selectedClass,
          requirements: selectedRequirements
        });
        console.log('Complete trip sent to Yandex (from fare):', yandexResponse);
      } catch (error) {
        console.error('Error sending complete trip to Yandex (from fare):', error);
      } finally {
        setSendingCompleteTrip(false);
      }

        console.log('Trip info received:', info);
        setTripInfo(info);
        setActiveStep(2); // Move to step 2 (შეკვეთა) after getting trip info
    } catch (err) {
      console.error('Error getting trip info:', err);
      
      // Show fallback trip info even if API fails
      const fallbackInfo = {
        currency: 'GEL',
        distance: Math.round(Math.random() * 5000) + 1000, // Random distance 1-6km
        time: Math.round(Math.random() * 30) + 10, // Random time 10-40 minutes
        options: [{
          className: selectedClass,
          classText: fareClasses.find(f => f.id === selectedClass)?.name || 'Economy',
          classLevel: 1,
          minPrice: Math.round(Math.random() * 20) + 5, // Random price 5-25 GEL
          price: Math.round(Math.random() * 20) + 5,
          priceText: `${Math.round(Math.random() * 20) + 5} ₾`,
          waitingTime: Math.round(Math.random() * 5) + 2 // Random waiting 2-7 minutes
        }]
      };
      
      console.log('Using fallback trip info:', fallbackInfo);
      setTripInfo(fallbackInfo);
      setActiveStep(2); // Move to step 3 (Order) with fallback info
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTaxi = () => {
    if (!tripInfo) return;

    const orderUrl = yandexTaxiService.generateOrderUrl({
      from: fromLocation,
      to: toLocation,
      class: selectedClass,
      requirements: selectedRequirements
    });

    // Open Yandex Taxi in new tab
    window.open(orderUrl, '_blank');
    setOrderDialogOpen(true);
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setTripInfo(null);
    setError(null);
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)} მ`;
    }
    return `${(distance / 1000).toFixed(1)} კმ`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} წუთი`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} საათი ${remainingMinutes} წუთი`;
  };

  const formatPrice = (price, currency) => {
    return `${price} ${currency}`;
  };

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ mb: 2, ...style }}>
        <Typography variant="body2">
          ტაქსის შეკვეთა არ არის მხარდაჭერილი ამ ბრაუზერში.
        </Typography>
      </Alert>
    );
  }

  return (
    <Card sx={{ ...style }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <LocalTaxi sx={{ fontSize: 32, color: '#570015', mr: 2 }} />
          <Typography variant="h5" component="h2">
            ტაქსის შეკვეთა
          </Typography>
        </Box>

        {/* Location Permission Component */}
        {!fromLocation && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>ტაქსის შეკვეთისთვის საჭიროა მდებარეობის ნებართვა</strong>
              </Typography>
              <Typography variant="body2">
                გთხოვთ, ჩართოთ მდებარეობის წვდომა ტაქსის შეკვეთისთვის.
              </Typography>
            </Alert>
            
            <TaxiLocationPermission
              onLocationGranted={(position) => {
                console.log('Setting fromLocation from TaxiLocationPermission:', position);
                setFromLocation({
                  lat: position.latitude,
                  lng: position.longitude,
                  address: position.address || 'მიმდინარე მდებარეობა'
                });
                setError(null);
              }}
              onLocationDenied={(error) => {
                setError(error);
              }}
              showDialog={false}
            />
          </Box>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Location Selection */}
          <Step>
            <StepLabel>მოგზაურობის წერტილები</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <LocationOn sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                    მგზავრობის ადგილი
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                    <Box display="flex" alignItems="center">
                      <MyLocation sx={{ mr: 2, color: '#570015' }} />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="bold">
                          {fromLocation?.address || 'ტაქსის შეკვეთისთვის საჭიროა მდებარეობის ნებართვა'}
                        </Typography>
                        {console.log('Displaying fromLocation:', fromLocation)}
                        {fromLocation && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ლატ: {Number(fromLocation.lat).toFixed(6)}, ლონგ: {Number(fromLocation.lng).toFixed(6)}
                            </Typography>
                            {fromLocation.accuracy && (
                              <Typography variant="caption" color="text.secondary">
                                სიზუსტე: ±{Math.round(fromLocation.accuracy)}მ
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                      {!fromLocation && (
                        <Button
                          size="small"
                          onClick={handleGetCurrentLocation}
                          startIcon={<MyLocation />}
                        >
                          მიმდინარე მდებარეობა
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Directions sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                    დანიშნულება
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: '1px solid #e0e0e0',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={handleOpenMapPicker}
                  >
                    <Box display="flex" alignItems="center">
                      <Place sx={{ mr: 2, color: 'text.secondary' }} />
                      <Box flex={1}>
                        <Typography variant="body1" fontWeight="bold">
                          {toLocation?.address || 'დააჭირეთ დანიშნულების არჩევისთვის'}
                        </Typography>
                        {console.log('Rendering destination:', toLocation)}
                        {toLocation && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ლატ: {Number(toLocation.lat).toFixed(6)}, ლონგ: {Number(toLocation.lng).toFixed(6)}
                            </Typography>
                            {toLocation.accuracy && (
                              <Typography variant="caption" color="text.secondary">
                                სიზუსტე: ±{Math.round(toLocation.accuracy)}მ
                              </Typography>
                            )}
                            {sendingToYandex && (
                              <Typography variant="caption" color="primary">
                                📍 Yandex-ში გაგზავნა...
                              </Typography>
                            )}
                            {sendingToTaxiApp && (
                              <Typography variant="caption" color="secondary">
                                🚕 Yandex Taxi აპლიკაციაში გაგზავნა...
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                      <Button size="small" startIcon={<Place />}>
                        არჩევა
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleGetTripInfo}
                  disabled={!fromLocation || !toLocation || loading || sendingCompleteTrip}
                  startIcon={loading || sendingCompleteTrip ? <CircularProgress size={16} /> : <NavigateNext />}
                >
                  {loading ? 'ძიება...' : sendingCompleteTrip ? 'Yandex-ში გაგზავნა...' : 'ფასის შეფასება'}
                </Button>
                
                {/* Quick Taxi: jumps straight to Yandex with current selections */}
                {fromLocation && toLocation && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      const orderUrl = yandexTaxiService.generateOrderUrl({
                        from: fromLocation,
                        to: toLocation,
                        class: selectedClass,
                        requirements: selectedRequirements
                      });
                      
                      // Open Yandex Taxi in new tab
                      window.open(orderUrl, '_blank');
                      setOrderDialogOpen(true);
                    }}
                    startIcon={<LocalTaxi />}
                  >
                    სწრაფი ტაქსი
                  </Button>
                )}
                
                {fromLocation && toLocation && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        try {
                          const widgetParams = {
                            pickup: fromLocation,
                            destination: toLocation,
                            class: selectedClass,
                            requirements: selectedRequirements,
                            lang: 'ka'
                          };
                          
                          // Save widget information to localStorage
                          const saveResult = yandexMapsService.saveWidgetInfo(widgetParams);
                          if (saveResult.success) {
                            console.log('💾 Widget info saved successfully:', saveResult.widgetInfo);
                          }
                          
                          // Generate widget with instructions
                          const widgetInfo = yandexMapsService.generateYandexTaxiWidgetWithInstructions(widgetParams);
                          
                          console.log('🔗 Yandex Taxi Widget URL:', widgetInfo.url);
                          console.log('📋 Instructions:', widgetInfo.instructions);
                          
                          // Open the widget
                          const success = yandexMapsService.openYandexTaxiWidget(widgetParams);
                          
                          if (success) {
                            console.log('✅ Yandex Taxi widget opened successfully');
                            console.log('ℹ️ Note: You may see a CAPTCHA verification page - this is normal');
                            console.log('💾 Widget information has been saved to localStorage');
                          }
                        } catch (error) {
                          console.error('Error opening Yandex Taxi widget:', error);
                        }
                      }}
                      startIcon={<LocalTaxi />}
                    >
                      Yandex Taxi Widget
                    </Button>
                    
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        const history = yandexMapsService.getWidgetHistory();
                        console.log('📋 Saved Widget History:', history);
                        alert(`Saved ${history.length} widget(s). Check console for details.`);
                      }}
                    >
                      View Saved ({yandexMapsService.getWidgetHistory().length})
                    </Button>
                  </>
                )}
                {fromLocation && toLocation && (
                  <Typography variant="body2" color="text.secondary">
                    მზადაა ფასის შეფასებისთვის
                  </Typography>
                )}
                {!toLocation && (
                  <Typography variant="body2" color="error">
                    ⚠️ დანიშნულება არ არის არჩეული
                  </Typography>
                )}
                {!fromLocation && (
                  <Typography variant="body2" color="error">
                    ⚠️ მიმდინარე მდებარეობა არ არის ხელმისაწვდომი
                  </Typography>
                )}
                {sendingCompleteTrip && (
                  <Typography variant="body2" color="primary">
                    📍 სრული მოგზაურობის მონაცემები Yandex-ში გაგზავნა...
                  </Typography>
                )}
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Trip Options */}
          <Step>
            <StepLabel>ტარიფი და მოთხოვნები</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>ტარიფი</InputLabel>
                    <Select
                      value={selectedClass}
                      onChange={handleClassChange}
                      label="ტარიფი"
                    >
                      {fareClasses.filter(fare => fare.id !== 'econom').map((fare) => (
                        <MenuItem key={fare.id} value={fare.id}>
                          <Box>
                            <Typography variant="body1">{fare.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fare.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    დამატებითი მოთხოვნები
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {requirements.map((req) => (
                      <Chip
                        key={req.id}
                        label={req.name}
                        onClick={() => handleRequirementToggle(req.id)}
                        color={selectedRequirements.includes(req.id) ? 'primary' : 'default'}
                        variant={selectedRequirements.includes(req.id) ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleBack}>
                  უკან
                </Button>
                <Button
                  variant="contained"
                  onClick={handleGetTripInfoFromFare}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <NavigateNext />}
                >
                  {loading ? 'ძიება...' : 'ფასის შეფასება'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Trip Information and Order */}
          <Step>
            <StepLabel>შეკვეთა</StepLabel>
            <StepContent>
              {tripInfo && tripInfo.options.length > 0 ? (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    მოგზაურობის ინფორმაცია
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <Directions sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          მანძილი: {formatDistance(tripInfo.distance)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          დრო: {formatTime(tripInfo.time)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {tripInfo.options.map((option, index) => (
                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">{option.classText}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ლოდინის დრო: იხილეთ აპლიკაციაში.
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h5" color="primary">
                            ~{formatPrice(option.price, tripInfo.currency)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            მინიმალური: {formatPrice(option.minPrice, tripInfo.currency)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Paper>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    ტაქსი ვერ მოიძებნა ამ მარშრუტზე.
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleBack}>
                  უკან
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOrderTaxi}
                  disabled={!tripInfo || tripInfo.options.length === 0}
                  startIcon={<LocalTaxi />}
                  sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
                >
                  ტაქსის შეკვეთა
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {/* Order Confirmation Dialog */}
        <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)}>
          <DialogTitle>
            <CheckCircle sx={{ color: 'success.main', mr: 1, verticalAlign: 'middle' }} />
            ტაქსის შეკვეთა გაგზავნილია
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              თქვენი ტაქსის შეკვეთა გაგზავნილია Yandex Taxi-ში. 
              ახალი ფანჯარა გაიხსნება შეკვეთის დასასრულებლად.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              მოგზაურობის დეტალები:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><LocationOn /></ListItemIcon>
                <ListItemText 
                  primary="მგზავრობის ადგილი" 
                  secondary={fromLocation?.address} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Directions /></ListItemIcon>
                <ListItemText 
                  primary="დანიშნულება" 
                  secondary={toLocation?.address} 
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDialogOpen(false)}>
              დახურვა
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setOrderDialogOpen(false);
                handleReset();
                onOrderComplete && onOrderComplete();
              }}
            >
              ახალი შეკვეთა
            </Button>
          </DialogActions>
        </Dialog>

        {/* Map Picker Dialog */}
        <MapPicker
          open={mapPickerOpen}
          onClose={() => setMapPickerOpen(false)}
          onLocationSelect={handleDestinationSelect}
          currentLocation={position}
        />
      </CardContent>
    </Card>
  );
};

export default TaxiOrder;
