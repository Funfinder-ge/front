import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IconButton, Tooltip, Box } from '@mui/material';
import { RocketLaunch as RocketIcon } from '@mui/icons-material';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Scroll to (0, 0) on every route change – run after new page renders
  useEffect(() => {
    const scrollToZero = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainContent = document.querySelector('.main-content');
      if (mainContent) mainContent.scrollTop = 0;
    };
    scrollToZero();
    const id = setTimeout(scrollToZero, 0);
    return () => clearTimeout(id);
  }, [location.pathname, location.key]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Box
      data-fab-trigger="scrolltop"
      sx={{
        position: 'fixed',
        bottom: 230,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Tooltip title="Scroll to top">
        <IconButton
          onClick={scrollToTop}
          sx={{
            backgroundColor: '#87003A',
            color: 'white',
            width: 60,
            height: 60,
            boxShadow: '0 4px 20px rgba(135, 0, 58, 0.3)',
            '&:hover': {
              backgroundColor: '#6a002c',
              transform: 'scale(1.1) translateY(-5px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <RocketIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ScrollToTop;

