import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import TheatersIcon from '@mui/icons-material/Theaters';
import BlockIcon from '@mui/icons-material/Block';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AppsIcon from '@mui/icons-material/Apps';
import GavelIcon from '@mui/icons-material/Gavel';
import { useAuth } from '../contexts/AuthContext';
import '../layout/Nav.css';

const navItems = [
  { label: 'მთავარი', path: '/', icon: <HomeIcon /> },
  { label: 'ბილეთები', path: '/tickets', icon: <ConfirmationNumberIcon /> },
  { label: 'IMAX', path: '/imax', icon: <TheatersIcon /> },
  { label: 'შეზღუდვები', path: '/restrictions', icon: <BlockIcon /> },
  { label: 'კონტაქტი', path: '/contact', icon: <ContactMailIcon /> },
  { label: 'კინოთეატრები', path: '/cinemas', icon: <LocationCityIcon /> },
  { label: 'აპლიკაცია', path: '/app', icon: <AppsIcon /> },
  { label: 'წესები', path: '/rules', icon: <GavelIcon /> },
];

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search navigation or logic here
    alert(`Search: ${search}`);
  };

  return (
    <>
      {/* Horizontal Navbar */}
      <AppBar position="static" color="primary" elevation={2} sx={{ ml: { md: 260 } }}>
        <Toolbar className="nav-toolbar">
          {/* Sidebar toggle button for mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {/* Brand/Logo */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, flexGrow: { xs: 1, md: 0 }, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Style
          </Typography>
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            <form onSubmit={handleSearch} style={{ width: '350px' }}>
              <InputBase
                placeholder="ძიება..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  px: 2,
                  width: '100%',
                  fontSize: 16,
                  height: 40,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </form>
          </Box>
          {/* Right side: Profile or Auth */}
          <Box className="user" sx={{ ml: 2 }}>
            {user ? (
              <IconButton component={Link} to="/profile" size="large">
                <Avatar src={user.image} alt={user.name}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            ) : (
              <>
                <Button
                  className="login"
                  component={Link}
                  to="/login"
                  color="secondary"
                  sx={{ mx: 1 }}
                >
                  შესვლა
                </Button>
                <Button
                  className="register"
                  component={Link}
                  to="/register"
                  color="secondary"
                  variant="contained"
                  sx={{ mx: 1 }}
                >
                  რეგისტრაცია
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
        {/* Desktop nav links below AppBar (hidden, since sidebar is now permanent) */}
      </AppBar>
      {/* Sidebar Drawer for mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { md: 'none' } }}
      >
        {/* This is where the permanent sidebar content would be rendered if it were extracted */}
        {/* For now, it's empty as the permanent sidebar is removed from Nav.js */}
      </Drawer>
    </>
  );
}
