import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

import './MainSlider.css';

const MainSlider = ({ slides = [] }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;
    let ticking = false;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const offset = Math.max(-200, Math.min(200, -rect.top * 0.25));
      node.style.setProperty('--parallax-y', `${offset}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSlideClick = (link) => {
    if (!link) return;

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link;
    }
  };

  return (
    <div ref={sliderRef} className="main-slider-wrapper">
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
              onClick={() => handleSlideClick(slide.link)}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="slide-image"
                loading="lazy"
              />
              <div className="slide-vignette" />

              <div className="slide-overlay">
                {slide.title && (
                  <h2 className="slide-title">{slide.title}</h2>
                )}

                {slide.description && (
                  <p className="slide-description">
                    {slide.description}
                  </p>
                )}

                {slide.link && (
                  <button
                    className="slide-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideClick(slide.link);
                    }}
                  >
                    <span className="slide-button-label">Learn More</span>
                    <span className="slide-button-arrow">→</span>
                  </button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MainSlider;
