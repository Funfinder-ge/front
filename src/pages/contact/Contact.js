import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, TextField, Button, Container, 
  Paper, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { 
  Phone, Email, LocationOn, AccessTime, 
  DirectionsBoat, SportsMotorsports 
} from '@mui/icons-material';

const Contact = () => {
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
    alert('თქვენი შეტყობინება გაიგზავნა!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Phone sx={{ color: '#570015' }} />,
      title: 'ტელეფონი',
      details: ['+995 555 123 456', '+995 555 789 012']
    },
    {
      icon: <Email sx={{ color: '#570015' }} />,
      title: 'ელ.ფოსტა',
      details: ['info@discount.ge', 'booking@discount.ge']
    },
    {
      icon: <LocationOn sx={{ color: '#570015' }} />,
      title: 'მისამართი',
      details: ['ბათუმი, ზღვის პირა', 'ბულვარი 1']
    },
    {
      icon: <AccessTime sx={{ color: '#570015' }} />,
      title: 'სამუშაო საათები',
      details: ['ორშაბათი - პარასკევი: 09:00-18:00', 'შაბათი - კვირა: 10:00-16:00']
    }
  ];

  const services = [
    {
      icon: <DirectionsBoat sx={{ color: '#570015' }} />,
      title: 'საზღვაო აქტივობები',
      description: 'იახტით გასეირნება, ჯეტ სკიი, ზღვის პარაშუტი'
    },
    {
      icon: <SportsMotorsports sx={{ color: '#570015' }} />,
      title: 'სახმელეთო აქტივობები',
      description: 'კვადრო ტურები, ჯიპ ტურები, ზიპ ლაინები'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="#570015">
          კონტაქტი
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          დაუკავშირდით ჩვენს გუნდს ნებისმიერი კითხვისთვის
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={700} color="#570015">
                გაგვიგზავნეთ შეტყობინება
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="სახელი"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="ელ.ფოსტა"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="ტელეფონი"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="თემა"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="შეტყობინება"
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
                    bgcolor: '#570015', 
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#3d000f' }
                  }}
                >
                  გაგზავნა
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={700} color="#570015">
                კონტაქტის ინფორმაცია
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
        <Typography variant="h4" component="h2" gutterBottom align="center" fontWeight={700} color="#570015">
          ჩვენი სერვისები
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
        <Typography variant="h5" component="h3" gutterBottom fontWeight={700} color="#570015">
          ჩვენი მისამართი
        </Typography>
        <Typography variant="body1" paragraph>
          ბათუმი, ზღვის პირა, ბულვარი 1
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
            რუკა აქ იქნება ჩართული
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact; 