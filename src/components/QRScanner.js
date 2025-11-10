import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  styled,
  Typography,
  TextField
} from '@mui/material';

const ScannerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  boxShadow: theme.shadows[2],
}));

const QRScanner = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrData, setQrData] = useState('');


  const handleManualSubmit = () => {
    if (qrData.trim()) {
      if (onScan) {
        onScan(qrData.trim());
      }
      setIsScanning(false);
      setQrData('');
    }
  };

  const startScanning = () => {
    setQrData('');
    setIsScanning(true);
  };

  return (
    <Dialog
      open={isScanning}
      onClose={() => setIsScanning(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>QR კოდის სკანირება</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {isScanning ? (
            <ScannerContainer>
              <Typography variant="h6" gutterBottom>
                QR კოდის მონაცემების შეყვანა
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                შეიყვანეთ QR კოდის მონაცემები ხელით ან სკანირეთ კოდი
              </Typography>
              <TextField
                fullWidth
                label="QR კოდის მონაცემები"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
                placeholder="შეიყვანეთ QR კოდის მონაცემები აქ..."
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleManualSubmit}
                disabled={!qrData.trim()}
                sx={{
                  backgroundColor: '#570015',
                  '&:hover': {
                    backgroundColor: '#3d000f',
                  },
                }}
              >
                გაგზავნა
              </Button>
            </ScannerContainer>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={startScanning}
              sx={{
                backgroundColor: '#570015',
                '&:hover': {
                  backgroundColor: '#3d000f',
                },
              }}
            >
              QR კოდის სკანირება
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setIsScanning(false)}
          disabled={isScanning}
        >
          გაუქმება
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;
