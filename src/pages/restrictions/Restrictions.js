import React from 'react';
import { Box, Typography, Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import ChildCareIcon from '@mui/icons-material/ChildCare';

const Restrictions = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={3} color="primary">შეზღუდვები</Typography>
    <Divider sx={{ mb: 3 }} />
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" color="secondary" fontWeight={700} gutterBottom>
          ასაკობრივი შეზღუდვები
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><ChildCareIcon color="primary" /></ListItemIcon>
            <ListItemText primary="PG (6+) - 6 წლამდე ბავშვებისთვის შეუსაბამო" />
          </ListItem>
          <ListItem>
            <ListItemIcon><ChildCareIcon color="primary" /></ListItemIcon>
            <ListItemText primary="PG-13 (13+) - 13 წლამდე ბავშვებისთვის შეუსაბამო" />
          </ListItem>
          <ListItem>
            <ListItemIcon><ChildCareIcon color="primary" /></ListItemIcon>
            <ListItemText primary="R (18+) - 18 წლამდე პირებისთვის შეუსაბამო" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" color="secondary" fontWeight={700} gutterBottom>
          კონტენტის გაფრთხილებები
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon>
            <ListItemText primary="ძალადობა, უხეში ენა, შიშის მომგვრელი სცენები" />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberIcon color="warning" /></ListItemIcon>
            <ListItemText primary="სექსუალური შინაარსი ან ნარკოტიკების მოხმარება" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" color="secondary" fontWeight={700} gutterBottom>
          COVID-19 პოლიტიკა
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CoronavirusIcon color="error" /></ListItemIcon>
            <ListItemText primary="ნიღბის ტარება სავალდებულოა" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CoronavirusIcon color="error" /></ListItemIcon>
            <ListItemText primary="დისტანციის დაცვა აუცილებელია" />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  </Box>
);

export default Restrictions; 