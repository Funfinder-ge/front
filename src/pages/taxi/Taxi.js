import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  LocalTaxi,
  LocationOn,
  Directions,
  AccessTime,
  AttachMoney,
  MyLocation,
  Refresh
} from '@mui/icons-material';
import { useLocation } from '../../hooks/useLocation';
import TaxiOrder from '../../components/TaxiOrder';
import yandexTaxiService from '../../services/yandexTaxiApi';

/**
 * Taxi Page Component
 * Comprehensive taxi ordering and information page
 */
const Taxi = () => {
  const { position, getCurrentPosition, isSupported } = useLocation();
  const [pickupInfo, setPickupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get pickup fee when position is available
  useEffect(() => {
    if (position) {
      getPickupFee();
    }
  }, [position]);

  const getPickupFee = async () => {
    if (!position) return;

    setLoading(true);
    setError(null);

    try {
      const info = await yandexTaxiService.getPickupFee({
        lat: position.latitude,
        lng: position.longitude
      });
      setPickupInfo(info);
    } catch (err) {
      setError('ტაქსის ინფორმაციის მიღება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    getPickupFee();
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

  const fareClasses = yandexTaxiService.getAvailableClasses();
  const requirements = yandexTaxiService.getAvailableRequirements();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <LocalTaxi sx={{ fontSize: 64, color: '#570015', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          ტაქსის შეკვეთა
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          მოგზაურეთ კომფორტულად Yandex Taxi-ით
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Taxi Order Component */}
        <Grid item xs={12} lg={8}>
          <TaxiOrder 
            onOrderComplete={() => {
              console.log('Taxi order completed');
            }}
          />
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} lg={4}>
          {/* Current Location Info */}
          {position && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <MyLocation sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                  მიმდინარე მდებარეობა
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  ლატიტუდა: {position.latitude.toFixed(6)}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  ლონგიტუდა: {position.longitude.toFixed(6)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  სიზუსტე: ±{Math.round(position.accuracy)} მ
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Pickup Fee Information */}
          {position && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    <AttachMoney sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                    მიღების ღირებულება
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleRefresh}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                  >
                    განახლება
                  </Button>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : pickupInfo && pickupInfo.options.length > 0 ? (
                  <Box>
                    {pickupInfo.options.map((option, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {option.classText}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ლოდინი: {formatTime(option.waitingTime)}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {option.priceText}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    ტაქსი ვერ მოიძებნა ამ მდებარეობაზე
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Available Fare Classes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ხელმისაწვდომი ტარიფები
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {fareClasses.map((fare) => (
                  <Box key={fare.id} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {fare.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fare.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Available Requirements */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                დამატებითი მოთხოვნები
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requirements.slice(0, 6).map((req) => (
                  <Chip
                    key={req.id}
                    label={req.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                და სხვა {requirements.length - 6} მოთხოვნა...
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Information Section */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h5" gutterBottom align="center" fontWeight={700}>
            როგორ მუშაობს ტაქსის შეკვეთა?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <LocationOn sx={{ fontSize: 48, color: '#570015', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  1. მდებარეობის მითითება
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  მიუთითეთ მგზავრობის ადგილი და დანიშნულება
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Directions sx={{ fontSize: 48, color: '#570015', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  2. ტარიფის არჩევა
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  აირჩიეთ სასურველი ტარიფი და დამატებითი მოთხოვნები
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <LocalTaxi sx={{ fontSize: 48, color: '#570015', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  3. ტაქსის შეკვეთა
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  შეუკვეთეთ ტაქსი Yandex Taxi-ში
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Features Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center" fontWeight={700}>
          ჩვენი უპირატესობები
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <AccessTime sx={{ fontSize: 40, color: '#570015', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                სწრაფი მიღება
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ტაქსი მოვა რამდენიმე წუთში
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <AttachMoney sx={{ fontSize: 40, color: '#570015', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                გამჭვირვალე ფასები
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ფასი ცნობილია წინასწარ
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Directions sx={{ fontSize: 40, color: '#570015', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                უსაფრთხო მოგზაურობა
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ყველა მძღოლი გადამოწმებულია
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <LocalTaxi sx={{ fontSize: 40, color: '#570015', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                24/7 მომსახურება
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ტაქსი ხელმისაწვდომია ყოველთვის
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Taxi;
