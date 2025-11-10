import React, { createContext, useContext, useEffect, useState } from 'react';

const SeasonalContext = createContext();

export const useSeasonal = () => {
  const context = useContext(SeasonalContext);
  if (!context) {
    throw new Error('useSeasonal must be used within a SeasonalProvider');
  }
  return context;
};

// Function to determine current season based on date
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  // Northern Hemisphere seasons
  if (month >= 3 && month <= 5) return 'spring'; // March, April, May
  if (month >= 6 && month <= 8) return 'summer'; // June, July, August
  if (month >= 9 && month <= 11) return 'autumn'; // September, October, November
  return 'winter'; // December, January, February
};

// Seasonal theme configurations
const seasonalThemes = {
  spring: {
    name: 'Spring Sakura',
    className: 'seasonal-spring',
    colors: {
      primary: '#ffb3d9', // Light pink
      secondary: '#ff69b4', // Hot pink
      accent: '#ff1493', // Deep pink
      background: 'linear-gradient(135deg, #ffb3d9 0%, #ff69b4 50%, #ff1493 100%)',
      sidebar: 'linear-gradient(180deg, #ffb3d9 0%, #ff69b4 100%)',
    },
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'sakura\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%23ff69b4\' opacity=\'0.3\'/%3E%3Ccircle cx=\'5\' cy=\'15\' r=\'1.5\' fill=\'%23ff1493\' opacity=\'0.2\'/%3E%3Ccircle cx=\'15\' cy=\'5\' r=\'1.5\' fill=\'%23ff69b4\' opacity=\'0.2\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23sakura)\'/%3E%3C/svg%3E")'
  },
  summer: {
    name: 'Summer Sea',
    className: 'seasonal-summer',
    colors: {
      primary: '#87ceeb', // Sky blue
      secondary: '#4682b4', // Steel blue
      accent: '#1e90ff', // Dodger blue
      background: 'linear-gradient(135deg, #87ceeb 0%, #4682b4 50%, #1e90ff 100%)',
      sidebar: 'linear-gradient(180deg, #87ceeb 0%, #4682b4 100%)',
    },
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'waves\' patternUnits=\'userSpaceOnUse\' width=\'30\' height=\'30\'%3E%3Cpath d=\'M0,20 Q15,10 30,20 T60,20 T90,20 V30 H0 Z\' fill=\'%234682b4\' opacity=\'0.2\'/%3E%3Cpath d=\'M0,25 Q15,15 30,25 T60,25 T90,25 V35 H0 Z\' fill=\'%231e90ff\' opacity=\'0.1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23waves)\'/%3E%3C/svg%3E")'
  },
  autumn: {
    name: 'Autumn Wine',
    className: 'seasonal-autumn',
    colors: {
      primary: '#8b4513', // Saddle brown
      secondary: '#a0522d', // Sienna
      accent: '#cd853f', // Peru
      background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)',
      sidebar: 'linear-gradient(180deg, #8b4513 0%, #a0522d 100%)',
    },
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'leaves\' patternUnits=\'userSpaceOnUse\' width=\'25\' height=\'25\'%3E%3Cpath d=\'M12.5,5 C15,8 18,10 20,12 C18,15 15,17 12.5,20 C10,17 7,15 5,12 C7,10 10,8 12.5,5 Z\' fill=\'%23a0522d\' opacity=\'0.3\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'2\' fill=\'%23cd853f\' opacity=\'0.2\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23leaves)\'/%3E%3C/svg%3E")'
  },
  winter: {
    name: 'Winter Snow',
    className: 'seasonal-winter',
    colors: {
      primary: '#e6f3ff', // Light blue
      secondary: '#b3d9ff', // Light blue
      accent: '#87ceeb', // Sky blue
      background: 'linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 50%, #87ceeb 100%)',
      sidebar: 'linear-gradient(180deg, #e6f3ff 0%, #b3d9ff 100%)',
    },
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'snow\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3E%3Cpath d=\'M10,2 L12,6 L16,6 L13,9 L14,13 L10,11 L6,13 L7,9 L4,6 L8,6 Z\' fill=\'%23b3d9ff\' opacity=\'0.4\'/%3E%3Ccircle cx=\'5\' cy=\'15\' r=\'1\' fill=\'%23e6f3ff\' opacity=\'0.6\'/%3E%3Ccircle cx=\'15\' cy=\'5\' r=\'1\' fill=\'%23b3d9ff\' opacity=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23snow)\'/%3E%3C/svg%3E")'
  }
};

export const SeasonalProvider = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());
  const [theme, setTheme] = useState(seasonalThemes[getCurrentSeason()]);

  useEffect(() => {
    const updateSeason = () => {
      const season = getCurrentSeason();
      setCurrentSeason(season);
      setTheme(seasonalThemes[season]);
      
      // Apply seasonal class to body
      document.body.className = document.body.className.replace(/seasonal-\w+/g, '');
      document.body.classList.add(`seasonal-${season}`);
    };

    // Update season on mount
    updateSeason();

    // Update season every hour to catch month changes
    const interval = setInterval(updateSeason, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    currentSeason,
    theme,
    seasonalThemes
  };

  return (
    <SeasonalContext.Provider value={value}>
      {children}
    </SeasonalContext.Provider>
  );
};

export default seasonalThemes;
