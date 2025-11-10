import React, { useState } from 'react';
import { 
  Box, Typography, Grid, TextField, Button, Card, CardContent, 
  Alert, MenuItem, FormControl, InputLabel, Select, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { QrCode2 as QRCodeIcon } from '@mui/icons-material';
import QRCode from 'qrcode.react';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            დაჯავშნა
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
