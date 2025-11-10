import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Divider } from '@mui/material';

const cinemas = [
  {
    id: 1,
    name: 'City Mall',
    address: 'თბილისი, აღმაშენებლის ხეივანი 12კმ',
  },
  {
    id: 2,
    name: 'East Point',
    address: 'თბილისი, ალ. წერეთლის გამზირი 2',
  },
  {
    id: 3,
    name: 'Gallery',
    address: 'თბილისი, შოთა რუსთაველის გამზირი 2',
  },
];

const Cinemas = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3} color="primary">კინოთეატრები</Typography>
    <Divider sx={{ mb: 3 }} />
    <Grid container spacing={4}>
      {cinemas.map(cinema => (
        <Grid item xs={12} md={4} key={cinema.id}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" color="secondary" fontWeight={700}>{cinema.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{cinema.address}</Typography>
              <Box sx={{ width: '100%', height: 120, bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.disabled">[რუკის ან სურათის ადგილი]</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Cinemas; 