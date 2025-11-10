import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import './MainSlider.css';

const MainSlider = ({ slides }) => {
  const handleSlideClick = (link) => {
    if (link) {
      // Check if it's an external link (starts with http:// or https://)
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        // Internal link - could be used for React Router navigation if needed
        window.location.href = link;
      }
    }
  };

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{
        clickable: true,
        renderBullet: (index, className) => {
          return `<span class="${className}"></span>`;
        },
      }}
      className="main-slider"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div 
            className={`slide-content ${slide.link ? 'slide-clickable' : ''}`}
            onClick={() => handleSlideClick(slide.link)}
            style={{ cursor: slide.link ? 'pointer' : 'default' }}
          >
            <img src={slide.image} alt={slide.title} className="slide-image" />
            <div className="slide-overlay">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-description">{slide.description}</p>
              {slide.link ? (
                <button 
                  className="slide-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(slide.link);
                  }}
                >
                  გაიგება მეტი
                </button>
              ) : (
                <button className="slide-button">გაიგება მეტი</button>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MainSlider;
