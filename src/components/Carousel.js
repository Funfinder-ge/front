import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "./Carousel.css";

import img1 from "./../assets/1.jpg";
import img2 from "./../assets/2.jpg";
import img3 from "./../assets/3.jpg";
import img4 from "./../assets/4.png";
import img5 from "./../assets/5.jpg";
import img6 from "./../assets/6.jpg";
import img7 from "./../assets/7.jpg";
const Carousel = () => {
  const items = [
    { id: 1, img: img1 },
    { id: 2, img: img2 },
    { id: 3, img: img3 },
    { id: 4, img: img4 },
    { id: 5, img: img5 },
    { id: 6, img: img6 },
    { id: 7, img: img7 },
  ];
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      slidesPerView={1}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{ clickable: true }}
      loop={true}
      className="mySwiper"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <div style={styles.item}>
            <img src={item.img} alt={`Slide ${item.id}`} style={styles.image} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

const styles = {
  item: {
    height: "190px",
    background: "#4DC7A0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "2rem",
    color: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  image: {
    width: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
};

export default Carousel;
