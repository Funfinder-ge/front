import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaymentButton = ({ 
  tour, 
  variant = "contained", 
  fullWidth = false, 
  size = "medium",
  sx = {},
  children = "დაჯავშნა"
}) => {
  const navigate = useNavigate();

  const handleBooking = () => {
    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        bookingData: {
          activity: {
            id: tour.id,
            name: tour.name,
            image: tour.primary_image?.image || tour.images?.[0]?.image || tour.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
            base_price: tour.base_price || tour.price,
            duration: tour.duration,
            location: tour.city?.name || tour.location || tour.city,
            description: tour.description,
            category: tour.category?.name || tour.category
          },
          bookingDetails: {
            name: '',
            phone: '',
            date: '',
            time: '',
            participants: 1
          }
        }
      }
    });
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      onClick={handleBooking}
      sx={{ 
        borderRadius: 2,
        backgroundColor: variant === 'contained' ? '#570015' : undefined,
        '&:hover': { 
          backgroundColor: variant === 'contained' ? '#3d000f' : undefined 
        },
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

export default PaymentButton;
