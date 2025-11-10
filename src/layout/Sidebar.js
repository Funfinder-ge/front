import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GavelIcon from '@mui/icons-material/Gavel';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import DirectionsBoat from '@mui/icons-material/DirectionsBoat';
import Kayaking from '@mui/icons-material/Kayaking';
import Water from '@mui/icons-material/Water';
import BeachAccess from '@mui/icons-material/BeachAccess';
import Tour from '@mui/icons-material/Tour';
import DirectionsCar from '@mui/icons-material/DirectionsCar';
import TwoWheeler from '@mui/icons-material/TwoWheeler';
import DirectionsBike from '@mui/icons-material/DirectionsBike';
import SportsMotorsports from '@mui/icons-material/SportsMotorsports';
import Flight from '@mui/icons-material/Flight';
import DirectionsRun from '@mui/icons-material/DirectionsRun';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Speed from '@mui/icons-material/Speed';
import SportsEsports from '@mui/icons-material/SportsEsports';
import ElectricBikeIcon from '@mui/icons-material/ElectricBike';
import CarRentalIcon from '@mui/icons-material/CarRental';import LocalTaxi from '@mui/icons-material/LocalTaxi';
import { useAuth } from '../contexts/AuthContext';
import '../layout/Nav.css';
import logo from '../assets/logo.jpg';
// Grouped nav sections
const navSections = [
 
  {
    header: 'საზღვაო აქტივობები', // Marine Activities
    items: [
      { label: 'ყველა საზღვაო აქტივობა', path: '/water-activities', icon: <Water /> },
      { label: 'პარაშუტი', path: '/parachute', icon: <Flight /> },
      { label: 'იახტა', path: '/yacht', icon: <DirectionsBoat /> },
      { label: 'რაფტინგი', path: '/rafting', icon: <Kayaking /> },
      { label: 'სეა-მოტო', path: '/sea-moto', icon: <Speed /> },
      { label: 'სხვა აქტივობები', path: '/sea-other', icon: <BeachAccess /> },
    ],
  },
  {
    header: 'სახმელეთო აქტივობები', // Land Activities
    items: [
      { label: 'ყველა სახმელეთო აქტივობა', path: '/land-activities', icon: <DirectionsBike /> },
      { label: 'კვადრო ტურები', path: '/quad-tours', icon: <ElectricBikeIcon /> },
      { label: 'მოტო ტურები', path: '/moto-tours', icon: <TwoWheeler /> },
      { label: 'ჯიპ ტურები', path: '/jeep-tours', icon: <DirectionsCar /> },
      { label: 'ველოსიპედები', path: '/bicycles', icon: <DirectionsBike /> },
      { label: 'VIP Car Rent', path: '/bicycles', icon: <CarRentalIcon /> },
      { label: 'ჰიკინგი', path: '/hiking', icon: <DirectionsRun /> },
    ],
  },
  {
    header: 'მთავარი',
    items: [
      { label: 'ბილეთები', path: '/tickets', icon: <ConfirmationNumberIcon /> },
      { label: 'წესები', path: '/rules', icon: <GavelIcon /> },
      { label: 'კონტაქტი', path: '/contact', icon: <ContactMailIcon /> },
    ],
  },
];

export function SidebarContent({ onMobileClose }) {
  const location = useLocation();
  const { user } = useAuth();
  
  const handleItemClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <Box sx={{ width: { xs: 250, md: 260 }, height: '100%', display: 'flex', flexDirection: 'column',  }}>
      {/* Logo Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.2)' 
      }}>
        
        <Link to="/">
        <img 
          src={logo} 
          alt="logo"
          style={{ 
            maxWidth: '120px', 
            height: '80px!important', 
            objectFit: 'contain' 
          }} 
        />
</Link>

      </Box>

      {/* Mobile Header */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 2, 
        borderBottom: '1px solid rgba(255,255,255,0.2)' 
      }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
          მენიუ
        </Typography>
        <IconButton onClick={onMobileClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* User Info/Profile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff', mb: 1 }}>{user ? user.name : 'სტუმარი'}</Typography>
        {user ? (
          <Button 
            component={Link} 
            to="/profile" 
            color="secondary" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={handleItemClick}
          >
            პროფილი
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button 
              component={Link} 
              to="/login" 
              color="secondary" 
              size="small"
              onClick={handleItemClick}
            >
              შესვლა
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              color="secondary" 
              size="small" 
              variant="contained"
              onClick={handleItemClick}
            >
              რეგისტრაცია
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Navigation sections with vertical scroll */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {navSections.map(section => (
          <List
            key={section.header}
            subheader={
              <ListSubheader component="div" disableSticky sx={{ bgcolor: 'inherit', fontWeight: 700, fontSize: 15, color: '#fff' }}>
                {section.header}
              </ListSubheader>
            }
          >
            {section.items.map((item) => (
              <ListItem key={item.path} disablePadding selected={location.pathname === item.path}>
                <ListItemButton 
                  component={Link} 
                  to={item.path}
                  onClick={handleItemClick}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    },
                  }}
                >
                  <Box sx={{ minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {item.icon}
                  </Box>
                  <ListItemText primary={item.label} sx={{ ml: 1, color: '#fff', '& .MuiTypography-root': { color: '#fff' } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ))}
      </Box>
    </Box>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
    setMoreMenuOpen(true);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuOpen(false);
    setMoreMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMoreMenuClose();
  };

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          backgroundColor: '#570015',
          zIndex: 1300
        }}
      >
                  <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              ტურისტული აქტივობები
            </Typography>
            <IconButton
              color="inherit"
              aria-label="more options"
              aria-controls={moreMenuOpen ? 'more-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={moreMenuOpen ? 'true' : undefined}
              onClick={handleMoreMenuOpen}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <div className="sidebar-fixed">
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
              top: 0,
              left: 0,
              height: '100vh',
              zIndex: 1200,
              background: '#570015', // New main color
              borderRight: '1px solid #eee',
              overflowX: 'hidden', // Prevent horizontal scroll
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      </div>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: '#570015',
            borderRight: '1px solid #eee',
            overflowX: 'hidden',
            marginTop: '50px',
          },
        }}
      >
        <SidebarContent onMobileClose={handleMobileClose} />
      </Drawer>

      {/* Mobile More Menu */}
      <Menu
        id="more-menu"
        anchorEl={moreMenuAnchor}
        open={moreMenuOpen}
        onClose={handleMoreMenuClose}
        MenuListProps={{
          'aria-labelledby': 'more-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {user ? (
          <>
            <MenuItem onClick={handleMoreMenuClose} component={Link} to="/profile">
              პროფილი
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              გამოსვლა
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleMoreMenuClose} component={Link} to="/contact">
              კონტაქტი
            </MenuItem>
            <MenuItem onClick={handleMoreMenuClose} component={Link} to="/about">
              ჩვენს შესახებ
            </MenuItem>
            <MenuItem onClick={handleMoreMenuClose} component={Link} to="/rules">
              წესები
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
} 