import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import './PartnerCompanySlider.css';

const PartnerCompanySlider = ({ partners }) => {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={30}
      slidesPerView={4}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      navigation={true}
      breakpoints={{
        320: {
          slidesPerView: 1,
        },
        480: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 4,
        },
      }}
      className="partner-slider"
    >
      {partners.map((partner, index) => (
        <SwiperSlide key={index}>
          <div className="partner-card">
            <img src={partner.logo} alt={partner.name} className="partner-logo" />
            <h3 className="partner-name">{partner.name}</h3>
            <p className="partner-description">{partner.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PartnerCompanySlider;
