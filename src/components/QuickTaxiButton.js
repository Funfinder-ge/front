import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalTaxi,
  Close,
  MyLocation
} from '@mui/icons-material';
import { useLocation } from '../hooks/useLocation';
import yandexTaxiService from '../services/yandexTaxiApi';

/**
 * Quick Taxi Button Component
 * Floating action button for quick taxi ordering
 */
const QuickTaxiButton = ({ 
  position = 'bottom-right',
  style = {} 
}) => {
  const { position: userPosition, getCurrentPosition } = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickupInfo, setPickupInfo] = useState(null);

  const handleTaxiClick = async () => {
    setDialogOpen(true);
    
    if (userPosition) {
      await getPickupFee();
    }
  };

  const getPickupFee = async () => {
    if (!userPosition) return;

    setLoading(true);
    try {
      const info = await yandexTaxiService.getPickupFee({
        lat: userPosition.latitude,
        lng: userPosition.longitude
      });
      setPickupInfo(info);
    } catch (error) {
      console.error('Error getting pickup fee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTaxi = () => {
    if (!userPosition) return;

    const orderUrl = yandexTaxiService.generateOrderUrl({
      from: {
        lat: userPosition.latitude,
        lng: userPosition.longitude
      }
    });

    window.open(orderUrl, '_blank');
    setDialogOpen(false);
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
      ...style
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 20, left: 20 };
      case 'top-right':
        return { ...baseStyles, top: 20, right: 20 };
      case 'top-left':
        return { ...baseStyles, top: 20, left: 20 };
      default:
        return { ...baseStyles, bottom: 20, right: 20 };
    }
  };

  return (
    <>
      <Tooltip title="ტაქსის შეკვეთა" placement="left">
        <Fab
          color="primary"
          onClick={handleTaxiClick}
          sx={{
            ...getPositionStyles(),
            bgcolor: '#570015',
            '&:hover': {
              bgcolor: '#3d000f',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <LocalTaxi />
        </Fab>
      </Tooltip>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <LocalTaxi sx={{ mr: 1, color: '#570015' }} />
              <Typography variant="h6">ტაქსის შეკვეთა</Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {userPosition ? (
            <Box>
              <Typography variant="body1" paragraph>
                <MyLocation sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                მიმდინარე მდებარეობიდან ტაქსის შეკვეთა
              </Typography>
              
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  ფასის შეფასება...
                </Typography>
              ) : pickupInfo && pickupInfo.options.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    ხელმისაწვდომი ტარიფები:
                  </Typography>
                  {pickupInfo.options.map((option, index) => (
                    <Box key={index} sx={{ 
                      p: 2, 
                      mb: 1, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body1">
                        {option.classText}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {option.priceText}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  ტაქსი ვერ მოიძებნა ამ მდებარეობაზე
                </Typography>
              )}
            </Box>
          ) : (
            <Box textAlign="center" py={3}>
              <MyLocation sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                მდებარეობა არ არის ხელმისაწვდომი
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ტაქსის შეკვეთისთვის საჭიროა მდებარეობის ნებართვა
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            გაუქმება
          </Button>
          {userPosition && (
            <Button 
              variant="contained" 
              onClick={handleOrderTaxi}
              sx={{ bgcolor: '#570015', '&:hover': { bgcolor: '#3d000f' } }}
            >
              ტაქსის შეკვეთა
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickTaxiButton;
