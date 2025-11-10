import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Box component="footer" sx={{
      bgcolor: 'primary.main',
      color: 'background.paper',
      py: 3,
      textAlign: 'center',
      mt: 4,
    }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        Discount © {new Date().getFullYear()} | All rights reserved
      </Typography>
    </Box>
  );
} 