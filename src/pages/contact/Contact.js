import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, TextField, Button, Container, 
  Paper, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { 
  Phone, Email, LocationOn, AccessTime, 
  DirectionsBoat, SportsMotorsports 
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Phone sx={{ color: '#87003A' }} />,
      title: 'Phone',
      details: ['+995 593 76 27 27', '+995 571 92 50 05']
    },
    {
      icon: <Email sx={{ color: '#87003A' }} />,
      title: 'Email',
      details: ['info@funfinder.ge']
    },
    {
      icon: <LocationOn sx={{ color: '#87003A' }} />,
      title: 'Address',
      details: ['Batumi, Adjara', '']
    },
    {
      icon: <AccessTime sx={{ color: '#87003A' }} />,
      title: 'Working Hours',
      details: ['Monday - Friday: 09:00-18:00', 'Saturday - Sunday: 10:00-16:00']
    }
  ];

  const services = [
    {
      icon: <DirectionsBoat sx={{ color: '#87003A' }} />,
      title: 'Sea Activities',
      description: 'Yacht tours, jet ski, sea parachute'
    },
    {
      icon: <SportsMotorsports sx={{ color: '#87003A' }} />,
      title: 'Land Activities',
      description: 'Quad tours, jeep tours, zip lines'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="#87003A">
          Contact
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Contact our team for any questions
        </Typography>
      </Box>

      {/* About Us Section */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: '#f8f9fa' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} color="#87003A" sx={{ mb: 3 }}>
          {t("home.about.title")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', fontStyle: 'italic' }}>
              {t("home.about.quote")}
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', fontStyle: 'italic' }}>
              {t("home.about.p1")}
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', fontStyle: 'italic' }}>
              {t("home.about.p2")}
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(135, 0, 58, 0.05)', borderRadius: 2 }}>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 600, color: 'text.secondary', fontStyle: 'italic' }}>
                {t("home.about.missionTitle")}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary', fontStyle: 'italic' }}>
                {t("home.about.missionText")}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
              {t("home.about.p3")}
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 600, color: '#87003A', fontStyle: 'italic' }}>
              {t("home.about.final")}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={700} color="#87003A">
                Send Us a Message
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Message"
                  name="message"
                  multiline
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    bgcolor: '#87003A', 
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#3d000f' }
                  }}
                >
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={700} color="#87003A">
                Contact Information
              </Typography>
              <List>
                {contactInfo.map((info, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {info.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={info.title}
                      secondary={
                        <Box>
                          {info.details.map((detail, detailIndex) => (
                            <Typography key={detailIndex} variant="body2" color="text.secondary">
                              {detail}
                            </Typography>
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Services */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} color="#87003A">
          Our Services
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  {service.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom fontWeight={700}>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Map Placeholder */}
      <Paper sx={{ p: 4, mt: 6, textAlign: 'center', bgcolor: '#f8f9fa' }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight={700} color="#87003A">
          Our Address
        </Typography>
        <Typography variant="body1" paragraph>
          Batumi, Seaside, Boulevard 1
        </Typography>
        <Box sx={{ 
          width: '100%', 
          height: 300, 
          bgcolor: '#e0e0e0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Map will be embedded here
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact; 