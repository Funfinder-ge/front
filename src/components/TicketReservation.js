import React, { useState } from 'react';
import {
  Box, Typography, Grid, TextField, Button, Card, CardContent,
  Alert, MenuItem, FormControl, InputLabel, Select, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, keyframes
} from '@mui/material';
import { QrCode2 as QRCodeIcon, Warning as WarningIcon } from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { Link } from 'react-router-dom';

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
`;

const TicketReservation = ({ activity, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    seats: 1
  });
  const [open, setOpen] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsWarning, setShowTermsWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setShowTermsWarning(true);
      return;
    }
    setShowTermsWarning(false);
    onSubmit(formData);
    setOpen(true);
    generateQRCode();
  };

  const generateQRCode = () => {
    const qrData = {
      activity: activity.title,
      date: formData.date,
      time: formData.time,
      name: formData.name,
      phone: formData.phone
    };
    setQRCode(qrData);
  };

  const handleClose = () => {
    setOpen(false);
    setQRCode(null);
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {activity.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {activity.description}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="სახელი"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ტელეფონი"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="თარიღი"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>დრო</InputLabel>
                  <Select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    label="დრო"
                    required
                  >
                    {activity.times.map((time, index) => (
                      <MenuItem key={index} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ადგილები</InputLabel>
                  <Select
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    label="ადგილები"
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Terms & Conditions Warning */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: termsAccepted ? 'success.main' : 'error.main',
                backgroundColor: termsAccepted ? 'rgba(46, 125, 50, 0.05)' : 'rgba(211, 47, 47, 0.06)',
                animation: !termsAccepted ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
                ...(showTermsWarning && !termsAccepted && {
                  animation: `${shakeAnimation} 0.5s ease-in-out, ${pulseAnimation} 2s ease-in-out infinite`,
                }),
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{
                  color: 'error.main',
                  mr: 1,
                  fontSize: 28,
                  animation: !termsAccepted ? `${pulseAnimation} 1.5s ease-in-out infinite` : 'none',
                }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'error.main',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  სავალდებულოა წესებისა და პირობების წაკითხვა!
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setShowTermsWarning(false);
                    }}
                    sx={{
                      color: 'error.main',
                      '&.Mui-checked': { color: 'success.main' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    ვეთანხმები{' '}
                    <Link
                      to="/rules"
                      target="_blank"
                      style={{
                        color: '#d32f2f',
                        fontWeight: 700,
                        textDecoration: 'underline'
                      }}
                    >
                      წესებსა და პირობებს
                    </Link>
                  </Typography>
                }
              />

              {showTermsWarning && !termsAccepted && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'error.main',
                    fontWeight: 600,
                    mt: 1,
                    animation: `${shakeAnimation} 0.5s ease-in-out`,
                  }}
                >
                  გთხოვთ, წაიკითხოთ და დაეთანხმოთ წესებსა და პირობებს ბილეთის შეძენამდე!
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                opacity: termsAccepted ? 1 : 0.6,
              }}
            >
              Book Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>თქვენი ბილეთი</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <QRCode
              value={JSON.stringify(qrCode)}
              size={200}
              level="H"
            />
          </Box>
          <Typography variant="h6" align="center" gutterBottom>
            {activity.title}
          </Typography>
          <Typography variant="body1" align="center">
            თარიღი: {formData.date}<br />
            დრო: {formData.time}<br />
            სახელი: {formData.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>დახურვა</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketReservation;
