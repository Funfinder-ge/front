import React, { createContext, useContext, useState, useEffect } from 'react';

const GuideContext = createContext();

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};

export const GuideProvider = ({ children }) => {
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if user has seen the guide before
    const seen = localStorage.getItem('funfinder_guide_seen');
    if (seen === 'true') {
      setHasSeenGuide(true);
    } else {
      // Show guide for first-time visitors
      setShowGuide(true);
    }
  }, []);

  const markGuideAsSeen = () => {
    localStorage.setItem('funfinder_guide_seen', 'true');
    setHasSeenGuide(true);
    setShowGuide(false);
  };

  const resetGuide = () => {
    localStorage.removeItem('funfinder_guide_seen');
    setHasSeenGuide(false);
    setShowGuide(true);
  };

  return (
    <GuideContext.Provider
      value={{
        hasSeenGuide,
        showGuide,
        markGuideAsSeen,
        resetGuide,
        setShowGuide,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};



