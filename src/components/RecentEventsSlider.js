import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import './MainSlider.css';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import FunLoader from './FunLoader';

import { getImageUrl } from '../utils/imageUtils';

const RecentEventsSlider = ({ categoryName, categoryId }) => {
  const navigate = useNavigate();
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoading(true);
        const events = await eventsApi.getAll();
        
        // Filter by category if categoryId or categoryName is provided
        let filteredEvents = Array.isArray(events) ? events : [];
        
        if (categoryId) {
          // Filter by category ID (preferred method)
          filteredEvents = filteredEvents.filter((event) => {
            const eventCategoryId = event.category?.id;
            return eventCategoryId && String(eventCategoryId) === String(categoryId);
          });
        } else if (categoryName) {
          // Fallback to category name filtering
          filteredEvents = filteredEvents.filter((event) => {
            const eventCategoryName = event.category?.name?.toLowerCase();
            const filterCategoryName = categoryName.toLowerCase();
            return eventCategoryName === filterCategoryName;
          });
        }
        
        // Get the 3 most recent events (sort by ID descending)
        const sortedEvents = filteredEvents
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 3);
        
        setRecentEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching recent events:', error);
        setRecentEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, [categoryName, categoryId]);

  const handleSlideClick = (eventId) => {
    if (eventId) {
      navigate(`/activity/${eventId}`);
    }
  };

  if (loading) {
    return <FunLoader />;
  }

  if (recentEvents.length === 0) {
    return null;
  }

  // Transform events to slides format matching MainSlider
  const slides = recentEvents.map((event) => ({
    image: getImageUrl(
      event.primary_image?.image ||
        event.images?.[0]?.image ||
        event.image
    ),
    title: event.name || event.title || 'Activity',
    description: event.description || '',
    link: `/activity/${event.id}`,
  }));

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={16}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{ clickable: true }}
      className="main-slider"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div
            className={`slide-content ${slide.link ? 'slide-clickable' : ''}`}
            onClick={() => handleSlideClick(slide.link?.replace('/activity/', ''))}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="slide-image"
              loading="lazy"
            />

            <div className="slide-overlay">
              {slide.title && (
                <h2 className="slide-title">{slide.title}</h2>
              )}


              {slide.link && (
                <button
                  className="slide-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide.link.replace('/activity/', ''));
                  }}
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default RecentEventsSlider;
